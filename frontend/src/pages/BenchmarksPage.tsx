import React from 'react';
import { BenchmarkChart } from '../components/BenchmarkChart';

export const BenchmarksPage: React.FC = () => {
  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[VERIFIED REPRODUCIBLE DATA]</span>
            <h1>Performance Benchmarks</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Hardware-equivalent comparisons between Flask, flap Python fallback, and flap Rust core. Strictly verified data; no fabricated numbers.
            </p>
          </div>
        </div>

        <BenchmarkChart />
      </div>
    </div>
  );
};
