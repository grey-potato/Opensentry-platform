import type { ReactNode } from "react";
import { RepoContextPanel, RepoTabs } from "@/components/repo-ui";

export default async function RepoLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return (
    <div>
      <RepoTabs repoId={repoId} />
      <div className="repo-layout">
        <div>{children}</div>
        <RepoContextPanel repoId={repoId} />
      </div>
    </div>
  );
}
