import { DetailPlaceholder } from "@/components/repo-ui";

export default async function CommitDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;

  return (
    <DetailPlaceholder
      title={`Commit 详情：${id}（仓库 ${repoId}）`}
      backHref={`/repo/${repoId}/commits`}
    />
  );
}
