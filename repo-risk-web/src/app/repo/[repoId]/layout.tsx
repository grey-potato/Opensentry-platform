import type { ReactNode } from "react";
import { RepoContextPanel, RepoTabs } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";

export default async function RepoLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();

  return (
    <div>
      <RepoTabs repoId={repoId} locale={locale} />
      <div className="repo-layout">
        <div>{children}</div>
        <RepoContextPanel repoId={repoId} locale={locale} />
      </div>
    </div>
  );
}
