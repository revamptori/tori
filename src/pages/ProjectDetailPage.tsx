import React from 'react';
import { Project, GitHubRepo } from '../types';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface ProjectDetailPageProps {
  project: Project;
  liveRepo?: GitHubRepo;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, liveRepo, onBack }) => {
  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <button
          onClick={onBack}
          className="btn"
          style={{ marginBottom: '2rem', fontSize: '0.8rem' }}
        >
          ← BACK TO PROJECTS
        </button>

        <div className="section-header">
          <div className="section-title">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="mono-tag" style={{ color: 'var(--accent)' }}>
                {project.category}
              </span>
              {project.is_experimental && (
                <span className="mono-badge" style={{ borderColor: '#eab308', color: '#facc15' }}>
                  EXPERIMENTAL RUNTIME
                </span>
              )}
            </div>
            <h1>{project.name}</h1>
            <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
              {project.tagline}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary"
              >
                OPEN GITHUB REPOSITORY ↗
              </a>
            )}
            {project.docs_url && (
              <a
                href={project.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                DOCUMENTATION ↗
              </a>
            )}
          </div>
        </div>

        {/* Live GitHub Repository Synchronized Card */}
        {liveRepo && (
          <div
            className="card"
            style={{
              marginBottom: '2rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="mono-tag" style={{ color: 'var(--accent)' }}>[GITHUB API // LIVE REPOSITORY METADATA]</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {liveRepo.full_name}
              </div>
              <p style={{ fontSize: '0.82rem', margin: '0.2rem 0 0', color: 'var(--text-muted)' }}>
                Last pushed: {new Date(liveRepo.pushed_at).toLocaleDateString()} • License: {liveRepo.license || 'Custom/Proprietary'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span className="mono-tag">STARS</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{liveRepo.stars}</div>
              </div>
              <div>
                <span className="mono-tag">FORKS</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{liveRepo.forks}</div>
              </div>
              <div>
                <span className="mono-tag">OPEN ISSUES</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{liveRepo.open_issues}</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        {project.key_metrics && project.key_metrics.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {project.key_metrics.map((m) => (
              <div key={m.label} className="card" style={{ padding: '1rem' }}>
                <div className="mono-tag">{m.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)', marginTop: '0.25rem' }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Long Architecture Description */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>System Architecture & Engineering Decisions</h3>
          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            {project.long_description.trim()}
          </div>
        </div>

        {/* Architecture Diagram */}
        {project.architecture_diagram && (
          <ArchitectureDiagram
            title={project.name.toUpperCase()}
            diagram={project.architecture_diagram}
          />
        )}

        {/* Technology Stack & Highlights */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Technology Stack & Features</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {project.stack.map((t) => (
              <span key={t} className="mono-badge accent" style={{ fontSize: '0.82rem', padding: '0.3rem 0.65rem' }}>
                {t}
              </span>
            ))}
          </div>

          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Key Highlights</h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            {project.highlights.map((h, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem' }}>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
