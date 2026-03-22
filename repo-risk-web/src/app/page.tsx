import Link from "next/link";
import {
  HomeDiscoveryFilters,
  HomeEmptyState,
  HomeInsightCard,
  RepositoryPlaceholderCard,
} from "@/components/home-ui";
import {
  getHomePageViewModel,
  type HomeSortKey,
} from "@/lib/repo-view-models";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as HomeSortKey | undefined) ?? "stars";
  const model = getHomePageViewModel(sort);

  return (
    <div className="home-shell">
      <section className="card home-hero-card">
        <div className="home-hero-copy">
          <div className="home-kicker">Repository Explorer</div>
          <h2>Discover repositories before entering the repository workspace.</h2>
          <p className="muted">
            This page is the discovery surface for the production frontend. It
            focuses on search, indicator views, and repository card density
            before real data interfaces are integrated.
          </p>
        </div>
        <div className="home-hero-actions">
          <form
            className="home-search-panel"
            role="search"
            action="/search"
            method="get"
          >
            <label className="home-search-label" htmlFor="home-search-input">
              Global Search
            </label>
            <input
              id="home-search-input"
              name="q"
              type="search"
              placeholder="Search SHA, issue number, title, or user"
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          <div className="home-hero-note">
            <span className="badge">No API Connected Yet</span>
            <span className="muted">
              The layout stays interface-free in this stage.
            </span>
          </div>
        </div>
      </section>

      <section className="card home-filter-card">
        <div className="home-section-head">
          <div>
            <h3>Discovery Views</h3>
            <p className="muted">
              Switch the homepage by repository signal, without entering a
              repository detail page.
            </p>
          </div>
          <Link className="chip" href="/">
            Reset
          </Link>
        </div>
        <HomeDiscoveryFilters
          filters={model.filters}
        />
      </section>

      <section className="home-insight-grid">
        {model.insights.map((card) => (
          <HomeInsightCard key={card.title} {...card} />
        ))}
      </section>

      <section className="home-section-head home-section-spacing">
        <div>
          <h3>Repository List</h3>
          <p className="muted">
            Placeholder repository cards keep the final information density
            while the repository source is still pending.
          </p>
        </div>
        <span className="badge">Current View: {model.currentSort}</span>
      </section>

      <section className="repository-card-grid">
        {model.repositories.map((card) => (
          <RepositoryPlaceholderCard key={card.name} {...card} placeholder />
        ))}
      </section>

      <HomeEmptyState
        title="Data Interface Pending"
        description="Repository cards, summary cards, and discovery filters are now implemented as structured placeholders. When backend interfaces are ready, this page can switch to real repository data without redesigning the page structure."
      />
    </div>
  );
}
