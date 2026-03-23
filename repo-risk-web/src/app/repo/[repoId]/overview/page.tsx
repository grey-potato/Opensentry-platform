import {
  RepoOverviewHero,
  RepoPreviewPanel,
  RepoSummaryStats,
  RepoTimelineChart,
} from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getRepoOverviewViewModel } from "@/lib/repo-view-models";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getRepoOverviewViewModel(repoId, locale);

  return (
    <div className="repo-overview-shell">
      <RepoOverviewHero repoId={repoId} model={model} locale={locale} />

      <RepoSummaryStats items={model.summaryStats} />

      <section className="card overview-portrait-summary">
        <div className="overview-section-head">
          <div>
            <h3>{t.repo.portraitSummary}</h3>
            <p className="muted">{t.repo.portraitSummaryDescription}</p>
          </div>
          <span className="badge">{model.windowLabel}</span>
        </div>
        <div className="overview-portrait-grid">
          {model.portraitSummary.map((item) => (
            <article key={item.label} className="overview-portrait-card">
              <div className="muted">{item.label}</div>
              <h4>{item.value}</h4>
            </article>
          ))}
        </div>
      </section>

      <RepoTimelineChart
        title={t.repo.historyTitle}
        description={t.repo.historyDescription}
        caption={model.windowLabel}
        points={model.timeline}
        locale={locale}
      />

      <section className="overview-preview-grid">
        <RepoPreviewPanel
          title={t.repo.recentCommits}
          href={`/repo/${repoId}/commits`}
          items={model.recentCommits}
          locale={locale}
        />
        <RepoPreviewPanel
          title={t.repo.openIssues}
          href={`/repo/${repoId}/issues`}
          items={model.openIssues}
          locale={locale}
        />
        <RepoPreviewPanel
          title={t.repo.pullRequests}
          href={`/repo/${repoId}/prs`}
          items={model.pullRequests}
          locale={locale}
        />
      </section>
    </div>
  );
}
