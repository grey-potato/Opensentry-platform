import { unstable_cache } from "next/cache";
import {
  fetchAllProjects,
  fetchIssues,
  fetchLatestProjectPortrait,
  fetchPullRequests,
  fetchRepository,
  fetchRepositoryUsers,
  getPlatform,
  type ProjectItem,
} from "@/lib/opensentry-api";
import {
  buildIssueRelatedUsers,
  buildPullRequestRelatedUsers,
  formatCompactNumber,
  formatDate,
  formatDelta,
  formatNumber,
  formatPercent,
  getObservationWindow,
  loadCommitPreviewItems,
  loadRepoAggregate,
  mapProjectPortrait,
  type MetricItemViewModel,
  type PreviewItemViewModel,
  type ProjectPortraitResult,
  type RepoTimelinePointViewModel,
  type RiskLevel,
} from "@/lib/repo-core";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/ui-copy";

export type { MetricItemViewModel, PreviewItemViewModel, RiskLevel } from "@/lib/repo-core";

export type HomeSortKey = "stars" | "activity" | "collab" | "community" | "updated";

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
  usingLiveData: boolean;
  errorMessage?: string;
};

export type RepoSidebarViewModel = {
  title: string;
  description: string;
  pills: string[];
  repositoryStats: MetricItemViewModel[];
  portraitStats: MetricItemViewModel[];
  tags: string[];
  riskLevel: RiskLevel;
};

export type RepoOverviewViewModel = {
  title: string;
  description: string;
  pills: string[];
  htmlUrl: string | null;
  riskLevel: RiskLevel;
  summaryStats: MetricItemViewModel[];
  portraitSummary: MetricItemViewModel[];
  windowLabel: string;
  timeline: RepoTimelinePointViewModel[];
  recentCommits: PreviewItemViewModel[];
  openIssues: PreviewItemViewModel[];
  pullRequests: PreviewItemViewModel[];
};

export type RepoRiskViewModel = {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  tags: string[];
  summaryStats: MetricItemViewModel[];
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

type HomeRepoCandidate = {
  repoId: number;
  platform: string;
  fullName: string;
  description: string;
  htmlUrl: string | null;
  visibility: string;
  license: string;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  lastSync: string;
  projectPortrait: ProjectPortraitResult;
};

const HOME_FILTERS: HomeSortKey[] = ["stars", "activity", "collab", "community", "updated"];
const HOME_CARD_LIMIT = 6;
const HOME_RECOMMENDATION_REVALIDATE_SECONDS = 300;

function buildRepoContextTags(
  repo: { projectPortrait: ProjectPortraitResult; topics?: string[] },
  locale: Locale
) {
  return [
    locale === "en"
      ? `Trust ${repo.projectPortrait.trustLevel}`
      : `可信 ${repo.projectPortrait.trustLevel}`,
    locale === "en"
      ? `Score ${repo.projectPortrait.riskScorePercent}`
      : `风险 ${repo.projectPortrait.riskLevel}`,
    ...(repo.topics ?? []).slice(0, 2),
  ];
}

function buildHomeMetricTags(repo: HomeRepoCandidate, locale: Locale) {
  const tags = [
    locale === "en"
      ? `Commit/W ${formatNumber(repo.projectPortrait.commitFrequency)}`
      : `周提交 ${formatNumber(repo.projectPortrait.commitFrequency)}`,
    locale === "en"
      ? `Active ${formatPercent(repo.projectPortrait.activeWeekRatio, 0)}`
      : `活跃周占比 ${formatPercent(repo.projectPortrait.activeWeekRatio, 0)}`,
    locale === "en"
      ? `PR Backlog ${formatNumber(repo.projectPortrait.prBacklog, 0)}`
      : `PR 积压 ${formatNumber(repo.projectPortrait.prBacklog, 0)}`,
    locale === "en"
      ? `Star Δ ${formatDelta(repo.projectPortrait.communityStarDelta)}`
      : `Star 增量 ${formatDelta(repo.projectPortrait.communityStarDelta)}`,
    locale === "en"
      ? `Stars ${formatCompactNumber(repo.stars)}`
      : `Stars ${formatCompactNumber(repo.stars)}`,
  ];

  return tags.filter(Boolean).slice(0, 4);
}

function sortValue(sort: HomeSortKey, repo: HomeRepoCandidate) {
  switch (sort) {
    case "activity":
      return repo.projectPortrait.commitFrequency;
    case "collab":
      return repo.projectPortrait.prBacklog;
    case "community":
      return repo.projectPortrait.communityStarDelta;
    case "updated":
      return Date.parse(repo.updatedAt || repo.lastSync || "");
    case "stars":
    default:
      return repo.stars;
  }
}

function firstRepoByMetric<T>(repos: T[], score: (repo: T) => number) {
  return [...repos].sort((left, right) => score(right) - score(left))[0];
}

function buildHomeInsights(repos: HomeRepoCandidate[], locale: Locale): InsightCardViewModel[] {
  const mostActive = firstRepoByMetric(repos, (repo) => repo.projectPortrait.commitFrequency);
  const mostIssues = firstRepoByMetric(repos, (repo) => repo.openIssues);
  const mostBacklog = firstRepoByMetric(repos, (repo) => repo.projectPortrait.prBacklog);
  const strongestCommunity = firstRepoByMetric(
    repos,
    (repo) => repo.projectPortrait.communityStarDelta
  );

  const cards: InsightCardViewModel[] = [];

  if (mostActive) {
    cards.push({
      title: locale === "en" ? "Active This Week" : "本周活跃仓库",
      value: mostActive.fullName,
      description:
        locale === "en"
          ? `${formatNumber(mostActive.projectPortrait.commitFrequency)} commits per week over the latest 12-week window.`
          : `近 12 周平均每周提交 ${formatNumber(mostActive.projectPortrait.commitFrequency)} 次。`,
      href: `/repo/${mostActive.repoId}/overview`,
    });
  }

  if (mostIssues) {
    cards.push({
      title: locale === "en" ? "Issue Activity Watch" : "Issue 活跃观察",
      value: mostIssues.fullName,
      description:
        locale === "en"
          ? `${formatCompactNumber(mostIssues.openIssues)} open issues are waiting right now.`
          : `当前共有 ${formatCompactNumber(mostIssues.openIssues)} 个 Open Issue。`,
      href: `/repo/${mostIssues.repoId}/overview`,
    });
  }

  if (mostBacklog) {
    cards.push({
      title: locale === "en" ? "PR Backlog Watch" : "PR Backlog 观察",
      value: mostBacklog.fullName,
      description:
        locale === "en"
          ? `${formatNumber(mostBacklog.projectPortrait.prBacklog, 0)} open pull requests are still in backlog.`
          : `当前有 ${formatNumber(mostBacklog.projectPortrait.prBacklog, 0)} 个 PR 处于积压状态。`,
      href: `/repo/${mostBacklog.repoId}/risk`,
    });
  }

  if (strongestCommunity) {
    cards.push({
      title: locale === "en" ? "Community Growth Watch" : "社区增长观察",
      value: strongestCommunity.fullName,
      description:
        locale === "en"
          ? `${formatDelta(strongestCommunity.projectPortrait.communityStarDelta)} stars over the latest observation window.`
          : `近 12 周 Star 增量为 ${formatDelta(strongestCommunity.projectPortrait.communityStarDelta)}。`,
      href: `/repo/${strongestCommunity.repoId}/overview`,
    });
  }

  return cards;
}

async function loadHomeRepoCandidate(project: ProjectItem): Promise<HomeRepoCandidate | null> {
  const [repository, portrait] = await Promise.all([
    fetchRepository(project.repo_id, { platform: project.platform }),
    fetchLatestProjectPortrait(project.repo_id, { platform: project.platform }),
  ]);

  if (!repository) {
    return null;
  }

  return {
    repoId: project.repo_id,
    platform: project.platform,
    fullName: project.full_name ?? repository.full_name ?? `repo/${project.repo_id}`,
    description: repository.description ?? "Repository metadata snapshot.",
    htmlUrl: project.html_url ?? repository.html_url ?? null,
    visibility: repository.visibility ?? "public",
    license: repository.key ?? "unknown",
    stars: repository.stargazers_count ?? 0,
    forks: repository.forks_count ?? 0,
    openIssues: repository.open_issues_count ?? 0,
    updatedAt: repository.updated_at ?? "",
    lastSync: repository.crawled_at ?? repository.updated_at ?? "",
    projectPortrait: mapProjectPortrait(portrait),
  };
}

const loadCachedHomeRepoUniverse = unstable_cache(
  async (platform: string) => {
    const projects = await fetchAllProjects({
      pageSize: 100,
      platform,
    });

    const uniqueProjects = new Map<number, ProjectItem>();
    for (const project of projects) {
      if (!uniqueProjects.has(project.repo_id)) {
        uniqueProjects.set(project.repo_id, project);
      }
    }

    const settled = await Promise.allSettled(
      [...uniqueProjects.values()].map((project) => loadHomeRepoCandidate(project))
    );

    return settled
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<HomeRepoCandidate | null> => result.status === "fulfilled"
      )
      .map((result) => result.value)
      .filter((item): item is HomeRepoCandidate => Boolean(item));
  },
  ["home-repo-candidates"],
  {
    revalidate: HOME_RECOMMENDATION_REVALIDATE_SECONDS,
  }
);

export async function getHomePageViewModel(
  sort: HomeSortKey = "stars",
  locale: Locale = "zh-CN"
): Promise<HomePageViewModel> {
  const t = getDictionary(locale);

  try {
    const repos = await loadCachedHomeRepoUniverse(getPlatform());
    if (!repos.length) {
      throw new Error(locale === "en" ? "No repositories available." : "没有可用仓库。");
    }

    const ordered = [...repos]
      .sort((left, right) => sortValue(sort, right) - sortValue(sort, left))
      .slice(0, HOME_CARD_LIMIT);

    const contributorEntries = await Promise.all(
      ordered.map(async (repo) => ({
        repoId: repo.repoId,
        count:
          (
            await fetchRepositoryUsers(repo.repoId, {
              pageSize: 100,
              platform: repo.platform,
            }).catch(() => null)
          )?.data?.length ?? null,
      }))
    );

    const contributorCounts = new Map(
      contributorEntries.map((entry) => [entry.repoId, entry.count] as const)
    );

    return {
      currentSort: sort,
      filters: HOME_FILTERS.map((value) => ({
        label: t.home.filters[value],
        value,
        href: value === "stars" ? "/" : `/?sort=${value}`,
        selected: value === sort,
      })),
      insights: buildHomeInsights(repos, locale),
      repositories: ordered.map((repo) => ({
        name: repo.fullName,
        description: repo.description,
        href: `/repo/${repo.repoId}/overview`,
        language: repo.visibility,
        license: repo.license,
        stars: formatCompactNumber(repo.stars),
        forks: formatCompactNumber(repo.forks),
        issues: formatCompactNumber(repo.openIssues),
        prs: formatNumber(repo.projectPortrait.prBacklog, 0),
        contributors:
          contributorCounts.get(repo.repoId) === null ||
          contributorCounts.get(repo.repoId) === undefined
            ? t.common.noData
            : formatNumber(contributorCounts.get(repo.repoId) ?? 0, 0),
        tags: buildHomeMetricTags(repo, locale),
      })),
      usingLiveData: true,
    };
  } catch (error) {
    return {
      currentSort: sort,
      filters: HOME_FILTERS.map((value) => ({
        label: t.home.filters[value],
        value,
        href: value === "stars" ? "/" : `/?sort=${value}`,
        selected: value === sort,
      })),
      insights: [],
      repositories: [],
      usingLiveData: false,
      errorMessage:
        error instanceof Error ? error.message : locale === "en" ? "API request failed." : "接口请求失败。",
    };
  }
}

export async function getRepoSidebarViewModel(
  repoId: string,
  locale: Locale = "zh-CN"
): Promise<RepoSidebarViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);

  return {
    title: repo.fullName,
    description: repo.description,
    pills: [repo.visibility, repo.license, repo.defaultBranch],
    repositoryStats: [
      { label: t.home.filters.stars, value: formatCompactNumber(repo.stars) },
      { label: locale === "en" ? "Forks" : "Fork", value: formatCompactNumber(repo.forks) },
      { label: locale === "en" ? "Watchers" : "关注者", value: formatCompactNumber(repo.watchers) },
      {
        label: locale === "en" ? "Open Issues" : "Open Issue",
        value: formatCompactNumber(repo.openIssues),
      },
      {
        label: locale === "en" ? "Last Sync" : "最近同步",
        value: formatDate(repo.lastSync) || t.common.unavailable,
      },
    ],
    portraitStats: [
      {
        label: locale === "en" ? "Trust Level" : "可信等级",
        value: repo.projectPortrait.trustLevel,
      },
      {
        label: locale === "en" ? "Risk Score" : "风险分",
        value: `${repo.projectPortrait.riskScorePercent}`,
      },
      {
        label: locale === "en" ? "Commit / Week" : "周提交频率",
        value: formatNumber(repo.projectPortrait.commitFrequency),
      },
      {
        label: locale === "en" ? "Assessed At" : "评估时间",
        value: formatDate(repo.projectPortrait.assessedAt) || t.common.unavailable,
      },
    ],
    tags: buildRepoContextTags(repo, locale),
    riskLevel: repo.projectPortrait.riskLevel,
  };
}

export async function getRepoOverviewViewModel(
  repoId: string,
  locale: Locale = "zh-CN"
): Promise<RepoOverviewViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const [recentCommits, issuesPage, prsPage] = await Promise.all([
    loadCommitPreviewItems(repo.repoId, repoId, repo.platform, locale).catch(() => []),
    fetchIssues(repo.repoId, { pageSize: 3, state: "open", platform: repo.platform }).catch(
      () => ({
        data: [],
        pagination: {
          has_more: false,
          next_cursor: null,
          page_size: 3,
        },
      })
    ),
    fetchPullRequests(repo.repoId, {
      pageSize: 3,
      state: "open",
      platform: repo.platform,
    }).catch(() => ({
      data: [],
      pagination: {
        has_more: false,
        next_cursor: null,
        page_size: 3,
      },
    })),
  ]);
  const [issueUsers, prUsers] = await Promise.all([
    Promise.all(
      (issuesPage.data ?? [])
        .slice(0, 3)
        .map((item) => buildIssueRelatedUsers(item, repoId, repo.platform, locale))
    ),
    Promise.all(
      (prsPage.data ?? [])
        .slice(0, 3)
        .map((item) => buildPullRequestRelatedUsers(item, repoId, repo.platform, locale))
    ),
  ]);

  const openIssues = (issuesPage.data ?? []).slice(0, 3).map((item, index) => ({
    title: item.title ?? `Issue #${item.number ?? item.id}`,
    meta: `#${item.number ?? item.id} / ${item.state ?? t.common.unknown} / ${
      formatDate(item.updated_at ?? item.crawled_at) || t.common.unavailable
    }`,
    badgeLabel: item.state ?? t.common.unknown,
    href: `/repo/${repoId}/issues/${item.id}`,
    relatedUsers: issueUsers[index],
  }));

  const pullRequests = (prsPage.data ?? []).slice(0, 3).map((item, index) => ({
    title: item.title ?? `PR #${item.number ?? item.id}`,
    meta: `#${item.number ?? item.id} / ${item.state ?? t.common.unknown} / ${
      formatDate(item.updated_at ?? item.crawled_at) || t.common.unavailable
    }`,
    badgeLabel: item.merged_at
      ? "merged"
      : item.draft
        ? "draft"
        : item.state ?? t.common.unknown,
    href: `/repo/${repoId}/prs/${item.id}`,
    relatedUsers: prUsers[index],
  }));

  const observationLabel =
    getObservationWindow({
      window_start: repo.projectPortrait.windowStart,
      window_end: repo.projectPortrait.windowEnd,
      effective_window_days: repo.projectPortrait.effectiveWindowDays,
    }).label || (locale === "en" ? "Observation window unavailable" : "暂无观测窗口");

  return {
    title: repo.fullName,
    description: repo.description,
    pills: [
      repo.visibility,
      repo.license,
      repo.defaultBranch,
      locale === "en"
        ? `Created: ${formatDate(repo.createdAt) || t.common.unavailable}`
        : `创建于：${formatDate(repo.createdAt) || t.common.unavailable}`,
      locale === "en"
        ? `Updated: ${formatDate(repo.updatedAt) || t.common.unavailable}`
        : `更新于：${formatDate(repo.updatedAt) || t.common.unavailable}`,
    ],
    htmlUrl: repo.htmlUrl || null,
    riskLevel: repo.projectPortrait.riskLevel,
    summaryStats: [
      { label: t.home.filters.stars, value: formatCompactNumber(repo.stars) },
      { label: locale === "en" ? "Forks" : "Fork", value: formatCompactNumber(repo.forks) },
      { label: locale === "en" ? "Watchers" : "关注者", value: formatCompactNumber(repo.watchers) },
      {
        label: locale === "en" ? "Subscribers" : "订阅者",
        value: formatCompactNumber(repo.subscribers),
      },
      {
        label: locale === "en" ? "Open Issues" : "Open Issue",
        value: formatCompactNumber(repo.openIssues),
      },
    ],
    portraitSummary: [
      {
        label: locale === "en" ? "Commit / Week" : "周提交频率",
        value: formatNumber(repo.projectPortrait.commitFrequency),
      },
      {
        label: locale === "en" ? "Active Week Ratio" : "活跃周占比",
        value: formatPercent(repo.projectPortrait.activeWeekRatio, 1),
      },
      {
        label: locale === "en" ? "Collab Index" : "协作指数",
        value: formatNumber(repo.projectPortrait.collabIndex, 0),
      },
      {
        label: locale === "en" ? "Star Delta" : "Star 增量",
        value: formatDelta(repo.projectPortrait.communityStarDelta),
      },
    ],
    windowLabel: observationLabel,
    timeline: repo.timeline,
    recentCommits,
    openIssues,
    pullRequests,
  };
}

export async function getRepoRiskViewModel(
  repoId: string,
  locale: Locale = "zh-CN"
): Promise<RepoRiskViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);

  return {
    title: repo.fullName,
    description: repo.description,
    riskLevel: repo.projectPortrait.riskLevel,
    tags: buildRepoContextTags(repo, locale),
    summaryStats: [
      {
        label: locale === "en" ? "Risk Score" : "风险分",
        value: `${repo.projectPortrait.riskScorePercent}`,
      },
      {
        label: locale === "en" ? "Trust Level" : "可信等级",
        value: repo.projectPortrait.trustLevel,
      },
      {
        label: locale === "en" ? "Assessed At" : "评估时间",
        value: formatDate(repo.projectPortrait.assessedAt) || t.common.unavailable,
      },
      {
        label: locale === "en" ? "Window" : "观测窗口",
        value:
          locale === "en"
            ? `${repo.projectPortrait.effectiveWindowDays} days`
            : `${repo.projectPortrait.effectiveWindowDays} 天`,
      },
    ],
    snapshots: [
      {
        label: locale === "en" ? "Commit / Week" : "周提交频率",
        value: formatNumber(repo.projectPortrait.commitFrequency),
        level: repo.projectPortrait.commitFrequency >= 8 ? "high" : "medium",
      },
      {
        label: locale === "en" ? "Active Week Ratio" : "活跃周占比",
        value: formatPercent(repo.projectPortrait.activeWeekRatio, 1),
        level: repo.projectPortrait.activeWeekRatio >= 80 ? "low" : "medium",
      },
      {
        label: locale === "en" ? "Collab Index" : "协作指数",
        value: formatNumber(repo.projectPortrait.collabIndex, 0),
        level: repo.projectPortrait.collabIndex >= 10 ? "medium" : "low",
      },
      {
        label: locale === "en" ? "PR Backlog" : "PR Backlog",
        value: formatNumber(repo.projectPortrait.prBacklog, 0),
        level: repo.projectPortrait.prBacklog >= 10 ? "high" : "medium",
      },
      {
        label: locale === "en" ? "Issue Response" : "Issue 首响",
        value: `${formatNumber(repo.projectPortrait.issueResponseHours)}h`,
        level: repo.projectPortrait.issueResponseHours > 24 ? "high" : "low",
      },
      {
        label: locale === "en" ? "Star Delta" : "Star 增量",
        value: formatDelta(repo.projectPortrait.communityStarDelta),
        level: repo.projectPortrait.communityStarDelta >= 0 ? "low" : "medium",
      },
    ],
    dimensions: [
      {
        title: t.repo.dimensions.activity,
        description:
          locale === "en"
            ? "Project portrait activity signals over the latest observation window."
            : "基于最新观测窗口的项目活跃度信号。",
        metrics: [
          {
            label: locale === "en" ? "Commit Frequency" : "提交频率",
            value:
              locale === "en"
                ? `${formatNumber(repo.projectPortrait.commitFrequency)} / week`
                : `${formatNumber(repo.projectPortrait.commitFrequency)} / 周`,
            note:
              locale === "en"
                ? "From project portrait commit_frequency."
                : "来自项目画像中的 commit_frequency。",
            level: repo.projectPortrait.commitFrequency >= 8 ? "high" : "medium",
          },
          {
            label: locale === "en" ? "Active Week Ratio" : "活跃周占比",
            value: formatPercent(repo.projectPortrait.activeWeekRatio, 1),
            note:
              locale === "en"
                ? "Converted from the portrait snapshot ratio."
                : "由画像快照中的比例字段转换而来。",
            level: repo.projectPortrait.activeWeekRatio >= 80 ? "low" : "medium",
          },
        ],
      },
      {
        title: t.repo.dimensions.collaboration,
        description:
          locale === "en"
            ? "Issue and PR signals extracted from the latest project portrait snapshot."
            : "来自最新项目画像快照中的 Issue 与 PR 信号。",
        metrics: [
          {
            label: locale === "en" ? "Collab Index" : "协作指数",
            value: formatNumber(repo.projectPortrait.collabIndex, 0),
            note:
              locale === "en"
                ? "From project portrait collab_index."
                : "来自项目画像中的 collab_index。",
            level: repo.projectPortrait.collabIndex >= 10 ? "medium" : "low",
          },
          {
            label: locale === "en" ? "Issue Response" : "Issue 首响时长",
            value:
              locale === "en"
                ? `${formatNumber(repo.projectPortrait.issueResponseHours)} hours`
                : `${formatNumber(repo.projectPortrait.issueResponseHours)} 小时`,
            note:
              locale === "en"
                ? "From issue_metrics.median_issue_response_hours."
                : "来自 issue_metrics.median_issue_response_hours。",
            level: repo.projectPortrait.issueResponseHours > 24 ? "high" : "low",
          },
          {
            label: locale === "en" ? "PR Backlog" : "PR 积压数",
            value: formatNumber(repo.projectPortrait.prBacklog, 0),
            note:
              locale === "en"
                ? "From pr_metrics.open_pr_backlog_count."
                : "来自 pr_metrics.open_pr_backlog_count。",
            level: repo.projectPortrait.prBacklog >= 10 ? "high" : "medium",
          },
        ],
      },
      {
        title: t.repo.dimensions.community,
        description:
          locale === "en"
            ? "Current popularity and recent movement of the repository community."
            : "仓库当前社区热度及最近一段时间的变化。",
        metrics: [
          {
            label: t.home.filters.stars,
            value: formatCompactNumber(repo.stars),
            note: locale === "en" ? "From repository metadata." : "来自仓库 metadata。",
            level: repo.stars >= 3000 ? "low" : "medium",
          },
          {
            label: locale === "en" ? "Community Star Delta" : "社区 Star 增量",
            value: formatDelta(repo.projectPortrait.communityStarDelta),
            note:
              locale === "en"
                ? "From the latest project portrait window."
                : "来自最新项目画像观测窗口。",
            level: repo.projectPortrait.communityStarDelta >= 0 ? "low" : "medium",
          },
          {
            label: locale === "en" ? "Community Fork Delta" : "社区 Fork 增量",
            value: formatDelta(repo.projectPortrait.communityForkDelta),
            note:
              locale === "en"
                ? "From the latest project portrait window."
                : "来自最新项目画像观测窗口。",
            level: repo.projectPortrait.communityForkDelta >= 0 ? "low" : "medium",
          },
        ],
      },
    ],
  };
}
