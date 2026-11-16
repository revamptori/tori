import { describe, it, expect, vi } from 'vitest';
import { fetchHealth, fetchContributions } from '../api';

describe('Frontend API Client', () => {
  it('fetchHealth returns health status object', async () => {
    const mockHealth = {
      status: 'healthy',
      app: 'tori-portfolio',
      author: 'revamptori',
      framework: 'flap',
      framework_version: '1.0.0',
      engine: 'rust',
      engine_detail: 'Tokio + Hyper + Axum (Rust)',
      rust_engine_compiled: true,
      configured_engine: 'rust',
      timestamp: '2026-11-16T00:00:00Z',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
    } as Response);

    const result = await fetchHealth();
    expect(result.status).toBe('healthy');
    expect(result.framework).toBe('flap');
    expect(result.author).toBe('revamptori');
  });

  it('fetchContributions handles year query', async () => {
    const mockContributions = {
      username: 'revamptori',
      profile_url: 'https://github.com/revamptori',
      year: 2026,
      total_contributions: 67,
      weeks: [],
      months: [],
      last_updated: '2026-11-16T00:00:00Z',
      is_stale: false,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockContributions,
    } as Response);

    const result = await fetchContributions(2026);
    expect(result.username).toBe('revamptori');
    expect(result.year).toBe(2026);
    expect(result.total_contributions).toBe(67);
  });

  it('handles API errors gracefully by throwing error with backend message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Validation Error', message: 'Year is out of range' }),
    } as Response);

    await expect(fetchContributions(2035)).rejects.toThrow('Year is out of range');
  });
});
