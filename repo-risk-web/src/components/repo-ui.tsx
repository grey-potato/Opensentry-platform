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
import { formatCompactNumber, formatShortDateLabel, type RepoTimelinePointViewModel } from "@/lib/repo-core";

export function RiskBadge({ level, locale = "zh-CN" }: { level: RiskLevel; locale?: Locale }) {
  return <span className={`badge ${level}`}>{getRiskLabel(level, locale)}</span>;
}

export async function RepoContextPanel({
  repoId,
  locale,
}: {
  repoId: string;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const model = await getRepoSidebarViewModel(repoId, locale);

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
        <RiskBadge level={model.riskLevel} locale={locale} />
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
        <div className="hero-badge-stack">
          <RiskBadge level={model.riskLevel} locale={locale} />
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
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);

  if (maxValue === minValue) {
    return values.map(() => 0.5);
  }

  return values.map((value) => (value - minValue) / (maxValue - minValue));
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
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingX = 28;
  const paddingTop = 18;
  const paddingBottom = 34;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const plotWidth = chartWidth - paddingX * 2;
  const yTicks = 4;
  const latestPoint = points[points.length - 1];
  const trendTickLabels = ["100", "75", "50", "25", "0"];

  const series = [
    {
      key: "stars",
      label: locale === "en" ? "Stars" : "Star",
      className: "stars",
      values: points.map((point) => point.stars),
      latest: latestPoint?.stars ?? 0,
    },
    {
      key: "forks",
      label: "Forks",
      className: "forks",
      values: points.map((point) => point.forks),
      latest: latestPoint?.forks ?? 0,
    },
    {
      key: "issues",
      label: locale === "en" ? "Open Issues" : "Open Issues",
      className: "issues",
      values: points.map((point) => point.issues),
      latest: latestPoint?.issues ?? 0,
    },
  ] as const;

  function toX(index: number) {
    if (points.length <= 1) {
      return chartWidth / 2;
    }
    return paddingX + (plotWidth / (points.length - 1)) * index;
  }

  function toY(ratio: number) {
    return paddingTop + plotHeight - ratio * plotHeight;
  }

  function buildLinePath(values: number[]) {
    return values
      .map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(value)}`)
      .join(" ");
  }

  const normalizedSeries = series.map((item) => {
    const normalized = normalizeSeries(item.values);
    return {
      ...item,
      normalized,
      path: buildLinePath(normalized),
    };
  });

  const trendCaption =
    locale === "en"
      ? `${caption} · Each line uses its own scale for trend reading.`
      : `${caption} · 各曲线按各自范围缩放，仅用于观察趋势变化。`;

  return (
    <section className="card overview-chart-card">
      <div className="overview-section-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">{description}</p>
        </div>
        {latestPoint ? (
          <div className="timeline-legend">
            {normalizedSeries.map((item) => (
              <span key={item.key} className={`timeline-legend-item ${item.className}`}>
                <i />
                <span>{item.label}</span>
                <strong>{formatCompactNumber(item.latest)}</strong>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {points.length ? (
        <div className="timeline-chart-shell">
          <div className="timeline-y-axis">
            {trendTickLabels.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="timeline-chart-main">
            <svg
              className="timeline-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label={locale === "en" ? "repository history timeline" : "仓库历史时序图"}
              preserveAspectRatio="none"
            >
              {Array.from({ length: yTicks + 1 }, (_, index) => {
                const y = toY((yTicks - index) / yTicks);
                return (
                  <line
                    key={`grid-${index}`}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    className="timeline-grid-line"
                  />
                );
              })}

              {points.map((point, index) => (
                <line
                  key={`x-${point.label}`}
                  x1={toX(index)}
                  y1={paddingTop}
                  x2={toX(index)}
                  y2={paddingTop + plotHeight}
                  className="timeline-vertical-guide"
                />
              ))}

              {normalizedSeries.map((item) => (
                <path key={item.key} d={item.path} className={`timeline-line ${item.className}`} />
              ))}

              {normalizedSeries.flatMap((item) =>
                item.normalized.map((value, index) => (
                  <circle
                    key={`${item.key}-${points[index]?.label ?? index}`}
                    cx={toX(index)}
                    cy={toY(value)}
                    r={item.key === "stars" ? "4" : "3.5"}
                    className={`timeline-dot ${item.className}`}
                  />
                ))
              )}
            </svg>

            <div className="timeline-x-axis">
              {points.map((point) => (
                <div key={point.label} className="timeline-x-tick">
                  <strong>{formatShortDateLabel(point.label)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty">{t.repo.historyEmpty}</div>
      )}
      <div className="chart-placeholder-caption muted">{trendCaption}</div>
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
        {items.map((item) => (
          <div key={`${title}-${item.title}`} className="preview-item">
            <div className="preview-main">
              <div className="preview-title-line">
                {item.href ? <Link href={item.href}>{item.title}</Link> : <strong>{item.title}</strong>}
              </div>
              <div className="muted preview-meta">{item.meta}</div>
              <div className="related-user-row">
                {item.relatedUsers?.length ? (
                  item.relatedUsers.map((user) => (
                    <Link key={`${item.title}-${user.id}`} href={user.href} className="related-user-link">
                      <span className="muted">{user.role}</span>
                      <strong>{user.label}</strong>
                    </Link>
                  ))
                ) : (
                  <span className="muted">{t.common.noRelatedUsers}</span>
                )}
              </div>
            </div>
            {item.level ? <RiskBadge level={item.level} locale={locale} /> : null}
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
  nextHref,
  locale = "zh-CN",
}: {
  nextHref: string | null;
  locale?: Locale;
}) {
  if (!nextHref) {
    return null;
  }

  return (
    <div className="inline-links">
      <Link href={nextHref}>{getDictionary(locale).common.loadNextPage}</Link>
    </div>
  );
}
