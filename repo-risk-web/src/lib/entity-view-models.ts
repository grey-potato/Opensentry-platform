import {
  fetchAllProjects,
  fetchCommit,
  fetchCommitPortrait,
  fetchCommits,
  fetchIssue,
  fetchIssues,
  fetchLatestUserPortrait,
  fetchPullRequest,
  fetchPullRequests,
  fetchRepositoryUsers,
  fetchUser,
  fetchUsersByLogin,
  getPlatform,
  type UserItem,
} from "@/lib/opensentry-api";
import {
  ENTITY_PAGE_SIZE_OPTIONS,
  buildCommitRelatedUsers,
  buildIssueRelatedUsers,
  buildPaginationHref,
  buildPullRequestRelatedUsers,
  commitActorLabel,
  firstLine,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatShortSha,
  loadRepoAggregate,
  mapCommitPortrait,
  mapUserPortrait,
  normalizeEntityPage,
  normalizeEntityPageSize,
  parsePageChain,
  readBoolean,
  readString,
  restLines,
  type MetricItemViewModel,
  type RelatedUserViewModel,
  type RiskLevel,
} from "@/lib/repo-core";
import type { Locale } from "@/lib/locale";
import { getBooleanLabel, getDictionary } from "@/lib/ui-copy";

export type EntityPaginationViewModel = {
  currentPage: number;
  pageSize: number;
  pageSizeOptions: number[];
  pageLinks: Array<{
    page: number;
    href: string;
    active: boolean;
  }>;
  prevHref: string | null;
  nextHref: string | null;
  hasMore: boolean;
};

export type CommitListItemViewModel = {
  title: string;
  subtitle: string;
  href: string;
  sha: string;
  portraitLabel: string;
  portraitAvailable: boolean;
  trustLevel: string;
  relatedUsers: RelatedUserViewModel[];
};

export type CommitListPageViewModel = {
  title: string;
  subtitle: string;
  stats: MetricItemViewModel[];
  items: CommitListItemViewModel[];
  pagination: EntityPaginationViewModel;
  authorId: string;
  sort: string;
  order: string;
  pageSize: number;
};

export type CommitDetailPageViewModel = {
  title: string;
  subtitle: string;
  backHref: string;
  summaryStats: MetricItemViewModel[];
  metadata: MetricItemViewModel[];
  messageTitle: string;
  messageBody: string;
  portraitTitle: string;
  portraitRiskLevel: RiskLevel;
  portraitStats: MetricItemViewModel[];
  portraitTags: string[];
  portraitRules: string[];
  portraitAvailable: boolean;
};

export type UserListItemViewModel = {
  title: string;
  subtitle: string;
  href: string;
  roles: string[];
  portraitLabel: string;
  portraitAvailable: boolean;
};

export type UserListPageViewModel = {
  title: string;
  subtitle: string;
  stats: MetricItemViewModel[];
  items: UserListItemViewModel[];
  pagination: EntityPaginationViewModel;
  role: string;
  pageSize: number;
};

export type UserDetailPageViewModel = {
  title: string;
  subtitle: string;
  backHref: string;
  summaryStats: MetricItemViewModel[];
  profileStats: MetricItemViewModel[];
  portraitTitle: string;
  portraitRiskLevel: RiskLevel;
  portraitStats: MetricItemViewModel[];
  scoreBreakdown: MetricItemViewModel[];
  portraitAvailable: boolean;
};

export type IssueListItemViewModel = {
  title: string;
  subtitle: string;
  href: string;
  stateLabel: string;
  relatedUsers: RelatedUserViewModel[];
};

export type IssueListPageViewModel = {
  title: string;
  subtitle: string;
  stats: MetricItemViewModel[];
  items: IssueListItemViewModel[];
  pagination: EntityPaginationViewModel;
  state: string;
  pageSize: number;
};

export type IssueDetailPageViewModel = {
  title: string;
  subtitle: string;
  backHref: string;
  summaryStats: MetricItemViewModel[];
  body: string;
  projectContext: MetricItemViewModel[];
};

export type PullRequestListItemViewModel = {
  title: string;
  subtitle: string;
  href: string;
  stateLabel: string;
  relatedUsers: RelatedUserViewModel[];
};

export type PullRequestListPageViewModel = {
  title: string;
  subtitle: string;
  stats: MetricItemViewModel[];
  items: PullRequestListItemViewModel[];
  pagination: EntityPaginationViewModel;
  state: string;
  pageSize: number;
};

export type PullRequestDetailPageViewModel = {
  title: string;
  subtitle: string;
  backHref: string;
  summaryStats: MetricItemViewModel[];
  body: string;
  projectContext: MetricItemViewModel[];
};

export type SearchResultItemViewModel = {
  kind: "repo" | "user";
  title: string;
  subtitle: string;
  href: string;
  tags: string[];
};

export type SearchPageViewModel = {
  query: string;
  usingLiveData: boolean;
  results: SearchResultItemViewModel[];
  redirectHref?: string;
};

export type GlobalUserDetailPageViewModel = {
  title: string;
  subtitle: string;
  backHref: string;
  summaryStats: MetricItemViewModel[];
  profileStats: MetricItemViewModel[];
  portraitTitle: string;
  portraitStats: MetricItemViewModel[];
  scoreBreakdown: MetricItemViewModel[];
  portraitAvailable: boolean;
};

function buildRepoSubtitle(
  repo: Awaited<ReturnType<typeof loadRepoAggregate>>,
  locale: Locale
) {
  return locale === "en"
    ? `${repo.fullName} / ${repo.projectPortrait.effectiveWindowDays || 0} day portrait window`
    : `${repo.fullName} / ${repo.projectPortrait.effectiveWindowDays || 0} 天画像窗口`;
}

function userTypeLabel(type: string | null | undefined, locale: Locale) {
  return type ?? (locale === "en" ? "User" : "用户");
}

function buildUserProfileStats(
  user: UserItem,
  locale: Locale,
  unavailable: string
): MetricItemViewModel[] {
  return [
    { label: "Login", value: user.login ?? user.id },
    { label: locale === "en" ? "Type" : "类型", value: user.type ?? unavailable },
    {
      label: locale === "en" ? "Created At" : "创建时间",
      value: formatDate(user.created_at) || unavailable,
    },
    {
      label: locale === "en" ? "Updated At" : "更新时间",
      value: formatDate(user.updated_at) || unavailable,
    },
    { label: "Blog", value: user.blog ?? unavailable },
    { label: "Email", value: user.email ?? unavailable },
  ];
}

function resolveCursorPageState(
  pageValue?: string,
  pageSizeValue?: string,
  pageChainValue?: string
) {
  const pageSize = normalizeEntityPageSize(pageSizeValue);
  const requestedPage = normalizeEntityPage(pageValue);
  const pageChain = parsePageChain(pageChainValue);

  if (requestedPage > pageChain.length) {
    return {
      currentPage: 1,
      pageSize,
      pageChain: [null] as Array<string | null>,
      cursor: null as string | null,
    };
  }

  return {
    currentPage: requestedPage,
    pageSize,
    pageChain,
    cursor: pageChain[requestedPage - 1] ?? null,
  };
}

function buildVisitedPageChain(
  pageChain: Array<string | null>,
  currentPage: number,
  cursor: string | null
) {
  const visited = pageChain.slice(0, currentPage);
  if (!visited.length) {
    visited.push(null);
  }
  visited[0] = null;
  visited[currentPage - 1] = cursor;
  return visited;
}

function buildEntityPaginationViewModel(
  repoId: string,
  section: string,
  filters: Record<string, string | undefined>,
  currentPage: number,
  pageSize: number,
  visitedPageChain: Array<string | null>,
  nextCursor?: string | null
): EntityPaginationViewModel {
  const pageLinks = visitedPageChain.map((_, index) => ({
    page: index + 1,
    href: buildPaginationHref(repoId, section, filters, {
      page: index + 1,
      pageSize,
      pageChain: visitedPageChain,
    }),
    active: index + 1 === currentPage,
  }));

  return {
    currentPage,
    pageSize,
    pageSizeOptions: [...ENTITY_PAGE_SIZE_OPTIONS],
    pageLinks,
    prevHref:
      currentPage > 1
        ? buildPaginationHref(repoId, section, filters, {
            page: currentPage - 1,
            pageSize,
            pageChain: visitedPageChain,
          })
        : null,
    nextHref: nextCursor
      ? buildPaginationHref(repoId, section, filters, {
          page: currentPage + 1,
          pageSize,
          pageChain: [...visitedPageChain, nextCursor],
        })
      : null,
    hasMore: Boolean(nextCursor),
  };
}

export async function getCommitListPageViewModel(
  repoId: string,
  {
    page,
    pageSize,
    pageChain,
    authorId,
    sort = "sha",
    order = "asc",
  }: {
    page?: string;
    pageSize?: string;
    pageChain?: string;
    authorId?: string;
    sort?: string;
    order?: string;
  },
  locale: Locale = "zh-CN"
): Promise<CommitListPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const paginationState = resolveCursorPageState(page, pageSize, pageChain);
  const response = await fetchCommits(repo.repoId, {
    pageSize: paginationState.pageSize,
    cursor: paginationState.cursor ?? undefined,
    authorId,
    sort,
    order,
    platform: repo.platform,
  });
  const commits = response.data ?? [];
  const [portraits, relatedUsers] = await Promise.all([
    Promise.all(
      commits.map((commit) =>
        fetchCommitPortrait(repo.repoId, commit.sha, { platform: repo.platform }).catch(() => null)
      )
    ),
    Promise.all(
      commits.map((commit) => buildCommitRelatedUsers(commit, repoId, repo.platform, locale))
    ),
  ]);

  return {
    title: t.entities.commits.title,
    subtitle: buildRepoSubtitle(repo, locale),
    stats: [
      {
        label: locale === "en" ? "Commit / Week" : "周提交频率",
        value: formatNumber(repo.projectPortrait.commitFrequency),
      },
      {
        label: locale === "en" ? "Window" : "观测窗口",
        value:
          locale === "en"
            ? `${repo.projectPortrait.effectiveWindowDays} days`
            : `${repo.projectPortrait.effectiveWindowDays} 天`,
      },
      {
        label: locale === "en" ? "Active Week Ratio" : "活跃周占比",
        value: formatPercent(repo.projectPortrait.activeWeekRatio, 1),
      },
    ],
    items: commits.map((commit, index) => {
      const portrait = mapCommitPortrait(portraits[index]);
      return {
        title: firstLine(commit.message) || formatShortSha(commit.sha),
        subtitle: `${formatShortSha(commit.sha)} / ${
          formatDate(readString(commit.author_info ?? undefined, "date") || commit.crawled_at) ||
          t.common.unavailable
        }`,
        href: `/repo/${repoId}/commits/${commit.sha}`,
        sha: commit.sha,
        portraitLabel: portrait.available
          ? locale === "en"
            ? `Trust ${portrait.trustLevel}`
            : `可信 ${portrait.trustLevel}`
          : locale === "en"
            ? "Portrait unavailable"
            : "画像不可用",
        portraitAvailable: portrait.available,
        trustLevel: portrait.trustLevel,
        relatedUsers: relatedUsers[index],
      };
    }),
    pagination: {
      ...buildEntityPaginationViewModel(
        repoId,
        "commits",
        { author_id: authorId, sort, order },
        paginationState.currentPage,
        paginationState.pageSize,
        buildVisitedPageChain(
          paginationState.pageChain,
          paginationState.currentPage,
          paginationState.cursor
        ),
        response.pagination.next_cursor
      ),
    },
    authorId: authorId ?? "",
    sort,
    order,
    pageSize: paginationState.pageSize,
  };
}

export async function getCommitDetailPageViewModel(
  repoId: string,
  sha: string,
  locale: Locale = "zh-CN"
): Promise<CommitDetailPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const [commit, portraitRaw] = await Promise.all([
    fetchCommit(repo.repoId, sha, { platform: repo.platform }),
    fetchCommitPortrait(repo.repoId, sha, { platform: repo.platform }).catch(() => null),
  ]);
  const portrait = mapCommitPortrait(portraitRaw);
  const actor = commitActorLabel(commit);

  return {
    title: firstLine(commit.message) || formatShortSha(commit.sha),
    subtitle: `${repo.fullName} / ${formatShortSha(commit.sha)} / ${actor || t.common.unavailable}`,
    backHref: `/repo/${repoId}/commits`,
    summaryStats: [
      { label: t.entities.commits.author, value: actor || t.common.unavailable },
      {
        label: t.entities.commits.committed,
        value:
          formatDateTime(readString(commit.author_info ?? undefined, "date")) ||
          t.common.unavailable,
      },
      { label: t.entities.commits.parents, value: String(commit.parents?.length ?? 0) },
      {
        label: t.entities.commits.verified,
        value: getBooleanLabel(Boolean(readBoolean(commit.verification ?? undefined, "verified")), locale),
      },
    ],
    metadata: [
      { label: "SHA", value: commit.sha },
      { label: t.entities.commits.tree, value: commit.tree ?? t.common.unavailable },
      { label: t.entities.commits.authorId, value: commit.author_id ?? t.common.unavailable },
      {
        label: t.entities.commits.committerId,
        value: commit.committer_id ?? t.common.unavailable,
      },
      {
        label: t.entities.commits.crawledAt,
        value: formatDateTime(commit.crawled_at) || t.common.unavailable,
      },
    ],
    messageTitle: firstLine(commit.message) || commit.sha,
    messageBody: restLines(commit.message) || t.entities.commits.noExtendedMessage,
    portraitTitle: portrait.available
      ? t.entities.commits.portraitAvailable
      : t.entities.commits.portraitUnavailable,
    portraitRiskLevel: portrait.riskLevel,
    portraitStats: portrait.available
      ? [
          {
            label: locale === "en" ? "Trust Level" : "可信等级",
            value: portrait.trustLevel,
          },
          {
            label: locale === "en" ? "Assessed At" : "评估时间",
            value: formatDateTime(portrait.assessedAt) || t.common.unavailable,
          },
          {
            label: t.entities.commits.verification,
            value: portrait.verificationReason || t.common.unavailable,
          },
          {
            label: t.entities.commits.signature,
            value: portrait.signatureType || t.common.unavailable,
          },
          { label: t.entities.commits.findings, value: String(portrait.findingsCount) },
        ]
      : [
          {
            label: locale === "en" ? "Status" : "状态",
            value: t.entities.commits.noPortrait,
          },
        ],
    portraitTags: portrait.tags,
    portraitRules: portrait.triggeredRules,
    portraitAvailable: portrait.available,
  };
}

export async function getUserListPageViewModel(
  repoId: string,
  {
    page,
    pageSize,
    pageChain,
    role,
  }: { page?: string; pageSize?: string; pageChain?: string; role?: string },
  locale: Locale = "zh-CN"
): Promise<UserListPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const paginationState = resolveCursorPageState(page, pageSize, pageChain);
  const response = await fetchRepositoryUsers(repo.repoId, {
    pageSize: paginationState.pageSize,
    cursor: paginationState.cursor ?? undefined,
    role,
    platform: repo.platform,
  });
  const users = response.data ?? [];
  const enriched = await Promise.all(
    users.map(async (userRef) => {
      const [user, portraitRaw] = await Promise.all([
        fetchUser(userRef.id, { platform: repo.platform }).catch(() => null),
        fetchLatestUserPortrait(userRef.id, { platform: repo.platform }).catch(() => null),
      ]);
      return {
        userRef,
        user,
        portrait: mapUserPortrait(portraitRaw),
      };
    })
  );

  return {
    title: t.entities.users.title,
    subtitle: buildRepoSubtitle(repo, locale),
    stats: [
      { label: locale === "en" ? "Trust Level" : "可信等级", value: repo.projectPortrait.trustLevel },
      { label: locale === "en" ? "Collab Index" : "协作指数", value: formatNumber(repo.projectPortrait.collabIndex, 0) },
      {
        label: locale === "en" ? "Active Week Ratio" : "活跃周占比",
        value: formatPercent(repo.projectPortrait.activeWeekRatio, 1),
      },
    ],
    items: enriched.map(({ userRef, user, portrait }) => ({
      title: user?.login ?? user?.name ?? userRef.id,
      subtitle:
        locale === "en"
          ? `${userTypeLabel(user?.type, locale)} / roles: ${(userRef.role ?? []).join(", ") || t.common.none}`
          : `${userTypeLabel(user?.type, locale)} / 角色：${(userRef.role ?? []).join(", ") || t.common.none}`,
      href: `/repo/${repoId}/users/${userRef.id}`,
      roles: userRef.role ?? [],
      portraitLabel: portrait.available
        ? locale === "en"
          ? `Score ${formatNumber(portrait.totalScore)} / ${portrait.trustLevel}`
          : `得分 ${formatNumber(portrait.totalScore)} / ${portrait.trustLevel}`
        : locale === "en"
          ? "Portrait unavailable"
          : "画像不可用",
      portraitAvailable: portrait.available,
    })),
    pagination: {
      ...buildEntityPaginationViewModel(
        repoId,
        "users",
        { role },
        paginationState.currentPage,
        paginationState.pageSize,
        buildVisitedPageChain(
          paginationState.pageChain,
          paginationState.currentPage,
          paginationState.cursor
        ),
        response.pagination.next_cursor
      ),
    },
    role: role ?? "",
    pageSize: paginationState.pageSize,
  };
}

export async function getUserDetailPageViewModel(
  repoId: string,
  userId: string,
  locale: Locale = "zh-CN"
): Promise<UserDetailPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const [userRaw, portraitRaw] = await Promise.all([
    fetchUser(userId, { platform: repo.platform }).catch(() => null),
    fetchLatestUserPortrait(userId, { platform: repo.platform }).catch(() => null),
  ]);
  const user: UserItem =
    userRaw ??
    ({
      id: userId,
      login: userId,
      crawled_at: "",
    } as UserItem);
  const portrait = mapUserPortrait(portraitRaw);

  return {
    title: user.login ?? user.name ?? userId,
    subtitle: `${repo.fullName} / ${userTypeLabel(user.type, locale)} / ${userId}`,
    backHref: `/repo/${repoId}/users`,
    summaryStats: [
      {
        label: locale === "en" ? "Trust Level" : "可信等级",
        value: portrait.available ? portrait.trustLevel : t.common.unavailable,
      },
      {
        label: locale === "en" ? "Total Score" : "总分",
        value: portrait.available ? formatNumber(portrait.totalScore) : t.common.noData,
      },
      {
        label: locale === "en" ? "Public Repos" : "公开仓库",
        value: formatNumber(user.public_repos ?? 0, 0),
      },
      {
        label: locale === "en" ? "Public Gists" : "公开 Gist",
        value: formatNumber(user.public_gists ?? 0, 0),
      },
    ],
    profileStats: [
      { label: "Login", value: user.login ?? userId },
      { label: locale === "en" ? "Type" : "类型", value: user.type ?? t.common.unavailable },
      {
        label: locale === "en" ? "Created At" : "创建时间",
        value: formatDate(user.created_at) || t.common.unavailable,
      },
      {
        label: locale === "en" ? "Updated At" : "更新时间",
        value: formatDate(user.updated_at) || t.common.unavailable,
      },
      { label: "Blog", value: user.blog ?? t.common.unavailable },
      { label: "Email", value: user.email ?? t.common.unavailable },
    ],
    portraitTitle: portrait.available
      ? t.entities.users.portraitAvailable
      : t.entities.users.portraitUnavailable,
    portraitRiskLevel: portrait.riskLevel,
    portraitStats: portrait.available
      ? [
          {
            label: locale === "en" ? "Trust Level" : "可信等级",
            value: portrait.trustLevel,
          },
          {
            label: locale === "en" ? "Assessed At" : "评估时间",
            value: formatDateTime(portrait.assessedAt) || t.common.unavailable,
          },
          {
            label: locale === "en" ? "Total Score" : "总分",
            value: formatNumber(portrait.totalScore),
          },
        ]
      : [
          {
            label: locale === "en" ? "Status" : "状态",
            value:
              locale === "en"
                ? "No portrait result found for this user."
                : "当前用户暂无画像结果。",
          },
        ],
    scoreBreakdown: portrait.scoreBreakdown,
    portraitAvailable: portrait.available,
  };
}

export async function getGlobalUserDetailPageViewModel(
  userId: string,
  locale: Locale = "zh-CN"
): Promise<GlobalUserDetailPageViewModel> {
  const t = getDictionary(locale);
  const [userRaw, portraitRaw] = await Promise.all([
    fetchUser(userId, { platform: getPlatform() }).catch(() => null),
    fetchLatestUserPortrait(userId, { platform: getPlatform() }).catch(() => null),
  ]);
  const user: UserItem =
    userRaw ??
    ({
      id: userId,
      login: userId,
      crawled_at: "",
    } as UserItem);
  const portrait = mapUserPortrait(portraitRaw);

  return {
    title: user.login ?? user.name ?? userId,
    subtitle:
      locale === "en"
        ? `Global user portrait / ${userTypeLabel(user.type, locale)} / ${userId}`
        : `全局用户画像 / ${userTypeLabel(user.type, locale)} / ${userId}`,
    backHref: `/search?q=${encodeURIComponent(user.login ?? userId)}`,
    summaryStats: [
      {
        label: locale === "en" ? "Trust Level" : "可信等级",
        value: portrait.available ? portrait.trustLevel : t.common.unavailable,
      },
      {
        label: locale === "en" ? "Total Score" : "画像分值",
        value: portrait.available ? formatNumber(portrait.totalScore) : t.common.noData,
      },
      {
        label: locale === "en" ? "Public Repos" : "公开仓库",
        value: formatNumber(user.public_repos ?? 0, 0),
      },
      {
        label: locale === "en" ? "Public Gists" : "公开 Gist",
        value: formatNumber(user.public_gists ?? 0, 0),
      },
    ],
    profileStats: buildUserProfileStats(user, locale, t.common.unavailable),
    portraitTitle: portrait.available
      ? t.entities.users.portraitAvailable
      : t.entities.users.portraitUnavailable,
    portraitStats: portrait.available
      ? [
          {
            label: locale === "en" ? "Trust Level" : "可信等级",
            value: portrait.trustLevel,
          },
          {
            label: locale === "en" ? "Assessed At" : "评估时间",
            value: formatDateTime(portrait.assessedAt) || t.common.unavailable,
          },
          {
            label: locale === "en" ? "Total Score" : "画像分值",
            value: formatNumber(portrait.totalScore),
          },
        ]
      : [
          {
            label: locale === "en" ? "Status" : "状态",
            value:
              locale === "en"
                ? "No portrait result found for this user."
                : "当前用户暂无画像结果。",
          },
        ],
    scoreBreakdown: portrait.scoreBreakdown,
    portraitAvailable: portrait.available,
  };
}

export async function getIssueListPageViewModel(
  repoId: string,
  {
    page,
    pageSize,
    pageChain,
    state,
  }: { page?: string; pageSize?: string; pageChain?: string; state?: string },
  locale: Locale = "zh-CN"
): Promise<IssueListPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const paginationState = resolveCursorPageState(page, pageSize, pageChain);
  const response = await fetchIssues(repo.repoId, {
    pageSize: paginationState.pageSize,
    cursor: paginationState.cursor ?? undefined,
    state,
    platform: repo.platform,
  });
  const relatedUsers = await Promise.all(
    (response.data ?? []).map((issue) => buildIssueRelatedUsers(issue, repoId, repo.platform, locale))
  );

  return {
    title: t.entities.issues.title,
    subtitle: buildRepoSubtitle(repo, locale),
    stats: [
      {
        label: locale === "en" ? "Open Issues" : "Open Issue",
        value: formatNumber(repo.openIssues, 0),
      },
      {
        label: locale === "en" ? "Issue Response" : "Issue 首响",
        value: `${formatNumber(repo.projectPortrait.issueResponseHours)}h`,
      },
      {
        label: locale === "en" ? "Issue Close Time" : "Issue 关闭时长",
        value:
          locale === "en"
            ? `${formatNumber(repo.projectPortrait.issueCloseDays)} days`
            : `${formatNumber(repo.projectPortrait.issueCloseDays)} 天`,
      },
    ],
    items: (response.data ?? []).map((issue, index) => ({
      title: issue.title ?? `Issue #${issue.number ?? issue.id}`,
      subtitle: `#${issue.number ?? issue.id} / ${issue.state ?? t.common.unknown} / ${
        formatDate(issue.updated_at ?? issue.crawled_at) || t.common.unavailable
      }`,
      href: `/repo/${repoId}/issues/${issue.id}`,
      stateLabel: issue.state ?? t.common.unknown,
      relatedUsers: relatedUsers[index],
    })),
    pagination: {
      ...buildEntityPaginationViewModel(
        repoId,
        "issues",
        { state },
        paginationState.currentPage,
        paginationState.pageSize,
        buildVisitedPageChain(
          paginationState.pageChain,
          paginationState.currentPage,
          paginationState.cursor
        ),
        response.pagination.next_cursor
      ),
    },
    state: state ?? "",
    pageSize: paginationState.pageSize,
  };
}

export async function getIssueDetailPageViewModel(
  repoId: string,
  issueId: string,
  locale: Locale = "zh-CN"
): Promise<IssueDetailPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const issue = await fetchIssue(repo.repoId, Number(issueId), { platform: repo.platform });

  return {
    title: issue.title ?? `Issue #${issue.number ?? issue.id}`,
    subtitle: `${repo.fullName} / #${issue.number ?? issue.id} / ${issue.state ?? t.common.unknown}`,
    backHref: `/repo/${repoId}/issues`,
    summaryStats: [
      { label: t.entities.issues.state, value: issue.state ?? t.common.unknown },
      { label: t.entities.issues.comments, value: formatNumber(issue.comments ?? 0, 0) },
      {
        label: t.entities.issues.association,
        value: issue.author_association ?? t.common.unavailable,
      },
      {
        label: t.entities.issues.created,
        value: formatDateTime(issue.created_at) || t.common.unavailable,
      },
    ],
    body: issue.body ?? t.entities.issues.noBody,
    projectContext: [
      {
        label: locale === "en" ? "Repo Trust" : "仓库可信等级",
        value: repo.projectPortrait.trustLevel,
      },
      {
        label: locale === "en" ? "Repo Risk" : "仓库风险等级",
        value: repo.projectPortrait.riskLevel.toUpperCase(),
      },
      {
        label: locale === "en" ? "Issue Response" : "Issue 首响",
        value: `${formatNumber(repo.projectPortrait.issueResponseHours)}h`,
      },
      {
        label: locale === "en" ? "PR Backlog" : "PR 积压数",
        value: formatNumber(repo.projectPortrait.prBacklog, 0),
      },
    ],
  };
}

export async function getPullRequestListPageViewModel(
  repoId: string,
  {
    page,
    pageSize,
    pageChain,
    state,
  }: { page?: string; pageSize?: string; pageChain?: string; state?: string },
  locale: Locale = "zh-CN"
): Promise<PullRequestListPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const paginationState = resolveCursorPageState(page, pageSize, pageChain);
  const response = await fetchPullRequests(repo.repoId, {
    pageSize: paginationState.pageSize,
    cursor: paginationState.cursor ?? undefined,
    state,
    platform: repo.platform,
  });
  const relatedUsers = await Promise.all(
    (response.data ?? []).map((pr) => buildPullRequestRelatedUsers(pr, repoId, repo.platform, locale))
  );

  return {
    title: t.entities.prs.title,
    subtitle: buildRepoSubtitle(repo, locale),
    stats: [
      {
        label: locale === "en" ? "Open PR Backlog" : "打开 PR 积压数",
        value: formatNumber(repo.projectPortrait.prBacklog, 0),
      },
      {
        label: locale === "en" ? "Stale PR Ratio" : "陈旧 PR 占比",
        value: formatPercent(repo.projectPortrait.stalePrRatio, 1),
      },
      {
        label: locale === "en" ? "Collab Index" : "协作指数",
        value: formatNumber(repo.projectPortrait.collabIndex, 0),
      },
    ],
    items: (response.data ?? []).map((pr, index) => ({
      title: pr.title ?? `PR #${pr.number ?? pr.id}`,
      subtitle: `#${pr.number ?? pr.id} / ${pr.state ?? t.common.unknown} / ${
        formatDate(pr.updated_at ?? pr.crawled_at) || t.common.unavailable
      }`,
      href: `/repo/${repoId}/prs/${pr.id}`,
      stateLabel: pr.merged_at
        ? "merged"
        : pr.draft
          ? "draft"
          : pr.state ?? t.common.unknown,
      relatedUsers: relatedUsers[index],
    })),
    pagination: {
      ...buildEntityPaginationViewModel(
        repoId,
        "prs",
        { state },
        paginationState.currentPage,
        paginationState.pageSize,
        buildVisitedPageChain(
          paginationState.pageChain,
          paginationState.currentPage,
          paginationState.cursor
        ),
        response.pagination.next_cursor
      ),
    },
    state: state ?? "",
    pageSize: paginationState.pageSize,
  };
}

export async function getPullRequestDetailPageViewModel(
  repoId: string,
  pullRequestId: string,
  locale: Locale = "zh-CN"
): Promise<PullRequestDetailPageViewModel> {
  const repo = await loadRepoAggregate(repoId, getPlatform());
  const t = getDictionary(locale);
  const pr = await fetchPullRequest(repo.repoId, Number(pullRequestId), {
    platform: repo.platform,
  });

  return {
    title: pr.title ?? `PR #${pr.number ?? pr.id}`,
    subtitle: `${repo.fullName} / #${pr.number ?? pr.id} / ${pr.state ?? t.common.unknown}`,
    backHref: `/repo/${repoId}/prs`,
    summaryStats: [
      { label: t.entities.prs.state, value: pr.state ?? t.common.unknown },
      { label: t.entities.prs.draft, value: getBooleanLabel(Boolean(pr.draft), locale) },
      {
        label: t.entities.prs.association,
        value: pr.author_association ?? t.common.unavailable,
      },
      {
        label: t.entities.prs.merged,
        value: pr.merged_at
          ? formatDateTime(pr.merged_at) || t.common.unavailable
          : locale === "en"
            ? "Not merged"
            : "未合并",
      },
    ],
    body: pr.body ?? t.entities.prs.noBody,
    projectContext: [
      {
        label: locale === "en" ? "Repo Trust" : "仓库可信等级",
        value: repo.projectPortrait.trustLevel,
      },
      {
        label: locale === "en" ? "PR Backlog" : "PR 积压数",
        value: formatNumber(repo.projectPortrait.prBacklog, 0),
      },
      {
        label: locale === "en" ? "Stale PR Ratio" : "陈旧 PR 占比",
        value: formatPercent(repo.projectPortrait.stalePrRatio, 1),
      },
      {
        label: locale === "en" ? "Collab Index" : "协作指数",
        value: formatNumber(repo.projectPortrait.collabIndex, 0),
      },
    ],
  };
}

export async function getSearchPageViewModel(
  query: string,
  locale: Locale = "zh-CN"
): Promise<SearchPageViewModel> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      usingLiveData: true,
      results: [],
    };
  }

  try {
    const platform = getPlatform();
    const [projects, usersByLogin] = await Promise.all([
      fetchAllProjects({
        pageSize: 100,
        platform,
      }),
      fetchUsersByLogin(trimmed, { platform }).catch(() => []),
    ]);

    const exactUsers = usersByLogin.filter(
      (user) => (user.login ?? "").toLowerCase() === trimmed.toLowerCase()
    );

    if (exactUsers.length === 1) {
      return {
        query: trimmed,
        usingLiveData: true,
        results: [],
        redirectHref: `/users/${exactUsers[0].id}`,
      };
    }

    const userResults = exactUsers.slice(0, 8).map((user) => ({
      kind: "user" as const,
      title: user.login ?? user.name ?? user.id,
      subtitle:
        locale === "en"
          ? `user / ${user.type ?? "User"} / ${user.id}`
          : `用户 / ${user.type ?? "User"} / ${user.id}`,
      href: `/users/${user.id}`,
      tags: [user.id],
    }));

    const results = projects
      .filter((project) => {
        const haystack = `${project.full_name ?? ""} ${project.name ?? ""} ${project.repo_id}`.toLowerCase();
        return haystack.includes(trimmed.toLowerCase());
      })
      .slice(0, 24)
      .map((project) => ({
        kind: "repo" as const,
        title: project.full_name ?? project.name ?? `repo/${project.repo_id}`,
        subtitle:
          locale === "en"
            ? `${project.platform} / repo_id ${project.repo_id}`
            : `${project.platform} / 仓库 ID ${project.repo_id}`,
        href: `/repo/${project.repo_id}/overview`,
        tags: [project.database_name],
      }));

    return {
      query: trimmed,
      usingLiveData: true,
      results: [...userResults, ...results],
    };
  } catch {
    return {
      query: trimmed,
      usingLiveData: false,
      results: [],
    };
  }
}
