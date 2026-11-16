import React from 'react';
import { SystemHealth } from '../types';

interface FooterProps {
  health: SystemHealth | null;
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ health, onSelectTab }) => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            TORI — Systems & Backend Engineer
          </div>
          <div>
            Powered by{' '}
            <a
              href="https://github.com/revamptori/flap"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              flap
            </a>{' '}
            ({health?.engine === 'rust' ? 'Rust Hyper+Tokio Engine' : 'Python uvloop Fallback Engine'})
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
