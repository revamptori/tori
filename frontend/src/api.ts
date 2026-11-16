/**
 * API client for Tori's portfolio backend served by flap.
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

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}`;
    try {
      const errorJson = await res.json();
      errMessage = errorJson.message || errorJson.error || errMessage;
    } catch {
      // Non-JSON response
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse<SystemHealth>(res);
}

export async function fetchContributions(year: number): Promise<ContributionsData> {
  const res = await fetch(`${API_BASE}/github/contributions?year=${year}`);
  return handleResponse<ContributionsData>(res);
}

export async function refreshContributions(year?: number): Promise<ContributionsData> {
  const url = year ? `${API_BASE}/github/refresh?year=${year}` : `${API_BASE}/github/refresh`;
  const res = await fetch(url, { method: 'POST' });
  return handleResponse<ContributionsData>(res);
}

export async function fetchProfile(): Promise<GitHubProfile> {
  const res = await fetch(`${API_BASE}/github/profile`);
  return handleResponse<GitHubProfile>(res);
}

export async function fetchRepositories(): Promise<GitHubRepo[]> {
  const res = await fetch(`${API_BASE}/github/repositories`);
  return handleResponse<GitHubRepo[]>(res);
}

export async function fetchBenchmarks(): Promise<BenchmarksData> {
  const res = await fetch(`${API_BASE}/benchmarks`);
  return handleResponse<BenchmarksData>(res);
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  return handleResponse<Project[]>(res);
}

export async function fetchProjectDetail(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`);
  return handleResponse<Project>(res);
}

export async function fetchArticles(): Promise<ArticleSummary[]> {
  const res = await fetch(`${API_BASE}/articles`);
  return handleResponse<ArticleSummary[]>(res);
}

export async function fetchArticleDetail(slug: string): Promise<ArticleDetail> {
  const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`);
  return handleResponse<ArticleDetail>(res);
}
