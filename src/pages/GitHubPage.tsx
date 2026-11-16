import React, { useState, useEffect } from 'react';
import { GitHubProfile, GitHubRepo } from '../types';
import { fetchProfile, fetchRepositories } from '../api';
import { ContributionGraph } from '../components/ContributionGraph';

export const GitHubPage: React.FC = () => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchRepositories()])
      .then(([prof, repoList]) => {
        setProfile(prof);
        setRepos(repoList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[OCTOKIT GRAPHQL & REST // REAL-TIME SYNC]</span>
            <h1>GitHub Activity & Repositories</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Live integration via GitHub's official GraphQL and REST endpoints. Server-side caching (5 minutes) with automatic deduplication.
            </p>
          </div>
          <a
            href="https://github.com/revamptori"
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
          >
            VIEW ON GITHUB.COM ↗
          </a>
        </div>

        {/* Live Contribution Graph */}
        <div style={{ marginBottom: '3rem' }}>
          <ContributionGraph initialYear={2026} />
        </div>

        {/* Developer Profile Card */}
        {profile && (
          <div
            className="card"
            style={{
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.login}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '2px',
                  border: '1px solid var(--border-strong)',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{profile.name}</h2>
                <span className="mono-tag">@{profile.login}</span>
              </div>
              <p style={{ margin: '0.25rem 0 0.75rem', color: 'var(--text-secondary)' }}>
                {profile.bio}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>PUBLIC REPOS: <strong style={{ color: 'var(--text-primary)' }}>{profile.public_repos}</strong></span>
                <span>FOLLOWERS: <strong style={{ color: 'var(--text-primary)' }}>{profile.followers}</strong></span>
                <span>SINCE: <strong style={{ color: 'var(--text-primary)' }}>{profile.created_at ? new Date(profile.created_at).getFullYear() : '2026'}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Live Public Repositories List */}
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">
            <span className="mono-tag">[PUBLIC CODE REPOSITORIES]</span>
            <h2>Repositories ({repos.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            [SYS.NET]: Querying GitHub REST API /users/revamptori/repos...
          </div>
        ) : (
          <div className="projects-grid">
            {repos.map((repo) => (
              <div key={repo.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600, fontSize: '1.1rem' }}
                  >
                    {repo.name} ↗
                  </a>
                  {repo.language && <span className="mono-badge">{repo.language}</span>}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem' }}>
                  {repo.description || 'Public repository by revamptori.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span>★ {repo.stars}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                  <span>UPDATED {new Date(repo.pushed_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
