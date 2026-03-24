import Link from "next/link";
import { EmptyStateCard, PaginationLink } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getCommitListPageViewModel } from "@/lib/entity-view-models";

export default async function CommitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{
    page?: string;
    page_size?: string;
    page_chain?: string;
    author_id?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const { repoId } = await params;
  const filters = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getCommitListPageViewModel(
    repoId,
    {
      page: filters.page,
      pageSize: filters.page_size,
      pageChain: filters.page_chain,
      authorId: filters.author_id,
      sort: filters.sort,
      order: filters.order,
    },
    locale
  );

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
          <input
            name="author_id"
            placeholder={t.entities.commits.filterAuthor}
            defaultValue={model.authorId}
          />
          <select name="page_size" defaultValue={String(model.pageSize)}>
            <option value="10">{locale === "en" ? "10 / page" : "10 / 页"}</option>
            <option value="20">{locale === "en" ? "20 / page" : "20 / 页"}</option>
            <option value="50">{locale === "en" ? "50 / page" : "50 / 页"}</option>
          </select>
          <select name="sort" defaultValue={model.sort}>
            <option value="sha">{t.entities.commits.sortSha}</option>
            <option value="created_at">{t.entities.commits.sortCreatedAt}</option>
          </select>
          <select name="order" defaultValue={model.order}>
            <option value="asc">{t.entities.commits.asc}</option>
            <option value="desc">{t.entities.commits.desc}</option>
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
            <article key={item.sha} className="card entity-list-card">
              <div className="entity-list-head">
                <div>
                  <Link href={item.href}>{item.title}</Link>
                  <div className="muted">{item.subtitle}</div>
                  <div className="related-user-row">
                    {item.relatedUsers.length ? (
                      item.relatedUsers.map((user) => (
                        <Link
                          key={`${item.sha}-${user.id}`}
                          href={user.href}
                          className="related-user-link"
                        >
                          <span className="muted">{user.role}</span>
                          <strong>{user.label}</strong>
                        </Link>
                      ))
                    ) : (
                      <span className="muted">{t.common.noRelatedUsers}</span>
                    )}
                  </div>
                </div>
                <span className="badge">
                  {item.portraitAvailable ? item.trustLevel : t.entities.commits.noPortrait}
                </span>
              </div>
              <div className="entity-tag-row">
                <span className="badge">{`SHA ${item.sha.slice(0, 7)}`}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyStateCard
          title={t.entities.commits.emptyTitle}
          description={t.entities.commits.emptyDescription}
        />
      )}

      <PaginationLink pagination={model.pagination} locale={locale} />
    </div>
  );
}
