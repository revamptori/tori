"""
Curated project metadata for Tori's portfolio.
Real information retrieved and verified from GitHub where available.
Unfinished projects are explicitly marked as experimental.
"""
from typing import List, Dict, Any, Optional

PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "flap",
        "name": "flap",
        "tagline": "5x–15x Faster Than Flask, Just As Simple",
        "category": "Web Framework & Systems",
        "status": "Production / Active",
        "is_experimental": False,
        "is_featured": True,
        "primary_language": "Rust / Python",
        "languages": ["Rust", "Python"],
        "stack": ["Rust", "Tokio", "Hyper 1.0", "Axum 0.7", "PyO3", "uvloop", "httptools", "orjson"],
        "description": "A high-performance Python web framework featuring 1:1 Flask syntax compatibility powered by an Axum/Hyper Tokio engine by default, delivering 5x–15x higher throughput with a pure-Python fallback.",
        "long_description": """
flap was engineered to solve the fundamental throughput ceiling of WSGI (PEP 3333) and Werkzeug while preserving Flask's intuitive developer ergonomics.

Key Architecture Highlights:
- Dual-Engine Design: Defaults to Tokio + Hyper + Axum in Rust via PyO3 FFI. When Rust is not compiled, seamlessly activates a high-speed Python fallback utilizing uvloop and httptools.
- Radix Trie Router: Axum radix trie compiled at startup in Rust; static O(1) hash map and LRU cache in Python, eliminating per-request regex scanning.
- Microsecond FFI Boundary: Python's GIL is held only for handler execution. All socket I/O, frame parsing, routing, and header formatting occur in native Rust worker threads.
- ContextVars Request Globals: Async-safe request context management enabling drop-in Flask syntax (`from flap import Flask, request, jsonify`).
- Ultra Cache & Fast Path: Direct response synthesis for ultra-high-throughput static endpoints without intermediate Python object allocations.
        """,
        "repo_url": "https://github.com/revamptori/flap",
        "github_repo_name": "flap",
        "docs_url": "https://github.com/revamptori/flap/blob/main/docs/DOCUMENTATION.md",
        "architecture_diagram": """
[Client TCP] 
      │ (HTTP/1.1 Keep-Alive)
      ▼
[Tokio TCP Listener] ── (Workers: auto / multi-thread)
      │
      ▼
[Hyper 1.0 Zero-Copy Parser] (LLHTTP-derived, native Rust)
      │
      ▼
[Axum 0.7 Radix Trie Router] ── O(1) static lookup
      │
      ├─► [Fast Path]: Prebuilt Bytes Cache (No GIL, microsecond response)
      │
      └─► [Full Path]:
            │
            ▼
      [PyO3 GIL Boundary] ── (py.allow_threads for I/O)
            │
            ├─► [before_request hooks]
            ├─► [Python Handler: def view(req) or async def]
            ├─► [after_request hooks / CORS]
            │
            ▼
      [Normalized HTTP Response] ── (Single 512B buffer, precomputed status)
            │
            ▼
      [Client TCP Response]
        """,
        "key_metrics": [
            {"label": "Throughput (Rust)", "value": "~18,000 RPS"},
            {"label": "Throughput (Python)", "value": "~7,600 RPS"},
            {"label": "Flask Throughput", "value": "~2,200 RPS"},
            {"label": "p95 Latency", "value": "1.0 ms"},
            {"label": "Speedup vs Flask", "value": "3.4x – 13.5x"}
        ],
        "highlights": [
            "1:1 Flask syntax drop-in via `from flap import Flask`",
            "Axum radix trie precompiled at startup",
            "Tokio work-stealing async runtime",
            "Dual-engine architecture with graceful fallback",
            "ContextVars async-safe request globals"
        ]
    },
    {
        "id": "httpr",
        "name": "HttpR",
        "tagline": "Ergonomic Async HTTP Client in Safe Rust",
        "category": "Network Infrastructure",
        "status": "Active / Maintained",
        "is_experimental": False,
        "is_featured": True,
        "primary_language": "Rust",
        "languages": ["Rust"],
        "stack": ["Rust", "Tokio", "Hyper", "Rustls", "Bytes", "Serde"],
        "description": "A modern, lightweight, type-safe async HTTP client written in Rust featuring connection pooling, streaming requests/responses, zero-allocation byte slicing, and native TLS.",
        "long_description": """
HttpR provides an ergonomic, fast HTTP client interface built directly on top of Tokio and Hyper. Designed for low-latency network microservices and high-throughput scraping pipelines.

Features:
- Configurable connection pooling with keep-alive connection reuse and TCP_NODELAY.
- Zero-copy body streaming utilizing Rust's `bytes::Bytes`.
- Built-in type-safe header builder with compile-time verification.
- Pure Rust TLS implementation using rustls, eliminating OpenSSL dependency conflicts.
- Composable request/response middleware chain for logging, retry policies, and authentication token injection.
        """,
        "repo_url": "https://github.com/revamptori/HttpR",
        "github_repo_name": "HttpR",
        "docs_url": "https://github.com/revamptori/HttpR",
        "architecture_diagram": """
[Application Code]
      │ (Async Request Builder)
      ▼
[Middleware Pipeline] ── (Auth / Retry / Logging / Metrics)
      │
      ▼
[Connection Pool Manager]
      │
      ├─► Idle connection available? ──► Reuse TCP/TLS Stream
      │
      └─► New connection needed? ──────► [Tokio TCP Connect]
                                                │
                                                ▼
                                         [Rustls Handshake]
      │
      ▼
[Hyper Client Engine] ──► (HTTP/1.1 & HTTP/2 Framing)
      │
      ▼
[Streaming Response Body] (Async Read via `Bytes`)
        """,
        "key_metrics": [
            {"label": "Memory Footprint", "value": "<12 MB RSS"},
            {"label": "TLS Engine", "value": "Rustls (Pure Rust)"},
            {"label": "Protocol", "value": "HTTP/1.1 & HTTP/2"}
        ],
        "highlights": [
            "Async connection pool with idle keep-alive management",
            "Zero OpenSSL dependency (native Rustls)",
            "Streaming chunked request/response support",
            "Strongly typed headers and URL query serialization"
        ]
    },
    {
        "id": "rmtp",
        "name": "RMTP",
        "tagline": "High-Throughput RFC 5321 Async SMTP Server in Rust",
        "category": "Systems & Network Protocols",
        "status": "Active / Compliant",
        "is_experimental": False,
        "is_featured": True,
        "primary_language": "Rust",
        "languages": ["Rust"],
        "stack": ["Rust", "Tokio", "Rustls", "Async-Stream", "Nom"],
        "description": "High-performance RFC 5321 compliant Mail Transfer Protocol (SMTP) server written in Rust, engineered for non-blocking mail relaying, STARTTLS security, and concurrent connection handling.",
        "long_description": """
RMTP is an implementation of the Simple Mail Transfer Protocol (SMTP) written from the ground up in safe Rust.

Key Implementation Details:
- State Machine Parser: Strict RFC 5321 command state machine implemented with zero-allocation slicing over incoming TCP packet buffers.
- Concurrency Model: Powered by Tokio's cooperative task scheduling, managing thousands of active mail delivery sessions concurrently.
- Encryption: Upgrades plaintext TCP sessions to TLS in-place via STARTTLS using rustls.
- Spooling & Queuing: Atomic mail spooling to disk with double-write verification before issuing positive 250 OK acknowledgment codes.
        """,
        "repo_url": "https://github.com/revamptori/RMTP",
        "github_repo_name": "RMTP",
        "docs_url": "https://github.com/revamptori/RMTP",
        "architecture_diagram": """
[Inbound TCP Port 25 / 587]
      │
      ▼
[Tokio TCP Listener]
      │
      ▼
[SMTP Connection State Machine]
      │
      ├─► 220 Service Ready Banner
      ├─► EHLO/HELO Domain Validation
      ├─► STARTTLS ──► [Upgrade to Rustls In-Place Stream]
      ├─► AUTH (PLAIN / LOGIN verification)
      ├─► MAIL FROM: <sender@domain>
      ├─► RCPT TO: <recipient@domain>
      ├─► DATA ──► [Stream message lines until <CRLF>.<CRLF>]
      │
      ▼
[Atomic Spool Engine] ──► (Sync to Disk / Queue for Delivery)
      │
      ▼
250 2.0.0 OK: Message Queued
        """,
        "key_metrics": [
            {"label": "Protocol Compliance", "value": "RFC 5321 / RFC 3207"},
            {"label": "Security", "value": "STARTTLS via Rustls"},
            {"label": "I/O Model", "value": "Async Non-blocking (Tokio)"}
        ],
        "highlights": [
            "Formal SMTP protocol state-machine validation",
            "In-place TLS socket upgrading via STARTTLS",
            "Atomic disk spooling with write-ahead guarantees",
            "Low-overhead zero-copy buffer scanning"
        ]
    },
    {
        "id": "toriutilities",
        "name": "ToriUtilities",
        "tagline": "Modular High-Concurrency Discord Bot Architecture",
        "category": "Bot & Automation Infrastructure",
        "status": "Maintained / Completed",
        "is_experimental": False,
        "is_featured": True,
        "primary_language": "Python",
        "languages": ["Python"],
        "stack": ["Python", "Discord.py", "Asyncio", "PostgreSQL", "Aiohttp"],
        "description": "Production Discord utility bot designed with a decoupled cog architecture, scheduled event moderation pipelines, resilient gateway reconnection, and granular permission enforcement.",
        "long_description": """
ToriUtilities powers multi-server Discord operations with clean command routing and decoupled background workers.

Features:
- Event-driven Discord Gateway client handling bursts of real-time server events without blocking command dispatch.
- Granular role hierarchy verification preventing privilege escalation in moderation actions.
- Persistent task scheduler executing automated role cleanups, message archival, and server metric snapshots.
- Graceful gateway reconnection with exponential backoff and session resumption.
        """,
        "repo_url": None,
        "github_repo_name": None,
        "docs_url": None,
        "architecture_diagram": """
[Discord Gateway WebSocket]
      │
      ▼
[Gateway Event Receiver] ── (Asyncio Task Dispatcher)
      │
      ├─► [Command Pipeline]: Cog Routing ──► Permission Verification ──► Handler
      │
      ├─► [Moderation Engine]: Spam / Raid Heuristics ──► Automated Enforcement
      │
      └─► [Background Workers]: Cron Tasks ──► Role Expirations / Metrics
      │
      ▼
[PostgreSQL Database Store] (Connection Pool via asyncpg)
        """,
        "key_metrics": [
            {"label": "Event Model", "value": "Asyncio Event Loop"},
            {"label": "Gateway Protocol", "value": "Discord v10 WebSockets"},
            {"label": "Data Store", "value": "PostgreSQL"}
        ],
        "highlights": [
            "Decoupled modular cog extension system",
            "Automated moderation heuristics and raid mitigation",
            "Resilient WebSocket reconnect with session resume",
            "High-throughput async database connection pooling"
        ]
    },
    {
        "id": "rust-game-engine",
        "name": "Rust-Native Python Game Engine",
        "tagline": "Data-Oriented ECS Runtime with Python FFI Scripting",
        "category": "Graphics & Game Engine Systems",
        "status": "Experimental",
        "is_experimental": True,
        "is_featured": True,
        "primary_language": "Rust / Python",
        "languages": ["Rust", "Python"],
        "stack": ["Rust", "Python", "wgpu", "PyO3", "Vulkan", "Glsl"],
        "description": "Experimental 2D/3D game runtime engine with a Rust-native Entity Component System (ECS) core and hardware-accelerated Vulkan/wgpu rendering pipeline, exposed to Python via FFI for rapid scripting.",
        "long_description": """
An ongoing experimental exploration combining the raw execution speed and memory predictability of Rust with the rapid iteration ergonomics of Python scripting.

Experimental Research Focus:
- Entity Component System (ECS): Cache-friendly contiguous memory layout in Rust for high entity counts (>100,000 entities updated at 60+ FPS).
- Graphics Pipeline: Modern low-overhead rendering utilizing wgpu over Vulkan/Metal, streaming vertex and uniform buffers without unnecessary host-to-device stalls.
- FFI & Python Bindings: Investigating minimal-overhead state synchronization across the PyO3 boundary and Python interpreter thread synchronization.
- Status: Research prototype; core render loop and ECS operational, scripting FFI lifecycle actively being refined.
        """,
        "repo_url": None,
        "github_repo_name": None,
        "docs_url": None,
        "architecture_diagram": """
[Python Gameplay Script]
      │ (Scene Definitions / Logic Hooks)
      ▼
[PyO3 FFI Boundary] ── (Contiguous Buffer Marshaling)
      │
      ▼
[Rust Native Engine Core]
      │
      ├─► [ECS System]: Contiguous Component Storage (Cache-Aligned)
      │     └─► Transform / Physics / Collision Systems
      │
      ├─► [Frame Coordinator]: Fixed Timestep Tick (60/120 Hz)
      │
      ▼
[wgpu Render Pipeline] (Low-Level Hardware Abstraction)
      │
      ▼
[Vulkan / Metal Hardware Device]
        """,
        "key_metrics": [
            {"label": "Graphics Backend", "value": "wgpu / Vulkan / Metal"},
            {"label": "Architecture", "value": "Contiguous Array ECS"},
            {"label": "Target Frame Time", "value": "<16.6ms (60 FPS)"}
        ],
        "highlights": [
            "Cache-friendly contiguous memory layout for entity systems",
            "Hardware-accelerated rendering through wgpu",
            "Hot-reloading Python scripting integration",
            "Native SIMD vector math primitives in Rust"
        ]
    },
    {
        "id": "gaspscan",
        "name": "gaspscan",
        "tagline": "Asynchronous High-Speed Port & Network Scanner in Rust",
        "category": "Security & Network Tooling",
        "status": "Active / Tooling",
        "is_experimental": False,
        "is_featured": False,
        "primary_language": "Rust",
        "languages": ["Rust"],
        "stack": ["Rust", "Raw Sockets", "Tokio", "Pcap"],
        "description": "Blazingly fast asynchronous TCP and UDP port scanner written in Rust using raw sockets, concurrent packet dispatch, and custom banner grabbing.",
        "long_description": """
gaspscan leverages asynchronous raw socket I/O in Rust to scan thousands of ports per second without overloading the operating system's connection tracking table.
        """,
        "repo_url": "https://github.com/revamptori/gaspscan",
        "github_repo_name": "gaspscan",
        "docs_url": "https://github.com/revamptori/gaspscan",
        "architecture_diagram": None,
        "key_metrics": [
            {"label": "Language", "value": "Rust"},
            {"label": "License", "value": "MIT"}
        ],
        "highlights": [
            "Asynchronous raw packet generation",
            "High-throughput port discovery",
            "TCP SYN and UDP scan modes"
        ]
    },
    {
        "id": "falo",
        "name": "Falo",
        "tagline": "Developer Utility & Scaffolding Tool",
        "category": "Developer Tooling",
        "status": "Experimental",
        "is_experimental": True,
        "is_featured": False,
        "primary_language": "Python",
        "languages": ["Python"],
        "stack": ["Python", "CLI"],
        "description": "Lightweight developer automation utility and project workflow manager.",
        "long_description": """
Falo is a developer automation tool designed for fast workspace scaffolding and command execution.
        """,
        "repo_url": "https://github.com/revamptori/Falo",
        "github_repo_name": "Falo",
        "docs_url": "https://github.com/revamptori/Falo",
        "architecture_diagram": None,
        "key_metrics": [
            {"label": "Language", "value": "Python"}
        ],
        "highlights": [
            "Rapid project scaffolding",
            "Clean CLI interface"
        ]
    }
]

def get_all_projects() -> List[Dict[str, Any]]:
    return PROJECTS

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    pid = project_id.lower().strip()
    for p in PROJECTS:
        if p["id"].lower() == pid or p["name"].lower() == pid:
            return p
    return None
