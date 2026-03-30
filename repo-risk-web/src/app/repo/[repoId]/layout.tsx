import type { ReactNode } from "react";
import { RepoShell } from "@/components/repo-shell";
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

  return <RepoShell repoId={repoId} locale={locale}>{children}</RepoShell>;
}
