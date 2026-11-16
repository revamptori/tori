"""
Tests for GitHub GraphQL API and REST API integration.
Tests mocked upstream responses, invalid years, rate limits, malformed responses,
stale cache fallback, and GitHub outages.
"""
import pytest
from unittest.mock import patch, MagicMock
from backend.app import app
from backend.github_service import GitHubService

@pytest.fixture
def client():
    return app.test_client()

@pytest.fixture
def clean_service():
    """Returns a fresh instance of GitHubService with clean cache."""
    return GitHubService()

def test_github_contributions_success_live_or_cached(client):
    """Test standard contributions endpoint."""
    resp = client.get("/api/github/contributions?year=2026")
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "revamptori"
    assert data["year"] == 2026
    assert "total_contributions" in data
    assert "weeks" in data
    assert "months" in data
    assert data["is_stale"] is False

def test_github_contributions_invalid_year_rejected(client):
    """Test validation rejection for non-integer or out-of-bounds years."""
    # String / non-integer
    resp = client.get("/api/github/contributions?year=notayear")
    assert resp.status_code == 400
    assert "Validation Error" in resp.json()["error"]

    # Historical year before 2020
    resp_old = client.get("/api/github/contributions?year=2015")
    assert resp_old.status_code == 400

    # Future year beyond current year
    resp_future = client.get("/api/github/contributions?year=2030")
    assert resp_future.status_code == 400

def test_github_contributions_mocked_upstream(clean_service):
    """Test parsing of mocked successful GraphQL response."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "user": {
                "name": "Tori",
                "login": "revamptori",
                "contributionsCollection": {
                    "contributionCalendar": {
                        "totalContributions": 120,
                        "weeks": [
                            {
                                "contributionDays": [
                                    {
                                        "date": "2026-01-01",
                                        "contributionCount": 5,
                                        "color": "#216e39",
                                        "contributionLevel": "FOURTH_QUARTILE",
                                        "weekday": 4
                                    }
                                ]
                            }
                        ],
                        "months": [
                            {"name": "Jan", "year": 2026, "firstDay": "2026-01-01", "totalWeeks": 5}
                        ]
                    }
                }
            }
        }
    }

    with patch("requests.post", return_value=mock_response):
        data, status = clean_service.get_contributions(2026, force_refresh=True)
        assert status == 200
        assert data["total_contributions"] == 120
        assert data["year"] == 2026
        assert len(data["weeks"]) == 1
        assert data["is_stale"] is False

def test_github_contributions_rate_limit_handling(clean_service):
    """Test handling of HTTP 429 Rate Limited response without prior cache."""
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.text = "Rate limit exceeded"

    with patch("requests.post", return_value=mock_response):
        data, status = clean_service.get_contributions(2026, force_refresh=True)
        assert status == 429
        assert "rate limit" in data["message"].lower()
        assert data["has_cache"] is False

def test_github_contributions_stale_cache_fallback_on_outage(clean_service):
    """
    Test that if GitHub becomes unavailable, the last successfully cached graph
    is returned with a clear stale-data indicator (is_stale=True).
    """
    # 1. First, seed the cache with valid data
    seed_response = MagicMock()
    seed_response.status_code = 200
    seed_response.json.return_value = {
        "data": {
            "user": {
                "contributionsCollection": {
                    "contributionCalendar": {
                        "totalContributions": 75,
                        "weeks": [],
                        "months": []
                    }
                }
            }
        }
    }
    with patch("requests.post", return_value=seed_response):
        data1, status1 = clean_service.get_contributions(2026, force_refresh=True)
        assert status1 == 200
        assert data1["is_stale"] is False
        assert data1["total_contributions"] == 75

    # 2. Now simulate GitHub outage (HTTP 500) on refresh
    outage_response = MagicMock()
    outage_response.status_code = 500
    outage_response.text = "Internal Server Error"

    with patch("requests.post", return_value=outage_response):
        data2, status2 = clean_service.get_contributions(2026, force_refresh=True)
        # Should gracefully return stale cached data with status 200
        assert status2 == 200
        assert data2["is_stale"] is True
        assert data2["total_contributions"] == 75
        assert "stale_reason" in data2

def test_github_contributions_never_fabricate_data_on_total_failure(clean_service):
    """Ensure that if GitHub is down and NO cache exists, we NEVER invent fake data."""
    mock_response = MagicMock()
    mock_response.status_code = 503
    mock_response.text = "Service Unavailable"

    with patch("requests.post", return_value=mock_response):
        data, status = clean_service.get_contributions(2025, force_refresh=True)
        assert status == 503
        assert data["has_cache"] is False
        assert "weeks" not in data  # No fabricated calendar!

def test_github_contributions_malformed_response(clean_service):
    """Test handling when response is missing user or calendar object."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": {"user": None}}

    with patch("requests.post", return_value=mock_response):
        data, status = clean_service.get_contributions(2026, force_refresh=True)
        assert status == 404
        assert "not found" in data["message"].lower()

def test_github_manual_refresh_cooldown(clean_service):
    """Test that manual refresh endpoint enforces rate limiting."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "user": {
                "contributionsCollection": {
                    "contributionCalendar": {
                        "totalContributions": 50,
                        "weeks": [],
                        "months": []
                    }
                }
            }
        }
    }

    with patch("requests.post", return_value=mock_response):
        # First refresh succeeds
        data1, status1 = clean_service.refresh_contributions(2026)
        assert status1 == 200

        # Immediate second refresh is rate limited (429)
        data2, status2 = clean_service.refresh_contributions(2026)
        assert status2 == 429
        assert "rate limited" in data2["error"].lower()
