import Link from "next/link";
import {
  getRepoSidebarViewModel,
  type PreviewItemViewModel,
  type RepoOverviewViewModel,
  type RiskLevel,
} from "@/lib/repo-view-models";

type OverviewStat = {
  label: string;
  value: string;
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`badge ${level}`}>{level.toUpperCase()}</span>;
}

export function RepoContextPanel({ repoId }: { repoId: string }) {
  const model = getRepoSidebarViewModel(repoId);

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
        <div className="repo-sidebar-title">Repository</div>
        {model.repositoryStats.map((item) => (
          <div key={item.label} className="repo-sidebar-kv">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="repo-sidebar-section">
        <div className="repo-sidebar-title">Portrait</div>
        {model.portraitStats.map((item) => (
          <div key={item.label} className="repo-sidebar-kv">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="context-tags">
        <RiskBadge level={model.riskLevel} />
        {model.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>

      <div className="inline-links" style={{ marginTop: 10 }}>
        <Link href={`/repo/${repoId}/overview`}>Overview</Link>
        <Link href={`/repo/${repoId}/risk`}>Risk</Link>
        <Link href="/">Back to Home</Link>
      </div>
    </aside>
  );
}

export function RepoTabs({ repoId }: { repoId: string }) {
  const tabs = [
    ["overview", "Overview"],
    ["commits", "Commits"],
    ["issues", "Issues"],
    ["prs", "PRs"],
    ["users", "Users"],
    ["risk", "Risk"],
  ] as const;

  return (
    <nav className="repo-tabs" aria-label="Repository views">
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
}: {
  repoId: string;
  model: RepoOverviewViewModel;
}) {
  return (
    <section className="card repo-hero-card">
      <div className="repo-hero-head">
        <div>
          <div className="repo-kicker">Repository Overview</div>
          <h2>{model.title}</h2>
          <p className="muted repo-hero-description">{model.description}</p>
        </div>
        <div className="hero-badge-stack">
          <RiskBadge level={model.riskLevel} />
        </div>
      </div>

      <div className="repo-pill-row">
        {model.pills.map((pill) => (
          <span key={pill}>{pill}</span>
        ))}
      </div>

      <div className="inline-links">
        <Link href="/">Back to Home</Link>
        <Link href={`/repo/${repoId}/risk`}>Open Risk</Link>
      </div>
    </section>
  );
}

export function RepoSummaryStats({ items }: { items: OverviewStat[] }) {
  return (
    <section className="repo-summary-grid">
      {items.map((item) => (
        <article key={item.label} className="card repo-summary-card">
          <div className="muted">{item.label}</div>
          <h3>{item.value}</h3>
        </article>
      ))}
    </section>
  );
}

export function RepoOverviewChartPlaceholder({
  title = "12-Week Activity",
  description = "Timeline placeholder for commits, issues, PRs, and contributor activity.",
  caption = "Waiting for time-series integration.",
}: {
  title?: string;
  description?: string;
  caption?: string;
}) {
  return (
    <section className="card overview-chart-card">
      <div className="overview-section-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">{description}</p>
        </div>
      </div>
      <div className="chart-placeholder">
        <div className="chart-placeholder-bars">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
      <div className="chart-placeholder-caption muted">{caption}</div>
    </section>
  );
}

export function RepoPreviewPanel({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: Array<PreviewItemViewModel & { href: string }>;
}) {
  return (
    <section className="card overview-preview-card">
      <div className="overview-section-head">
        <h3>{title}</h3>
        <Link className="chip" href={href}>
          View All
        </Link>
      </div>
      <div className="preview-list">
        {items.map((item) => (
          <div key={`${title}-${item.title}`} className="preview-item">
            <div>
              <Link href={item.href}>{item.title}</Link>
              <div className="muted">{item.meta}</div>
            </div>
            {item.level ? <RiskBadge level={item.level} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ListPlaceholder({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="muted">{hint}</p>
      <div className="entity-toolbar">
        <div className="muted">Filter scaffold</div>
        <div className="toolbar">
          <span className="chip selected">All</span>
          <span className="chip">High</span>
          <span className="chip">Medium</span>
          <span className="chip">Low</span>
        </div>
      </div>
      <div className="empty">
        Placeholder list layout is ready for repository entity interfaces.
      </div>
    </section>
  );
}

export function DetailPlaceholder({
  title,
  backHref,
}: {
  title: string;
  backHref: string;
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="muted">
        Detail page scaffold is in place and intentionally does not render code
        diffs in this stage.
      </p>
      <div className="inline-links">
        <Link href={backHref}>Back to List</Link>
      </div>
    </section>
  );
}
