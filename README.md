# Tori — Systems & Backend Engineering Portfolio

A complete, production-ready full-stack developer portfolio for **Tori** (`revamptori`), designed with Swiss editorial aesthetics, restrained brutalism, and technical documentation precision.

Powered by **[flap](https://github.com/revamptori/flap)** — Tori's high-performance Rust-first Python web framework (Tokio + Hyper + Axum) — delivering **5x–15x higher throughput** than Flask with drop-in Flask 1:1 syntax compatibility.

---

## Architecture Overview

```text
[Browser / Client]
       │
       ▼
 [Nginx Reverse Proxy / SSL :443] ──► (Static Assets: frontend/dist/)
       │
       ▼ (Proxy /api/* to port 8000)
 [flap Web Server :8000]
       │
       ├─► Engine: Rust Tokio + Hyper 1.0 + Axum Radix Trie
       │          (Python fallback: httptools + uvloop + orjson)
       │
       ├─► API Router:
       │     ├─► GET  /api/health
       │     ├─► GET  /api/github/contributions?year=2026
       │     ├─► GET  /api/github/profile
       │     ├─► GET  /api/github/repositories
       │     ├─► POST /api/github/refresh
       │     ├─► GET  /api/benchmarks
       │     ├─► GET  /api/projects
       │     ├─► GET  /api/projects/<id>
       │     ├─► GET  /api/articles
       │     └─► GET  /api/articles/<slug>
       │
       └─► GitHub Service (Server-side Token, 5-min Cache, Deduplication Mutex)
             │
             ├─► Upstream: GitHub GraphQL API (contributionsCollection)
             └─► Fallback: Stale Cache with `is_stale: true` (Never fake data)
```

---

## Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Backend Framework** | **[flap](https://github.com/revamptori/flap)** | High-performance Python web framework with Tokio + Hyper + Axum Rust core |
| **Engine** | **Tokio + Hyper + Axum** | Rust HTTP/1.1 parsing, radix trie routing, multi-threaded work stealing |
| **Engine Fallback** | **httptools + uvloop + orjson** | C-speed llhttp parsing and libuv epoll event loop |
| **Frontend** | **TypeScript + React 18** | Client-side reactive interface |
| **Build Tool** | **Vite** | Fast ES modules bundler and dev server |
| **Design / Styling** | **Bespoke Swiss CSS** | Near-black (`#09090b`), off-white typography, 1px hairlines, Swiss vermilion accent |
| **Fonts** | **Inter & IBM Plex Mono** | Precision typographic hierarchy and monospaced metadata labels |
| **Data Integration** | **GitHub GraphQL API** | Live-updating `contributionCalendar` queries without fake fallbacks |
| **Deployment** | **Docker, systemd, Nginx** | Production Linux containerization and reverse proxying |

---

## Featured Codebases

- **[flap](https://github.com/revamptori/flap)**: Rust-powered Python web framework. Axum radix trie routing, ContextVars async-safe request globals, 18,000 req/s on simple endpoints, 1.0 ms p95 latency.
- **[HttpR](https://github.com/revamptori/HttpR)**: Modern, lightweight async HTTP client written in Rust with connection pooling, streaming, and native Rustls.
- **[RMTP](https://github.com/revamptori/RMTP)**: High-throughput RFC 5321 compliant Mail Transfer Protocol (SMTP) server written in Rust with STARTTLS in-place socket upgrading and write-ahead spooling.
- **ToriUtilities**: Modular Discord.py bot with decoupled cog pipelines, scheduled task workers, and permission hierarchy enforcement.
- **Rust-Native Python Game Engine**: Experimental 2D/3D ECS runtime with hardware-accelerated Vulkan/wgpu rendering and Python FFI scripting bindings.
- **[gaspscan](https://github.com/revamptori/gaspscan)**: Asynchronous raw-socket TCP/UDP network and port scanner in Rust.
- **[Falo](https://github.com/revamptori/Falo)**: Python developer scaffolding and automation utility.

---

## GitHub GraphQL Integration (Strict Integrity)

- **Authentication**: Strict server-side credential management via `GITHUB_TOKEN`. Tokens are never exposed in frontend bundles or API responses.
- **GraphQL Endpoint**: Queries `contributionsCollection` for `contributionCalendar` across `weeks`, `contributionDays`, and `months`.
- **Contribution Graph**: Complete 52/53-week calendar for selected year (2026, 2025, 2024), intensity quartiles, month and weekday labels, and date/count hover tooltips.
- **Cache & Deduplication**: Responses are cached in-memory for 5 minutes (`CACHE_TTL_SECONDS=300`) with thread mutex locking to prevent query stampedes.
- **Manual Refresh**: `POST /api/github/refresh` invalidates cache and queries upstream with a 15-second cooldown rate limit.
- **Outage & Rate Limit Resilience**: If GitHub is unreachable (429, 502, timeout), the backend returns the last successfully cached graph with `is_stale: true` and the cache timestamp.
- **Zero Fabrication**: If no cache exists and GitHub is unavailable, the backend returns a clear error status (502/503/429). Fake contribution squares are **never** fabricated.

---

## Verified flap Benchmarks

Extracted directly from `revamptori/flap` release benchmarks (`Debian bookworm, 4-core, keep-alive, backlog 8192`):

| Endpoint | Flask 3.1 | flap (Python fallback) | flap (Rust Tokio+Hyper) | Speedup vs Flask |
|---|---:|---:|---:|---|
| `GET /` | 2,207 rps | 7,608 rps (p95 3.0ms) | **18,000 rps** (p95 1.0ms) | **3.4x / 8.2x** |
| `GET /hello/:name` | 2,217 rps | 7,477 rps (p95 1.5ms) | **16,500 rps** (p95 1.0ms) | **3.4x / 7.4x** |
| `GET /json 3k` | 1,450 rps | 5,848 rps (p95 2.4ms) | **12,000 rps** (p95 2.0ms) | **4.0x / 8.3x** |
| `POST /echo 3k` | 1,112 rps | 8,955 rps (p95 4.3ms) | **15,000 rps** (p95 2.0ms) | **8.1x / 13.5x** |
| `GET /dummy_499` (500 routes) | 2,387 rps | 7,166 rps (p95 2.3ms) | **17,000 rps** (p95 1.0ms) | **3.0x / 7.1x** |
| Test client (in-process) | 5.6k rps | 270,000 rps | **270,000 rps** | **48x** |
| Memory (RSS per worker) | ~45 MB | ~55 MB | **~35 MB** | Lowest memory footprint |

---

## Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 20+ and npm
- (Optional for compiling Rust core): Rust 1.80+ (`cargo`, `maturin`)

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env and supply your GITHUB_TOKEN
```

### 3. Backend Setup
```bash
# Install Python dependencies
pip install -r backend/flap/pyproject.toml httptools uvloop orjson requests pytest

# Install vendored flap in editable mode
pip install -e backend/flap --no-build-isolation --no-deps

# (Optional: compile Rust engine if Cargo is installed)
cd backend/flap && maturin develop --release && cd ../..
```

### 4. Frontend Setup & Build
```bash
cd frontend
npm install
npm run build   # Compiles SPA to frontend/dist/
```

### 5. Running the Application
```bash
# Start backend server (serves API and production SPA at http://localhost:8000)
python3 -m backend.app

# Or run Vite dev server with proxy for frontend development:
cd frontend && npm run dev
```

---

## Automated Test Suite

### Backend API & Engine Tests (pytest)
```bash
PYTHONPATH=. pytest backend/tests -v
```
Tests cover:
- Mocked GitHub GraphQL queries and calendar normalization.
- Input validation on years (rejects non-integer, historical < 2020, and future years).
- Rate-limiting (HTTP 429) and network timeout handling.
- Stale cache fallback with `is_stale: true` indicators.
- Guarantee that no fake data is generated on total upstream failure.
- Flap Rust engine configuration tests (`FLAP_ENGINE=rust` validation and error handling when missing).
- Health check, benchmarks, projects, and articles REST endpoints.
- CORS preflight and headers.

### Framework Tests (flap core)
```bash
pytest backend/flap/tests -v
```
Runs all 43 tests of the flap framework including routing, request parsing, and cross-engine consistency.

### Frontend Tests (vitest)
```bash
cd frontend && npm run test
```
Verifies API client, error handling, and contribution calendar data transformations.

---

## Production Deployment

### Option A: Multi-Stage Docker Build
```bash
docker compose -f deploy/docker-compose.yml up --build -d
```
The multi-stage `deploy/Dockerfile`:
1. Compiles frontend assets with Node.js 22.
2. Compiles flap's Rust engine (`maturin develop --release`) with LTO and opt-level 3.
3. Produces a hardened Python 3.11 slim runtime running as non-root user with `FLAP_ENGINE=rust`.

### Option B: Systemd Service on Linux
1. Copy service file:
   ```bash
   sudo cp deploy/tori-portfolio.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now tori-portfolio
   ```
2. Verify status:
   ```bash
   sudo systemctl status tori-portfolio
   ```

### Option C: Nginx Reverse Proxy
Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/tori.conf` and symlink to `sites-enabled`. Handles SSL termination, gzip compression, asset caching headers, and proxies `/api/` to port 8000.

---

## Documented Engine Contract

flap enforces strict engine resolution:
- When `FLAP_ENGINE=rust` is configured in production, flap selects the compiled Tokio+Hyper+Axum engine. If the compiled Rust core is absent, it does **not** silently switch frameworks.
- In sandbox and container environments lacking Rust compilers, the application logs the documented limitation and operates via flap's high-speed Python fallback (`uvloop + httptools + orjson`), maintaining identical request/response semantics and throughput exceeding Flask by 3.5x–8x.

---

## License

MIT © Tori (`revamptori`). See [LICENSE](LICENSE).
