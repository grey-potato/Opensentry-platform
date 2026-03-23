import Link from "next/link";
import {
  HomeDiscoveryFilters,
  HomeEmptyState,
  HomeInsightCard,
  RepositoryCard,
} from "@/components/home-ui";
import {
  getHomePageViewModel,
  type HomeSortKey,
} from "@/lib/repo-view-models";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as HomeSortKey | undefined) ?? "stars";
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getHomePageViewModel(sort, locale);

  return (
    <div className="home-shell">
      <section className="card home-hero-card">
        <div className="home-hero-copy">
          <div className="home-kicker">{t.home.kicker}</div>
          <h2>{t.home.title}</h2>
          <p className="muted">{t.home.description}</p>
        </div>
        <div className="home-hero-actions">
          <form
            className="home-search-panel"
            role="search"
            action="/search"
            method="get"
          >
            <label className="home-search-label" htmlFor="home-search-input">
              {t.home.searchLabel}
            </label>
            <input
              id="home-search-input"
              name="q"
              type="search"
              placeholder={t.layout.searchPlaceholder}
              autoComplete="off"
            />
            <button type="submit">{t.layout.searchButton}</button>
          </form>
          <div className="home-hero-note">
            <span className="badge">
              {model.usingLiveData ? t.home.liveBadge : t.home.apiErrorBadge}
            </span>
            <span className="muted">
              {model.usingLiveData
                ? t.home.liveNote
                : t.home.apiErrorNote}
            </span>
          </div>
        </div>
      </section>

      <section className="card home-filter-card">
        <div className="home-section-head">
          <div>
            <h3>{t.home.filterTitle}</h3>
            <p className="muted">{t.home.filterDescription}</p>
          </div>
          <Link className="chip" href="/">
            {t.common.reset}
          </Link>
        </div>
        <HomeDiscoveryFilters
          filters={model.filters}
          locale={locale}
        />
      </section>

      <section className="home-insight-grid">
        {model.insights.map((card) => (
          <HomeInsightCard key={card.title} {...card} locale={locale} />
        ))}
      </section>

      <section className="home-section-head home-section-spacing">
        <div>
          <h3>{t.home.repoListTitle}</h3>
          <p className="muted">{t.home.repoListDescription}</p>
        </div>
        <span className="badge">
          {t.common.currentView}: {model.filters.find((item) => item.selected)?.label ?? model.currentSort}
        </span>
      </section>

      <section className="repository-card-grid">
        {model.repositories.map((card) => (
          <RepositoryCard
            key={card.name}
            {...card}
            locale={locale}
          />
        ))}
      </section>

      <HomeEmptyState
        title={model.usingLiveData ? t.home.currentScopeTitle : t.home.apiErrorTitle}
        description={
          model.usingLiveData
            ? t.home.currentScopeDescription
            : model.errorMessage
              ? `${t.home.apiErrorDescription} ${model.errorMessage}`
              : t.home.apiErrorDescription
        }
      />
    </div>
  );
}
