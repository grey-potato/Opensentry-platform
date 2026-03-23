import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getIssueDetailPageViewModel } from "@/lib/entity-view-models";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getIssueDetailPageViewModel(repoId, id, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{t.entities.issues.detail}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{t.tabs.issues}</Link>
        </div>
      </section>

      <section className="repo-summary-grid">
        {model.summaryStats.map((item) => (
          <article key={item.label} className="card repo-summary-card">
            <div className="muted">{item.label}</div>
            <h3>{item.value}</h3>
          </article>
        ))}
      </section>

      <section className="detail-two-column">
        <article className="card">
          <h3>{t.entities.issues.body}</h3>
          <pre className="detail-body">{model.body}</pre>
        </article>
        <article className="card">
          <h3>{t.entities.issues.context}</h3>
          <div className="detail-kv-grid">
            {model.projectContext.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
