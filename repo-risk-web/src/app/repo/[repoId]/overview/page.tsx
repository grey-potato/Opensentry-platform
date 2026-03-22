import {
  RepoOverviewChartPlaceholder,
  RepoOverviewHero,
  RepoPreviewPanel,
  RepoSummaryStats,
} from "@/components/repo-ui";
import { getRepoOverviewViewModel } from "@/lib/repo-view-models";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const model = getRepoOverviewViewModel(repoId);

  return (
    <div className="repo-overview-shell">
      <RepoOverviewHero repoId={repoId} model={model} />

      <RepoSummaryStats items={model.summaryStats} />

      <section className="card overview-portrait-summary">
        <div className="overview-section-head">
          <div>
            <h3>Project Portrait Summary</h3>
            <p className="muted">
              Metadata and portrait metrics are now mapped through the frontend
              view model instead of page-level hardcoded placeholders.
            </p>
          </div>
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

      <RepoOverviewChartPlaceholder
        description="The chart area is stable now; only the actual time-series interface remains to be connected."
        caption="Series rendering will switch from placeholder bars to API-backed weekly points."
      />

      <section className="overview-preview-grid">
        <RepoPreviewPanel
          title="Recent Commits"
          href={`/repo/${repoId}/commits`}
          items={model.recentCommits.map((item, index) => ({
            ...item,
            href: `/repo/${repoId}/commits/commit-${index + 1}`,
          }))}
        />
        <RepoPreviewPanel
          title="Open Issues"
          href={`/repo/${repoId}/issues`}
          items={model.openIssues.map((item, index) => ({
            ...item,
            href: `/repo/${repoId}/issues/issue-${index + 1}`,
          }))}
        />
        <RepoPreviewPanel
          title="Pull Requests"
          href={`/repo/${repoId}/prs`}
          items={model.pullRequests.map((item, index) => ({
            ...item,
            href: `/repo/${repoId}/prs/pr-${index + 1}`,
          }))}
        />
      </section>
    </div>
  );
}
