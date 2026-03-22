import { ListPlaceholder } from "@/components/repo-ui";

export default async function CommitsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return <ListPlaceholder title="Commits" hint={`仓库：${repoId} · 列表和筛选框架已就绪。`} />;
}
