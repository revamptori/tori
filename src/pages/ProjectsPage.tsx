import React, { useState } from 'react';
import { Project, GitHubRepo } from '../types';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  repos: GitHubRepo[];
  onOpenDetail: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, repos, onOpenDetail }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'rust') return p.languages.includes('Rust');
    if (filter === 'python') return p.languages.includes('Python');
    if (filter === 'experimental') return p.is_experimental;
    return true;
  });

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <span className="mono-tag">[CODEBASES & SYSTEMS]</span>
            <h1>Curated Projects</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Production infrastructure, protocol implementations, and experimental runtimes. Real GitHub metadata synchronized via API.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-subtle)', padding: '3px', borderRadius: '2px' }}>
            {['all', 'rust', 'python', 'experimental'].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className="btn"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  backgroundColor: filter === tag ? 'var(--bg-active)' : 'transparent',
                  borderColor: filter === tag ? 'var(--border-strong)' : 'transparent',
                  color: filter === tag ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const liveRepo = repos.find(
              (r) =>
                project.github_repo_name &&
                r.name.toLowerCase() === project.github_repo_name.toLowerCase()
            );
            return (
              <ProjectCard
                key={project.id}
                project={project}
                liveRepo={liveRepo}
                onOpenDetail={onOpenDetail}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
