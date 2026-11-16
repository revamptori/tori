import { ArticleDetail, ArticleSummary } from '../types';

export const ARTICLES: ArticleDetail[] = [
  {
    slug: 'designing-flap-breaking-wsgi-bottleneck',
    title: 'Designing flap: Breaking the WSGI Bottleneck with Tokio, Hyper, and Axum',
    subtitle: 'How eliminating PEP 3333 dictionary allocations and moving I/O to Rust yielded an 8x-15x throughput increase over Flask.',
    date: '2026-11-14',
    read_time: '9 min read',
    category: 'Systems Architecture',
    tags: ['Rust', 'Python', 'Tokio', 'Hyper', 'Axum', 'WSGI', 'Web Performance'],
    summary: 'WSGI (PEP 3333) has defined Python web servers for two decades, but its per-request environ dict allocation imposes an unavoidable latency floor. Here is how flap redesigns Python web servers from the ground up using Tokio, Hyper, and Axum radix trie routing.',
    content: `
## The WSGI Ceiling

When profiling Werkzeug and Flask under high concurrency (\`wrk -c 100 -t 4\`), flame graphs consistently reveal a sobering reality: less than 15% of total request time is spent executing actual application view logic. Over 60% of execution time is consumed by three distinct operations:

1. **Pure-Python HTTP Parsing**: Iterating byte-by-byte in \`readline()\` to extract HTTP headers.
2. **PEP 3333 Environ Dict Construction**: Allocating, populating, and passing a 20+ key dictionary (\`wsgi.input\`, \`REQUEST_METHOD\`, \`PATH_INFO\`, etc.) on every single incoming frame.
3. **Linear Regex Route Matching**: Iterating over \`werkzeug.routing.Map\` rules with dynamic regular expressions.

On modern hardware, this creates an artificial ceiling of ~2,000 requests per second per core for simple endpoints.

\`\`\`
Flask Pipeline (~1.4ms per request):
[TCP Frame] ──► [readline() loops] ──► [WSGI environ dict] ──► [Regex Scan] ──► [Handler] ──► [Response Dict]
\`\`\`

## The Rust-First Flap Architecture

\`flap\` rethinks this pipeline by pushing all I/O, parsing, and routing into a compiled Rust runtime (Hyper 1.0 + Tokio + Axum), holding Python's Global Interpreter Lock (GIL) strictly during handler execution.

\`\`\`
Flap Pipeline (~0.12ms per request):
[TCP Frame] ──► [Hyper Zero-Copy Parser] ──► [Axum Radix Trie] ──► [PyO3 GIL] ──► [Fast Response Buffer]
                       (Rust / Tokio)            (Rust Radix)     (Microseconds)      (Single 512B)
\`\`\`

### 1. HTTP Parsing in Native Rust
Hyper's HTTP/1.1 parser operates directly on \`bytes::Bytes\` chunks without allocating intermediate Python strings. Headers are indexed as lowercased byte slices.

### 2. Precompiled Axum Radix Trie Router
Instead of inspecting regular expressions at request time, \`flap\` compiles all registered routes into an Axum radix trie at server startup. Static paths (\`/api/health\`) resolve in O(1) time via direct pointer hashing. Parameterized paths (\`/user/<int:id>\`) traverse precomputed trie nodes in microsecond space.

### 3. Lazy Request Object Allocation
In flap, the \`Request\` object exposed to Python handlers does not parse query strings, cookies, or JSON upfront. Properties like \`req.query\`, \`req.cookies\`, and \`req.json()\` are lazy accessors:
- If a route never accesses \`req.query\`, \`urllib.parse.parse_qs\` is never called.
- If a route never touches cookies, \`SimpleCookie\` is completely bypassed.

### 4. Minimizing the PyO3 GIL Window
Using PyO3's \`py.allow_threads()\`, Tokio background worker threads accept incoming TCP connections, read sockets, and process HTTP state machines entirely without the GIL. The GIL is acquired via \`Python::with_gil()\` only when the request is dispatched to the Python callable, and released immediately upon return.

### 5. Benchmark Validation
Across standardized test suites (1,000 requests, keep-alive, backlog 8192), flap's Rust engine delivers:
- \`GET /\`: **18,000 RPS** (vs Flask's 2,207 RPS — **8.2x speedup**)
- \`POST /echo 3k\`: **15,000 RPS** (vs Flask's 1,112 RPS — **13.5x speedup**)
- p95 Latency: **1.0 ms** (vs Flask's 5.5–11.9 ms)

For environments without Rust build toolchains, flap includes an identical-API Python fallback using \`httptools\` and \`uvloop\`, which still sustains ~7,600 RPS (3.4x over Flask).
    `,
  },
  {
    slug: 'rust-first-python-ffi-safe-memory-management',
    title: 'Rust-First Python FFI: Safe Memory Management and PyO3 Concurrency',
    subtitle: 'Practical patterns for passing raw bytes, managing thread safety, and avoiding memory leaks across the CPython FFI boundary.',
    date: '2026-11-12',
    read_time: '7 min read',
    category: 'Systems & FFI',
    tags: ['Rust', 'PyO3', 'Python C-API', 'Concurrency', 'Memory Safety'],
    summary: 'Bridging Tokio\'s work-stealing multi-threaded runtime with Python\'s single-threaded interpreter requires rigorous memory ownership and lock management. Here are the core FFI design rules implemented in flap.',
    content: `
## The Peril of Naive FFI

Writing Python C-extensions or Rust PyO3 bindings is deceptively simple for toy examples. However, in a multi-threaded web server handling 20,000 requests per second, subtle race conditions and memory leaks quickly emerge:

1. **Deadlocks**: Calling blocking Python operations inside an async Tokio worker thread without yielding worker control.
2. **Double-Frees & Dangling Pointers**: Storing Python references (\`PyObject\`) in Rust heap structures without proper reference counting or GC awareness.
3. **Hidden Buffer Copies**: Attempting 'zero-copy' conversions between Rust \`Vec<u8>\` and Python \`bytes\`, only to discover CPython forces a heap copy to guarantee byte immutability.

## Key Rules Implemented in Flap

### Rule 1: Never Call Python from Async Tokio Tasks Directly
Tokio tasks are cooperative. If an async task calls a Python function that executes for 5 milliseconds, it blocks the entire underlying OS thread, starving all other connections assigned to that thread.

In flap, handler dispatches utilize \`tokio::task::spawn_blocking\` or dedicated worker threads:

\`\`\`rust
// Offload Python invocation from Tokio reactor threads:
let result = tokio::task::spawn_blocking(move || {
    Python::with_gil(|py| {
        let handler = handler_clone.bind(py);
        handler.call1((py_req,))
    })
}).await?;
\`\`\`

### Rule 2: Explicit GIL Boundaries
Rust worker threads manage network buffers and HTTP framing inside \`py.allow_threads\`:

\`\`\`rust
// Run Tokio event loop outside Python GIL:
let rt = py.allow_threads(|| build_runtime(workers))?;
\`\`\`

This ensures that network polling, TLS handshakes, and socket writes run at full multi-core speed without waiting for Python garbage collection pauses.

### Rule 3: Honest Zero-Copy Claims
CPython's \`bytes\` type is strictly immutable and requires a private memory allocation. When passing request bodies into Python, \`PyBytes::new(py, &rust_slice)\` must allocate.

Instead of falsely claiming zero-copy for Python bodies, flap eliminates allocations in the **response path**: precomputed status lines and static headers are built directly into Rust \`Bytes\` and written directly to the Tokio socket via \`AsyncWriteExt\`.
    `,
  },
  {
    slug: 'writing-async-smtp-daemon-in-rust',
    title: 'Writing an Async RFC 5321 SMTP Daemon in Safe Rust',
    subtitle: 'Designing a non-blocking mail transfer agent with protocol state machines, STARTTLS socket upgrading, and write-ahead disk spooling.',
    date: '2026-11-08',
    read_time: '8 min read',
    category: 'Network Protocols',
    tags: ['Rust', 'Tokio', 'SMTP', 'Networking', 'Cryptography'],
    summary: 'Building RMTP: An exploration of SMTP state machines, upgrading plaintext TCP streams to TLS in-place, and guaranteeing atomic message persistence before sending 250 OK acknowledgment codes.',
    content: `
## The Enduring Complexity of SMTP

Simple Mail Transfer Protocol (RFC 5321) appears deceptively simple: plain text commands (\`EHLO\`, \`MAIL FROM\`, \`RCPT TO\`, \`DATA\`) terminated by carriage return line feeds (\`<CRLF>\`).

In practice, implementing a robust MTA (Mail Transfer Agent) in a modern systems language requires addressing several hard problems:

- **Strict Protocol State Machines**: A client cannot send \`MAIL FROM\` before completing \`EHLO\`/\`HELO\`. It cannot issue \`DATA\` without at least one valid recipient (\`RCPT TO\`).
- **In-Place TLS Upgrading**: Unlike HTTPS (which negotiates TLS immediately upon socket connection), SMTP connections begin in plaintext on port 25 or 587, and dynamically upgrade to TLS upon receiving the \`STARTTLS\` verb.
- **Write-Ahead Spooling Durability**: An MTA must never send \`250 2.0.0 OK: Message accepted for delivery\` until the entire message body has been safely flushed to persistent disk storage.

\`\`\`
SMTP Session State Machine:
[Connect] ──► 220 Banner
    │
    ▼
[EHLO client.domain] ──► 250 Capabilities (STARTTLS, 8BITMIME, SIZE)
    │
    ├─► [STARTTLS] ──► 220 Go ahead ──► [In-Place Rustls Handshake] ──► [Encrypted Stream]
    │                                                                          │
    ▼                                                                          ▼
[MAIL FROM: <alice@corp>] ──► 250 OK
    │
    ▼
[RCPT TO: <bob@recipient>] ──► 250 OK
    │
    ▼
[DATA] ──► 354 Start mail input; end with <CRLF>.<CRLF>
    │
    ▼
[Stream chunks directly to Spool File] ──► [fsync()] ──► 250 OK: Queued
\`\`\`

## Non-Blocking Socket Upgrading with Rustls

In Tokio, a plain TCP connection is represented as \`tokio::net::TcpStream\`. When \`STARTTLS\` is received, RMTP swaps the stream with an encrypted wrapper:

\`\`\`rust
// Transitioning stream from plaintext to TLS:
let tls_acceptor = tokio_rustls::TlsAcceptor::from(arc_tls_config);
let tls_stream = tls_acceptor.accept(tcp_stream).await?;
// Session continues seamlessly over tls_stream
\`\`\`

By leveraging Rust's enum state machines and Tokio's non-blocking I/O, RMTP easily handles thousands of concurrent mail transactions while consuming less than 15 MB of RSS memory.
    `,
  },
];

export function getAllArticles(): ArticleSummary[] {
  return ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    date: a.date,
    read_time: a.read_time,
    category: a.category,
    tags: a.tags,
    summary: a.summary,
  }));
}

export function getArticleBySlug(slug: string): ArticleDetail | undefined {
  const target = slug.toLowerCase().trim();
  return ARTICLES.find((a) => a.slug.toLowerCase() === target);
}
