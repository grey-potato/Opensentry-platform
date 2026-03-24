import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getCommitDetailPageViewModel } from "@/lib/entity-view-models";

export default async function CommitDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getCommitDetailPageViewModel(repoId, id, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{t.entities.commits.detail}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{t.tabs.commits}</Link>
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
          <h3>{model.messageTitle}</h3>
          <pre className="detail-body">{model.messageBody}</pre>
        </article>
        <article className="card">
          <h3>{t.entities.commits.metadata}</h3>
          <div className="detail-kv-grid">
            {model.metadata.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="overview-section-head">
          <div>
            <h3>{model.portraitTitle}</h3>
            <p className="muted">{t.entities.commits.portraitDescription}</p>
          </div>
        </div>
        <div className="detail-kv-grid">
          {model.portraitStats.map((item) => (
            <div key={item.label} className="detail-kv-item">
              <span className="muted">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        {model.portraitAvailable ? (
          <>
            <div className="entity-tag-row" style={{ marginTop: 12 }}>
              {model.portraitTags.map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
            {model.portraitRules.length ? (
              <div className="detail-rule-list">
                {model.portraitRules.map((rule) => (
                  <span key={rule} className="badge">
                    {rule}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
