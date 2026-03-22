import Link from "next/link";

type DiscoveryFilter = {
  href: string;
  label: string;
  selected?: boolean;
};

type InsightCardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
};

type RepositoryCardProps = {
  name: string;
  description: string;
  href: string;
  language: string;
  license: string;
  stars: string;
  forks: string;
  issues: string;
  prs: string;
  contributors: string;
  tags: string[];
  placeholder?: boolean;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

export function HomeDiscoveryFilters({
  filters,
}: {
  filters: DiscoveryFilter[];
}) {
  return (
    <div className="home-filter-row" aria-label="Repository sort and discovery filters">
      {filters.map((filter) => (
        <Link
          key={filter.label}
          className={`chip ${filter.selected ? "selected" : ""}`}
          href={filter.href}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

export function HomeInsightCard({
  title,
  value,
  description,
  href,
}: InsightCardProps) {
  return (
    <article className="card home-insight-card">
      <div className="muted">{title}</div>
      <h3>{value}</h3>
      <p className="muted">{description}</p>
      <div className="inline-links">
        <Link href={href}>View Repository</Link>
      </div>
    </article>
  );
}

export function RepositoryPlaceholderCard({
  name,
  description,
  href,
  language,
  license,
  stars,
  forks,
  issues,
  prs,
  contributors,
  tags,
  placeholder = false,
}: RepositoryCardProps) {
  return (
    <article className={`card repository-card ${placeholder ? "is-placeholder" : ""}`}>
      <div className="repository-card-head">
        <h3>
          <Link href={href}>{name}</Link>
        </h3>
        {placeholder ? <span className="badge">Placeholder</span> : null}
      </div>
      <p className="muted repository-card-description">{description}</p>
      <div className="repository-pill-row">
        <span>{language}</span>
        <span>{license}</span>
      </div>
      <div className="repository-stat-grid">
        <div>
          <span className="muted">Stars</span>
          <strong>{stars}</strong>
        </div>
        <div>
          <span className="muted">Forks</span>
          <strong>{forks}</strong>
        </div>
        <div>
          <span className="muted">Issues</span>
          <strong>{issues}</strong>
        </div>
        <div>
          <span className="muted">PRs</span>
          <strong>{prs}</strong>
        </div>
        <div>
          <span className="muted">Contributors</span>
          <strong>{contributors}</strong>
        </div>
      </div>
      <div className="repository-tag-row">
        {tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export function HomeEmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="card home-empty-card">
      <h3>{title}</h3>
      <div className="empty">{description}</div>
    </section>
  );
}
