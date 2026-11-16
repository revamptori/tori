"""
Verified benchmark data directly extracted from revamptori/flap repository.
Sources: flap/benchmarks/results.md, flap/docs/PERFORMANCE.md, flap/docs/COMPETITION.md.
"""
from typing import Dict, Any, List

BENCHMARK_METHODOLOGY = {
    "title": "Hardware-Equivalent, Concurrency-Equivalent Benchmark Suite",
    "hardware": "Debian GNU/Linux 12 (bookworm), 4 vCPUs, 8 GB RAM, Python 3.11.2",
    "network": "Localhost loopback (no WAN/LAN jitter)",
    "protocol": "HTTP/1.1 keep-alive enabled, TCP_NODELAY, socket backlog 8192",
    "parameters": "1,000 requests per run, concurrency=10 (quick suite) and concurrency=20 (sustained suite)",
    "source_repository": "https://github.com/revamptori/flap",
    "source_files": [
        "benchmarks/benchmark.py",
        "benchmarks/compare_all.py",
        "benchmarks/results.md",
        "docs/PERFORMANCE.md"
    ],
    "verification_notice": "All data represents measured values from release builds (maturin develop --release with LTO thin and opt-level 3 for Rust; httptools + uvloop + orjson for Python). Results are reproducible via `python benchmarks/benchmark.py --quick` in the flap repository."
}

# The 6 Bottlenecks eliminated by flap (from docs/OPTIMIZATION.md & docs/PERFORMANCE.md)
BOTTLENECKS = [
    {
        "id": "A",
        "name": "HTTP Parsing",
        "flask_bottleneck": "Werkzeug pure-Python readline() loops and string allocations per header line (~0.3ms per request).",
        "flap_solution": "Rust-native hyper 1.0 (zero-copy Bytes) in Rust engine; C-speed httptools (Node.js llhttp parser) in Python fallback.",
        "impact": "Parses HTTP frames in microsecond C/Rust space without allocating intermediate Python strings."
    },
    {
        "id": "B",
        "name": "WSGI Environ Dict Creation",
        "flask_bottleneck": "PEP 3333 requires Werkzeug to construct a 20+ key dictionary plus BytesIO wrappers on every incoming request (~0.4ms).",
        "flap_solution": "Flat method/path/headers/body struct with lazy properties; query parsing (parse_qs), cookies, and JSON decoding only execute on access.",
        "impact": "Eliminates ~1,200 dictionary and string allocations per 100 requests."
    },
    {
        "id": "C",
        "name": "GIL & Threading Contention",
        "flask_bottleneck": "ThreadingMixIn spawns Python threads contending heavily for the GIL; synchronous I/O blocks event processing.",
        "flap_solution": "Rust Tokio work-stealing threadpool runs outside the GIL via `py.allow_threads`; Python GIL is acquired solely for handler invocation.",
        "impact": "Multi-threaded socket I/O, routing, and header formatting scale across CPU cores without GIL bottlenecks."
    },
    {
        "id": "D",
        "name": "JSON Serialization",
        "flask_bottleneck": "Flask jsonify uses stdlib json.dumps, which walks Python ASTs and performs multiple memory reallocations.",
        "flap_solution": "Rust serde_json in Rust core; orjson (compiled Rust extension) in Python fallback.",
        "impact": "8.1x - 13x higher throughput on JSON echo and payload endpoints."
    },
    {
        "id": "E",
        "name": "Routing Lookup Overhead",
        "flask_bottleneck": "Werkzeug Map performs linear O(N) regex scanning over route rules on every dispatch.",
        "flap_solution": "Axum radix trie precompiled at startup in Rust; static O(1) hash table + LRU cache (2048 entries) in Python fallback.",
        "impact": "Router dispatch time reduced from ~0.4ms to O(1) <15 microseconds even with 500+ routes."
    },
    {
        "id": "F",
        "name": "Response Serialization & Buffering",
        "flask_bottleneck": "Iterative response formatting constructs headers and body across multiple allocations.",
        "flap_solution": "Precomputed HTTP/1.1 status lines, single 512-byte reusable bytearray buffer, direct bytes header writes, chunked streaming support.",
        "impact": "Minimizes response buffer reallocations and syscall overhead."
    }
]

# Workload comparison metrics (RPS and Latency p95 in ms)
WORKLOADS = [
    {
        "endpoint": "GET /",
        "description": "Minimal text response ('Hello, Flap!') evaluating raw HTTP framing throughput",
        "rps": {
            "flask": 2207,
            "flap_python": 7608,
            "flap_rust": 18000,
            "express": 3339,
            "gin": 22000,
            "drogon": 55000
        },
        "p95_latency_ms": {
            "flask": 5.5,
            "flap_python": 3.0,
            "flap_rust": 1.0,
            "express": 6.9
        },
        "speedup_vs_flask": {
            "flap_python": "3.4x",
            "flap_rust": "8.2x"
        }
    },
    {
        "endpoint": "GET /hello/:name",
        "description": "Dynamic route parameter extraction and string interpolation (<name>)",
        "rps": {
            "flask": 2217,
            "flap_python": 7477,
            "flap_rust": 16500,
            "express": 3284,
            "gin": 21000,
            "drogon": 52000
        },
        "p95_latency_ms": {
            "flask": 6.0,
            "flap_python": 1.5,
            "flap_rust": 1.0,
            "express": 4.5
        },
        "speedup_vs_flask": {
            "flap_python": "3.4x",
            "flap_rust": "7.4x"
        }
    },
    {
        "endpoint": "GET /json 3k",
        "description": "JSON payload serialization with 3,000 array items and nested structures (~3 KB payload)",
        "rps": {
            "flask": 1450,
            "flap_python": 5848,
            "flap_rust": 12000,
            "express": 2230,
            "gin": 12000,
            "drogon": 35000
        },
        "p95_latency_ms": {
            "flask": 8.6,
            "flap_python": 2.4,
            "flap_rust": 2.0,
            "express": 6.9
        },
        "speedup_vs_flask": {
            "flap_python": "4.0x",
            "flap_rust": "8.3x"
        }
    },
    {
        "endpoint": "POST /echo 3k",
        "description": "POST request parsing, JSON deserialization, and echo serialization of 3 KB payload",
        "rps": {
            "flask": 1112,
            "flap_python": 8955,
            "flap_rust": 15000,
            "express": 2100,
            "gin": 14000,
            "drogon": 40000
        },
        "p95_latency_ms": {
            "flask": 11.9,
            "flap_python": 4.3,
            "flap_rust": 2.0,
            "express": 8.2
        },
        "speedup_vs_flask": {
            "flap_python": "8.1x",
            "flap_rust": "13.5x"
        }
    },
    {
        "endpoint": "GET /dummy_499",
        "description": "Router dispatch performance under 500 registered routes testing routing table degradation",
        "rps": {
            "flask": 2387,
            "flap_python": 7166,
            "flap_rust": 17000,
            "express": 3315,
            "gin": 23000,
            "drogon": 56000
        },
        "p95_latency_ms": {
            "flask": 5.5,
            "flap_python": 2.3,
            "flap_rust": 1.0,
            "express": 5.3
        },
        "speedup_vs_flask": {
            "flap_python": "3.0x",
            "flap_rust": "7.1x"
        }
    },
    {
        "endpoint": "Test Client (In-Process)",
        "description": "Zero-TCP in-process test client dispatch benchmark (no socket overhead)",
        "rps": {
            "flask": 5600,
            "flap_python": 270000,
            "flap_rust": 270000,
            "express": 0,
            "gin": 0,
            "drogon": 0
        },
        "p95_latency_ms": {
            "flask": 0.18,
            "flap_python": 0.003,
            "flap_rust": 0.003,
            "express": 0
        },
        "speedup_vs_flask": {
            "flap_python": "48x",
            "flap_rust": "48x"
        }
    }
]

RESOURCE_UTILIZATION = {
    "description": "Resource footprint under sustained 10,000 request load",
    "metrics": [
        {
            "framework": "Flask 3.1 (Werkzeug)",
            "cpu_utilization_pct": 80,
            "cores_active": 1,
            "memory_rss_mb": 45.2,
            "notes": "Single core GIL-bound; high Python object churn"
        },
        {
            "framework": "flap Python (httptools+uvloop+orjson)",
            "cpu_utilization_pct": 60,
            "cores_active": 1,
            "memory_rss_mb": 54.8,
            "notes": "uvloop epoll event loop; zero-copy C parsing reduces CPU"
        },
        {
            "framework": "flap Rust (Tokio+Hyper+Axum)",
            "cpu_utilization_pct": 120,
            "cores_active": 2,
            "memory_rss_mb": 34.6,
            "notes": "Multi-threaded Tokio work-stealing pool; lowest memory footprint"
        }
    ]
}

def get_benchmarks_summary() -> Dict[str, Any]:
    return {
        "methodology": BENCHMARK_METHODOLOGY,
        "bottlenecks": BOTTLENECKS,
        "workloads": WORKLOADS,
        "resource_utilization": RESOURCE_UTILIZATION
    }
