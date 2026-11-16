import React, { useState, useEffect } from 'react';
import { BenchmarksData, WorkloadBenchmark } from '../types';
import { fetchBenchmarks } from '../api';

export const BenchmarkChart: React.FC = () => {
  const [data, setData] = useState<BenchmarksData | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /');
  const [metricMode, setMetricMode] = useState<'rps' | 'latency'>('rps');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmarks()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load verified benchmark data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        [SYS.BENCH]: Loading verified flap benchmark data from backend...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ color: '#ef4444', padding: '2rem 1rem' }}>
        [ERR.BENCH]: {error || 'Benchmark data unavailable'}
      </div>
    );
  }

  const activeWorkload: WorkloadBenchmark =
    data.workloads.find((w) => w.endpoint === selectedEndpoint) || data.workloads[0];

  // Maximum value for proportional bar chart
  const maxRps = Math.max(
    activeWorkload.rps.flap_rust,
    activeWorkload.rps.gin || 0,
    activeWorkload.rps.drogon || 0,
    25000
  );

  return (
    <div>
      {/* Benchmark Control Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Workload Selectors */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {data.workloads.map((w) => (
            <button
              key={w.endpoint}
              onClick={() => setSelectedEndpoint(w.endpoint)}
              className="btn"
              style={{
                fontSize: '0.75rem',
                backgroundColor: selectedEndpoint === w.endpoint ? 'var(--bg-active)' : 'transparent',
                borderColor: selectedEndpoint === w.endpoint ? 'var(--accent)' : 'var(--border-subtle)',
                color: selectedEndpoint === w.endpoint ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {w.endpoint}
            </button>
          ))}
        </div>

        {/* Metric Mode Toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-subtle)', padding: '2px', borderRadius: '2px' }}>
          <button
            onClick={() => setMetricMode('rps')}
            className="btn"
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.72rem',
              backgroundColor: metricMode === 'rps' ? 'var(--bg-active)' : 'transparent',
              borderColor: metricMode === 'rps' ? 'var(--border-strong)' : 'transparent',
              color: metricMode === 'rps' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            RPS (THROUGHPUT)
          </button>
          <button
            onClick={() => setMetricMode('latency')}
            className="btn"
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.72rem',
              backgroundColor: metricMode === 'latency' ? 'var(--bg-active)' : 'transparent',
              borderColor: metricMode === 'latency' ? 'var(--border-strong)' : 'transparent',
              color: metricMode === 'latency' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            LATENCY p95 (MS)
          </button>
        </div>
      </div>

      {/* Workload Active Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>
          [EVALUATION TARGET]: {activeWorkload.endpoint}
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {activeWorkload.description}
        </p>
      </div>

      {/* Interactive Visual Bar Comparison */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1.25rem' }}>
          {metricMode === 'rps' ? 'Throughput Comparison (Requests Per Second — Higher is Better)' : 'p95 Latency Comparison (Milliseconds — Lower is Better)'}
        </h4>

        {metricMode === 'rps' ? (
          <div>
            {/* flap Rust */}
            <div className="bar-chart-row">
              <div className="bar-meta">
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>flap Rust (Hyper 1.0 + Tokio + Axum)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {activeWorkload.rps.flap_rust.toLocaleString()} req/s ({activeWorkload.speedup_vs_flask.flap_rust} vs Flask)
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flap-rust"
                  style={{ width: `${(activeWorkload.rps.flap_rust / maxRps) * 100}%` }}
                />
              </div>
            </div>

            {/* flap Python Fallback */}
            <div className="bar-chart-row">
              <div className="bar-meta">
                <span style={{ color: '#60a5fa' }}>flap Python (uvloop + httptools + orjson)</span>
                <span style={{ color: '#60a5fa' }}>
                  {activeWorkload.rps.flap_python.toLocaleString()} req/s ({activeWorkload.speedup_vs_flask.flap_python} vs Flask)
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flap-py"
                  style={{ width: `${(activeWorkload.rps.flap_python / maxRps) * 100}%` }}
                />
              </div>
            </div>

            {/* Flask Baseline */}
            <div className="bar-chart-row">
              <div className="bar-meta">
                <span>Flask 3.1 (Werkzeug WSGI) — Baseline</span>
                <span>{activeWorkload.rps.flask.toLocaleString()} req/s (1.0x)</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flask"
                  style={{ width: `${(activeWorkload.rps.flask / maxRps) * 100}%` }}
                />
              </div>
            </div>

            {/* Express comparison if available */}
            {activeWorkload.rps.express && activeWorkload.rps.express > 0 && (
              <div className="bar-chart-row">
                <div className="bar-meta">
                  <span style={{ color: '#facc15' }}>Express 4.x (Node.js)</span>
                  <span style={{ color: '#facc15' }}>{activeWorkload.rps.express.toLocaleString()} req/s</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill express"
                    style={{ width: `${(activeWorkload.rps.express / maxRps) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Latency Comparison Bars */}
            <div className="bar-chart-row">
              <div className="bar-meta">
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>flap Rust</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeWorkload.p95_latency_ms.flap_rust} ms</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flap-rust"
                  style={{ width: `${Math.max(5, (activeWorkload.p95_latency_ms.flap_rust / 12) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bar-chart-row">
              <div className="bar-meta">
                <span style={{ color: '#60a5fa' }}>flap Python</span>
                <span style={{ color: '#60a5fa' }}>{activeWorkload.p95_latency_ms.flap_python} ms</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flap-py"
                  style={{ width: `${Math.max(5, (activeWorkload.p95_latency_ms.flap_python / 12) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bar-chart-row">
              <div className="bar-meta">
                <span>Flask 3.1</span>
                <span>{activeWorkload.p95_latency_ms.flask} ms</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill flask"
                  style={{ width: `${Math.max(5, (activeWorkload.p95_latency_ms.flask / 12) * 100)}%` }}
                />
              </div>
            </div>

            {activeWorkload.p95_latency_ms.express && (
              <div className="bar-chart-row">
                <div className="bar-meta">
                  <span style={{ color: '#facc15' }}>Express 4.x</span>
                  <span style={{ color: '#facc15' }}>{activeWorkload.p95_latency_ms.express} ms</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill express"
                    style={{ width: `${Math.max(5, (activeWorkload.p95_latency_ms.express / 12) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Results Table */}
      <h4 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>All Workloads Comprehensive Table</h4>
      <div className="benchmark-table-wrapper">
        <table className="benchmark-table">
          <thead>
            <tr>
              <th>Workload</th>
              <th>Flask 3.1</th>
              <th>flap (Python)</th>
              <th>flap (Rust)</th>
              <th>Speedup (Py / Rust)</th>
              <th>p95 Latency (Flask → Rust)</th>
            </tr>
          </thead>
          <tbody>
            {data.workloads.map((w) => (
              <tr key={w.endpoint}>
                <td style={{ fontWeight: 600 }}>{w.endpoint}</td>
                <td>{w.rps.flask.toLocaleString()} rps</td>
                <td style={{ color: '#60a5fa' }}>{w.rps.flap_python.toLocaleString()} rps</td>
                <td className="highlight-rust">{w.rps.flap_rust.toLocaleString()} rps</td>
                <td>
                  <span className="mono-badge accent">{w.speedup_vs_flask.flap_python} / {w.speedup_vs_flask.flap_rust}</span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {w.p95_latency_ms.flask}ms → <strong style={{ color: 'var(--accent)' }}>{w.p95_latency_ms.flap_rust}ms</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resource Utilization (CPU & Memory) */}
      <h4 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Resource Footprint Under Sustained Load</h4>
      <div className="projects-grid">
        {data.resource_utilization.metrics.map((m) => (
          <div key={m.framework} className="card">
            <div className="mono-tag" style={{ marginBottom: '0.4rem' }}>{m.framework}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.75rem 0' }}>
              <div>
                <div className="mono-tag">RESIDENT MEMORY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.memory_rss_mb} MB</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono-tag">CPU UTILIZATION</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.cpu_utilization_pct}%</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{m.notes}</p>
          </div>
        ))}
      </div>

      {/* The 6 Bottlenecks Section */}
      <h4 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>How flap Replaces Flask Bottlenecks (A–F)</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.bottlenecks.map((b) => (
          <div key={b.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="mono-badge accent">BOTTLENECK {b.id}</span>
              <strong style={{ color: 'var(--text-primary)' }}>{b.name}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <span className="mono-tag" style={{ color: '#ef4444' }}>FLASK CEILING:</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{b.flask_bottleneck}</p>
              </div>
              <div>
                <span className="mono-tag" style={{ color: 'var(--accent)' }}>FLAP ARCHITECTURE:</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{b.flap_solution}</p>
              </div>
            </div>
            <div className="mono-tag" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              IMPACT: {b.impact}
            </div>
          </div>
        ))}
      </div>

      {/* Hardware & Reproduction Methodology */}
      <div className="card" style={{ marginTop: '2.5rem', backgroundColor: '#060608', borderColor: 'var(--border-strong)' }}>
        <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
          [VERIFIED METHODOLOGY & REPRODUCIBILITY]
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {data.methodology.verification_notice}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>HARDWARE:</span> {data.methodology.hardware}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>PROTOCOL:</span> {data.methodology.protocol}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>PARAMETERS:</span> {data.methodology.parameters}
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <a
            href="https://github.com/revamptori/flap/blob/main/docs/PERFORMANCE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ fontSize: '0.75rem' }}
          >
            VIEW ORIGINAL BENCHMARK DOCUMENTATION (PERFORMANCE.MD) ↗
          </a>
        </div>
      </div>
    </div>
  );
};
