# ==============================================================================
# Multi-Stage Production Dockerfile for Tori's Portfolio
# Builds flap's Rust core (Tokio + Hyper + Axum), compiles frontend SPA,
# and runs with FLAP_ENGINE=rust in high-performance production mode.
# ==============================================================================

# Stage 1: Frontend SPA Builder
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Rust & Python Core Compiler
FROM python:3.11-bookworm AS rust-builder
WORKDIR /app

# Install Rust toolchain for compiling flap's Rust engine
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Python build tools and maturin
RUN pip install --no-cache-dir maturin setuptools wheel

# Copy flap source code and compile Rust extension with LTO and opt-level 3
COPY backend/flap /app/backend/flap
WORKDIR /app/backend/flap
RUN maturin develop --release

# Stage 3: Production Runtime
FROM python:3.11-slim-bookworm AS runtime
WORKDIR /app

# Install system runtime dependencies and ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python runtime dependencies
RUN pip install --no-cache-dir \
    httptools>=0.5.0 \
    uvloop>=0.18.0 \
    orjson>=3.8.0 \
    requests>=2.31.0

# Copy compiled flap package with Rust extension from builder
COPY --from=rust-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=rust-builder /app/backend/flap /app/backend/flap

# Copy backend application source
COPY backend/ /app/backend/

# Copy compiled frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set production environment variables
ENV PYTHONUNBUFFERED=1
ENV FLAP_ENGINE=rust
ENV HOST=0.0.0.0
ENV PORT=8000
ENV PYTHONPATH=/app

# Verify flap engine at build time
RUN python -c "import flap; print('Flap version:', flap.__version__, '| Engine:', flap.get_engine(), '| Rust compiled:', flap.is_rust_available())"

# Security: Run as non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["python", "backend/app.py"]
