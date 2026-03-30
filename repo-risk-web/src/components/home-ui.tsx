import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/ui-copy";

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
};

type EmptyStateProps = {
  title: string;
  description: string;
};

export function HomeDiscoveryFilters({
  filters,
  locale,
}: {
  filters: DiscoveryFilter[];
  locale: Locale;
}) {
  return (
    <div
      className="home-filter-row"
      aria-label={locale === "en" ? "Repository discovery filters" : "仓库发现筛选"}
    >
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
  locale,
}: InsightCardProps & { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <article className="card home-insight-card">
      <div className="muted">{title}</div>
      <h3>{value}</h3>
      <p className="muted">{description}</p>
      <Link className="home-insight-button" href={href}>
        {t.common.viewAll}
      </Link>
    </article>
  );
}

export function RepositoryCard({
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
  locale,
}: RepositoryCardProps & { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <article className="card repository-card">
      <div className="repository-card-head">
        <h3>
          <Link href={href}>{name}</Link>
        </h3>
      </div>
      <p className="muted repository-card-description">{description}</p>
      <div className="repository-pill-row">
        <span>{language}</span>
        <span>{license}</span>
      </div>
      <div className="repository-stat-grid">
        <div>
          <span className="muted">{t.home.filters.stars}</span>
          <strong>{stars}</strong>
        </div>
        <div>
          <span className="muted">{locale === "en" ? "Forks" : "Forks"}</span>
          <strong>{forks}</strong>
        </div>
        <div>
          <span className="muted">{locale === "en" ? "Issues" : "Issues"}</span>
          <strong>{issues}</strong>
        </div>
        <div>
          <span className="muted">PR</span>
          <strong>{prs}</strong>
        </div>
        <div>
          <span className="muted">{t.common.recordedUsers}</span>
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
