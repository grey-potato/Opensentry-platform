type InsightTone = "positive" | "warning" | "critical" | "neutral";

export type InsightHeroCardItem = {
  label: string;
  value: string;
  description?: string;
  tone?: InsightTone;
  chip?: string;
};

export type MetricProgressItem = {
  label: string;
  value: string;
  description?: string;
  progress: number;
  tone?: InsightTone;
  chip?: string;
  showProgress?: boolean;
  featured?: boolean;
};

export type MetricBarChartItem = {
  label: string;
  value: string;
  description?: string;
  progress: number;
  tone?: InsightTone;
};

function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, progress));
}

export function InsightHeroCards({
  items,
  columns = 4,
  compact = false,
}: {
  items: InsightHeroCardItem[];
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
}) {
  return (
    <section className={`insight-hero-grid cols-${columns}${compact ? " compact" : ""}`}>
      {items.map((item) => (
        <article key={item.label} className={`card insight-hero-card tone-${item.tone ?? "neutral"}`}>
          <div className="insight-card-head">
            <span className="muted">{item.label}</span>
            {item.chip ? <span className="badge">{item.chip}</span> : null}
          </div>
          <h3>{item.value}</h3>
          {item.description ? <p className="muted">{item.description}</p> : null}
        </article>
      ))}
    </section>
  );
}

export function MetricProgressCard({ item }: { item: MetricProgressItem }) {
  return (
    <article
      className={`metric-progress-card tone-${item.tone ?? "neutral"}${item.showProgress === false ? " no-progress" : ""}${item.featured ? " featured" : ""}`}
    >
      <div className="metric-progress-head">
        <strong>{item.label}</strong>
        <span className={`metric-progress-value tone-${item.tone ?? "neutral"}`}>{item.value}</span>
      </div>
      {item.showProgress === false ? null : (
        <div className="metric-progress-bar">
          <span
            className={`metric-progress-fill tone-${item.tone ?? "neutral"}`}
            style={{ width: `${clampProgress(item.progress)}%` }}
          />
        </div>
      )}
      {item.description ? <p className="muted">{item.description}</p> : null}
      {item.chip ? <div className="metric-chip-row"><span className="badge">{item.chip}</span></div> : null}
    </article>
  );
}

export function DimensionSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: MetricProgressItem[];
}) {
  return (
    <article className="card insight-dimension-card">
      <div className="overview-section-head">
        <div>
          <h3>{title}</h3>
          {description ? <p className="muted">{description}</p> : null}
        </div>
      </div>
      <div className="metric-progress-grid">
        {items.map((item) => (
          <MetricProgressCard key={item.label} item={item} />
        ))}
      </div>
    </article>
  );
}

export function EvidenceTagGroup({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText?: string;
}) {
  return (
    <section className="evidence-group">
      <h4>{title}</h4>
      {items.length ? (
        <div className="entity-tag-row">
          {items.map((item) => (
            <span key={`${title}-${item}`} className="badge">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </section>
  );
}

export function MetricBarChartSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: MetricBarChartItem[];
}) {
  return (
    <section className="card insight-detail-card">
      <div className="overview-section-head">
        <div>
          <h3>{title}</h3>
          {description ? <p className="muted">{description}</p> : null}
        </div>
      </div>
      <div className="metric-iso-chart">
        <div className="metric-iso-grid" aria-hidden="true" />
        <div className="metric-iso-bars">
          {items.map((item) => (
            <article
              key={item.label}
              className={`metric-iso-item tone-${item.tone ?? "neutral"}`}
              data-tooltip={`${item.label}: ${item.value}${item.description ? ` | ${item.description}` : ""}`}
            >
              <div className={`metric-iso-value tone-${item.tone ?? "neutral"}`}>{item.value}</div>
              <div className="metric-iso-column-wrap">
                <div
                  className={`metric-iso-column tone-${item.tone ?? "neutral"}`}
                  style={{ ["--column-height" as string]: `${Math.max(12, clampProgress(item.progress))}%` }}
                >
                  <span className="metric-iso-face metric-iso-front" />
                  <span className="metric-iso-face metric-iso-side" />
                  <span className="metric-iso-face metric-iso-top" />
                </div>
              </div>
              <div className="metric-iso-label">{item.label}</div>
            </article>
          ))}
        </div>
      </div>
      <div className="metric-iso-legend">
        {items.map((item) => (
          <span key={`${item.label}-legend`} className="metric-iso-legend-item">
            <span className={`metric-iso-legend-dot tone-${item.tone ?? "neutral"}`} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
