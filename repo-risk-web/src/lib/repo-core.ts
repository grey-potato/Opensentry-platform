import { cache } from "react";
import {
  fetchCommits,
  fetchCommitPortrait,
  fetchLatestProjectPortrait,
  fetchProject,
  fetchRepository,
  fetchRepositoryHistory,
  fetchUser,
  type CommitItem,
  type CommitPortraitItem,
  type CommitPortraitResultRaw,
  type IssueItem,
  type ProjectPortraitItem,
  type ProjectPortraitMetadata,
  type ProjectPortraitSnapshot,
  type PullRequestItem,
  type RepositoryItem,
  type UserPortraitItem,
} from "@/lib/opensentry-api";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/ui-copy";

export type RiskLevel = "high" | "medium" | "low";

export type PreviewItemViewModel = {
  title: string;
  meta: string;
  level?: RiskLevel;
  badgeLabel?: string;
  href?: string;
  relatedUsers?: RelatedUserViewModel[];
};

export type MetricItemViewModel = {
  label: string;
  value: string;
  note?: string;
};

export type RelatedUserViewModel = {
  id: string;
  label: string;
  role: string;
  href: string;
};

export type RepoTimelinePointViewModel = {
  label: string;
  stars: number;
  forks: number;
  issues: number;
};

export type ProjectPortraitResult = {
  riskLevel: RiskLevel;
  riskScorePercent: number;
  trustLevel: string;
  assessedAt: string;
  windowStart: string;
  windowEnd: string;
  effectiveWindowDays: number;
  commitFrequency: number;
  activeWeekRatio: number;
  collabIndex: number;
  issueResponseHours: number;
  issueCloseDays: number;
  issueUpdateCountWindow: number;
  prBacklog: number;
  stalePrRatio: number;
  communityStarDelta: number;
  communityForkDelta: number;
};

export type CommitPortraitResult = {
  available: boolean;
  trustLevel: string;
  riskLevel: RiskLevel;
  assessedAt: string;
  tags: string[];
  primaryReason: string;
  signatureType: string;
  verificationReason: string;
  isVerified: boolean | null;
  triggeredRules: string[];
  parentCount: number;
  messageTitle: string;
  messageLength: number;
  findingsCount: number;
};

export type UserPortraitResult = {
  available: boolean;
  totalScore: number;
  trustLevel: string;
  riskLevel: RiskLevel;
  assessedAt: string;
  scoreBreakdown: MetricItemViewModel[];
};

export type RepoAggregate = {
  repoId: number;
  platform: string;
  fullName: string;
  name: string;
  description: string;
  htmlUrl: string;
  visibility: string;
  license: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  watchers: number;
  subscribers: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  lastSync: string;
  topics: string[];
  projectPortrait: ProjectPortraitResult;
  timeline: RepoTimelinePointViewModel[];
};

export const DEFAULT_ENTITY_PAGE_SIZE = 10;
export const ENTITY_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000)
      .toFixed(value >= 10000 ? 0 : 1)
      .replace(/\.0$/, "")}k`;
  }

  return String(value);
}

export function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function formatShortSha(sha: string) {
  return sha.slice(0, 7);
}

export function firstLine(text?: string | null) {
  return (text ?? "").split("\n")[0]?.trim() ?? "";
}

export function restLines(text?: string | null) {
  return (text ?? "").split("\n").slice(1).join("\n").trim();
}

export function readString(
  source: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = source?.[key];
  return typeof value === "string" ? value : "";
}

export function readBoolean(
  source: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = source?.[key];
  return typeof value === "boolean" ? value : null;
}

export function readObject(
  source: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = source?.[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function readNestedString(
  source: Record<string, unknown> | null | undefined,
  path: string[]
) {
  let current: unknown = source;

  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return "";
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : "";
}

export function normalizeRatioToPercent(value?: number | null) {
  if (!value) {
    return 0;
  }

  return value <= 1.5 ? value * 100 : value;
}

export function mapTrustToRiskLevel(trustLevel?: string | null): RiskLevel {
  switch ((trustLevel ?? "").toLowerCase()) {
    case "high":
    case "trusted":
      return "low";
    case "at_risk":
    case "untrusted":
    case "risk":
      return "high";
    case "unknown":
    case "medium":
    default:
      return "medium";
  }
}

export function mapIssueStateToLevel(state?: string | null): RiskLevel {
  return state === "open" ? "medium" : "low";
}

export function mapPullRequestStateToLevel(
  state?: string | null,
  mergedAt?: string | null
): RiskLevel {
  if (mergedAt) {
    return "low";
  }

  return state === "open" ? "medium" : "low";
}

export function buildQueryString(
  params: Record<string, string | undefined | null>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    search.set(key, value);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildRepoRoute(
  repoId: string,
  section: string,
  params?: Record<string, string | undefined | null>
) {
  return `/repo/${repoId}/${section}${buildQueryString(params ?? {})}`;
}

export function buildPaginationHref(
  repoId: string,
  section: string,
  current: Record<string, string | undefined>,
  options: {
    page: number;
    pageSize: number;
    pageChain: Array<string | null>;
  }
) {
  return buildRepoRoute(repoId, section, {
    ...current,
    page: String(options.page),
    page_size: String(options.pageSize),
    page_chain: serializePageChain(options.pageChain),
  });
}

export function normalizeEntityPage(value?: string | number | null) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 1;
}

export function normalizeEntityPageSize(value?: string | number | null) {
  const numeric = Number(value);
  return ENTITY_PAGE_SIZE_OPTIONS.includes(numeric as (typeof ENTITY_PAGE_SIZE_OPTIONS)[number])
    ? numeric
    : DEFAULT_ENTITY_PAGE_SIZE;
}

export function parsePageChain(value?: string | null) {
  if (!value) {
    return [null];
  }

  const items = value
    .split("|")
    .filter(Boolean)
    .map((item) => (item === "~" ? null : decodeURIComponent(item)));

  if (!items.length || items[0] !== null) {
    items.unshift(null);
  }

  return items;
}

export function serializePageChain(cursors: Array<string | null>) {
  const normalized = cursors.length ? cursors : [null];
  return normalized.map((cursor) => (cursor === null ? "~" : encodeURIComponent(cursor))).join("|");
}

export function parseRepoId(repoId: string) {
  const numeric = Number(repoId);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`Invalid repo id: ${repoId}`);
  }

  return numeric;
}

function buildTimelinePoints(history: RepositoryItem[]) {
  return history.slice(-12).map((item) => ({
    label: formatDate(item.crawled_at),
    stars: item.stargazers_count ?? 0,
    forks: item.forks_count ?? 0,
    issues: item.open_issues_count ?? 0,
  }));
}

export function getObservationWindow(metadata?: ProjectPortraitMetadata | null) {
  const windowStart = metadata?.window_start ?? "";
  const windowEnd = metadata?.window_end ?? "";
  const effectiveWindowDays = metadata?.effective_window_days ?? 0;

  return {
    windowStart,
    windowEnd,
    effectiveWindowDays,
    label:
      windowStart && windowEnd
        ? `${formatDate(windowStart)} -> ${formatDate(windowEnd)}`
        : "",
  };
}

export function mapProjectPortrait(
  portrait: ProjectPortraitItem | null
): ProjectPortraitResult {
  const metadata = portrait?.metadata;
  const snapshot = metadata?.project_portrait_snapshot as
    | ProjectPortraitSnapshot
    | undefined;
  const window = getObservationWindow(metadata);

  return {
    riskLevel: mapTrustToRiskLevel(
      readString(portrait?.result as Record<string, unknown>, "risk_level") ||
        portrait?.trust_level
    ),
    riskScorePercent: Math.round((portrait?.risk_score ?? 0) * 100),
    trustLevel: portrait?.trust_level ?? "unknown",
    assessedAt: portrait?.assessed_at ?? "",
    windowStart: window.windowStart,
    windowEnd: window.windowEnd,
    effectiveWindowDays: window.effectiveWindowDays,
    commitFrequency: snapshot?.commit_frequency ?? 0,
    activeWeekRatio: normalizeRatioToPercent(snapshot?.active_week_ratio),
    collabIndex: snapshot?.collab_index ?? 0,
    issueResponseHours:
      snapshot?.issue_metrics?.median_issue_response_hours ?? 0,
    issueCloseDays: snapshot?.issue_metrics?.median_issue_close_days ?? 0,
    issueUpdateCountWindow:
      snapshot?.issue_metrics?.issue_update_count_window ?? 0,
    prBacklog: snapshot?.pr_metrics?.open_pr_backlog_count ?? 0,
    stalePrRatio:
      normalizeRatioToPercent(snapshot?.pr_metrics?.stale_open_pr_ratio),
    communityStarDelta: snapshot?.community_star_delta_window ?? 0,
    communityForkDelta: snapshot?.community_fork_delta_window ?? 0,
  };
}

export function mapCommitPortrait(
  portrait: CommitPortraitItem | null
): CommitPortraitResult {
  if (!portrait) {
    return {
      available: false,
      trustLevel: "unavailable",
      riskLevel: "medium",
      assessedAt: "",
      tags: [],
      primaryReason: "Portrait unavailable",
      signatureType: "unknown",
      verificationReason: "unknown",
      isVerified: null,
      triggeredRules: [],
      parentCount: 0,
      messageTitle: "",
      messageLength: 0,
      findingsCount: 0,
    };
  }

  const result = portrait.result as CommitPortraitResultRaw;
  const summary = result.summary ?? {};
  const evidence = result.evidence ?? {};
  const identity = evidence.identity ?? {};
  const commitMetadata = evidence.commit_metadata ?? {};
  const semgrep = evidence.code_payload?.semgrep ?? {};

  return {
    available: true,
    trustLevel: portrait.trust_level,
    riskLevel: mapTrustToRiskLevel(
      summary.trust_level_code ?? portrait.trust_level
    ),
    assessedAt: portrait.assessed_at,
    tags: summary.tags ?? [],
    primaryReason: summary.primary_reason ?? "Portrait available",
    signatureType: identity.signature_type ?? "unknown",
    verificationReason: identity.verification_reason ?? "unknown",
    isVerified: identity.is_verified ?? null,
    triggeredRules: result.decision?.triggered_rules ?? [],
    parentCount: commitMetadata.parent_count ?? 0,
    messageTitle: commitMetadata.message_title ?? "",
    messageLength: commitMetadata.message_length ?? 0,
    findingsCount: semgrep.findings_count ?? 0,
  };
}

export function mapUserPortrait(
  portrait: UserPortraitItem | null
): UserPortraitResult {
  if (!portrait) {
    return {
      available: false,
      totalScore: 0,
      trustLevel: "unavailable",
      riskLevel: "medium",
      assessedAt: "",
      scoreBreakdown: [],
    };
  }

  const scores = portrait.assessment_data?.scores ?? {};
  const scoreBreakdown = Object.entries(scores).map(([label, entry]) => ({
    label,
    value: `${formatNumber(entry.score ?? 0)} / ${formatNumber(entry.max ?? 0)}`,
  }));

  return {
    available: true,
    totalScore: portrait.total_score,
    trustLevel: portrait.trust_level,
    riskLevel: mapTrustToRiskLevel(portrait.trust_level),
    assessedAt: portrait.assessed_at,
    scoreBreakdown,
  };
}

export function commitActorLabel(commit: CommitItem) {
  const info = (commit.author_info ?? commit.committer_info ?? {}) as Record<
    string,
    unknown
  >;
  return readString(info, "name") || commit.author_id || commit.committer_id || "";
}

export function buildRepoSubtitle(repo: RepoAggregate, locale: Locale) {
  return locale === "en"
    ? `${repo.fullName} / ${repo.projectPortrait.effectiveWindowDays || 0} day portrait window`
    : `${repo.fullName} / ${repo.projectPortrait.effectiveWindowDays || 0} 天画像窗口`;
}

export function buildRepoTags(repo: RepoAggregate, locale: Locale) {
  return [
    locale === "en"
      ? `Trust ${repo.projectPortrait.trustLevel}`
      : `可信 ${repo.projectPortrait.trustLevel}`,
    locale === "en"
      ? `Risk ${repo.projectPortrait.riskLevel}`
      : `风险 ${repo.projectPortrait.riskLevel}`,
    ...repo.topics.slice(0, 2),
  ];
}

type RelatedUserSeed = {
  id: string;
  label?: string;
  roleKey: "author" | "committer" | "assignee" | "closedBy" | "reviewer";
};

function roleLabel(roleKey: RelatedUserSeed["roleKey"], locale: Locale) {
  return getDictionary(locale).roles[roleKey];
}

async function hydrateRelatedUsers(
  routeRepoId: string,
  platform: string,
  seeds: RelatedUserSeed[],
  locale: Locale
): Promise<RelatedUserViewModel[]> {
  const merged = new Map<
    string,
    { label?: string; roles: Set<RelatedUserSeed["roleKey"]> }
  >();

  for (const seed of seeds) {
    if (!seed.id) {
      continue;
    }
    const current = merged.get(seed.id) ?? { label: seed.label, roles: new Set() };
    if (!current.label && seed.label) {
      current.label = seed.label;
    }
    current.roles.add(seed.roleKey);
    merged.set(seed.id, current);
  }

  const idsToLookup = [...merged.entries()]
    .filter(([, value]) => !value.label)
    .map(([id]) => id);

  const fetched = await Promise.all(
    idsToLookup.map((id) => fetchUser(id, { platform }).catch(() => null))
  );

  idsToLookup.forEach((id, index) => {
    const entry = merged.get(id);
    const user = fetched[index];
    if (entry && user) {
      entry.label = user.login ?? user.name ?? id;
    }
  });

  return [...merged.entries()].map(([id, value]) => ({
    id,
    label: value.label ?? id,
    role: [...value.roles].map((item) => roleLabel(item, locale)).join(" / "),
    href: `/repo/${routeRepoId}/users/${encodeURIComponent(id)}`,
  }));
}

export async function buildCommitRelatedUsers(
  commit: CommitItem,
  routeRepoId: string,
  platform: string,
  locale: Locale
) {
  const authorInfo = (commit.author_info ?? {}) as Record<string, unknown>;
  const committerInfo = (commit.committer_info ?? {}) as Record<string, unknown>;
  const seeds: RelatedUserSeed[] = [];

  if (commit.author_id) {
    seeds.push({
      id: commit.author_id,
      label: readString(authorInfo, "name") || readString(authorInfo, "login") || undefined,
      roleKey: "author",
    });
  }

  if (commit.committer_id && commit.committer_id !== commit.author_id) {
    seeds.push({
      id: commit.committer_id,
      label:
        readString(committerInfo, "name") || readString(committerInfo, "login") || undefined,
      roleKey: "committer",
    });
  }

  return hydrateRelatedUsers(routeRepoId, platform, seeds, locale);
}

export async function buildIssueRelatedUsers(
  issue: IssueItem,
  routeRepoId: string,
  platform: string,
  locale: Locale
) {
  const seeds: RelatedUserSeed[] = [
    ...(issue.assignees_id ?? []).map((id) => ({ id, roleKey: "assignee" as const })),
  ];

  if (issue.closed_by_id) {
    seeds.push({ id: issue.closed_by_id, roleKey: "closedBy" });
  }

  return hydrateRelatedUsers(routeRepoId, platform, seeds, locale);
}

export async function buildPullRequestRelatedUsers(
  pr: PullRequestItem,
  routeRepoId: string,
  platform: string,
  locale: Locale
) {
  const seeds: RelatedUserSeed[] = [
    ...(pr.assignees_id ?? []).map((id) => ({ id, roleKey: "assignee" as const })),
    ...(pr.requested_reviewers_id ?? []).map((id) => ({
      id,
      roleKey: "reviewer" as const,
    })),
  ];

  const directUser = readObject((pr as Record<string, unknown>) ?? null, "user");
  const directUserId =
    readString((pr as Record<string, unknown>) ?? null, "user_id") ||
    readString(directUser, "id");
  const directUserLabel = readString(directUser, "login") || readString(directUser, "name");

  const headUserId =
    readNestedString(pr.head as Record<string, unknown>, ["user", "id"]) ||
    readString(pr.head as Record<string, unknown>, "user_id");
  const headUserLabel =
    readNestedString(pr.head as Record<string, unknown>, ["user", "login"]) ||
    readNestedString(pr.head as Record<string, unknown>, ["user", "name"]);

  const baseUserId =
    readNestedString(pr.base as Record<string, unknown>, ["user", "id"]) ||
    readString(pr.base as Record<string, unknown>, "user_id");
  const baseUserLabel =
    readNestedString(pr.base as Record<string, unknown>, ["user", "login"]) ||
    readNestedString(pr.base as Record<string, unknown>, ["user", "name"]);

  const primaryAuthorId = directUserId || headUserId || baseUserId;
  const primaryAuthorLabel = directUserLabel || headUserLabel || baseUserLabel;

  if (primaryAuthorId) {
    seeds.unshift({
      id: primaryAuthorId,
      label: primaryAuthorLabel || undefined,
      roleKey: "author",
    });
  }

  return hydrateRelatedUsers(routeRepoId, platform, seeds, locale);
}

export function formatShortDateLabel(value: string) {
  if (!value) {
    return "";
  }

  return value.length >= 10 ? value.slice(5) : value;
}

const loadRepoAggregateInternal = async (
  repoId: string,
  platform: string
): Promise<RepoAggregate> => {
  const numericRepoId = parseRepoId(repoId);
  const [project, repository] = await Promise.all([
    fetchProject(numericRepoId, { platform }),
    fetchRepository(numericRepoId, { platform }),
  ]);
  const [portrait, history] = await Promise.all([
    fetchLatestProjectPortrait(numericRepoId, { platform }).catch(() => null),
    fetchRepositoryHistory(numericRepoId, { platform }).catch(() => []),
  ]);

  const fullName =
    project.full_name ?? repository.full_name ?? `repo/${numericRepoId}`;

  return {
    repoId: numericRepoId,
    platform: project.platform,
    fullName,
    name: project.name ?? repository.name ?? String(numericRepoId),
    description: repository.description ?? "Repository metadata snapshot.",
    htmlUrl: project.html_url ?? repository.html_url ?? "",
    visibility: repository.visibility ?? "public",
    license: repository.key ?? "unknown",
    defaultBranch: repository.default_branch ?? "main",
    stars: repository.stargazers_count ?? 0,
    forks: repository.forks_count ?? 0,
    watchers: repository.watchers_count ?? 0,
    subscribers: repository.subscribers_count ?? 0,
    openIssues: repository.open_issues_count ?? 0,
    createdAt: repository.created_at ?? "",
    updatedAt: repository.updated_at ?? "",
    lastSync: repository.crawled_at ?? repository.updated_at ?? "",
    topics: repository.topics ?? [],
    projectPortrait: mapProjectPortrait(portrait),
    timeline: buildTimelinePoints(history),
  };
};

export const loadRepoAggregate = cache(loadRepoAggregateInternal);

export async function loadCommitPreviewItems(
  repoId: number,
  routeRepoId: string,
  platform: string,
  locale: Locale
) {
  const commitsResponse = await fetchCommits(repoId, {
    pageSize: 3,
    sort: "crawled_at",
    order: "desc",
    platform,
  });
  const items = commitsResponse.data ?? [];
  const portraits = await Promise.all(
    items.map((item) => fetchCommitPortrait(repoId, item.sha, { platform }).catch(() => null))
  );

  const relatedUsers = await Promise.all(
    items.map((item) => buildCommitRelatedUsers(item, routeRepoId, platform, locale))
  );

  return items.map((item, index) => {
    const portrait = mapCommitPortrait(portraits[index]);
    return {
      title: firstLine(item.message) || formatShortSha(item.sha),
      meta: `${formatShortSha(item.sha)} / ${formatDate(
        readString(item.author_info ?? undefined, "date") || item.crawled_at
      )}`,
      badgeLabel: portrait.available
        ? portrait.trustLevel
        : locale === "en"
          ? "portrait unavailable"
          : "暂无画像",
      href: `/repo/${routeRepoId}/commits/${item.sha}`,
      relatedUsers: relatedUsers[index],
    };
  });
}
