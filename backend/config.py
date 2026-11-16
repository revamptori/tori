"""
Configuration and environment management for Tori's portfolio backend.
"""
import os
import sys
import logging
from pathlib import Path

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"

# Ensure CA certificates are properly configured for requests in sandboxed/proxy environments
SYSTEM_CA_BUNDLE = "/etc/ssl/certs/ca-certificates.crt"
if os.path.exists(SYSTEM_CA_BUNDLE):
    os.environ.setdefault("REQUESTS_CA_BUNDLE", SYSTEM_CA_BUNDLE)
    os.environ.setdefault("SSL_CERT_FILE", SYSTEM_CA_BUNDLE)

# GitHub Configuration
# Never hardcode secrets. Reads from GITHUB_TOKEN or GH_TOKEN
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN") or ""
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "revamptori").strip()
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GITHUB_REST_URL = "https://api.github.com"

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

# Flap Engine Configuration: "rust", "python", or "auto"
# Production default is "rust"
FLAP_ENGINE = os.getenv("FLAP_ENGINE", "rust").strip().lower()

# Cache Configuration
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))  # 5 minutes
REFRESH_COOLDOWN_SECONDS = int(os.getenv("REFRESH_COOLDOWN_SECONDS", "15"))  # Rate limit manual refresh

# Configure structured logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("tori.portfolio")
