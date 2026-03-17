const navPages = [
  ["home", "Home"],
  ["overview", "Overview"],
  ["commits", "Commits"],
  ["issues", "Issues"],
  ["prs", "PRs"],
  ["users", "Users"],
  ["risk", "Risk"]
];

const app = document.getElementById("app");
const nav = document.getElementById("main-nav");
const searchForm = document.getElementById("global-search-form");
const searchInput = document.getElementById("global-search-input");
const brandSubtitle = document.querySelector(".brand p");

function getQuery() {
  const p = new URLSearchParams(window.location.search);
  return {
    page: p.get("page") || "home",
    repo: p.get("repo") || "",
    id: p.get("id") || "",
    user: p.get("user") || "",
    q: p.get("q") || "",
    sort: p.get("sort") || "stars"
  };
}

function link(page, query, extra = {}, options = {}) {
  const keepRepo = options.keepRepo !== false;
  const p = new URLSearchParams({ page });
  if (keepRepo && query.repo) {
    p.set("repo", query.repo);
  }
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      p.set(k, String(v));
    }
  });
  return `?${p.toString()}`;
}

function getRepoById(repoId) {
  return window.DEMO_DATA.repos.find((r) => r.id === repoId);
}

function userById(repo, userId) {
  return repo.users.find((u) => u.id === userId);
}

function riskBadge(level) {
  return `<span class="badge ${level}">${level.toUpperCase()}</span>`;
}

function trendTag(trend) {
  if (trend === "up") return "风险上升";
  if (trend === "down") return "风险下降";
  return "风险平稳";
}

function cardStat(title, val, sub) {
  return `
    <section class="card">
      <div class="muted">${title}</div>
      <div class="stat">${val}</div>
      <div class="muted">${sub || ""}</div>
    </section>
  `;
}

function getCurrentIsoWeekLabel() {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function getRepoMetadata(repo) {
  const fallbackByRepo = {
    "repo-opensentry-platform": { language: "TypeScript", defaultBranch: "main", firstSeen: "2024-08", lastSync: "2026-03-17", dataWindow: "12 months" },
    "repo-cloudshield-core": { language: "Go", defaultBranch: "main", firstSeen: "2024-05", lastSync: "2026-03-17", dataWindow: "12 months" },
    "repo-auditkit-web": { language: "TypeScript", defaultBranch: "release", firstSeen: "2024-09", lastSync: "2026-03-17", dataWindow: "12 months" },
    "repo-gatekeeper-engine": { language: "Rust", defaultBranch: "main", firstSeen: "2024-01", lastSync: "2026-03-17", dataWindow: "12 months" }
  };
  return fallbackByRepo[repo.id] || {
    language: "Unknown",
    defaultBranch: "main",
    firstSeen: "2024-01",
    lastSync: "2026-03-17",
    dataWindow: "12 months"
  };
}

function buildWeeklySeries(repo) {
  const labels = ["W-7", "W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "W0"];
  const trendShift = repo.trend === "up" ? 1 : repo.trend === "down" ? -1 : 0;
  const baseCommits = Math.max(4, Math.round(repo.stars / 700));
  const baseIssues = Math.max(2, Math.round(repo.openIssues / 5));
  const basePrsMerged = Math.max(1, Math.round(repo.openPrs / 4));

  return labels.map((label, idx) => {
    const center = idx - 3.5;
    const commitWave = Math.round(Math.sin((idx + repo.seed) * 0.9) * 2);
    const issueWave = Math.round(Math.cos((idx + repo.seed) * 0.8) * 1.6);
    const prWave = Math.round(Math.sin((idx + repo.seed + 1) * 0.7) * 1.2);
    const commits = clamp(baseCommits + trendShift * Math.round(center / 1.3) + commitWave, 1, 40);
    const openedIssues = clamp(baseIssues + Math.round(center / 3) + issueWave, 0, 30);
    const mergedPrs = clamp(basePrsMerged + trendShift * Math.round(center / 2.2) + prWave, 0, 25);
    const activeContributors = clamp(repo.contributors + Math.round(Math.sin((idx + 2) * 0.8) * 2), 1, 100);
    return { label, commits, openedIssues, mergedPrs, activeContributors };
  });
}

function seriesPath(series, field, w, h, min, max) {
  const step = w / (series.length - 1);
  return series
    .map((point, idx) => {
      const value = point[field];
      const x = idx * step;
      const y = h - ((value - min) / (max - min || 1)) * h;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function renderWeeklyChart(repo) {
  const series = buildWeeklySeries(repo);
  const chartWidth = 620;
  const chartHeight = 170;
  const maxY = Math.max(
    ...series.map((item) => Math.max(item.commits, item.openedIssues, item.mergedPrs, item.activeContributors)),
    6
  );
  const commitPath = seriesPath(series, "commits", chartWidth, chartHeight, 0, maxY);
  const issuePath = seriesPath(series, "openedIssues", chartWidth, chartHeight, 0, maxY);
  const prPath = seriesPath(series, "mergedPrs", chartWidth, chartHeight, 0, maxY);
  const contributorPath = seriesPath(series, "activeContributors", chartWidth, chartHeight, 0, maxY);
  const latest = series[series.length - 1];

  return `
    <section class="card" style="margin-top: 12px;">
      <h3>周级时序图（活跃度与流转）</h3>
      <p class="muted">展示最近 8 周趋势：提交数、新开 Issue、合并 PR、活跃贡献者。</p>
      <div class="timeline-legend">
        <span><i class="dot commit"></i>提交数</span>
        <span><i class="dot issue"></i>新开 Issue</span>
        <span><i class="dot pr"></i>合并 PR</span>
        <span><i class="dot user"></i>活跃贡献者</span>
      </div>
      <div class="timeline-wrap">
        <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="周级趋势图">
          <path d="${commitPath}" class="line-commit" />
          <path d="${issuePath}" class="line-issue" />
          <path d="${prPath}" class="line-pr" />
          <path d="${contributorPath}" class="line-user" />
        </svg>
      </div>
      <div class="week-labels">
        ${series.map((item) => `<span>${item.label}</span>`).join("")}
      </div>
      <div class="metric-row muted">最新周：提交 ${latest.commits} · 新开 Issue ${latest.openedIssues} · 合并 PR ${latest.mergedPrs} · 活跃贡献者 ${latest.activeContributors}</div>
    </section>
  `;
}

function renderNav(activePage, query, repo) {
  const pages = repo ? navPages : [["home", "Home"]];
  nav.innerHTML = pages
    .map(([id, name]) => {
      const active = id === activePage ? "active" : "";
      return `<a class="${active}" href="${link(id, query)}">${name}</a>`;
    })
    .join("");
}

function getHomeInsights(repos) {
  const insightRows = repos.map((repo) => {
    const weekly = buildWeeklySeries(repo);
    const latest = weekly[weekly.length - 1];
    const prev = weekly[weekly.length - 2] || latest;
    const newCommits = latest.commits;
    const newIssues = latest.openedIssues;
    const pendingReviewPrs = Math.max(0, repo.openPrs - latest.mergedPrs);
    const contributorRise = latest.activeContributors - prev.activeContributors;
    return { repo, latest, prev, newCommits, newIssues, pendingReviewPrs, contributorRise };
  });

  const highestNewCommits = [...insightRows].sort((a, b) => b.newCommits - a.newCommits)[0];
  const highestNewIssues = [...insightRows].sort((a, b) => b.newIssues - a.newIssues)[0];
  const highestPendingReviewPrs = [...insightRows].sort((a, b) => b.pendingReviewPrs - a.pendingReviewPrs)[0];
  const highestContributorRise = [...insightRows].sort((a, b) => b.contributorRise - a.contributorRise)[0];

  return { highestNewCommits, highestNewIssues, highestPendingReviewPrs, highestContributorRise };
}

function renderHome(query) {
  const searchText = query.q.trim().toLowerCase();
  const weekLabel = getCurrentIsoWeekLabel();
  let repos = [...window.DEMO_DATA.repos];

  if (query.sort === "random") {
    repos.sort((a, b) => a.seed - b.seed);
  } else {
    repos.sort((a, b) => b.stars - a.stars);
  }

  if (searchText) {
    repos = repos.filter((r) => {
      return r.fullName.toLowerCase().includes(searchText) || r.description.toLowerCase().includes(searchText);
    });
  }

  const insights = repos.length ? getHomeInsights(repos) : null;

  function actionCard(title, value, desc, href) {
    return `
      <section class="card">
        <div class="muted">${title}</div>
        <div class="action-title">${value}</div>
        <div class="muted">${desc}</div>
        <div class="inline-links"><a href="${href}">查看详情</a></div>
      </section>
    `;
  }

  return `
    <section class="card">
      <h2>仓库总览入口</h2>
      <p class="muted">首页只做“选仓库”的总览。点击任意仓库后，进入该仓库的 Overview/Commits/Issues/PRs/Users/Risk 视图。</p>
      <div class="toolbar">
        <a class="chip ${query.sort === "stars" ? "selected" : ""}" href="${link("home", query, { sort: "stars", q: query.q }, { keepRepo: false })}">按 Star 排序</a>
        <a class="chip ${query.sort === "random" ? "selected" : ""}" href="${link("home", query, { sort: "random", q: query.q }, { keepRepo: false })}">随机探索</a>
      </div>
    </section>

    <section class="grid" style="margin-top: 12px;">
      ${
        insights
          ? actionCard(
              "本周新增 Commit 最多",
              insights.highestNewCommits.repo.fullName,
              `${weekLabel} 新增 Commit ${insights.highestNewCommits.newCommits}`,
              link("commits", query, { repo: insights.highestNewCommits.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "本周新增 Issue 最多",
              insights.highestNewIssues.repo.fullName,
              `${weekLabel} 新增 Issue ${insights.highestNewIssues.newIssues}`,
              link("issues", query, { repo: insights.highestNewIssues.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "待评审 PR 最多",
              insights.highestPendingReviewPrs.repo.fullName,
              `${weekLabel} 待评审 PR ${insights.highestPendingReviewPrs.pendingReviewPrs}`,
              link("prs", query, { repo: insights.highestPendingReviewPrs.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "贡献活跃上升",
              insights.highestContributorRise.repo.fullName,
              `${weekLabel} 活跃贡献者周增 ${insights.highestContributorRise.contributorRise >= 0 ? "+" : ""}${insights.highestContributorRise.contributorRise}`,
              link("users", query, { repo: insights.highestContributorRise.repo.id }, { keepRepo: false })
            )
          : ""
      }
    </section>

    <section class="repo-grid" style="margin-top: 12px;">
      ${
        repos.length
          ? repos
              .map((repo) => {
                return `
                  <article class="repo-card">
                    <h3><a href="${link("overview", query, { repo: repo.id }, { keepRepo: false })}">${repo.fullName}</a></h3>
                    <p class="muted">${repo.description}</p>
                    <div class="metric-row muted">★ ${repo.stars} · Fork ${repo.forks} · ${repo.license}</div>
                    <div class="metric-row">
                      <span class="muted">Issue ${repo.openIssues} · PR ${repo.openPrs} · Contributors ${repo.contributors}</span>
                    </div>
                  </article>
                `;
              })
              .join("")
          : `<div class="empty">没有匹配的仓库，请换个关键词。</div>`
      }
    </section>
  `;
}

function renderRepoNotSelected(query) {
  return `
    <section class="empty">
      你还没有选择仓库。请先回到
      <a href="${link("home", query, {}, { keepRepo: false })}">首页仓库总览</a>
      选择一个仓库。
    </section>
  `;
}

function renderOverview(repo, query) {
  const metadata = getRepoMetadata(repo);
  return `
    <section class="card">
      <h2>${repo.fullName}</h2>
      <p class="muted">${repo.description}</p>
      <div class="inline-links">
        <a href="${link("home", query, {}, { keepRepo: false })}">返回仓库总览</a>
      </div>
    </section>

    <section class="grid" style="margin-top: 12px;">
      ${cardStat("License", repo.license, "仓库许可")}
      ${cardStat("Contributors", repo.contributors, "活跃贡献者")}
      ${cardStat("Stars", repo.stars, "仓库关注度")}
      ${cardStat("Open Issues / PRs", `${repo.openIssues} / ${repo.openPrs}`, "待处理工作量")}
    </section>

    <section class="card" style="margin-top: 12px;">
      <h3>Metadata</h3>
      <div class="meta-grid">
        <div><span class="muted">Repository</span><strong>${repo.fullName}</strong></div>
        <div><span class="muted">Default Branch</span><strong>${metadata.defaultBranch}</strong></div>
        <div><span class="muted">Primary Language</span><strong>${metadata.language}</strong></div>
        <div><span class="muted">License</span><strong>${repo.license}</strong></div>
        <div><span class="muted">First Seen</span><strong>${metadata.firstSeen}</strong></div>
        <div><span class="muted">Last Sync</span><strong>${metadata.lastSync}</strong></div>
        <div><span class="muted">Contributors</span><strong>${repo.contributors}</strong></div>
        <div><span class="muted">Data Window</span><strong>${metadata.dataWindow}</strong></div>
      </div>
    </section>

    ${renderWeeklyChart(repo)}

    <section class="card" style="margin-top: 12px;">
      <h3>快捷跳转</h3>
      <div class="inline-links">
        <a href="${link("commits", query)}">Commits</a>
        <a href="${link("issues", query)}">Issues</a>
        <a href="${link("prs", query)}">PRs</a>
        <a href="${link("users", query)}">Users</a>
      </div>
    </section>
  `;
}

function renderEntityList(title, rows, type, query, repo) {
  const filtered = rows.filter((r) => {
    if (!query.user) return true;
    return r.userId === query.user;
  });

  return `
    <section class="card">
      <h2>${title}</h2>
      <p class="muted">当前仓库：${repo.fullName}</p>
      ${query.user ? `<p class="muted">当前按用户过滤：${userById(repo, query.user)?.name || query.user}</p>` : ""}
      <div class="list">
        ${
          filtered.length
            ? filtered
                .map((row) => {
                  const u = userById(repo, row.userId);
                  const idText = row.sha || `#${row.number}`;
                  return `
                    <div class="item">
                      <div>
                        <a href="${link(`${type}-detail`, query, { id: row.id })}">${row.title}</a>
                        <div class="muted">${idText} · by <a href="${link("user-detail", query, { id: u.id })}">${u.name}</a></div>
                      </div>
                      ${riskBadge(row.risk)}
                    </div>
                  `;
                })
                .join("")
            : `<div class="empty">暂无数据</div>`
        }
      </div>
    </section>
  `;
}

function renderDetail(type, id, query, repo) {
  const m = {
    commit: repo.commits,
    issue: repo.issues,
    pr: repo.prs
  };
  const row = m[type].find((x) => x.id === id);
  if (!row) return `<section class="empty">未找到详情</section>`;
  const u = userById(repo, row.userId);

  return `
    <section class="card">
      <h2>${row.title}</h2>
      <div class="muted">${repo.fullName} · ${row.sha || `#${row.number}`}</div>
      <p>${riskBadge(row.risk)} 此处故意不展示 diff，仅展示元数据与风险结果。</p>
      <div class="inline-links">
        <a href="${link("user-detail", query, { id: u.id })}">查看用户 ${u.name}</a>
        <a href="${link(type === "commit" ? "commits" : `${type}s`, query)}">返回列表</a>
      </div>
    </section>
  `;
}

function renderUsers(repo, query) {
  return `
    <section class="card">
      <h2>Users / Contributors</h2>
      <p class="muted">当前仓库：${repo.fullName}</p>
      <div class="list">
      ${repo.users
        .map((u) => {
          return `
            <div class="item">
              <div>
                <a href="${link("user-detail", query, { id: u.id })}">${u.name}</a>
                <div class="muted">${u.role}</div>
              </div>
              ${riskBadge(u.risk)}
            </div>
          `;
        })
        .join("")}
      </div>
    </section>
  `;
}

function renderUserDetail(repo, query, id) {
  const u = userById(repo, id);
  if (!u) return `<section class="empty">未找到用户</section>`;

  return `
    <section class="card">
      <h2>${u.name}</h2>
      <p class="muted">${repo.fullName} · ${u.role} · ${riskBadge(u.risk)}</p>
      <h4>按该用户跳转过滤</h4>
      <div class="inline-links">
        <a href="${link("commits", query, { user: u.id })}">查看该用户 Commits</a>
        <a href="${link("issues", query, { user: u.id })}">查看该用户 Issues</a>
        <a href="${link("prs", query, { user: u.id })}">查看该用户 PRs</a>
      </div>
    </section>
  `;
}

function renderRisk(repo, query) {
  const entities = [
    ...repo.commits.map((x) => ({ ...x, t: "commit" })),
    ...repo.issues.map((x) => ({ ...x, t: "issue" })),
    ...repo.prs.map((x) => ({ ...x, t: "pr" }))
  ];

  return `
    <section class="grid">
      ${cardStat("Risk Score", repo.riskScore, "仓库风险总分")}
      ${cardStat("Level", repo.riskLevel.toUpperCase(), "风险等级")}
      ${cardStat("Tags", repo.riskTags.length, repo.riskTags.join(", "))}
      ${cardStat("Entity Count", entities.length, "风险实体数量")}
    </section>

    <section class="card" style="margin-top: 12px;">
      <h3>风险实体列表</h3>
      <div class="list">
        ${entities
          .map((e) => {
            const suffix = e.t === "commit" ? "commit-detail" : `${e.t}-detail`;
            return `
              <div class="item">
                <div>
                  <a href="${link(suffix, query, { id: e.id })}">${e.title}</a>
                  <div class="muted">${e.t.toUpperCase()} · ${e.sha || `#${e.number}`}</div>
                </div>
                ${riskBadge(e.risk)}
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderSearch(query, repo) {
  if (!query.q) return `<section class="empty">请输入搜索关键词</section>`;
  const lowerQ = query.q.toLowerCase();
  const results = [];

  if (!repo) {
    const matchedRepos = window.DEMO_DATA.repos.filter((r) => {
      return r.fullName.toLowerCase().includes(lowerQ) || r.description.toLowerCase().includes(lowerQ);
    });
    return `
      <section class="card">
        <h2>仓库搜索结果</h2>
        <p class="muted">关键词：${query.q}</p>
        <div class="list">
        ${
          matchedRepos.length
            ? matchedRepos
                .map((r) => {
                  return `
                    <div class="item">
                      <div>
                        <a href="${link("overview", query, { repo: r.id }, { keepRepo: false })}">${r.fullName}</a>
                        <div class="muted">${r.description}</div>
                      </div>
                      ${riskBadge(r.riskLevel)}
                    </div>
                  `;
                })
                .join("")
            : `<div class="empty">没有匹配的仓库</div>`
        }
        </div>
      </section>
    `;
  }

  repo.commits.forEach((c) => {
    if (c.sha.toLowerCase().includes(lowerQ) || c.title.toLowerCase().includes(lowerQ)) {
      results.push({
        label: `Commit ${c.sha}`,
        title: c.title,
        href: link("commit-detail", query, { id: c.id })
      });
    }
  });

  repo.issues.forEach((i) => {
    if (`#${i.number}`.includes(query.q) || i.title.toLowerCase().includes(lowerQ)) {
      results.push({
        label: `Issue #${i.number}`,
        title: i.title,
        href: link("issue-detail", query, { id: i.id })
      });
    }
  });

  repo.prs.forEach((p) => {
    if (`#${p.number}`.includes(query.q) || p.title.toLowerCase().includes(lowerQ)) {
      results.push({
        label: `PR #${p.number}`,
        title: p.title,
        href: link("pr-detail", query, { id: p.id })
      });
    }
  });

  repo.users.forEach((u) => {
    if (u.name.toLowerCase().includes(lowerQ)) {
      results.push({
        label: `User ${u.name}`,
        title: `${u.role} / ${u.risk}`,
        href: link("user-detail", query, { id: u.id })
      });
    }
  });

  return `
    <section class="card">
      <h2>仓库内搜索结果</h2>
      <p class="muted">${repo.fullName} · 关键词：${query.q}</p>
      <div class="list">
      ${
        results.length
          ? results
              .map(
                (r) => `
            <div class="item">
              <div>
                <a href="${r.href}">${r.title}</a>
                <div class="muted">${r.label}</div>
              </div>
            </div>
          `
              )
              .join("")
          : `<div class="empty">未匹配到结果</div>`
      }
      </div>
    </section>
  `;
}

function render() {
  const query = getQuery();
  const repo = query.repo ? getRepoById(query.repo) : null;
  renderNav(query.page, query, repo);

  brandSubtitle.textContent = repo ? `repo: ${repo.fullName}` : "pick a repository to start";
  searchInput.value = query.q || "";

  if (query.page === "home") app.innerHTML = renderHome(query);
  if (query.page === "search") app.innerHTML = renderSearch(query, repo);

  if (!["home", "search"].includes(query.page) && !repo) {
    app.innerHTML = renderRepoNotSelected(query);
    return;
  }

  if (query.page === "overview") app.innerHTML = renderOverview(repo, query);
  if (query.page === "commits") app.innerHTML = renderEntityList("Commits", repo.commits, "commit", query, repo);
  if (query.page === "issues") app.innerHTML = renderEntityList("Issues", repo.issues, "issue", query, repo);
  if (query.page === "prs") app.innerHTML = renderEntityList("PRs", repo.prs, "pr", query, repo);
  if (query.page === "users") app.innerHTML = renderUsers(repo, query);
  if (query.page === "risk") app.innerHTML = renderRisk(repo, query);
  if (query.page === "commit-detail") app.innerHTML = renderDetail("commit", query.id, query, repo);
  if (query.page === "issue-detail") app.innerHTML = renderDetail("issue", query.id, query, repo);
  if (query.page === "pr-detail") app.innerHTML = renderDetail("pr", query.id, query, repo);
  if (query.page === "user-detail") app.innerHTML = renderUserDetail(repo, query, query.id);
}

window.addEventListener("popstate", render);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = getQuery();
  const inputValue = searchInput.value.trim();
  window.history.pushState({}, "", link("search", query, { q: inputValue }));
  render();
});

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || !a.getAttribute("href").startsWith("?")) return;
  e.preventDefault();
  window.history.pushState({}, "", a.getAttribute("href"));
  render();
});

render();
