import React from 'react';
import { Project, GitHubRepo, SystemHealth } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { ContributionGraph } from '../components/ContributionGraph';

interface HomePageProps {
  projects: Project[];
  repos: GitHubRepo[];
  health: SystemHealth | null;
  onSelectTab: (tab: string) => void;
  onOpenProjectDetail: (project: Project) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  projects,
  repos,
  health,
  onSelectTab,
  onOpenProjectDetail,
}) => {
  const featuredProjects = projects.filter((p) => p.is_featured).slice(0, 4);

  return (
    <div>
      {/* Swiss Editorial Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>
            [ENGINEER PROFILE // revamptori]
          </div>
          <h1>Tori — Systems & Backend Engineer</h1>
          <p className="hero-lead">
            Designing low-overhead web frameworks, async network protocols, and high-throughput systems infrastructure. Author of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>flap</strong> (Rust-powered Python web framework),{' '}
            <strong style={{ color: 'var(--text-primary)' }}>HttpR</strong>, and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>RMTP</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => onSelectTab('projects')} className="btn primary">
              EXPLORE PROJECTS
            </button>
            <button onClick={() => onSelectTab('benchmarks')} className="btn">
              PERFORMANCE BENCHMARKS
            </button>
            <button onClick={() => onSelectTab('engineering')} className="btn">
              ARCHITECTURE WRITING
            </button>
            <a
              href="https://github.com/revamptori"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              GITHUB PROFILE ↗
            </a>
          </div>

          {/* Technical Metadata Grid */}
          <div className="hero-meta-grid">
            <div className="hero-meta-item">
              <span className="mono-tag">PRIMARY CORE</span>
              <span className="hero-meta-value">Rust (Tokio, Hyper, Axum)</span>
            </div>
            <div className="hero-meta-item">
              <span className="mono-tag">SYSTEMS FOCUS</span>
              <span className="hero-meta-value">Network Daemons & FFI</span>
            </div>
            <div className="hero-meta-item">
              <span className="mono-tag">BACKEND RUNTIME</span>
              <span className="hero-meta-value">
                flap v{health?.framework_version || '1.0.0'} ({health?.engine?.toUpperCase() || 'RUST'})
              </span>
            </div>
            <div className="hero-meta-item">
              <span className="mono-tag">GITHUB IDENTITY</span>
              <span className="hero-meta-value">@revamptori (Active)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live GitHub Contribution Graph */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <span className="mono-tag">[GRAPHQL // LIVE CALENDAR]</span>
              <h2>Real-Time GitHub Activity</h2>
            </div>
            <button onClick={() => onSelectTab('github')} className="btn" style={{ fontSize: '0.75rem' }}>
              VIEW REPOSITORY LOG ↗
            </button>
          </div>

          <ContributionGraph initialYear={2026} />
        </div>
      </section>

      {/* Featured Projects Section */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <span className="mono-tag">[ENGINEERING SYSTEMS]</span>
              <h2>Featured Work</h2>
            </div>
            <button onClick={() => onSelectTab('projects')} className="btn" style={{ fontSize: '0.75rem' }}>
              VIEW ALL PROJECTS ({projects.length}) ↗
            </button>
          </div>

          <div className="projects-grid">
            {featuredProjects.map((project) => {
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
                  onOpenDetail={onOpenProjectDetail}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Benchmark Highlight */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#0c0c0f' }}>
            <div className="mono-tag" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
              [BENCHMARK VERIFICATION // FLASK VS FLAP]
            </div>
            <h2 style={{ marginBottom: '1rem' }}>
              5x to 15x Higher Throughput with Flask 1:1 Syntax
            </h2>
            <p style={{ maxWidth: '720px', marginBottom: '1.5rem' }}>
              Measured release benchmarks demonstrate flap sustaining 18,000 req/s with 1.0ms p95 latency on simple endpoints (compared to Flask's 2,207 req/s), and 15,000 req/s on 3KB JSON echo (13.5x over Flask).
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => onSelectTab('benchmarks')} className="btn primary">
                INSPECT BENCHMARK CHARTS & METHODOLOGY
              </button>
              <button onClick={() => onSelectTab('engineering')} className="btn">
                READ ARCHITECTURE DECISIONS
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
