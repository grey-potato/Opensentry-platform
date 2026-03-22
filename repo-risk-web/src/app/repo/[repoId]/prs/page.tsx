import { ListPlaceholder } from "@/components/repo-ui";

export default async function PrsPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return <ListPlaceholder title="PRs" hint={`仓库：${repoId} · 列表和筛选框架已就绪。`} />;
}
