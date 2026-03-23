import { RiskBadge } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getRepoRiskViewModel } from "@/lib/repo-view-models";

export default async function RiskPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getRepoRiskViewModel(repoId, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{t.repo.repoPortrait}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.description}</p>
          </div>
          <div className="hero-badge-stack">
            <RiskBadge level={model.riskLevel} locale={locale} />
          </div>
        </div>
        <div className="context-tags">
          {model.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
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

      <section className="card">
        <div className="overview-section-head">
          <div>
            <h3>{t.repo.snapshotMetrics}</h3>
            <p className="muted">{t.repo.snapshotMetricsDescription}</p>
          </div>
        </div>
        <div className="risk-snapshot-grid">
          {model.snapshots.map((item) => (
            <article key={item.label} className="risk-snapshot-card">
              <div className="risk-snapshot-head">
                <span className="muted">{item.label}</span>
                <RiskBadge level={item.level} locale={locale} />
              </div>
              <h4>{item.value}</h4>
            </article>
          ))}
        </div>
      </section>

      <section className="risk-dimension-grid">
        {model.dimensions.map((dimension) => (
          <article key={dimension.title} className="card risk-dimension-card">
            <div className="overview-section-head">
              <div>
                <h3>{dimension.title}</h3>
                <p className="muted">{dimension.description}</p>
              </div>
            </div>
            <div className="risk-metric-list">
              {dimension.metrics.map((metric) => (
                <div key={metric.label} className="risk-metric-item">
                  <div className="risk-metric-head">
                    <strong>{metric.label}</strong>
                    <RiskBadge level={metric.level} locale={locale} />
                  </div>
                  <div className="risk-metric-value">{metric.value}</div>
                  <p className="muted">{metric.note}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
