import React from 'react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            TORI — Systems & Backend Engineer
          </div>
          <div>
            Author of{' '}
            <a
              href="https://github.com/revamptori/flap"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              flap
            </a>{' '}
            (Rust Hyper+Tokio Python Web Framework), HttpR, and RMTP
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <button
            onClick={() => onSelectTab('contact')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            CONTACT
          </button>
          <a
            href="https://github.com/revamptori"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)' }}
          >
            GITHUB // revamptori
          </a>
          <a
            href="https://github.com/revamptori/flap"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)' }}
          >
            SOURCE
          </a>
        </div>
      </div>
    </footer>
  );
};
