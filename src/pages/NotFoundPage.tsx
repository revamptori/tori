import React from 'react';

interface NotFoundPageProps {
  onReturnHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnHome }) => {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem' }}>
          [HTTP 404 // ROUTE NOT FOUND]
        </div>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-mono)', margin: '0 0 1rem' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The requested path does not exist on this server. The flap Axum/Radix trie router returned no matching endpoint.
        </p>
        <button onClick={onReturnHome} className="btn primary">
          RETURN TO INDEX
        </button>
      </div>
    </div>
  );
};
