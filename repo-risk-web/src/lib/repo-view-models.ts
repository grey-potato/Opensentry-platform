export type RiskLevel = "high" | "medium" | "low";

export type HomeSortKey =
  | "stars"
  | "activity"
  | "collab"
  | "community"
  | "updated";

export type PreviewItemViewModel = {
  title: string;
  meta: string;
  level?: RiskLevel;
};

type RawRepoSource = {
  id: string;
  fullName: string;
  description: string;
  language: string;
  license: string;
  defaultBranch: string;
  firstSeen: string;
  lastSync: string;
  riskLevel: RiskLevel;
  riskScore: number;
  stars: number;
  forks: number;
  openIssues: number;
  openPrs: number;
  contributors: number;
  commitPerWeek: number;
  activeWeekRatio: number;
  collabIndex: number;
  communityDelta: number;
  issueResponseHours: number;
  prBacklog: number;
  entityCount: number;
  tags: string[];
  recentCommits: PreviewItemViewModel[];
  openIssuesPreview: PreviewItemViewModel[];
  prsPreview: PreviewItemViewModel[];
};

export type FilterChipViewModel = {
  label: string;
  value: HomeSortKey;
  href: string;
  selected: boolean;
};

export type InsightCardViewModel = {
  title: string;
  value: string;
  description: string;
  href: string;
};

export type RepositoryCardViewModel = {
  name: string;
  description: string;
  href: string;
  language: string;
  license: string;
  stars: string;
  forks: string;
  issues: string;
  prs: string;
  contributors: string;
  tags: string[];
};

export type HomePageViewModel = {
  currentSort: HomeSortKey;
  filters: FilterChipViewModel[];
  insights: InsightCardViewModel[];
  repositories: RepositoryCardViewModel[];
};

export type RepoSidebarViewModel = {
  title: string;
  description: string;
  pills: string[];
  repositoryStats: Array<{ label: string; value: string }>;
  portraitStats: Array<{ label: string; value: string }>;
  tags: string[];
  riskLevel: RiskLevel;
};

export type RepoOverviewViewModel = {
  title: string;
  description: string;
  pills: string[];
  riskLevel: RiskLevel;
  summaryStats: Array<{ label: string; value: string }>;
  portraitSummary: Array<{ label: string; value: string }>;
  recentCommits: PreviewItemViewModel[];
  openIssues: PreviewItemViewModel[];
  pullRequests: PreviewItemViewModel[];
};

export type RepoRiskViewModel = {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  tags: string[];
  summaryStats: Array<{ label: string; value: string }>;
  snapshots: Array<{ label: string; value: string; level: RiskLevel }>;
  dimensions: Array<{
    title: string;
    description: string;
    metrics: Array<{
      label: string;
      value: string;
      note: string;
      level: RiskLevel;
    }>;
  }>;
};

const placeholderRepos: RawRepoSource[] = [
  {
    id: "repo-placeholder",
    fullName: "opensentry/platform",
    description:
      "Risk indexing and metadata service for open-source repositories.",
    language: "TypeScript",
    license: "Apache-2.0",
    defaultBranch: "main",
    firstSeen: "2024-08",
    lastSync: "2026-03-22",
    riskLevel: "medium",
    riskScore: 68,
    stars: 3894,
    forks: 612,
    openIssues: 37,
    openPrs: 11,
    contributors: 18,
    commitPerWeek: 9.4,
    activeWeekRatio: 92,
    collabIndex: 15,
    communityDelta: 214,
    issueResponseHours: 5.5,
    prBacklog: 11,
    entityCount: 126,
    tags: ["metadata", "portrait", "12-week window"],
    recentCommits: [
      {
        title: "feat: add dependency source validation",
        meta: "9bd13ef / alice / 2026-03-20",
        level: "medium",
      },
      {
        title: "fix: sanitize token parsing in pipeline",
        meta: "a6f2b1c / bob / 2026-03-18",
        level: "low",
      },
      {
        title: "chore: docs and cleanup",
        meta: "f22de66 / charlie / 2026-03-15",
      },
    ],
    openIssuesPreview: [
      {
        title: "Auth flow allows legacy token fallback",
        meta: "#128 / open / bob",
        level: "high",
      },
      {
        title: "Release script timeout at low network quality",
        meta: "#121 / open / alice",
        level: "medium",
      },
      {
        title: "Dependency sync watcher misses edge case",
        meta: "#117 / open / charlie",
      },
    ],
    prsPreview: [
      {
        title: "refactor: split scanner worker by queue",
        meta: "#76 / open / alice",
        level: "medium",
      },
      {
        title: "fix: prevent empty key material export",
        meta: "#73 / merged / charlie",
        level: "low",
      },
      {
        title: "feat: add release provenance badges",
        meta: "#71 / open / bob",
      },
    ],
  },
  {
    id: "cloudshield-core",
    fullName: "cloudshield/core",
    description:
      "Cloud runtime posture scanner for CI and deployment pipelines.",
    language: "Go",
    license: "MIT",
    defaultBranch: "main",
    firstSeen: "2024-05",
    lastSync: "2026-03-21",
    riskLevel: "medium",
    riskScore: 61,
    stars: 2568,
    forks: 420,
    openIssues: 22,
    openPrs: 8,
    contributors: 13,
    commitPerWeek: 6.1,
    activeWeekRatio: 83,
    collabIndex: 9,
    communityDelta: 97,
    issueResponseHours: 11.3,
    prBacklog: 8,
    entityCount: 84,
    tags: ["metadata", "collaboration"],
    recentCommits: [
      {
        title: "feat: scanner baseline for multi-region",
        meta: "1fa9b1e / nina / 2026-03-19",
        level: "medium",
      },
      {
        title: "fix: retry policy for failed policy fetch",
        meta: "2ad31bb / oscar / 2026-03-16",
        level: "low",
      },
      {
        title: "chore: release notes refresh",
        meta: "6aa14fe / lee / 2026-03-12",
      },
    ],
    openIssuesPreview: [
      {
        title: "Scanner misses private mirror in fallback mode",
        meta: "#87 / open / oscar",
        level: "medium",
      },
      {
        title: "Policy bundle update lag",
        meta: "#84 / open / nina",
      },
      {
        title: "Region label formatting mismatch",
        meta: "#79 / open / lee",
        level: "low",
      },
    ],
    prsPreview: [
      {
        title: "perf: cache policy compilation results",
        meta: "#55 / merged / lee",
        level: "low",
      },
      {
        title: "feat: expose scan profile summary",
        meta: "#57 / open / nina",
        level: "medium",
      },
      {
        title: "fix: retry jitter overflow",
        meta: "#58 / open / oscar",
      },
    ],
  },
  {
    id: "auditkit-web",
    fullName: "auditkit/web",
    description:
      "Web console for incident timelines, owners, and evidence snapshots.",
    language: "TypeScript",
    license: "BSD-3-Clause",
    defaultBranch: "release",
    firstSeen: "2024-09",
    lastSync: "2026-03-22",
    riskLevel: "high",
    riskScore: 74,
    stars: 1830,
    forks: 240,
    openIssues: 41,
    openPrs: 14,
    contributors: 15,
    commitPerWeek: 7.6,
    activeWeekRatio: 75,
    collabIndex: 13,
    communityDelta: 163,
    issueResponseHours: 18.7,
    prBacklog: 14,
    entityCount: 109,
    tags: ["community", "observation"],
    recentCommits: [
      {
        title: "feat: evidence panel with source badges",
        meta: "74da9f0 / yuki / 2026-03-21",
        level: "high",
      },
      {
        title: "fix: remove stale permission from team map",
        meta: "72ba10c / sam / 2026-03-18",
        level: "medium",
      },
      {
        title: "style: compact owner summary card",
        meta: "14ca919 / tom / 2026-03-12",
      },
    ],
    openIssuesPreview: [
      {
        title: "User role badge not aligned in mobile drawer",
        meta: "#219 / open / tom",
        level: "low",
      },
      {
        title: "Invite token flow needs confirmation state",
        meta: "#221 / open / yuki",
        level: "medium",
      },
      {
        title: "Activity timeline filter reset bug",
        meta: "#223 / open / sam",
      },
    ],
    prsPreview: [
      {
        title: "fix: harden invite token verification",
        meta: "#144 / open / yuki",
        level: "high",
      },
      {
        title: "feat: compact evidence stream layout",
        meta: "#145 / open / sam",
        level: "medium",
      },
      {
        title: "chore: release drawer cleanup",
        meta: "#142 / merged / tom",
        level: "low",
      },
    ],
  },
  {
    id: "gatekeeper-engine",
    fullName: "gatekeeper/engine",
    description:
      "Policy decision engine and metadata adapters for CI workflows.",
    language: "Rust",
    license: "Apache-2.0",
    defaultBranch: "main",
    firstSeen: "2024-01",
    lastSync: "2026-03-20",
    riskLevel: "low",
    riskScore: 48,
    stars: 4112,
    forks: 701,
    openIssues: 17,
    openPrs: 6,
    contributors: 21,
    commitPerWeek: 4.8,
    activeWeekRatio: 67,
    collabIndex: 8,
    communityDelta: -12,
    issueResponseHours: 7.8,
    prBacklog: 6,
    entityCount: 72,
    tags: ["stable", "metadata"],
    recentCommits: [
      {
        title: "refactor: isolate policy resolver context",
        meta: "ab89cce / marta / 2026-03-18",
        level: "medium",
      },
      {
        title: "feat: export policy graph metadata",
        meta: "5cf77de / zoe / 2026-03-14",
        level: "low",
      },
      {
        title: "fix: summary panel edge case",
        meta: "ae77cf2 / ian / 2026-03-10",
      },
    ],
    openIssuesPreview: [
      {
        title: "Rule conflict not reported in summary panel",
        meta: "#64 / open / ian",
        level: "medium",
      },
      {
        title: "Summary export misses labels",
        meta: "#61 / open / marta",
      },
      {
        title: "Graph diff viewer placeholder",
        meta: "#59 / open / zoe",
        level: "low",
      },
    ],
    prsPreview: [
      {
        title: "feat: export policy graph metadata",
        meta: "#39 / merged / zoe",
        level: "low",
      },
      {
        title: "fix: adapter metadata ordering",
        meta: "#40 / open / marta",
        level: "medium",
      },
      {
        title: "perf: policy cache warmup",
        meta: "#41 / open / ian",
      },
    ],
  },
];

const homeFilterOrder: Array<{ label: string; value: HomeSortKey }> = [
  { label: "Stars", value: "stars" },
  { label: "Activity", value: "activity" },
  { label: "Collaboration", value: "collab" },
  { label: "Community", value: "community" },
  { label: "Updated", value: "updated" },
];

function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000)
      .toFixed(value >= 10000 ? 0 : 1)
      .replace(/\.0$/, "")}k`;
  }

  return String(value);
}

function formatRepoLabel(repoId: string) {
  return repoId.replace(/-/g, "/");
}

function formatDelta(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function getFallbackRepo(repoId: string): RawRepoSource {
  const label = formatRepoLabel(repoId);

  return {
    ...placeholderRepos[0],
    id: repoId,
    fullName: label,
    description:
      "Placeholder repository generated for route preview before API integration.",
  };
}

function getRepoSource(repoId: string) {
  return (
    placeholderRepos.find((repo) => repo.id === repoId) ?? getFallbackRepo(repoId)
  );
}

function getSortValue(repo: RawRepoSource, sort: HomeSortKey) {
  switch (sort) {
    case "activity":
      return repo.commitPerWeek;
    case "collab":
      return repo.prBacklog;
    case "community":
      return repo.communityDelta;
    case "updated":
      return Date.parse(repo.lastSync);
    case "stars":
    default:
      return repo.stars;
  }
}

export function getHomePageViewModel(
  sort: HomeSortKey = "stars"
): HomePageViewModel {
  const repositories = [...placeholderRepos].sort(
    (left, right) => getSortValue(right, sort) - getSortValue(left, sort)
  );

  const mostActive = [...placeholderRepos].sort(
    (left, right) => right.commitPerWeek - left.commitPerWeek
  )[0];
  const mostIssues = [...placeholderRepos].sort(
    (left, right) => right.openIssues - left.openIssues
  )[0];
  const mostBacklog = [...placeholderRepos].sort(
    (left, right) => right.prBacklog - left.prBacklog
  )[0];
  const strongestCommunity = [...placeholderRepos].sort(
    (left, right) => right.communityDelta - left.communityDelta
  )[0];

  return {
    currentSort: sort,
    filters: homeFilterOrder.map((filter) => ({
      ...filter,
      href: filter.value === "stars" ? "/" : `/?sort=${filter.value}`,
      selected: filter.value === sort,
    })),
    insights: [
      {
        title: "Active This Week",
        value: mostActive.fullName,
        description: `${mostActive.commitPerWeek} commits/week placeholder signal for activity-focused discovery.`,
        href: `/repo/${mostActive.id}/overview`,
      },
      {
        title: "Issue Activity Watch",
        value: mostIssues.fullName,
        description: `${mostIssues.openIssues} open issues placeholder signal for issue-focused discovery.`,
        href: `/repo/${mostIssues.id}/overview`,
      },
      {
        title: "PR Backlog Watch",
        value: mostBacklog.fullName,
        description: `${mostBacklog.prBacklog} pending PRs placeholder signal for collaboration pressure.`,
        href: `/repo/${mostBacklog.id}/overview`,
      },
      {
        title: "Community Growth Watch",
        value: strongestCommunity.fullName,
        description: `${formatDelta(
          strongestCommunity.communityDelta
        )} community delta placeholder signal for growth view.`,
        href: `/repo/${strongestCommunity.id}/overview`,
      },
    ],
    repositories: repositories.map((repo) => ({
      name: repo.fullName,
      description: repo.description,
      href: `/repo/${repo.id}/overview`,
      language: repo.language,
      license: repo.license,
      stars: formatCompactNumber(repo.stars),
      forks: String(repo.forks),
      issues: String(repo.openIssues),
      prs: String(repo.openPrs),
      contributors: String(repo.contributors),
      tags: [
        "Placeholder",
        `Commit/W ${repo.commitPerWeek}`,
        `Delta ${formatDelta(repo.communityDelta)}`,
      ],
    })),
  };
}

export function getRepoSidebarViewModel(repoId: string): RepoSidebarViewModel {
  const repo = getRepoSource(repoId);

  return {
    title: repo.fullName,
    description: repo.description,
    pills: [repo.language, repo.license, repo.defaultBranch],
    repositoryStats: [
      { label: "Stars", value: formatCompactNumber(repo.stars) },
      { label: "Forks", value: String(repo.forks) },
      { label: "Open Issues", value: String(repo.openIssues) },
      { label: "Open PRs", value: String(repo.openPrs) },
      { label: "Last Sync", value: repo.lastSync },
    ],
    portraitStats: [
      { label: "Level", value: repo.riskLevel.toUpperCase() },
      { label: "Score", value: String(repo.riskScore) },
      { label: "Commit / Week", value: String(repo.commitPerWeek) },
      { label: "Active Weeks", value: `${repo.activeWeekRatio}%` },
    ],
    tags: repo.tags,
    riskLevel: repo.riskLevel,
  };
}

export function getRepoOverviewViewModel(
  repoId: string
): RepoOverviewViewModel {
  const repo = getRepoSource(repoId);

  return {
    title: repo.fullName,
    description: repo.description,
    pills: [
      repo.language,
      repo.license,
      repo.defaultBranch,
      `First Seen: ${repo.firstSeen}`,
      `Last Sync: ${repo.lastSync}`,
    ],
    riskLevel: repo.riskLevel,
    summaryStats: [
      { label: "Stars", value: formatCompactNumber(repo.stars) },
      { label: "Forks", value: String(repo.forks) },
      { label: "Open Issues", value: String(repo.openIssues) },
      { label: "Open PRs", value: String(repo.openPrs) },
      { label: "Contributors", value: String(repo.contributors) },
    ],
    portraitSummary: [
      { label: "Commit / Week", value: String(repo.commitPerWeek) },
      { label: "Active Week Ratio", value: `${repo.activeWeekRatio}%` },
      { label: "Collab Index", value: String(repo.collabIndex) },
      { label: "Community Delta", value: formatDelta(repo.communityDelta) },
    ],
    recentCommits: repo.recentCommits,
    openIssues: repo.openIssuesPreview,
    pullRequests: repo.prsPreview,
  };
}

export function getRepoRiskViewModel(repoId: string): RepoRiskViewModel {
  const repo = getRepoSource(repoId);

  return {
    title: repo.fullName,
    description: repo.description,
    riskLevel: repo.riskLevel,
    tags: repo.tags,
    summaryStats: [
      { label: "Risk Score", value: String(repo.riskScore) },
      { label: "Entity Count", value: String(repo.entityCount) },
      { label: "Contributors", value: String(repo.contributors) },
      { label: "Stars", value: formatCompactNumber(repo.stars) },
    ],
    snapshots: [
      {
        label: "Commit / Week",
        value: String(repo.commitPerWeek),
        level: repo.commitPerWeek >= 8 ? "high" : "medium",
      },
      {
        label: "Active Week Ratio",
        value: `${repo.activeWeekRatio}%`,
        level: repo.activeWeekRatio >= 80 ? "low" : "medium",
      },
      {
        label: "Collab Index",
        value: String(repo.collabIndex),
        level: repo.collabIndex >= 12 ? "medium" : "low",
      },
      {
        label: "PR Backlog",
        value: String(repo.prBacklog),
        level: repo.prBacklog >= 12 ? "high" : "medium",
      },
      {
        label: "Issue Response",
        value: `${repo.issueResponseHours}h`,
        level: repo.issueResponseHours > 12 ? "high" : "low",
      },
      {
        label: "Community Delta",
        value: formatDelta(repo.communityDelta),
        level: repo.communityDelta >= 0 ? "low" : "medium",
      },
    ],
    dimensions: [
      {
        title: "Activity",
        description:
          "Repository update rhythm and continuity over the current observation window.",
        metrics: [
          {
            label: "Commit Frequency",
            value: `${repo.commitPerWeek} / week`,
            note: "Fixed 12-week window placeholder.",
            level: repo.commitPerWeek >= 8 ? "high" : "medium",
          },
          {
            label: "Active Week Ratio",
            value: `${repo.activeWeekRatio}%`,
            note: "Displayed as a percentage rather than a 0-1 ratio.",
            level: repo.activeWeekRatio >= 80 ? "low" : "medium",
          },
        ],
      },
      {
        title: "Collaboration",
        description:
          "Issue and pull request interaction density, response speed, and working load.",
        metrics: [
          {
            label: "Collab Index",
            value: String(repo.collabIndex),
            note: "Approximate number of active submitters, PR authors, and reviewers.",
            level: repo.collabIndex >= 12 ? "medium" : "low",
          },
          {
            label: "Issue Response",
            value: `${repo.issueResponseHours} hours`,
            note: "Median first response placeholder value.",
            level: repo.issueResponseHours > 12 ? "high" : "low",
          },
          {
            label: "PR Backlog",
            value: String(repo.prBacklog),
            note: "Open PR backlog count placeholder.",
            level: repo.prBacklog >= 12 ? "high" : "medium",
          },
        ],
      },
      {
        title: "Community",
        description:
          "Snapshot popularity and short-window community movement placeholders.",
        metrics: [
          {
            label: "Stars",
            value: formatCompactNumber(repo.stars),
            note: "Current snapshot value.",
            level: repo.stars >= 3000 ? "low" : "medium",
          },
          {
            label: "Community Delta",
            value: formatDelta(repo.communityDelta),
            note: "Recent community movement placeholder.",
            level: repo.communityDelta >= 0 ? "low" : "medium",
          },
        ],
      },
    ],
  };
}
