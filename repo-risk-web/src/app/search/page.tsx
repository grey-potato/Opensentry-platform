import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyStateCard } from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getSearchPageViewModel } from "@/lib/entity-view-models";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getSearchPageViewModel(params.q ?? "", locale);

  if (model.redirectHref) {
    redirect(model.redirectHref);
  }

  return (
    <div className="repo-overview-shell">
      <section className="card">
        <h2>{t.entities.search.title}</h2>
        <p className="muted">
          {locale === "en" ? "Query" : "查询"}: {model.query || t.entities.search.queryEmpty} /{" "}
          {locale === "en" ? "Scope" : "范围"}: {t.entities.search.scope}
        </p>
      </section>

      {model.results.length ? (
        <section className="entity-list-grid">
          {model.results.map((item) => (
            <article key={item.href} className="card entity-list-card">
              <div className="entity-list-head">
                <div>
                  <Link href={item.href}>{item.title}</Link>
                  <div className="muted">{item.subtitle}</div>
                </div>
              </div>
              <div className="entity-tag-row">
                <span className="badge">
                  {item.kind === "user"
                    ? locale === "en"
                      ? "User"
                      : "用户"
                    : locale === "en"
                      ? "Repo"
                      : "仓库"}
                </span>
                {item.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyStateCard
          title={model.query ? t.entities.search.noResults : t.entities.search.ready}
          description={
            model.query
              ? model.usingLiveData
                ? t.entities.search.noResultsDescription
                : t.entities.search.apiFailed
              : t.entities.search.readyDescription
          }
        />
      )}
    </div>
  );
}
