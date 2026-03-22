export default async function OverviewPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return (
    <div>
      <section className="card">
        <h2>Overview</h2>
        <p className="muted">仓库：{repoId}</p>
        <p className="muted">仓库 metadata、license、活跃趋势与风险总览将在此展示。</p>
      </section>

      <section className="grid" style={{ marginTop: 12 }}>
        <article className="card">
          <div className="muted">License</div>
          <h3>待接口</h3>
        </article>
        <article className="card">
          <div className="muted">Contributors</div>
          <h3>待接口</h3>
        </article>
        <article className="card">
          <div className="muted">Open Issues / PRs</div>
          <h3>待接口</h3>
        </article>
        <article className="card">
          <div className="muted">Risk Score</div>
          <h3>待接口</h3>
        </article>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3>趋势图区域</h3>
        <div className="empty">周级趋势图骨架已预留，待联调真实时序数据。</div>
      </section>
    </div>
  );
}
