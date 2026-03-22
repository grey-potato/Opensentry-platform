import Link from "next/link";

export type RiskLevel = "high" | "medium" | "low";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`badge ${level}`}>{level.toUpperCase()}</span>;
}

export function RepoContextPanel({ repoId }: { repoId: string }) {
  return (
    <aside className="repo-context card">
      <h3>仓库上下文</h3>
      <div className="muted">{repoId}</div>
      <div className="context-stats">
        <span>Metadata: 待接口</span>
        <span>License: 待接口</span>
        <span>Contributors: 待接口</span>
        <span>Risk: 待接口</span>
      </div>
      <div className="context-tags">
        <RiskBadge level="medium" />
        <span className="badge">placeholder</span>
      </div>
      <div className="inline-links" style={{ marginTop: 10 }}>
        <Link href={`/repo/${repoId}/overview`}>Overview</Link>
        <Link href={`/repo/${repoId}/risk`}>Risk</Link>
        <Link href="/">切换仓库</Link>
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
        <div className="muted">筛选骨架（待联调）</div>
        <div className="toolbar">
          <span className="chip selected">全部</span>
          <span className="chip">High</span>
          <span className="chip">Medium</span>
          <span className="chip">Low</span>
        </div>
      </div>
      <div className="empty">暂无数据。该模块已经完成布局，可直接接入列表接口。</div>
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
      <p className="muted">详情页骨架已完成，按你的要求不展示代码 diff。</p>
      <div className="inline-links">
        <Link href={backHref}>返回列表</Link>
      </div>
    </section>
  );
}
