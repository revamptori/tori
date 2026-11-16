/**
 * TypeScript types for Tori's portfolio frontend.
 */

export interface SystemHealth {
  status: string;
  app: string;
  author: string;
  framework: string;
  framework_version: string;
  engine: string;
  engine_detail: string;
  rust_engine_compiled: boolean;
  configured_engine: string;
  timestamp: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionMonth {
  name: string;
  year: number;
  firstDay: string;
  totalWeeks: number;
}

export interface ContributionsData {
  username: string;
  profile_url: string;
  year: number;
  total_contributions: number;
  weeks: ContributionWeek[];
  months: ContributionMonth[];
  last_updated: string;
  is_stale: boolean;
  cached?: boolean;
  cache_age_seconds?: number;
  stale_reason?: string;
  error?: string;
  message?: string;
}

export interface GitHubProfile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  company?: string | null;
  location?: string | null;
  blog?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  cached?: boolean;
  is_stale?: boolean;
  error?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: string | null;
  open_issues: number;
  is_fork: boolean;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  category: string;
  status: string;
  is_experimental: boolean;
  is_featured: boolean;
  primary_language: string;
  languages: string[];
  stack: string[];
  description: string;
  long_description: string;
  repo_url: string | null;
  github_repo_name: string | null;
  docs_url: string | null;
  architecture_diagram: string | null;
  key_metrics: ProjectMetric[];
  highlights: string[];
}

export interface ArticleSummary {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  read_time: string;
  category: string;
  tags: string[];
  summary: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
}

export interface WorkloadBenchmark {
  endpoint: string;
  description: string;
  rps: {
    flask: number;
    flap_python: number;
    flap_rust: number;
    express?: number;
    gin?: number;
    drogon?: number;
  };
  p95_latency_ms: {
    flask: number;
    flap_python: number;
    flap_rust: number;
    express?: number;
  };
  speedup_vs_flask: {
    flap_python: string;
    flap_rust: string;
  };
}

export interface BottleneckInfo {
  id: string;
  name: string;
  flask_bottleneck: string;
  flap_solution: string;
  impact: string;
}

export interface ResourceMetric {
  framework: string;
  cpu_utilization_pct: number;
  cores_active: number;
  memory_rss_mb: number;
  notes: string;
}

export interface BenchmarksData {
  methodology: {
    title: string;
    hardware: string;
    network: string;
    protocol: string;
    parameters: string;
    source_repository: string;
    source_files: string[];
    verification_notice: string;
  };
  bottlenecks: BottleneckInfo[];
  workloads: WorkloadBenchmark[];
  resource_utilization: {
    description: string;
    metrics: ResourceMetric[];
  };
}
