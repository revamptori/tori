"""
Tests for all portfolio REST endpoints served by flap.
"""
import pytest
from backend.app import app

@pytest.fixture
def client():
    return app.test_client()

def test_health_endpoint(client):
    """Test /api/health endpoint structure and framework branding."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["app"] == "tori-portfolio"
    assert data["author"] == "revamptori"
    assert data["framework"] == "flap"
    assert "engine" in data
    assert "timestamp" in data

def test_benchmarks_endpoint(client):
    """Test /api/benchmarks returns verified flap data."""
    resp = client.get("/api/benchmarks")
    assert resp.status_code == 200
    data = resp.json()
    assert "methodology" in data
    assert "bottlenecks" in data
    assert len(data["bottlenecks"]) == 6
    assert "workloads" in data
    assert len(data["workloads"]) >= 5
    assert "resource_utilization" in data

    # Verify specific measured workloads
    workload_names = [w["endpoint"] for w in data["workloads"]]
    assert "GET /" in workload_names
    assert "GET /hello/:name" in workload_names
    assert "GET /json 3k" in workload_names
    assert "POST /echo 3k" in workload_names

    # Check that flap rust is documented as faster than flask
    echo_workload = next(w for w in data["workloads"] if w["endpoint"] == "POST /echo 3k")
    assert echo_workload["rps"]["flap_rust"] > echo_workload["rps"]["flask"]

def test_projects_endpoint(client):
    """Test /api/projects returns curated projects list."""
    resp = client.get("/api/projects")
    assert resp.status_code == 200
    projects = resp.json()
    assert isinstance(projects, list)
    assert len(projects) >= 5

    p_ids = [p["id"] for p in projects]
    assert "flap" in p_ids
    assert "httpr" in p_ids
    assert "rmtp" in p_ids
    assert "toriutilities" in p_ids
    assert "rust-game-engine" in p_ids

    # Verify experimental flag on unfinished projects
    game_engine = next(p for p in projects if p["id"] == "rust-game-engine")
    assert game_engine["is_experimental"] is True

def test_project_detail_endpoint(client):
    """Test /api/projects/<id> endpoint."""
    resp = client.get("/api/projects/flap")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "flap"
    assert data["repo_url"] == "https://github.com/revamptori/flap"
    assert "architecture_diagram" in data

    # Non-existent project
    resp_404 = client.get("/api/projects/unknown-proj")
    assert resp_404.status_code == 404

def test_articles_endpoint(client):
    """Test /api/articles and article detail."""
    resp = client.get("/api/articles")
    assert resp.status_code == 200
    articles = resp.json()
    assert len(articles) >= 3

    slug = articles[0]["slug"]
    detail_resp = client.get(f"/api/articles/{slug}")
    assert detail_resp.status_code == 200
    assert "content" in detail_resp.json()

    # Non-existent article
    resp_404 = client.get("/api/articles/non-existent-article")
    assert resp_404.status_code == 404

def test_cors_headers_applied(client):
    """Verify CORS headers are present on responses."""
    resp = client.get("/api/health")
    assert resp.headers.get("Access-Control-Allow-Origin") == "*"
    assert "GET" in resp.headers.get("Access-Control-Allow-Methods", "")
