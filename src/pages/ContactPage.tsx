import React, { useState } from 'react';

export const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = 'toriiilovesjas@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[COMMUNICATION CHANNELS]</span>
            <h1>Contact & Links</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Direct channels for systems engineering inquiries, open-source collaboration, and technical questions.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <span className="mono-tag" style={{ color: 'var(--accent)' }}>[PRIMARY EMAIL INQUIRY]</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              {email}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn">
                {copied ? 'COPIED TO CLIPBOARD' : 'COPY EMAIL'}
              </button>
              <a href={`mailto:${email}`} className="btn primary">
                SEND MAIL ↗
              </a>
            </div>
          </div>
        </div>

        <div className="projects-grid">
          <div className="card">
            <span className="mono-tag">[CODE REPOSITORIES]</span>
            <h3 style={{ margin: '0.25rem 0 0.5rem' }}>GitHub</h3>
            <p style={{ fontSize: '0.85rem' }}>Explore public repositories, commits, pull requests, and benchmarks.</p>
            <a
              href="https://github.com/revamptori"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}
            >
              github.com/revamptori ↗
            </a>
          </div>

          <div className="card">
            <span className="mono-tag">[REAL-TIME MESSAGING]</span>
            <h3 style={{ margin: '0.25rem 0 0.5rem' }}>Discord</h3>
            <p style={{ fontSize: '0.85rem' }}>Available for systems design discussions and open source collaboration.</p>
            <div className="mono-badge accent" style={{ marginTop: '0.5rem' }}>
              revamptori
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
