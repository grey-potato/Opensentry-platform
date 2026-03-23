import Link from "next/link";
import { EmptyStateCard, PaginationLink, RiskBadge } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getUserListPageViewModel } from "@/lib/entity-view-models";

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ cursor?: string; role?: string }>;
}) {
  const { repoId } = await params;
  const filters = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getUserListPageViewModel(repoId, {
    cursor: filters.cursor,
    role: filters.role,
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
          <input name="role" placeholder={t.entities.users.filterRole} defaultValue={model.role} />
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
                </div>
                <RiskBadge level={item.portraitLevel} locale={locale} />
              </div>
              <div className="entity-tag-row">
                <span className="badge">{item.portraitLabel}</span>
                {item.roles.map((role) => (
                  <span key={role} className="badge">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyStateCard
          title={t.entities.users.emptyTitle}
          description={t.entities.users.emptyDescription}
        />
      )}

      <PaginationLink nextHref={model.pagination.nextHref} locale={locale} />
    </div>
  );
}
