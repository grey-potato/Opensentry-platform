export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  return (
    <section className="card">
      <h2>全局搜索</h2>
      <p className="muted">关键词：{q || "（空）"}</p>
      <div className="empty">
        已完成搜索页面骨架。待接入后端搜索接口后，可返回仓库、Commit、Issue、PR、User 结果并支持跳转。
      </div>
    </section>
  );
}
