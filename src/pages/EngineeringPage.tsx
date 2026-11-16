import React, { useState, useEffect } from 'react';
import { ArticleSummary, ArticleDetail } from '../types';
import { fetchArticles, fetchArticleDetail } from '../api';

export const EngineeringPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchArticles()
      .then((res) => {
        setArticles(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleOpenArticle = (slug: string) => {
    setActiveSlug(slug);
    fetchArticleDetail(slug)
      .then((detail) => {
        setActiveArticle(detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleBackToList = () => {
    setActiveSlug(null);
    setActiveArticle(null);
  };

  if (activeSlug && activeArticle) {
    return (
      <div style={{ padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <button onClick={handleBackToList} className="btn" style={{ marginBottom: '2rem' }}>
            ← BACK TO ALL ARTICLES
          </button>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="mono-badge accent">{activeArticle.category}</span>
              <span className="mono-tag">{activeArticle.read_time}</span>
              <span className="mono-tag">•</span>
              <span className="mono-tag">{activeArticle.date}</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{activeArticle.title}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {activeArticle.subtitle}
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '2.5rem',
              backgroundColor: 'var(--bg-surface)',
              lineHeight: '1.8',
              fontSize: '1.02rem',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ whiteSpace: 'pre-line' }}>{activeArticle.content.trim()}</div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {activeArticle.tags.map((t) => (
              <span key={t} className="mono-badge">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[TECHNICAL DOCUMENTATION & DESIGN LOGS]</span>
            <h1>Engineering & Architecture</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              In-depth architectural breakdowns, memory safety patterns, and network protocol design decisions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            [SYS.DOCS]: Loading engineering articles...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {articles.map((art) => (
              <article
                key={art.slug}
                className="card"
                style={{
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
                }}
                onClick={() => handleOpenArticle(art.slug)}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="mono-badge accent">{art.category}</span>
                  <span className="mono-tag">{art.read_time}</span>
                  <span className="mono-tag">•</span>
                  <span className="mono-tag">{art.date}</span>
                </div>

                <h2 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0.5rem' }}>
                  {art.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {art.summary}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {art.tags.map((t) => (
                      <span key={t} className="mono-badge" style={{ fontSize: '0.72rem' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="mono-tag" style={{ color: 'var(--accent)' }}>
                    READ ARCHITECTURE ESSAY →
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
