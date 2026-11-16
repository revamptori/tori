import { describe, it, expect } from 'vitest';
import {
  fetchHealth,
  fetchContributions,
  fetchProjects,
  fetchProjectDetail,
  fetchBenchmarks,
  fetchArticles,
  fetchArticleDetail,
} from '../api';

describe('Client-Side API & Data Client', () => {
  it('fetchHealth returns system telemetry', async () => {
    const health = await fetchHealth();
    expect(health.status).toBe('healthy');
    expect(health.app).toBe('tori-portfolio');
    expect(health.author).toBe('revamptori');
    expect(health.engine).toBe('static-client');
  });

  it('fetchContributions returns verified calendar for 2026', async () => {
    const data = await fetchContributions(2026);
    expect(data.username).toBe('revamptori');
    expect(data.year).toBe(2026);
    expect(data.total_contributions).toBe(67);
    expect(data.weeks.length).toBeGreaterThan(50);
  });

  it('fetchContributions rejects invalid years', async () => {
    await expect(fetchContributions(2035)).rejects.toThrow('out of supported range');
    await expect(fetchContributions(2018)).rejects.toThrow('out of supported range');
  });

  it('fetchProjects returns curated codebases', async () => {
    const projects = await fetchProjects();
    expect(projects.length).toBeGreaterThanOrEqual(5);

    const ids = projects.map((p) => p.id);
    expect(ids).toContain('flap');
    expect(ids).toContain('httpr');
    expect(ids).toContain('rmtp');
    expect(ids).toContain('toriutilities');
    expect(ids).toContain('rust-game-engine');
  });

  it('fetchProjectDetail returns specific project or throws', async () => {
    const flapProj = await fetchProjectDetail('flap');
    expect(flapProj.name).toBe('flap');
    expect(flapProj.repo_url).toBe('https://github.com/revamptori/flap');

    await expect(fetchProjectDetail('nonexistent')).rejects.toThrow('not found');
  });

  it('fetchBenchmarks returns verified flap benchmarks', async () => {
    const bench = await fetchBenchmarks();
    expect(bench.workloads.length).toBeGreaterThanOrEqual(5);
    expect(bench.bottlenecks.length).toBe(6);
    expect(bench.methodology.source_repository).toBe('https://github.com/revamptori/flap');
  });

  it('fetchArticles returns engineering writeups', async () => {
    const articles = await fetchArticles();
    expect(articles.length).toBeGreaterThanOrEqual(3);

    const detail = await fetchArticleDetail(articles[0].slug);
    expect(detail.content.length).toBeGreaterThan(100);
  });
});
