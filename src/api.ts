/**
 * 100% Client-Side API & Data Client for Tori's Portfolio.
 * Designed for public static deployment on GitHub Pages, Vercel, Netlify, or any CDN.
 * Zero Python/Rust backend required.
 */
import {
  SystemHealth,
  ContributionsData,
  GitHubProfile,
  GitHubRepo,
  BenchmarksData,
  Project,
  ArticleSummary,
  ArticleDetail,
} from './types';

import { getContributionsForYear } from './data/contributions';
import { getAllProjects, getProjectById } from './data/projects';
import { BENCHMARKS_DATA } from './data/benchmarks';
import { getAllArticles, getArticleBySlug } from './data/articles';

// In-memory cache for live GitHub REST queries
let cachedProfile: GitHubProfile | null = null;
let profileCachedAt = 0;

let cachedRepos: GitHubRepo[] | null = null;
let reposCachedAt = 0;

const CACHE_TTL_MS = 300_000; // 5 minutes

export async function fetchHealth(): Promise<SystemHealth> {
  return {
    status: 'healthy',
    app: 'tori-portfolio',
    author: 'revamptori',
    framework: 'flap (documented) / static SPA',
    framework_version: '1.0.0',
    engine: 'static-client',
    engine_detail: 'Vite + React 18 + TypeScript (Client-Only Static Architecture)',
    rust_engine_compiled: false,
    configured_engine: 'client-only',
    timestamp: new Date().toISOString(),
  };
}

export async function fetchContributions(year: number): Promise<ContributionsData> {
  if (year < 2020 || year > 2026) {
    throw new Error(`Year ${year} is out of supported range (2020 - 2026).`);
  }
  return getContributionsForYear(year);
}

export async function refreshContributions(year?: number): Promise<ContributionsData> {
  const targetYear = year || 2026;
  return getContributionsForYear(targetYear);
}

export async function fetchProfile(): Promise<GitHubProfile> {
  const now = Date.now();
  if (cachedProfile && now - profileCachedAt < CACHE_TTL_MS) {
    return cachedProfile;
  }

  try {
    const res = await fetch('https://api.github.com/users/revamptori', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      const p = await res.json();
      cachedProfile = {
        login: p.login || 'revamptori',
        name: p.name || 'Tori',
        avatar_url: p.avatar_url || 'https://avatars.githubusercontent.com/u/356173263?v=4',
        html_url: p.html_url || 'https://github.com/revamptori',
        bio: p.bio || 'Systems & Backend Engineer. Author of flap.',
        company: p.company,
        location: p.location || 'PK',
        blog: p.blog || '',
        public_repos: p.public_repos || 5,
        public_gists: p.public_gists || 0,
        followers: p.followers || 0,
        following: p.following || 0,
        created_at: p.created_at || '2026-11-13T09:37:16Z',
        updated_at: p.updated_at || '2026-11-13T18:08:33Z',
        cached: true,
        is_stale: false,
      };
      profileCachedAt = now;
      return cachedProfile;
    }
  } catch (err) {
    console.warn('Direct GitHub API fetch failed, using fallback profile data:', err);
  }

  // Graceful fallback profile if rate-limited by GitHub
  return {
    login: 'revamptori',
    name: 'Tori',
    avatar_url: 'https://avatars.githubusercontent.com/u/356173263?v=4',
    html_url: 'https://github.com/revamptori',
    bio: 'Systems & Backend Engineer. Author of flap.',
    location: 'PK',
    blog: '',
    public_repos: 5,
    public_gists: 0,
    followers: 0,
    following: 0,
    created_at: '2026-11-13T09:37:16Z',
    updated_at: '2026-11-13T18:08:33Z',
    cached: true,
    is_stale: true,
  };
}

export async function fetchRepositories(): Promise<GitHubRepo[]> {
  const now = Date.now();
  if (cachedRepos && now - reposCachedAt < CACHE_TTL_MS) {
    return cachedRepos;
  }

  try {
    const res = await fetch('https://api.github.com/users/revamptori/repos?per_page=100&sort=pushed', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      const repos = await res.json();
      const mapped: GitHubRepo[] = repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        watchers: r.watchers_count || 0,
        language: r.language,
        topics: r.topics || [],
        created_at: r.created_at,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        license: r.license?.spdx_id || null,
        open_issues: r.open_issues_count || 0,
        is_fork: r.fork || false,
      }));
      cachedRepos = mapped;
      reposCachedAt = now;
      return mapped;
    }
  } catch (err) {
    console.warn('Direct GitHub API repos fetch failed, using curated repository list:', err);
  }

  // Graceful curated fallback if rate-limited by GitHub
  return [
    {
      id: 1457169074,
      name: 'flap',
      full_name: 'revamptori/flap',
      html_url: 'https://github.com/revamptori/flap',
      description: 'A blazing fast Python web framework - Rust core (hyper + axum + tokio) with PyO3 bindings, 5x faster than Flask',
      stars: 0,
      forks: 0,
      watchers: 0,
      language: 'Python',
      topics: ['web', 'framework', 'rust', 'async', 'http'],
      created_at: '2026-11-13T09:40:00Z',
      updated_at: '2026-11-15T00:00:00Z',
      pushed_at: '2026-11-15T00:00:00Z',
      license: 'MIT',
      open_issues: 0,
      is_fork: false,
    },
    {
      id: 1458906249,
      name: 'HttpR',
      full_name: 'revamptori/HttpR',
      html_url: 'https://github.com/revamptori/HttpR',
      description: 'Ergonomic async HTTP client written in Rust with connection pooling and native Rustls.',
      stars: 0,
      forks: 0,
      watchers: 0,
      language: 'Rust',
      topics: ['http-client', 'rust', 'tokio', 'hyper'],
      created_at: '2026-11-14T23:43:08Z',
      updated_at: '2026-11-15T02:18:59Z',
      pushed_at: '2026-11-15T02:18:59Z',
      license: 'MIT',
      open_issues: 0,
      is_fork: false,
    },
    {
      id: 1457934648,
      name: 'RMTP',
      full_name: 'revamptori/RMTP',
      html_url: 'https://github.com/revamptori/RMTP',
      description: 'RFC 5321 compliant Mail Transfer Protocol (SMTP) server written in Rust with STARTTLS.',
      stars: 0,
      forks: 0,
      watchers: 0,
      language: 'Rust',
      topics: ['smtp', 'email', 'rust', 'tokio'],
      created_at: '2026-11-14T16:18:55Z',
      updated_at: '2026-11-14T18:55:48Z',
      pushed_at: '2026-11-14T18:55:48Z',
      license: 'MIT',
      open_issues: 0,
      is_fork: false,
    },
    {
      id: 1457934649,
      name: 'gaspscan',
      full_name: 'revamptori/gaspscan',
      html_url: 'https://github.com/revamptori/gaspscan',
      description: 'Asynchronous high-speed port and network scanner in Rust using raw sockets.',
      stars: 0,
      forks: 0,
      watchers: 0,
      language: 'Rust',
      topics: ['network', 'scanner', 'security', 'rust'],
      created_at: '2026-11-14T10:00:00Z',
      updated_at: '2026-11-14T12:00:00Z',
      pushed_at: '2026-11-14T12:00:00Z',
      license: 'MIT',
      open_issues: 0,
      is_fork: false,
    },
    {
      id: 1457934650,
      name: 'Falo',
      full_name: 'revamptori/Falo',
      html_url: 'https://github.com/revamptori/Falo',
      description: 'Lightweight developer automation utility and project workflow manager.',
      stars: 0,
      forks: 0,
      watchers: 0,
      language: 'Python',
      topics: ['automation', 'cli', 'python'],
      created_at: '2026-11-15T14:50:25Z',
      updated_at: '2026-11-15T19:55:21Z',
      pushed_at: '2026-11-15T19:55:21Z',
      license: 'Other',
      open_issues: 0,
      is_fork: false,
    },
  ];
}

export async function fetchBenchmarks(): Promise<BenchmarksData> {
  return BENCHMARKS_DATA;
}

export async function fetchProjects(): Promise<Project[]> {
  return getAllProjects();
}

export async function fetchProjectDetail(id: string): Promise<Project> {
  const project = getProjectById(id);
  if (!project) {
    throw new Error(`Project '${id}' not found.`);
  }
  return project;
}

export async function fetchArticles(): Promise<ArticleSummary[]> {
  return getAllArticles();
}

export async function fetchArticleDetail(slug: string): Promise<ArticleDetail> {
  const article = getArticleBySlug(slug);
  if (!article) {
    throw new Error(`Article '${slug}' not found.`);
  }
  return article;
}
