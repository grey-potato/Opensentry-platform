const DEFAULT_BASE_URL = "http://172.30.95.44:8111";
const DEFAULT_PLATFORM = "github";
const FETCH_RETRY_ATTEMPTS = 2;
const FETCH_RETRY_DELAY_MS = 150;

type JsonObject = Record<string, unknown>;

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    generatedAt?: string;
    requestId?: string;
  };
};

export type Pagination = {
  next_cursor?: string | null;
  has_more: boolean;
  page_size: number;
};

export type ApiPaginatedResponse<T> = {
  data?: T[];
  pagination: Pagination;
  meta?: ApiEnvelope<unknown>["meta"];
};

export type ApiListResponse<T> = {
  data?: T[];
  meta?: ApiEnvelope<unknown>["meta"];
};

export type ProjectItem = {
  repo_id: number;
  name?: string | null;
  full_name?: string | null;
  html_url?: string | null;
  platform: string;
  database_name: string;
};

export type ProjectListResponse = {
  items: ProjectItem[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};

export type RepositoryItem = {
  id: number;
  name?: string | null;
  full_name?: string | null;
  html_url?: string | null;
  description?: string | null;
  forks_count?: number | null;
  stargazers_count?: number | null;
  watchers_count?: number | null;
  size?: number | null;
  default_branch?: string | null;
  open_issues_count?: number | null;
  visibility?: string | null;
  key?: string | null;
  subscribers_count?: number | null;
  network_count?: number | null;
  topics?: string[];
  updated_at?: string | null;
  created_at?: string | null;
  pushed_at?: string | null;
  recorded_at?: string | null;
  crawled_at: string;
};

export type CommitItem = {
  sha: string;
  url?: string | null;
  node_id?: string | null;
  author_id?: string | null;
  author_info?: JsonObject | null;
  committer_id?: string | null;
  committer_info?: JsonObject | null;
  message?: string | null;
  tree?: string | null;
  commit_count?: number | null;
  verification?: JsonObject | null;
  parents?: string[];
  recorded_at?: string | null;
  crawled_at: string;
  note?: string | null;
};

export type IssueItem = {
  id: number;
  node_id?: string | null;
  url?: string | null;
  number?: number | null;
  state?: string | null;
  title?: string | null;
  body?: string | null;
  milestone?: JsonObject | null;
  assignees_id?: string[];
  locked?: boolean | null;
  active_lock_reason?: string | null;
  comments?: number | null;
  pull_request_url?: string | null;
  closed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  closed_by_id?: string | null;
  author_association?: string | null;
  state_reason?: string | null;
  serial_id?: number | null;
  recorded_at?: string | null;
  crawled_at: string;
  note?: string | null;
};

export type PullRequestItem = {
  id: number;
  url?: string | null;
  node_id?: string | null;
  review_comments_url?: string | null;
  number?: number | null;
  state?: string | null;
  locked?: boolean | null;
  title?: string | null;
  body?: string | null;
  milestone?: JsonObject | null;
  active_lock_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  closed_at?: string | null;
  merged_at?: string | null;
  merge_commit_sha?: string | null;
  assignees_id?: string[];
  requested_reviewers_id?: string[];
  requested_teams_id?: string[];
  head?: JsonObject | null;
  base?: JsonObject | null;
  author_association?: string | null;
  auto_merge?: JsonObject | null;
  draft?: boolean | null;
  serial_id?: number | null;
  recorded_at?: string | null;
  crawled_at: string;
  note?: string | null;
};

export type RepositoryUserItem = {
  id: string;
  role?: string[];
  serial_id?: number | null;
  crawled_at: string;
  recorded_at?: string | null;
  note?: string | null;
};

export type UserItem = {
  id: string;
  login?: string | null;
  node_id?: string | null;
  avatar_url?: string | null;
  gravatar_id?: string | null;
  url?: string | null;
  type?: string | null;
  site_admin?: boolean | null;
  name?: string | null;
  company?: string | null;
  blog?: string | null;
  location?: string | null;
  email?: string | null;
  hireable?: boolean | null;
  bio?: string | null;
  twitter_username?: string | null;
  public_repos?: number | null;
  public_gists?: number | null;
  followers?: string[];
  following?: string[];
  created_at?: string | null;
  updated_at?: string | null;
  crawled_at: string;
  recorded_at?: string | null;
  note?: string | null;
};

export type ProjectPortraitSnapshot = {
  commit_frequency?: number | null;
  active_week_ratio?: number | null;
  collab_index?: number | null;
  stargazer_count?: number | null;
  watcher_count?: number | null;
  community_star_delta_window?: number | null;
  community_fork_delta_window?: number | null;
  commit_total_window?: number | null;
  commit_total_window_4weeks?: number | null;
  issue_metrics?: {
    issue_update_count_window?: number | null;
    median_issue_response_hours?: number | null;
    median_issue_close_days?: number | null;
  } | null;
  pr_metrics?: {
    open_pr_backlog_count?: number | null;
    stale_open_pr_ratio?: number | null;
    median_pr_time_to_merge_days?: number | null;
  } | null;
};

export type ProjectPortraitMetadata = {
  window_start?: string | null;
  window_end?: string | null;
  effective_window_days?: number | null;
  project_portrait_snapshot?: ProjectPortraitSnapshot;
  [key: string]: unknown;
};

export type ProjectPortraitResultRaw = {
  risk_level?: string | null;
  risk_score?: number | null;
  trust_level?: string | null;
  [key: string]: unknown;
};

export type ProjectPortraitItem = {
  repo_id?: number | null;
  platform: string;
  repo_full_name: string;
  risk_score: number;
  trust_level: string;
  assessed_at: string;
  assessment_version: string;
  engine_version: string;
  result: ProjectPortraitResultRaw;
  metadata?: ProjectPortraitMetadata | null;
  recorded_at: string;
};

export type CommitPortraitResultRaw = {
  summary?: {
    tags?: string[];
    risk_items?: string[];
    risk_score?: number | null;
    primary_reason?: string | null;
    trust_level_code?: string | null;
    trust_level_label?: string | null;
  };
  decision?: {
    funnel_stage?: string | null;
    triggered_rules?: string[];
  };
  evidence?: {
    identity?: {
      is_verified?: boolean | null;
      signature_type?: string | null;
      verification_reason?: string | null;
      is_author_committer_match?: boolean | null;
      author?: JsonObject | null;
      committer?: JsonObject | null;
    };
    code_payload?: {
      semgrep?: {
        info_hits?: number | null;
        warning_hits?: number | null;
        critical_hits?: number | null;
        findings_count?: number | null;
        sensitive_files_modified?: string[];
      };
    };
    commit_metadata?: {
      parent_count?: number | null;
      message_title?: string | null;
      message_length?: number | null;
      is_merge_commit?: boolean | null;
      has_detailed_message?: boolean | null;
    };
  };
  [key: string]: unknown;
};

export type CommitPortraitItem = {
  serial_id: number;
  repo_id: number;
  platform: string;
  repo_full_name: string;
  commit_sha: string;
  trust_level: string;
  assessed_at: string;
  assessment_version: string;
  engine_version: string;
  result: CommitPortraitResultRaw;
  recorded_at: string;
};

export type UserPortraitAssessmentDataRaw = {
  scores?: Record<
    string,
    {
      score?: number | null;
      max?: number | null;
    }
  >;
  bonuses?: string[];
  warnings?: string[];
  indicators?: Record<string, string | number | boolean | null>;
  [key: string]: unknown;
};

export type UserPortraitItem = {
  serial_id: number;
  user_id: string;
  login: string;
  platform: string;
  total_score: number;
  trust_level: string;
  assessed_at: string;
  algorithm_version: string;
  assessment_data: UserPortraitAssessmentDataRaw;
  metadata?: JsonObject | null;
  recorded_at: string;
};

type RequestOptions = {
  baseUrl?: string;
  platform?: string;
};

function getBaseUrl(override?: string) {
  return (override ?? process.env.OPENSENTRY_API_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/$/,
    ""
  );
}

export function getPlatform(override?: string) {
  return override ?? process.env.OPENSENTRY_PLATFORM ?? DEFAULT_PLATFORM;
}

function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function shouldRetryFetchError(error: unknown) {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const code =
    error.cause && typeof error.cause === "object" && "code" in error.cause
      ? (error.cause as { code?: unknown }).code
      : undefined;

  return (
    code === "UND_ERR_SOCKET" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(path: string, init?: RequestInit) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(path, {
        ...init,
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
      });
    } catch (error) {
      lastError = error;

      if (!shouldRetryFetchError(error) || attempt === FETCH_RETRY_ATTEMPTS) {
        throw error;
      }

      await delay(FETCH_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

async function readJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithRetry(path, init);

  if (!response.ok) {
    throw new Error(`OpenSentry API ${response.status}: ${path}`);
  }

  return (await response.json()) as T;
}

async function readJsonOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetchWithRetry(path, init);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`OpenSentry API ${response.status}: ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchProjects(
  {
    page = 1,
    pageSize = 6,
    syncStatus,
    platform,
    baseUrl,
  }: {
    page?: number;
    pageSize?: number;
    syncStatus?: string;
  } & RequestOptions = {}
): Promise<ProjectListResponse> {
  const resolvedPlatform = getPlatform(platform);
  const query = buildQuery({
    page,
    page_size: pageSize,
    sync_status: syncStatus,
  });
  const url = `${getBaseUrl(baseUrl)}/api/v1/${resolvedPlatform}/projects${query}`;
  const payload = await readJson<ApiEnvelope<ProjectListResponse>>(url);
  return payload.data;
}

export async function fetchAllProjects(
  {
    pageSize = 100,
    syncStatus,
    platform,
    baseUrl,
    maxPages = 200,
  }: {
    pageSize?: number;
    syncStatus?: string;
    maxPages?: number;
  } & RequestOptions = {}
): Promise<ProjectItem[]> {
  const items: ProjectItem[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchProjects({
      page,
      pageSize,
      syncStatus,
      platform,
      baseUrl,
    });

    items.push(...payload.items);

    if (!payload.has_next) {
      break;
    }
  }

  return items;
}

export async function fetchProject(
  repoId: number,
  options: RequestOptions = {}
): Promise<ProjectItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/projects/${repoId}`;
  const payload = await readJson<ApiEnvelope<ProjectItem>>(url);
  return payload.data;
}

export async function fetchRepository(
  repoId: number,
  options: RequestOptions = {}
): Promise<RepositoryItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}`;
  const payload = await readJson<ApiEnvelope<RepositoryItem>>(url);
  return payload.data;
}

export async function fetchRepositoryHistory(
  repoId: number,
  options: RequestOptions = {}
): Promise<RepositoryItem[]> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/history`;
  const payload = await readJson<ApiListResponse<RepositoryItem>>(url);
  return payload.data ?? [];
}

export async function fetchLatestProjectPortrait(
  repoId: number,
  options: RequestOptions = {}
): Promise<ProjectPortraitItem | null> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(
    options.baseUrl
  )}/api/v1/${resolvedPlatform}/analysis/repos/${repoId}/project-portraits/latest`;
  const payload = await readJsonOrNull<ApiEnvelope<ProjectPortraitItem>>(url);
  return payload?.data ?? null;
}

export async function fetchCommits(
  repoId: number,
  {
    pageSize = 12,
    cursor,
    authorId,
    committerId,
    createdAfter,
    createdBefore,
    sort,
    order,
    platform,
    baseUrl,
  }: {
    pageSize?: number;
    cursor?: string;
    authorId?: string;
    committerId?: string;
    createdAfter?: string;
    createdBefore?: string;
    sort?: string;
    order?: string;
  } & RequestOptions = {}
): Promise<ApiPaginatedResponse<CommitItem>> {
  const resolvedPlatform = getPlatform(platform);
  const query = buildQuery({
    page_size: pageSize,
    cursor,
    author_id: authorId,
    committer_id: committerId,
    created_after: createdAfter,
    created_before: createdBefore,
    sort,
    order,
  });
  const url = `${getBaseUrl(baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/commits${query}`;
  return readJson<ApiPaginatedResponse<CommitItem>>(url);
}

export async function fetchCommit(
  repoId: number,
  sha: string,
  options: RequestOptions = {}
): Promise<CommitItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/commits/${sha}`;
  const payload = await readJson<ApiEnvelope<CommitItem>>(url);
  return payload.data;
}

export async function fetchCommitPortrait(
  repoId: number,
  sha: string,
  options: RequestOptions = {}
): Promise<CommitPortraitItem | null> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(
    options.baseUrl
  )}/api/v1/${resolvedPlatform}/analysis/repos/${repoId}/commit-portraits/${sha}`;
  const payload = await readJsonOrNull<ApiEnvelope<CommitPortraitItem>>(url);
  return payload?.data ?? null;
}

export async function fetchRepositoryUsers(
  repoId: number,
  {
    pageSize = 12,
    cursor,
    role,
    platform,
    baseUrl,
  }: {
    pageSize?: number;
    cursor?: string;
    role?: string;
  } & RequestOptions = {}
): Promise<ApiPaginatedResponse<RepositoryUserItem>> {
  const resolvedPlatform = getPlatform(platform);
  const query = buildQuery({
    page_size: pageSize,
    cursor,
    role,
  });
  const url = `${getBaseUrl(baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/users${query}`;
  return readJson<ApiPaginatedResponse<RepositoryUserItem>>(url);
}

export async function fetchUser(
  userId: string,
  options: RequestOptions = {}
): Promise<UserItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/users/${userId}`;
  const payload = await readJson<ApiEnvelope<UserItem>>(url);
  return payload.data;
}

export async function fetchUsersByLogin(
  login: string,
  options: RequestOptions = {}
): Promise<UserItem[]> {
  const resolvedPlatform = getPlatform(options.platform);
  const encodedLogin = encodeURIComponent(login);
  const url = `${getBaseUrl(
    options.baseUrl
  )}/api/v1/${resolvedPlatform}/users/by-login/${encodedLogin}`;
  const payload = await readJson<ApiListResponse<UserItem>>(url);
  return payload.data ?? [];
}

export async function fetchLatestUserPortrait(
  userId: string,
  options: RequestOptions = {}
): Promise<UserPortraitItem | null> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(
    options.baseUrl
  )}/api/v1/${resolvedPlatform}/analysis/users/${userId}/user-portraits/latest`;
  const payload = await readJsonOrNull<ApiEnvelope<UserPortraitItem>>(url);
  return payload?.data ?? null;
}

export async function fetchIssues(
  repoId: number,
  {
    pageSize = 12,
    cursor,
    state,
    authorAssociation,
    createdAfter,
    createdBefore,
    sort,
    order,
    platform,
    baseUrl,
  }: {
    pageSize?: number;
    cursor?: string;
    state?: string;
    authorAssociation?: string;
    createdAfter?: string;
    createdBefore?: string;
    sort?: string;
    order?: string;
  } & RequestOptions = {}
): Promise<ApiPaginatedResponse<IssueItem>> {
  const resolvedPlatform = getPlatform(platform);
  const query = buildQuery({
    page_size: pageSize,
    cursor,
    state,
    author_association: authorAssociation,
    created_after: createdAfter,
    created_before: createdBefore,
    sort,
    order,
  });
  const url = `${getBaseUrl(baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/issues${query}`;
  return readJson<ApiPaginatedResponse<IssueItem>>(url);
}

export async function fetchIssue(
  repoId: number,
  issueId: number,
  options: RequestOptions = {}
): Promise<IssueItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/issues/${issueId}`;
  const payload = await readJson<ApiEnvelope<IssueItem>>(url);
  return payload.data;
}

export async function fetchPullRequests(
  repoId: number,
  {
    pageSize = 12,
    cursor,
    state,
    authorAssociation,
    createdAfter,
    createdBefore,
    sort,
    order,
    platform,
    baseUrl,
  }: {
    pageSize?: number;
    cursor?: string;
    state?: string;
    authorAssociation?: string;
    createdAfter?: string;
    createdBefore?: string;
    sort?: string;
    order?: string;
  } & RequestOptions = {}
): Promise<ApiPaginatedResponse<PullRequestItem>> {
  const resolvedPlatform = getPlatform(platform);
  const query = buildQuery({
    page_size: pageSize,
    cursor,
    state,
    author_association: authorAssociation,
    created_after: createdAfter,
    created_before: createdBefore,
    sort,
    order,
  });
  const url = `${getBaseUrl(baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/pull-requests${query}`;
  return readJson<ApiPaginatedResponse<PullRequestItem>>(url);
}

export async function fetchPullRequest(
  repoId: number,
  pullRequestId: number,
  options: RequestOptions = {}
): Promise<PullRequestItem> {
  const resolvedPlatform = getPlatform(options.platform);
  const url = `${getBaseUrl(options.baseUrl)}/api/v1/${resolvedPlatform}/repos/${repoId}/pull-requests/${pullRequestId}`;
  const payload = await readJson<ApiEnvelope<PullRequestItem>>(url);
  return payload.data;
}
