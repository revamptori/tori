import React from 'react';
import { Project, GitHubRepo } from '../types';

interface ProjectCardProps {
  project: Project;
  liveRepo?: GitHubRepo;
  onOpenDetail: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, liveRepo, onOpenDetail }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span className="mono-tag" style={{ color: 'var(--accent)' }}>
            {project.category}
          </span>
          <h3 style={{ margin: '0.25rem 0', fontSize: '1.25rem' }}>{project.name}</h3>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {project.is_experimental ? (
            <span className="mono-badge" style={{ borderColor: '#eab308', color: '#facc15' }}>
              EXPERIMENTAL
            </span>
          ) : (
            <span className="mono-badge">{project.status.split('/')[0].trim()}</span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1.25rem' }}>
        {project.description}
      </p>

      {/* Live GitHub Stats if available */}
      {liveRepo && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-surface-subtle)',
            borderRadius: '2px',
            marginBottom: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>★ {liveRepo.stars} stars</span>
          <span>⑂ {liveRepo.forks} forks</span>
          {liveRepo.language && <span>LANG: {liveRepo.language}</span>}
          <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>● LIVE SYNC</span>
        </div>
      )}

      {/* Stack Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {project.stack.slice(0, 5).map((tech) => (
          <span key={tech} className="mono-badge">
            {tech}
          </span>
        ))}
        {project.stack.length > 5 && (
          <span className="mono-badge" style={{ color: 'var(--text-muted)' }}>
            +{project.stack.length - 5}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onOpenDetail(project)}
          className="btn"
          style={{ flex: 1, fontSize: '0.75rem' }}
        >
          ARCHITECTURE & SPEC
        </button>

        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ fontSize: '0.75rem' }}
            title="Open GitHub Repository"
          >
            GITHUB ↗
          </a>
        )}
      </div>
    </div>
  );
};
