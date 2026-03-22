import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="card">
        <h2>仓库总览入口</h2>
        <p className="muted">
          这是正式版前端工程骨架。数据层暂未接入后端接口，当前页面用于先完成布局、路由和交互结构。
        </p>
        <div className="toolbar">
          <Link className="chip selected" href="/">
            Home
          </Link>
          <Link className="chip" href="/repo/repo-placeholder/overview">
            进入仓库视图
          </Link>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 12 }}>
        <article className="card">
          <div className="muted">页面覆盖</div>
          <h3>Overview / Commits / Issues / PRs / Users / Risk</h3>
        </article>
        <article className="card">
          <div className="muted">当前状态</div>
          <h3>已完成路由和组件骨架，待接后端接口</h3>
        </article>
        <article className="card">
          <div className="muted">数据策略</div>
          <h3>先前端框架后数据联调</h3>
        </article>
        <article className="card">
          <div className="muted">下一步</div>
          <h3>接入真实仓库、提交、Issue、PR、用户与风险数据</h3>
        </article>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3>仓库列表（待接口）</h3>
        <div className="empty">暂无仓库数据。接入后端后将在此展示可选仓库卡片。</div>
      </section>
    </div>
  );
}
