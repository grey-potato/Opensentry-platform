import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getDictionary, getRiskLabel } from "@/lib/ui-copy";
import {
  getRepoSidebarViewModel,
  type MetricItemViewModel,
  type PreviewItemViewModel,
  type RepoOverviewViewModel,
  type RiskLevel,
} from "@/lib/repo-view-models";
import {
  formatCompactNumber,
  formatShortDateLabel,
  type RepoTimelinePointViewModel,
} from "@/lib/repo-core";

type BadgeExplanationKind = "portrait" | "workflow" | "metrics";

type BadgeExplanationItem = {
  key: BadgeExplanationKind;
  title: string;
  source: string;
  meaning: string;
  mapping: string;
  caveat: string;
};

function getBadgeExplanationItems(locale: Locale): BadgeExplanationItem[] {
  if (locale === "en") {
    return [
      {
        key: "portrait",
        title: "Portrait Fields",
        source: "Read directly from backend portrait payloads.",
        meaning:
          "Use trust_level, score, assessed_at, and evidence fields as the primary interpretation layer.",
        mapping:
          "Repository: trust_level / risk_score. User: trust_level / total_score. Commit: trust_level / primary_reason / findings_count.",
        caveat: "These are raw backend fields, not a unified frontend risk grade.",
      },
      {
        key: "workflow",
        title: "Workflow State",
        source: "Read directly from issue and pull request state fields.",
        meaning: "Use open / closed / merged / draft as the main workflow signal.",
        mapping:
          "Issues show state directly. Pull requests show merged first, then draft, then state.",
        caveat: "Workflow state is separate from portrait trust and score fields.",
      },
      {
        key: "metrics",
        title: "Metric Fields",
        source: "Read from repository metadata and project portrait snapshots.",
        meaning:
          "Use the metric values themselves to understand activity, collaboration, and community state.",
        mapping:
          "Examples: commit_frequency, active_week_ratio, collab_index, issue_metrics, pr_metrics, and community deltas.",
        caveat:
          "Helper badges may still appear in snapshot cards, but the number itself is the primary signal.",
      },
    ];
  }

  return [
    {
      key: "portrait",
      title: "画像字段",
      source: "直接读取后端画像结果字段。",
      meaning:
        "仓库、用户、提交页面优先展示 trust_level、score、assessed_at 和证据字段本身。",
      mapping:
        "仓库画像：trust_level / risk_score。用户画像：trust_level / total_score。提交画像：trust_level / primary_reason / findings_count。",
      caveat: "这些是后端原始字段，不是前端统一换算出的风险等级。",
    },
    {
      key: "workflow",
      title: "流程状态字段",
      source: "直接读取 Issue 和 PR 的状态字段。",
      meaning: "列表页使用 open / closed / merged / draft 表示当前流程状态。",
      mapping:
        "Issue 直接展示 state。PR 优先展示 merged，其次是 draft，再回退到 state。",
      caveat: "流程状态和画像字段分开理解，不能当作同一种评分。",
    },
    {
      key: "metrics",
      title: "指标字段",
      source: "读取仓库 metadata 和项目画像快照中的原始指标。",
      meaning:
        "活跃度、协作治理、社区关注优先看数值本身，而不是前端合成等级。",
      mapping:
        "例如 commit_frequency、active_week_ratio、collab_index、issue_metrics、pr_metrics、community delta。",
      caveat: "快照卡里仍可能保留辅助 badge，但数字本身才是主信号。",
    },
  ];
}

export function RiskBadge({
  level,
  locale = "zh-CN",
}: {
  level: RiskLevel;
  locale?: Locale;
}) {
  return <span className={`badge ${level}`}>{getRiskLabel(level, locale)}</span>;
}

export function BadgeMeaningNote({
  locale,
  kind,
}: {
  locale: Locale;
  kind: BadgeExplanationKind;
}) {
  const item = getBadgeExplanationItems(locale).find((entry) => entry.key === kind);
  return item ? <p className="muted badge-inline-note">{item.source}</p> : null;
}

export function BadgeExplanationPanel({
  locale,
  kinds,
  compact = false,
}: {
  locale: Locale;
  kinds?: BadgeExplanationKind[];
  compact?: boolean;
}) {
  const items = getBadgeExplanationItems(locale).filter((item) =>
    kinds?.length ? kinds.includes(item.key) : true
  );

  return (
    <section className={`card badge-explanation-panel${compact ? " compact" : ""}`}>
      <div className="overview-section-head">
        <div>
          <h3>{locale === "en" ? "Field Guide" : "字段说明"}</h3>
          <p className="muted">
            {locale === "en"
              ? "This panel explains the raw backend fields shown across repository, user, and commit views."
              : "这里解释仓库、用户和提交页面中的后端原始字段及其含义。"}
          </p>
        </div>
      </div>
      <div className="badge-explanation-grid">
        {items.map((item) => (
          <article key={item.key} className="badge-explanation-card">
            <h4>{item.title}</h4>
            <div className="badge-explanation-meta">
              <span className="muted">
                <strong>{locale === "en" ? "Source: " : "来源："} </strong>
                {item.source}
              </span>
              <span className="muted">
                <strong>{locale === "en" ? "Meaning: " : "含义："} </strong>
                {item.meaning}
              </span>
              <span className="muted">
                <strong>{locale === "en" ? "Fields: " : "字段："} </strong>
                {item.mapping}
              </span>
              <span className="muted">
                <strong>{locale === "en" ? "Note: " : "说明："} </strong>
                {item.caveat}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function RepoContextPanel({
  repoId,
  locale,
}: {
  repoId: string;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const model = await getRepoSidebarViewModel(repoId, locale).catch(() => null);

  if (!model) {
    return (
      <aside className="repo-context card repo-sidebar-card">
        <div className="repo-sidebar-head">
          <h3>{locale === "en" ? "Repository Context" : "仓库上下文"}</h3>
          <p className="muted">
            {locale === "en"
              ? "The sidebar could not load live repository details just now. You can still continue browsing this page."
              : "侧栏暂时无法读取实时仓库信息，但你仍然可以继续浏览当前页面。"}
          </p>
        </div>
        <div className="empty">
          {locale === "en"
            ? "Repository metadata is temporarily unavailable."
            : "仓库元数据暂时不可用。"}
        </div>
        <div className="inline-links" style={{ marginTop: 10 }}>
          <Link href={`/repo/${repoId}/overview`}>{t.tabs.overview}</Link>
          <Link href={`/repo/${repoId}/risk`}>{t.tabs.risk}</Link>
          <Link href="/">{t.common.backHome}</Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="repo-context card repo-sidebar-card">
      <div className="repo-sidebar-head">
        <h3>{model.title}</h3>
        <p className="muted">{model.description}</p>
      </div>

      <div className="repo-pill-row">
        {model.pills.map((pill) => (
          <span key={pill}>{pill}</span>
        ))}
      </div>

      <div className="repo-sidebar-section">
        <div className="repo-sidebar-title">{t.repo.sidebarRepo}</div>
        {model.repositoryStats.map((item) => (
          <div key={item.label} className="repo-sidebar-kv">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="repo-sidebar-section">
        <div className="repo-sidebar-title">{t.repo.sidebarPortrait}</div>
        {model.portraitStats.map((item) => (
          <div key={item.label} className="repo-sidebar-kv">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="context-tags">
        {model.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>

      <div className="inline-links" style={{ marginTop: 10 }}>
        <Link href={`/repo/${repoId}/overview`}>{t.tabs.overview}</Link>
        <Link href={`/repo/${repoId}/risk`}>{t.tabs.risk}</Link>
        <Link href="/">{t.common.backHome}</Link>
      </div>
    </aside>
  );
}

export function RepoTabs({ repoId, locale }: { repoId: string; locale: Locale }) {
  const t = getDictionary(locale);
  const tabs = [
    ["overview", t.tabs.overview],
    ["commits", t.tabs.commits],
    ["issues", t.tabs.issues],
    ["prs", t.tabs.prs],
    ["users", t.tabs.users],
    ["risk", t.tabs.risk],
  ] as const;

  return (
    <nav className="repo-tabs" aria-label={locale === "en" ? "Repository views" : "仓库视图"}>
      {tabs.map(([key, label]) => (
        <Link key={key} href={`/repo/${repoId}/${key}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function RepoOverviewHero({
  repoId,
  model,
  locale,
}: {
  repoId: string;
  model: RepoOverviewViewModel;
  locale: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <section className="card repo-hero-card">
      <div className="repo-hero-head">
        <div className="repo-hero-copy">
          <div className="repo-kicker">{t.repo.repoOverview}</div>
          <h2>
            {model.htmlUrl ? (
              <a
                className="repo-title-link"
                href={model.htmlUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {model.title}
              </a>
            ) : (
              model.title
            )}
          </h2>
          <p className="muted repo-hero-description">{model.description}</p>
          {model.htmlUrl ? (
            <a
              className="repo-external-link"
              href={model.htmlUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              {model.htmlUrl}
            </a>
          ) : null}
        </div>
      </div>

      <div className="repo-pill-row">
        {model.pills.map((pill) => (
          <span key={pill}>{pill}</span>
        ))}
      </div>

      <div className="inline-links repo-hero-actions">
        <Link href="/">{t.common.backHome}</Link>
        <Link href={`/repo/${repoId}/risk`}>{t.common.openRisk}</Link>
      </div>
    </section>
  );
}

export function RepoSummaryStats({ items }: { items: MetricItemViewModel[] }) {
  return (
    <section className="repo-summary-grid">
      {items.map((item) => (
        <article key={item.label} className="card repo-summary-card">
          <div className="muted">{item.label}</div>
          <h3>{item.value}</h3>
          {item.note ? <div className="muted">{item.note}</div> : null}
        </article>
      ))}
    </section>
  );
}

function normalizeSeries(values: number[]) {
  const baseline = values[0] ?? 0;
  const deltas = values.map((value) => value - baseline);
  const minDelta = Math.min(...deltas, 0);
  const maxDelta = Math.max(...deltas, 0);
  const range = maxDelta - minDelta || 1;
  const normalized = deltas.map((value) => (value - minDelta) / range);

  return {
    baseline,
    deltas,
    minDelta,
    maxDelta,
    normalized,
  };
}

function buildLinePathInBand(
  values: number[],
  xPositions: number[],
  top: number,
  height: number
) {
  return values
    .map((value, index) => {
      const x = xPositions[index] ?? xPositions[0] ?? 0;
      const y = top + height - value * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function RepoTimelineChart({
  title,
  description,
  caption,
  points,
  locale,
}: {
  title: string;
  description: string;
  caption: string;
  points: RepoTimelinePointViewModel[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const chartWidth = 640;
  const chartHeight = 240;
  const paddingX = 18;
  const paddingY = 18;
  const laneGap = 14;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;
  const laneHeight = (plotHeight - laneGap * 2) / 3;

  const series = [
    {
      key: "stars",
      label: "Stars",
      className: "stars",
      values: points.map((point) => point.stars),
    },
    {
      key: "forks",
      label: "Forks",
      className: "forks",
      values: points.map((point) => point.forks),
    },
    {
      key: "issues",
      label: "Open Issues",
      className: "issues",
      values: points.map((point) => point.issues),
    },
  ] as const;

  const xPositions = points.map((_, index) =>
    points.length <= 1 ? chartWidth / 2 : paddingX + (plotWidth / (points.length - 1)) * index
  );

  const chartSeries = series.map((item, index) => {
    const normalized = normalizeSeries(item.values);
    const top = paddingY + index * (laneHeight + laneGap);
    const latest = item.values[item.values.length - 1] ?? 0;

    return {
      ...item,
      ...normalized,
      latest,
      linePath: buildLinePathInBand(normalized.normalized, xPositions, top, laneHeight),
      top,
      bottom: top + laneHeight,
    };
  });

  const xLabels = points.map((_, index) => `W-${points.length - 1 - index}`);

  return (
    <section className="card overview-chart-card">
      <div className="overview-section-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">{description}</p>
        </div>
      </div>
      {points.length ? (
        <div className="timeline-series-wrap">
          <div className="timeline-combined-head">
            {chartSeries.map((item) => (
              <div key={item.key} className={`timeline-legend-item ${item.className}`}>
                <span className={`timeline-legend-dot ${item.className}`} />
                <div className="timeline-legend-copy">
                  <strong>{item.label}</strong>
                  <span className="muted">{formatCompactNumber(item.latest)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-chart-frame timeline-chart-frame-combined">
            <div className="timeline-lane-axis" aria-hidden="true">
              {chartSeries.map((item) => (
                <div key={`${item.key}-axis`} className={`timeline-lane-axis-item ${item.className}`}>
                  <span className="timeline-lane-axis-value">
                    {formatCompactNumber(item.maxDelta + item.baseline)}
                  </span>
                  <span className="timeline-lane-axis-name">{item.label}</span>
                  <span className="timeline-lane-axis-value">
                    {formatCompactNumber(item.minDelta + item.baseline)}
                  </span>
                </div>
              ))}
            </div>

            <svg
              className="timeline-mini-chart timeline-mini-chart-combined"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label={locale === "en" ? "Repository history timeline" : "仓库历史时序"}
              preserveAspectRatio="none"
            >
              {chartSeries.map((item, index) => (
                <g key={`${item.key}-lane`}>
                  {[0, 0.5, 1].map((ratio) => {
                    const y = item.top + laneHeight * ratio;
                    return (
                      <line
                        key={`${item.key}-grid-${ratio}`}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        className="timeline-grid-line"
                      />
                    );
                  })}
                  {index < chartSeries.length - 1 ? (
                    <line
                      x1={paddingX}
                      y1={item.bottom + laneGap / 2}
                      x2={chartWidth - paddingX}
                      y2={item.bottom + laneGap / 2}
                      className="timeline-lane-separator"
                    />
                  ) : null}
                </g>
              ))}

              {points.map((point, index) => {
                const currentX = xPositions[index];
                const previousX = index === 0 ? paddingX : (xPositions[index - 1] + currentX) / 2;
                const nextX =
                  index === xPositions.length - 1
                    ? chartWidth - paddingX
                    : (currentX + xPositions[index + 1]) / 2;
                const width = Math.max(12, nextX - previousX);
                const tooltip = [
                  `${xLabels[index]} · ${formatShortDateLabel(point.label)}`,
                  ...chartSeries.map(
                    (item) => `${item.label}: ${formatCompactNumber(item.values[index] ?? 0)}`
                  ),
                ].join("\n");

                return (
                  <g key={`hover-${point.label}-${index}`} className="timeline-hover-band">
                    <rect
                      x={previousX}
                      y={paddingY}
                      width={width}
                      height={plotHeight}
                      className="timeline-hover-rect"
                    >
                      <title>{tooltip}</title>
                    </rect>
                    <line
                      x1={currentX}
                      y1={paddingY}
                      x2={currentX}
                      y2={chartHeight - paddingY}
                      className="timeline-hover-guide"
                    />
                  </g>
                );
              })}

              {chartSeries.map((item) => (
                <path
                  key={`${item.key}-line`}
                  d={item.linePath}
                  className={`timeline-line ${item.className}`}
                />
              ))}
            </svg>
          </div>

          <div className="timeline-shared-axis">
            {xLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                style={
                  points.length > 1 ? { left: `${(index / (points.length - 1)) * 100}%` } : undefined
                }
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty">{t.repo.historyEmpty}</div>
      )}
      <div className="chart-placeholder-caption muted">{caption}</div>
    </section>
  );
}

export function RepoPreviewPanel({
  title,
  href,
  items,
  locale,
}: {
  title: string;
  href: string;
  items: Array<PreviewItemViewModel & { href?: string }>;
  locale: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <section className="card overview-preview-card">
      <div className="overview-section-head">
        <h3>{title}</h3>
        <Link className="chip" href={href}>
          {t.common.viewAll}
        </Link>
      </div>
      <div className="preview-list">
        {items.map((item, index) => (
          <div
            key={item.href ?? `${title}-${item.title}-${item.meta}-${index}`}
            className="preview-item"
          >
            <div className="preview-main">
              <div className="preview-title-line">
                {item.href ? <Link href={item.href}>{item.title}</Link> : <strong>{item.title}</strong>}
              </div>
              <div className="muted preview-meta">{item.meta}</div>
              <div className="related-user-row">
                {item.relatedUsers?.length ? (
                  item.relatedUsers.map((user) => (
                    <Link
                      key={`${item.href ?? item.title}-${user.id}`}
                      href={user.href}
                      className="related-user-link"
                    >
                      <span className="muted">{user.role}</span>
                      <strong>{user.label}</strong>
                    </Link>
                  ))
                ) : (
                  <span className="muted">{t.common.noRelatedUsers}</span>
                )}
              </div>
            </div>
            {item.badgeLabel ? (
              <span className="badge">{item.badgeLabel}</span>
            ) : item.level ? (
              <RiskBadge level={item.level} locale={locale} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="empty">{description}</div>
    </section>
  );
}

export function PaginationLink({
  pagination,
  locale = "zh-CN",
}: {
  pagination: {
    currentPage: number;
    pageLinks: Array<{ page: number; href: string; active: boolean }>;
    prevHref: string | null;
    nextHref: string | null;
    hasMore: boolean;
  };
  locale?: Locale;
}) {
  const previousLabel = locale === "en" ? "Previous" : "上一页";
  const nextLabel = locale === "en" ? "Next" : "下一页";
  const pageLabel = locale === "en" ? `Page ${pagination.currentPage}` : `第 ${pagination.currentPage} 页`;

  if (!pagination.pageLinks.length && !pagination.prevHref && !pagination.nextHref) {
    return null;
  }

  return (
    <div className="pagination-bar">
      <div className="pagination-pages">
        {pagination.prevHref ? (
          <Link href={pagination.prevHref} className="chip">
            {previousLabel}
          </Link>
        ) : (
          <span className="chip pagination-disabled">{previousLabel}</span>
        )}

        {pagination.pageLinks.map((item) =>
          item.active ? (
            <span key={`page-${item.page}`} className="chip selected">
              {item.page}
            </span>
          ) : (
            <Link key={`page-${item.page}`} href={item.href} className="chip">
              {item.page}
            </Link>
          )
        )}

        {pagination.nextHref ? (
          <Link href={pagination.nextHref} className="chip">
            {nextLabel}
          </Link>
        ) : (
          <span className="chip pagination-disabled">{nextLabel}</span>
        )}
      </div>
      <div className="muted pagination-label">{pageLabel}</div>
    </div>
  );
}
