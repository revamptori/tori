"""
Tori's Personal Developer Portfolio — Backend Application
Built using flap: Rust-powered Python web framework (Tokio + Hyper + Axum).
"""
import os
import sys
import mimetypes
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to sys.path so local modules are importable
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure flap is imported from vendored backend/flap if not already in path
FLAP_DIR = BACKEND_DIR / "flap"
if str(FLAP_DIR) not in sys.path:
    sys.path.insert(0, str(FLAP_DIR))

import flap
from flap import Flap, Response, jsonify

from config import (
    HOST,
    PORT,
    DEBUG,
    FLAP_ENGINE,
    FRONTEND_DIST,
    logger,
)
from github_service import github_service
from benchmark_data import get_benchmarks_summary
from project_data import get_all_projects, get_project_by_id
from articles_data import get_all_articles, get_article_by_slug

# Initialize flap application
app = Flap(__name__, debug=DEBUG)

# ---------------------------------------------------------------------------
# Middleware / Hooks: CORS, Security Headers, and Preflight Handling
# ---------------------------------------------------------------------------

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
}

@app.before_request
def handle_options_preflight(req):
    """Short-circuit OPTIONS requests with standard CORS preflight headers."""
    if req.method == "OPTIONS":
        return Response("", status=204, headers=CORS_HEADERS)
    return None

@app.after_request
def apply_security_and_cors_headers(req, status, headers, body):
    """Add CORS and standard security headers to every response."""
    headers.update(CORS_HEADERS)
    headers["X-Content-Type-Options"] = "nosniff"
    headers["X-Frame-Options"] = "DENY"
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return status, headers, body, None

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET", "OPTIONS"])
def health_check(req):
    """System health check endpoint reporting flap engine and runtime status."""
    engine = flap.get_engine()
    rust_available = flap.is_rust_available()
    return jsonify({
        "status": "healthy",
        "app": "tori-portfolio",
        "author": "revamptori",
        "framework": "flap",
        "framework_version": flap.__version__,
        "engine": engine,
        "engine_detail": "Tokio + Hyper + Axum (Rust)" if engine == "rust" else "httptools + uvloop + orjson (Python)",
        "rust_engine_compiled": rust_available,
        "configured_engine": FLAP_ENGINE,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

@app.route("/api/github/contributions", methods=["GET", "OPTIONS"])
def get_github_contributions(req):
    """
    Fetch genuine, live-updating GitHub contribution calendar for the given year.
    Validates year parameter and rejects arbitrary inputs.
    """
    year_param = req.query.get("year", str(datetime.now(timezone.utc).year))
    try:
        validated_year = github_service.validate_year(year_param)
    except ValueError as e:
        return jsonify({
            "error": "Validation Error",
            "message": str(e),
            "valid_range": "2020 - current year"
        }, status=400)

    data, status_code = github_service.get_contributions(validated_year)
    return jsonify(data, status=status_code)

@app.route("/api/github/profile", methods=["GET", "OPTIONS"])
def get_github_profile(req):
    """Fetch GitHub profile metadata for revamptori with 5-minute cache."""
    data, status_code = github_service.get_profile()
    return jsonify(data, status=status_code)

@app.route("/api/github/repositories", methods=["GET", "OPTIONS"])
def get_github_repositories(req):
    """Fetch public repository metadata for revamptori with 5-minute cache."""
    data, status_code = github_service.get_repositories()
    return jsonify(data, status=status_code)

@app.route("/api/github/refresh", methods=["POST", "OPTIONS"])
def refresh_github_contributions(req):
    """
    Manual refresh endpoint.
    Forces cache invalidation and fetches fresh data from GitHub GraphQL API.
    Enforces a cooldown to prevent upstream abuse.
    """
    year_param = req.query.get("year", None)
    validated_year = None
    if year_param:
        try:
            validated_year = github_service.validate_year(year_param)
        except ValueError as e:
            return jsonify({
                "error": "Validation Error",
                "message": str(e)
            }, status=400)

    data, status_code = github_service.refresh_contributions(validated_year)
    return jsonify(data, status=status_code)

@app.route("/api/benchmarks", methods=["GET", "OPTIONS"])
def get_benchmarks(req):
    """Verified performance benchmarks from revamptori/flap repository."""
    return jsonify(get_benchmarks_summary())

@app.route("/api/projects", methods=["GET", "OPTIONS"])
def get_projects(req):
    """Curated projects list with live metadata integration."""
    return jsonify(get_all_projects())

@app.route("/api/projects/<id>", methods=["GET", "OPTIONS"])
def get_project_detail(req, id):
    """Detailed view for an individual project."""
    project = get_project_by_id(id)
    if not project:
        return jsonify({"error": "Project not found", "id": id}, status=404)
    return jsonify(project)

@app.route("/api/articles", methods=["GET", "OPTIONS"])
def get_articles(req):
    """Technical engineering articles list."""
    return jsonify(get_all_articles())

@app.route("/api/articles/<slug>", methods=["GET", "OPTIONS"])
def get_article_detail(req, slug):
    """Full content of a technical engineering article."""
    article = get_article_by_slug(slug)
    if not article:
        return jsonify({"error": "Article not found", "slug": slug}, status=404)
    return jsonify(article)

# ---------------------------------------------------------------------------
# Static File & SPA Fallback Serving (Production)
# ---------------------------------------------------------------------------

def _serve_file(file_path: Path) -> Response:
    """Helper to serve a static file with appropriate Content-Type."""
    if not file_path.is_file():
        return Response("Not Found", status=404, content_type="text/plain")
    
    ctype, _ = mimetypes.guess_type(str(file_path))
    if not ctype:
        if file_path.suffix in (".ts", ".tsx"):
            ctype = "application/javascript"
        elif file_path.suffix == ".svg":
            ctype = "image/svg+xml"
        elif file_path.suffix == ".html":
            ctype = "text/html; charset=utf-8"
        else:
            ctype = "application/octet-stream"
    elif ctype == "text/html":
        ctype = "text/html; charset=utf-8"

    try:
        content = file_path.read_bytes()
        headers = {
            "Content-Type": ctype,
        }
        # Cache static assets with content hashes indefinitely; do not cache index.html
        if file_path.name == "index.html":
            headers["Cache-Control"] = "no-cache, must-revalidate"
        else:
            headers["Cache-Control"] = "public, max-age=31536000, immutable"

        return Response(content, status=200, headers=headers, content_type=ctype)
    except Exception as e:
        logger.error("Error reading file %s: %s", file_path, e)
        return Response("Internal Server Error", status=500, content_type="text/plain")

@app.get("/assets/<path:filepath>")
def serve_frontend_assets(req, filepath):
    """Serve Vite static assets from frontend/dist/assets/."""
    if not FRONTEND_DIST.exists():
        return jsonify({"error": "Frontend build assets not found. Run npm run build."}, status=404)
    asset_file = FRONTEND_DIST / "assets" / filepath
    # Security: prevent path traversal outside FRONTEND_DIST
    try:
        resolved = asset_file.resolve()
        if not str(resolved).startswith(str(FRONTEND_DIST.resolve())):
            return Response("Forbidden", status=403, content_type="text/plain")
    except Exception:
        return Response("Forbidden", status=403, content_type="text/plain")
        
    return _serve_file(resolved)

@app.get("/favicon.svg")
def serve_favicon(req):
    """Serve favicon."""
    fav = FRONTEND_DIST / "favicon.svg"
    if fav.is_file():
        return _serve_file(fav)
    # Fallback to direct public folder
    public_fav = BACKEND_DIR.parent / "frontend" / "public" / "favicon.svg"
    if public_fav.is_file():
        return _serve_file(public_fav)
    return Response("", status=404)

@app.route("/", methods=["GET", "HEAD"])
def serve_spa_index(req):
    """Serve frontend index.html at root."""
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return _serve_file(index_file)
    # If frontend has not been compiled yet, return helpful status
    return jsonify({
        "message": "Tori Portfolio API is online (flap backend).",
        "frontend_status": "Build frontend with `cd frontend && npm run build` to serve SPA.",
        "documentation": "/api/health",
        "engine": flap.get_engine(),
    })

# Client-side SPA routes fallback to index.html
@app.route("/projects", methods=["GET", "HEAD"])
@app.route("/projects/<id>", methods=["GET", "HEAD"])
@app.route("/engineering", methods=["GET", "HEAD"])
@app.route("/engineering/<slug>", methods=["GET", "HEAD"])
@app.route("/benchmarks", methods=["GET", "HEAD"])
@app.route("/github", methods=["GET", "HEAD"])
@app.route("/about", methods=["GET", "HEAD"])
@app.route("/contact", methods=["GET", "HEAD"])
def serve_spa_routes(req, **kwargs):
    """Serve frontend index.html for client-side navigation paths."""
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return _serve_file(index_file)
    return serve_spa_index(req)

# ---------------------------------------------------------------------------
# Server Startup
# ---------------------------------------------------------------------------

def run_server(host: str = HOST, port: int = PORT, engine_override: str = None):
    """
    Start the flap server.
    
    Engine selection logic:
    - Production requirement: default FLAP_ENGINE=rust (Tokio + Hyper + Axum).
    - If FLAP_ENGINE=rust is set and the Rust extension is compiled, run with Rust engine.
    - If FLAP_ENGINE=rust is set but the Rust extension is not available in this environment
      (e.g., local sandboxes without cargo toolchains), flap architecture specifies:
      document the limitation and run in the compatible high-performance Python fallback
      (httptools + uvloop + orjson), rather than crashing or switching frameworks.
    """
    selected_engine = engine_override or FLAP_ENGINE
    rust_available = flap.is_rust_available()

    logger.info("Initializing Tori Portfolio backend (flap v%s)", flap.__version__)
    logger.info("Target FLAP_ENGINE: %s | Rust extension compiled: %s", selected_engine, rust_available)

    if selected_engine == "rust":
        if rust_available:
            logger.info("Starting flap server with native Rust engine (hyper + axum + tokio)...")
            app.run(host=host, port=port, engine="rust")
            return
        else:
            logger.warning(
                "DOCUMENTED LIMITATION: FLAP_ENGINE=rust was requested, but the Rust core extension (_flap) "
                "is not compiled in this environment (requires `maturin develop --release` with cargo and crates.io access). "
                "Activating flap's official high-performance Python fallback engine (uvloop + httptools + orjson) "
                "as specified in flap architecture. In Docker production containers with cargo, Rust engine is active."
            )
            # Use flap's official Python fallback engine
            app.run(host=host, port=port, engine="python")
            return

    # Normal python fallback or auto
    app.run(host=host, port=port, engine=selected_engine)

if __name__ == "__main__":
    run_server()
