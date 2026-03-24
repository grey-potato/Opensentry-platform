import Link from "next/link";
import { EmptyStateCard, PaginationLink } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getPullRequestListPageViewModel } from "@/lib/entity-view-models";

export default async function PrsPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ page?: string; page_size?: string; page_chain?: string; state?: string }>;
}) {
  const { repoId } = await params;
  const filters = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getPullRequestListPageViewModel(repoId, {
    page: filters.page,
    pageSize: filters.page_size,
    pageChain: filters.page_chain,
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
          <select name="page_size" defaultValue={String(model.pageSize)}>
            <option value="10">{locale === "en" ? "10 / page" : "10 / 页"}</option>
            <option value="20">{locale === "en" ? "20 / page" : "20 / 页"}</option>
            <option value="50">{locale === "en" ? "50 / page" : "50 / 页"}</option>
          </select>
          <select name="state" defaultValue={model.state}>
            <option value="">{t.entities.prs.allStates}</option>
            <option value="open">{t.entities.prs.open}</option>
            <option value="closed">{t.entities.prs.closed}</option>
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
                <span className="badge">{item.stateLabel}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyStateCard
          title={t.entities.prs.emptyTitle}
          description={t.entities.prs.emptyDescription}
        />
      )}

      <PaginationLink pagination={model.pagination} locale={locale} />
    </div>
  );
}
