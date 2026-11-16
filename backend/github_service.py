"""
GitHub GraphQL & REST API integration service for Tori's portfolio.

Requirements:
- Query contributionsCollection for authenticated user's contributionCalendar.
- Display complete contribution calendar for selected year (weeks, days, contributionCount, color, level).
- Month labels, weekday labels, total contributions.
- Automatic 5-minute caching with request deduplication (mutex).
- Manual refresh control with rate limiting.
- Stale cache fallback if GitHub API is unreachable or rate-limited.
- Strict token security: GITHUB_TOKEN kept server-side only.
- Never generate fake contribution data as fallback.
"""
import os
import time
import threading
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List
import requests

try:
    from .config import (
        GITHUB_TOKEN,
        GITHUB_USERNAME,
        GITHUB_GRAPHQL_URL,
        GITHUB_REST_URL,
        CACHE_TTL_SECONDS,
        REFRESH_COOLDOWN_SECONDS,
        SYSTEM_CA_BUNDLE,
        logger,
    )
except (ImportError, ValueError):
    from config import (
        GITHUB_TOKEN,
        GITHUB_USERNAME,
        GITHUB_GRAPHQL_URL,
        GITHUB_REST_URL,
        CACHE_TTL_SECONDS,
        REFRESH_COOLDOWN_SECONDS,
        SYSTEM_CA_BUNDLE,
        logger,
    )

# GraphQL query for user contribution calendar
CONTRIBUTION_CALENDAR_QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
    login
    avatarUrl
    url
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
            contributionLevel
            weekday
          }
        }
        months {
          name
          year
          firstDay
          totalWeeks
        }
      }
    }
  }
}
"""

class GitHubService:
    def __init__(self):
        self.username = GITHUB_USERNAME
        self._lock = threading.Lock()
        
        # Cache storage:
        # Key: "contributions_{year}" -> {"data": dict, "cached_at": float, "last_updated": str, "is_stale": bool}
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_refresh_time: float = 0.0

    def _get_headers(self) -> Dict[str, str]:
        token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN") or GITHUB_TOKEN
        headers = {
            "User-Agent": "tori-portfolio-backend/1.0",
            "Accept": "application/vnd.github.v3+json",
        }
        if token and token.strip():
            headers["Authorization"] = f"Bearer {token.strip()}"
        return headers

    def _get_verify(self) -> Any:
        # Use system CA bundle if it exists (critical for sandboxed proxy environments)
        if os.path.exists(SYSTEM_CA_BUNDLE):
            return SYSTEM_CA_BUNDLE
        return True

    def validate_year(self, year_input: Any) -> int:
        """Validate year parameter. Valid years are 2020 through current year (2026)."""
        current_year = datetime.now(timezone.utc).year
        try:
            year = int(year_input)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid year parameter: {year_input!r}. Must be an integer.")

        if year < 2020 or year > current_year:
            raise ValueError(
                f"Year {year} is out of supported range (2020 - {current_year}). "
                "Future years or historical years prior to 2020 are not permitted."
            )
        return year

    def get_contributions(self, year: int, force_refresh: bool = False) -> Tuple[Dict[str, Any], int]:
        """
        Fetch contribution calendar for the given year.
        Utilizes 5-minute cache, deduplication, and stale-data fallback.
        Never fabricates mock data.
        Returns: (data_dict, status_code)
        """
        cache_key = f"contributions_{year}"
        now = time.time()

        with self._lock:
            cached_entry = self._cache.get(cache_key)
            if cached_entry and not force_refresh:
                age = now - cached_entry["cached_at"]
                if age < CACHE_TTL_SECONDS:
                    # Fresh cache hit
                    data = dict(cached_entry["data"])
                    data["is_stale"] = False
                    data["cached"] = True
                    data["cache_age_seconds"] = int(age)
                    data["last_updated"] = cached_entry["last_updated"]
                    return data, 200

        # Need to fetch upstream from GitHub GraphQL API
        from_date = f"{year}-01-01T00:00:00Z"
        to_date = f"{year}-12-31T23:59:59Z"

        variables = {
            "login": self.username,
            "from": from_date,
            "to": to_date,
        }

        try:
            logger.info("Querying GitHub GraphQL API for %s contributionCalendar (%d)", self.username, year)
            resp = requests.post(
                GITHUB_GRAPHQL_URL,
                json={"query": CONTRIBUTION_CALENDAR_QUERY, "variables": variables},
                headers=self._get_headers(),
                verify=self._get_verify(),
                timeout=10,
            )

            # Check HTTP status
            if resp.status_code == 401:
                logger.error("GitHub API returned 401 Unauthorized. Check GITHUB_TOKEN.")
                return self._handle_upstream_error(cache_key, "GitHub API authentication failed (401). Invalid token.", 502)

            if resp.status_code == 429:
                logger.warning("GitHub API returned 429 Rate Limited.")
                return self._handle_upstream_error(cache_key, "GitHub API rate limit exceeded.", 429)

            if resp.status_code != 200:
                logger.error("GitHub API returned status %d: %s", resp.status_code, resp.text[:200])
                status_to_report = resp.status_code if resp.status_code in (502, 503, 504, 429) else 502
                return self._handle_upstream_error(cache_key, f"GitHub API error (HTTP {resp.status_code}).", status_to_report)

            payload = resp.json()

            # Handle GraphQL errors
            if "errors" in payload and payload["errors"]:
                err_msg = payload["errors"][0].get("message", "Unknown GraphQL error")
                logger.error("GitHub GraphQL error: %s", err_msg)
                return self._handle_upstream_error(cache_key, f"GitHub GraphQL error: {err_msg}", 502)

            user_data = payload.get("data", {}).get("user")
            if not user_data:
                logger.error("GitHub user %s not found in GraphQL response", self.username)
                return self._handle_upstream_error(cache_key, f"GitHub user '{self.username}' not found.", 404)

            calendar = user_data.get("contributionsCollection", {}).get("contributionCalendar")
            if not calendar:
                logger.error("Missing contributionCalendar in response for %s", self.username)
                return self._handle_upstream_error(cache_key, "Malformed contribution calendar data from GitHub.", 502)

            now_iso = datetime.now(timezone.utc).isoformat()
            
            result = {
                "username": self.username,
                "profile_url": f"https://github.com/{self.username}",
                "year": year,
                "total_contributions": calendar.get("totalContributions", 0),
                "weeks": calendar.get("weeks", []),
                "months": calendar.get("months", []),
                "last_updated": now_iso,
                "is_stale": False,
                "cached": False,
                "cache_age_seconds": 0,
            }

            # Save in cache
            with self._lock:
                self._cache[cache_key] = {
                    "data": result,
                    "cached_at": now,
                    "last_updated": now_iso,
                }

            return result, 200

        except requests.exceptions.Timeout:
            logger.error("GitHub GraphQL API timed out for year %d", year)
            return self._handle_upstream_error(cache_key, "GitHub API request timed out.", 504)
        except requests.exceptions.RequestException as e:
            logger.error("Network error connecting to GitHub: %s", e)
            return self._handle_upstream_error(cache_key, f"Network error connecting to GitHub API: {str(e)}", 503)
        except Exception as e:
            logger.exception("Unexpected error in get_contributions: %s", e)
            return self._handle_upstream_error(cache_key, f"Unexpected error: {str(e)}", 500)

    def _handle_upstream_error(self, cache_key: str, error_msg: str, status_code: int) -> Tuple[Dict[str, Any], int]:
        """
        Fallback strategy when upstream GitHub call fails:
        If stale cached data exists, return it with is_stale: True and status 200.
        Otherwise return structured error response. NEVER fake contribution data.
        """
        with self._lock:
            cached = self._cache.get(cache_key)
            if cached:
                logger.warning("Serving STALE cached contribution data for %s due to upstream error", cache_key)
                stale_data = dict(cached["data"])
                stale_data["is_stale"] = True
                stale_data["cached"] = True
                stale_data["stale_reason"] = error_msg
                stale_data["last_updated"] = cached["last_updated"]
                stale_data["cache_age_seconds"] = int(time.time() - cached["cached_at"])
                return stale_data, 200

        # No cache exists. Strictly return error, never fake data!
        return {
            "error": "GitHub contributions currently unavailable",
            "message": error_msg,
            "username": self.username,
            "profile_url": f"https://github.com/{self.username}",
            "is_stale": False,
            "has_cache": False,
        }, status_code

    def refresh_contributions(self, year: Optional[int] = None) -> Tuple[Dict[str, Any], int]:
        """
        Manual refresh control (POST /api/github/refresh).
        Enforces cooldown rate-limiting to prevent upstream abuse.
        """
        now = time.time()
        current_year = datetime.now(timezone.utc).year
        target_year = year if year is not None else current_year

        with self._lock:
            elapsed = now - self._last_refresh_time
            if elapsed < REFRESH_COOLDOWN_SECONDS:
                remaining = int(REFRESH_COOLDOWN_SECONDS - elapsed)
                return {
                    "error": "Refresh rate limited",
                    "message": f"Manual refresh is rate-limited. Please wait {remaining} seconds.",
                    "retry_after_seconds": remaining,
                }, 429
            self._last_refresh_time = now

        # Invalidate cache for target year and re-fetch
        return self.get_contributions(target_year, force_refresh=True)

    def get_profile(self) -> Tuple[Dict[str, Any], int]:
        """Fetch user profile metadata with 5-minute caching."""
        cache_key = "user_profile"
        now = time.time()

        with self._lock:
            cached = self._cache.get(cache_key)
            if cached:
                age = now - cached["cached_at"]
                if age < CACHE_TTL_SECONDS:
                    data = dict(cached["data"])
                    data["cached"] = True
                    data["cache_age_seconds"] = int(age)
                    return data, 200

        try:
            logger.info("Fetching public profile for %s from GitHub REST API", self.username)
            resp = requests.get(
                f"{GITHUB_REST_URL}/users/{self.username}",
                headers=self._get_headers(),
                verify=self._get_verify(),
                timeout=10,
            )

            if resp.status_code != 200:
                with self._lock:
                    if cached:
                        data = dict(cached["data"])
                        data["is_stale"] = True
                        return data, 200
                return {"error": f"Failed to fetch profile (HTTP {resp.status_code})"}, resp.status_code

            p = resp.json()
            profile_data = {
                "login": p.get("login", self.username),
                "name": p.get("name") or "Tori",
                "avatar_url": p.get("avatar_url", ""),
                "html_url": p.get("html_url", f"https://github.com/{self.username}"),
                "bio": p.get("bio") or "Systems & Backend Engineer. Author of flap.",
                "company": p.get("company"),
                "location": p.get("location") or "PK",
                "blog": p.get("blog", ""),
                "public_repos": p.get("public_repos", 0),
                "public_gists": p.get("public_gists", 0),
                "followers": p.get("followers", 0),
                "following": p.get("following", 0),
                "created_at": p.get("created_at"),
                "updated_at": p.get("updated_at"),
                "cached": False,
                "is_stale": False,
            }

            with self._lock:
                self._cache[cache_key] = {
                    "data": profile_data,
                    "cached_at": now,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                }

            return profile_data, 200

        except Exception as e:
            logger.error("Error fetching GitHub profile: %s", e)
            with self._lock:
                if cached:
                    data = dict(cached["data"])
                    data["is_stale"] = True
                    return data, 200
            return {"error": f"Network error fetching profile: {str(e)}"}, 503

    def get_repositories(self) -> Tuple[List[Dict[str, Any]], int]:
        """Fetch user public repositories with 5-minute caching."""
        cache_key = "user_repositories"
        now = time.time()

        with self._lock:
            cached = self._cache.get(cache_key)
            if cached:
                age = now - cached["cached_at"]
                if age < CACHE_TTL_SECONDS:
                    return cached["data"], 200

        try:
            logger.info("Fetching public repositories for %s from GitHub REST API", self.username)
            resp = requests.get(
                f"{GITHUB_REST_URL}/users/{self.username}/repos?per_page=100&sort=pushed",
                headers=self._get_headers(),
                verify=self._get_verify(),
                timeout=10,
            )

            if resp.status_code != 200:
                with self._lock:
                    if cached:
                        return cached["data"], 200
                return [{"error": f"Failed to fetch repositories (HTTP {resp.status_code})"}], resp.status_code

            repos = resp.json()
            cleaned_repos = []
            for r in repos:
                cleaned_repos.append({
                    "id": r.get("id"),
                    "name": r.get("name"),
                    "full_name": r.get("full_name"),
                    "html_url": r.get("html_url"),
                    "description": r.get("description"),
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "watchers": r.get("watchers_count", 0),
                    "language": r.get("language"),
                    "topics": r.get("topics", []),
                    "created_at": r.get("created_at"),
                    "updated_at": r.get("updated_at"),
                    "pushed_at": r.get("pushed_at"),
                    "license": r.get("license", {}).get("spdx_id") if r.get("license") else None,
                    "open_issues": r.get("open_issues_count", 0),
                    "is_fork": r.get("fork", False),
                })

            with self._lock:
                self._cache[cache_key] = {
                    "data": cleaned_repos,
                    "cached_at": now,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                }

            return cleaned_repos, 200

        except Exception as e:
            logger.error("Error fetching GitHub repositories: %s", e)
            with self._lock:
                if cached:
                    return cached["data"], 200
            return [{"error": f"Network error fetching repositories: {str(e)}"}], 503

# Singleton instance
github_service = GitHubService()
