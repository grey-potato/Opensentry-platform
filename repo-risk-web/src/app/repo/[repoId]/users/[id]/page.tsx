import Link from "next/link";
import { RiskBadge } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getUserDetailPageViewModel } from "@/lib/entity-view-models";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getUserDetailPageViewModel(repoId, id, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{t.entities.users.detail}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
          <div className="hero-badge-stack">
            <RiskBadge level={model.portraitRiskLevel} locale={locale} />
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{t.entities.users.backToUsers}</Link>
          <Link href={`/repo/${repoId}/commits`}>{t.entities.users.openCommits}</Link>
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
          <h3>{t.entities.users.profile}</h3>
          <div className="detail-kv-grid">
            {model.profileStats.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <div className="overview-section-head">
            <div>
              <h3>{model.portraitTitle}</h3>
              <p className="muted">{t.entities.users.portraitDescription}</p>
            </div>
            <RiskBadge level={model.portraitRiskLevel} locale={locale} />
          </div>
          <div className="detail-kv-grid">
            {model.portraitStats.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>{t.entities.users.scoreBreakdown}</h3>
        {model.scoreBreakdown.length ? (
          <div className="detail-kv-grid">
            {model.scoreBreakdown.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">{t.entities.users.noScoreBreakdown}</div>
        )}
      </section>
    </div>
  );
}
