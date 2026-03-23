import Link from "next/link";
import { EmptyStateCard, PaginationLink, RiskBadge } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getIssueListPageViewModel } from "@/lib/entity-view-models";

export default async function IssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ cursor?: string; state?: string }>;
}) {
  const { repoId } = await params;
  const filters = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getIssueListPageViewModel(repoId, {
    cursor: filters.cursor,
    state: filters.state,
  }, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card">
        <div className="overview-section-head">
          <div>
            <h2>{model.title}</h2>
            <p className="muted">{model.subtitle}</p>
          </div>
        </div>
        <form className="entity-filter-form" method="get">
          <select name="state" defaultValue={model.state}>
            <option value="">{t.entities.issues.allStates}</option>
            <option value="open">{t.entities.issues.open}</option>
            <option value="closed">{t.entities.issues.closed}</option>
          </select>
          <button type="submit">{t.common.apply}</button>
        </form>
      </section>

      <section className="repo-summary-grid">
        {model.stats.map((item) => (
          <article key={item.label} className="card repo-summary-card">
            <div className="muted">{item.label}</div>
            <h3>{item.value}</h3>
          </article>
        ))}
      </section>

      {model.items.length ? (
        <section className="entity-list-grid">
          {model.items.map((item) => (
            <article key={item.href} className="card entity-list-card">
              <div className="entity-list-head">
                <div>
                  <Link href={item.href}>{item.title}</Link>
                  <div className="muted">{item.subtitle}</div>
                  <div className="related-user-row">
                    {item.relatedUsers.length ? (
                      item.relatedUsers.map((user) => (
                        <Link key={`${item.href}-${user.id}`} href={user.href} className="related-user-link">
                          <span className="muted">{user.role}</span>
                          <strong>{user.label}</strong>
                        </Link>
                      ))
                    ) : (
                      <span className="muted">{t.common.noRelatedUsers}</span>
                    )}
                  </div>
                </div>
                <RiskBadge level={item.level} locale={locale} />
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyStateCard
          title={t.entities.issues.emptyTitle}
          description={t.entities.issues.emptyDescription}
        />
      )}

      <PaginationLink nextHref={model.pagination.nextHref} locale={locale} />
    </div>
  );
}
