import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[PROFILE & PHILOSOPHY]</span>
            <h1>About Tori</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Systems software engineer focused on high-throughput backend infrastructure, asynchronous network runtimes, and low-latency FFI boundaries.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Engineering Philosophy</h3>
          <p>
            I build software where performance, predictability, and ergonomic simplicity converge. The modern web often suffers from layers of unnecessary abstractions, bloated runtimes, and premature microservices that compound latency and memory usage.
          </p>
          <p>
            My approach is grounded in systems fundamentals: understanding exact memory layouts, eliminating redundant allocations, keeping I/O asynchronous and non-blocking, and profiling bottlenecks using real hardware telemetry rather than speculative optimizations.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Primary Technical Stack</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <div>
              <span className="mono-tag" style={{ color: 'var(--accent)' }}>SYSTEMS & CORE</span>
              <ul style={{ listStyle: 'none', marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                <li>• Rust (Tokio, Hyper, Axum)</li>
                <li>• C / CPython C-API FFI</li>
                <li>• PyO3 Native Bindings</li>
                <li>• Memory & Thread Safety</li>
              </ul>
            </div>

            <div>
              <span className="mono-tag" style={{ color: 'var(--accent)' }}>BACKEND INFRASTRUCTURE</span>
              <ul style={{ listStyle: 'none', marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                <li>• flap Web Framework</li>
                <li>• Linux Socket Programming</li>
                <li>• Async Networking (TCP/UDP/TLS)</li>
                <li>• HTTP/1.1 & HTTP/2 Protocols</li>
              </ul>
            </div>

            <div>
              <span className="mono-tag" style={{ color: 'var(--accent)' }}>DATA & PROTOCOLS</span>
              <ul style={{ listStyle: 'none', marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                <li>• RFC 5321 (SMTP / Mail Systems)</li>
                <li>• PostgreSQL & SQLite</li>
                <li>• GraphQL & REST APIs</li>
                <li>• Zero-Copy Serialization (Serde, Orjson)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Workstation & Development Environment</h3>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><span className="mono-tag">OPERATING SYSTEM:</span> Debian GNU/Linux 12 (Bookworm) / Arch Linux</div>
            <div><span className="mono-tag">EDITOR & TOOLS:</span> Neovim, Tmux, Alacritty, GDB, Valgrind, Py-Spy</div>
            <div><span className="mono-tag">BENCHMARK TOOLING:</span> wrk, oha, perf, flamegraph</div>
            <div><span className="mono-tag">HARDWARE TARGET:</span> x86_64, aarch64 (Linux server bare metal)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
