import Link from "next/link";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;

  return (
    <section className="card">
      <h2>用户详情：{id}</h2>
      <p className="muted">仓库：{repoId}</p>
      <p className="muted">用户画像、行为统计和风险标签区域已完成占位，待接口联调。</p>
      <div className="inline-links">
        <Link href={`/repo/${repoId}/commits`}>查看该用户 Commits</Link>
        <Link href={`/repo/${repoId}/issues`}>查看该用户 Issues</Link>
        <Link href={`/repo/${repoId}/prs`}>查看该用户 PRs</Link>
      </div>
    </section>
  );
}
