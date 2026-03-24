import { RiskBadge } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getRepoRiskViewModel, type RiskLevel } from "@/lib/repo-view-models";

function getTone(level: RiskLevel) {
  switch (level) {
    case "low":
      return "positive";
    case "high":
      return "critical";
    default:
      return "warning";
  }
}

function parseNumericValue(value: string) {
  const normalized = value.replace(/,/g, "");
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildSnapshotProgress(label: string, value: string) {
  const number = parseNumericValue(value);

  if (/commit|提交/i.test(label)) {
    return Math.max(8, Math.min(100, number * 8));
  }

  if (/ratio|占比/i.test(label)) {
    return Math.max(0, Math.min(100, number));
  }

  if (/collab|协作/i.test(label)) {
    return Math.max(8, Math.min(100, number * 8));
  }

  if (/backlog|积压/i.test(label)) {
    return Math.max(8, Math.min(100, number * 6));
  }

  if (/response|首响/i.test(label)) {
    return Math.max(8, Math.min(100, number * 3));
  }

  if (/delta|增量/i.test(label)) {
    return Math.max(0, Math.min(100, 50 + Math.max(-50, Math.min(50, number))));
  }

  return Math.max(12, Math.min(100, number));
}

function getSnapshotSummary(label: string, locale: "zh-CN" | "en") {
  if (/commit|提交/i.test(label)) {
    return locale === "en" ? "Weekly contribution intensity" : "反映最近一段时间的提交活跃节奏";
  }

  if (/ratio|占比/i.test(label)) {
    return locale === "en" ? "How steadily the project stays active" : "反映项目在观测窗口内保持活跃的稳定程度";
  }

  if (/collab|协作/i.test(label)) {
    return locale === "en" ? "Collaboration scale and involvement" : "反映当前协作参与规模";
  }

  if (/backlog|积压/i.test(label)) {
    return locale === "en" ? "Open pull requests still waiting" : "反映当前仍在排队等待处理的 PR 数量";
  }

  if (/response|首响/i.test(label)) {
    return locale === "en" ? "Typical first response speed" : "反映 Issue 获得首次响应的典型速度";
  }

  if (/delta|增量/i.test(label)) {
    return locale === "en" ? "Recent movement in the observation window" : "反映最近观测窗口内的变化趋势";
  }

  return locale === "en" ? "Latest portrait snapshot" : "来自最新项目画像快照";
}

function getMetricProgress(label: string, value: string) {
  return buildSnapshotProgress(label, value);
}

export default async function RiskPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getRepoRiskViewModel(repoId, locale);

  const heroCards = [
    ...model.summaryStats,
    ...model.snapshots.slice(0, 4).map((item) => ({
      label: item.label,
      value: item.value,
      note: getSnapshotSummary(item.label, locale),
      tone: getTone(item.level),
    })),
  ].slice(0, 8);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{t.repo.repoPortrait}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.description}</p>
          </div>
          <RiskBadge level={model.riskLevel} locale={locale} />
        </div>
        <div className="context-tags">
          {model.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="risk-hero-grid">
        {heroCards.map((item) => (
          <article
            key={item.label}
            className={`card risk-hero-card ${"tone" in item ? `tone-${item.tone}` : ""}`}
          >
            <span className="muted">{item.label}</span>
            <h3>{item.value}</h3>
            {"note" in item && item.note ? <p className="muted">{item.note}</p> : null}
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
          {model.snapshots.map((item) => {
            const progress = buildSnapshotProgress(item.label, item.value);
            const tone = getTone(item.level);

            return (
              <article key={item.label} className={`risk-snapshot-card tone-${tone}`}>
                <div className="risk-snapshot-head">
                  <span className="muted">{item.label}</span>
                  <RiskBadge level={item.level} locale={locale} />
                </div>
                <h4>{item.value}</h4>
                <div className="risk-meter">
                  <span
                    className={`risk-meter-fill tone-${tone}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="muted">{getSnapshotSummary(item.label, locale)}</p>
              </article>
            );
          })}
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
              {dimension.metrics.map((metric) => {
                const progress = getMetricProgress(metric.label, metric.value);
                const tone = getTone(metric.level);

                return (
                  <div key={metric.label} className={`risk-metric-item tone-${tone}`}>
                    <div className="risk-metric-head">
                      <strong>{metric.label}</strong>
                      <span className={`risk-inline-value tone-${tone}`}>{metric.value}</span>
                    </div>
                    <div className="risk-meter compact">
                      <span
                        className={`risk-meter-fill tone-${tone}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="muted">{metric.note}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
