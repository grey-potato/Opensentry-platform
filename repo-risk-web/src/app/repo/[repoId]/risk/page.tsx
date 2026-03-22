import { RiskBadge } from "@/components/repo-ui";

export default async function RiskPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return (
    <div>
      <section className="grid">
        <article className="card">
          <div className="muted">Risk Score</div>
          <h3>待接口</h3>
        </article>
        <article className="card">
          <div className="muted">Risk Level</div>
          <h3>
            <RiskBadge level="medium" />
          </h3>
        </article>
        <article className="card">
          <div className="muted">Risk Tags</div>
          <h3>待接口</h3>
        </article>
        <article className="card">
          <div className="muted">Entity Count</div>
          <h3>待接口</h3>
        </article>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h2>Risk</h2>
        <p className="muted">仓库：{repoId}</p>
        <div className="empty">风险实体列表与跳转骨架已就绪，待接入后端风险结果数据。</div>
      </section>
    </div>
  );
}
