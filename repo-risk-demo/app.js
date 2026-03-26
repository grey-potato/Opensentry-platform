const navPages = [
  ["home", "Home"],
  ["overview", "Overview"],
  ["commits", "Commits"],
  ["issues", "Issues"],
  ["prs", "PRs"],
  ["users", "Users"],
  ["risk", "Portrait"]
];

const projectPortraitGroups = [
  {
    title: "活跃度",
    description: "先看项目是否持续在更新，而不是只看社区热度。",
    metrics: [
      { key: "commit_frequency", label: "提交频率", path: "commit_frequency", unit: "次/周", note: "固定 12 周窗口" },
      { key: "active_week_ratio", label: "活跃周占比", path: "active_week_ratio", unit: "%", note: "源值为 0-1 比例，这里展示为百分比" }
    ]
  },
  {
    title: "协作治理",
    description: "看 issue / PR 协同效率和协作负载是否健康。",
    metrics: [
      {
        key: "issue_update_count_window",
        label: "近 12 周 Issue 更新数",
        path: "issue_metrics.issue_update_count_window",
        unit: "次",
        note: "固定 12 周窗口"
      },
      {
        key: "median_issue_response_hours",
        label: "Issue 首次响应时长",
        path: "issue_metrics.median_issue_response_hours",
        unit: "小时",
        note: "建议保留 1 位小数"
      },
      {
        key: "median_issue_close_days",
        label: "Issue 关闭时长",
        path: "issue_metrics.median_issue_close_days",
        unit: "天",
        note: "建议保留 1 位小数"
      },
      {
        key: "collab_index",
        label: "协作规模",
        path: "collab_index",
        unit: "人",
        note: "提交者、PR 作者、reviewer 的近似去重规模"
      },
      {
        key: "open_pr_backlog_count",
        label: "打开 PR 积压数",
        path: "pr_metrics.open_pr_backlog_count",
        unit: "个",
        note: "backlog 数量，不直接表示时长"
      }
    ]
  },
  {
    title: "社区关注",
    description: "把存量关注度和近 12 周增长拆开看，更容易判断势能。",
    metrics: [
      { key: "stargazer_count", label: "Star 总量", path: "stargazer_count", unit: "个", note: "当前快照值" },
      {
        key: "community_star_delta_window",
        label: "近 12 周 Star 净增量",
        path: "community_star_delta_window",
        unit: "个",
        note: "历史快照近似净增量，可为负"
      },
      {
        key: "community_fork_delta_window",
        label: "近 12 周 Fork 净增量",
        path: "community_fork_delta_window",
        unit: "个",
        note: "历史快照近似净增量，可为负"
      }
    ]
  }
];

const DATA_ROOT =
  window.DEMO_DATA && Array.isArray(window.DEMO_DATA.repos)
    ? window.DEMO_DATA
    : { repos: [] };

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
    risk: p.get("risk") || "",
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
  return DATA_ROOT.repos.find((r) => r.id === repoId);
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

function renderRepoContextPanel(repo, query) {
  return `
    <aside class="repo-context card">
      <h3>仓库上下文</h3>
      <div class="muted">${repo.fullName}</div>
      <div class="context-stats">
        <span>★ ${repo.stars}</span>
        <span>Issue ${repo.openIssues}</span>
        <span>PR ${repo.openPrs}</span>
        <span>Contributors ${repo.contributors}</span>
      </div>
      <div class="context-tags">
        ${riskBadge(repo.riskLevel)}
        ${repo.riskTags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
      </div>
      <div class="inline-links" style="margin-top:10px;">
        <a href="${link("overview", query)}">Overview</a>
        <a href="${link("risk", query)}">Risk</a>
        <a href="${link("home", query, {}, { keepRepo: false })}">切换仓库</a>
      </div>
    </aside>
  `;
}

function renderRepoPageFrame(content, repo, query) {
  return `
    <div class="repo-layout">
      <div>${content}</div>
      ${renderRepoContextPanel(repo, query)}
    </div>
  `;
}

function renderEntityToolbar(type, query) {
  const risk = query.risk || "";
  const pageName = type === "commit" ? "commits" : `${type}s`;
  return `
    <div class="entity-toolbar">
      <div class="muted">筛选（前端骨架）：</div>
      <div class="toolbar">
        <a class="chip ${risk === "" ? "selected" : ""}" href="${link(pageName, query, { risk: "" })}">全部风险</a>
        <a class="chip ${risk === "high" ? "selected" : ""}" href="${link(pageName, query, { risk: "high" })}">High</a>
        <a class="chip ${risk === "medium" ? "selected" : ""}" href="${link(pageName, query, { risk: "medium" })}">Medium</a>
        <a class="chip ${risk === "low" ? "selected" : ""}" href="${link(pageName, query, { risk: "low" })}">Low</a>
      </div>
    </div>
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

function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function formatDecimal(value, digits = 1) {
  return Number(value).toFixed(digits).replace(/\.0$/, "");
}

function formatSignedInteger(value) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString()}`;
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

function getProjectPortrait(repo) {
  const weekly = buildWeeklySeries(repo);
  const avgCommits = weekly.reduce((sum, item) => sum + item.commits, 0) / (weekly.length || 1);
  const activeWeeks = weekly.filter((item) => item.commits > 0 || item.openedIssues > 0 || item.mergedPrs > 0).length;
  const fallback = {
    commit_frequency: Number(avgCommits.toFixed(1)),
    active_week_ratio: Number((activeWeeks / (weekly.length || 1)).toFixed(2)),
    collab_index: Math.max(3, repo.users.length + Math.round(repo.openPrs / 2)),
    stargazer_count: repo.stars,
    community_star_delta_window: Math.round(repo.stars * 0.04),
    community_fork_delta_window: Math.round(repo.forks * 0.02),
    issue_metrics: {
      issue_update_count_window: Math.max(repo.openIssues * 2, repo.issues.length * 12),
      median_issue_response_hours: Number((6 + repo.seed * 1.6).toFixed(1)),
      median_issue_close_days: Number((4 + repo.seed * 0.7).toFixed(1))
    },
    pr_metrics: {
      open_pr_backlog_count: repo.openPrs
    }
  };

  return {
    ...fallback,
    ...(repo.projectPortrait || {}),
    issue_metrics: {
      ...fallback.issue_metrics,
      ...((repo.projectPortrait && repo.projectPortrait.issue_metrics) || {})
    },
    pr_metrics: {
      ...fallback.pr_metrics,
      ...((repo.projectPortrait && repo.projectPortrait.pr_metrics) || {})
    }
  };
}

function getPortraitMetricStatus(metricKey, value) {
  switch (metricKey) {
    case "commit_frequency":
      if (value >= 8) return { label: "高频", tone: "good" };
      if (value >= 4) return { label: "稳定", tone: "neutral" };
      return { label: "偏低", tone: "warn" };
    case "issue_update_count_window":
      if (value >= 80) return { label: "处理活跃", tone: "good" };
      if (value >= 30) return { label: "处理中", tone: "neutral" };
      return { label: "更新较少", tone: "warn" };
    case "median_issue_response_hours":
      if (value <= 8) return { label: "响应快", tone: "good" };
      if (value <= 24) return { label: "可接受", tone: "neutral" };
      return { label: "偏慢", tone: "warn" };
    case "active_week_ratio":
      if (value >= 0.8) return { label: "连续活跃", tone: "good" };
      if (value >= 0.6) return { label: "基本稳定", tone: "neutral" };
      return { label: "活跃不足", tone: "warn" };
    case "collab_index":
      if (value >= 12) return { label: "协作广", tone: "good" };
      if (value >= 6) return { label: "协作中", tone: "neutral" };
      return { label: "协作集中", tone: "warn" };
    case "open_pr_backlog_count":
      if (value <= 8) return { label: "可控", tone: "good" };
      if (value <= 15) return { label: "积压中", tone: "neutral" };
      return { label: "偏高", tone: "warn" };
    case "stargazer_count":
      if (value >= 3000) return { label: "关注高", tone: "good" };
      if (value >= 1000) return { label: "关注稳", tone: "neutral" };
      return { label: "起量中", tone: "neutral" };
    case "community_star_delta_window":
    case "community_fork_delta_window":
      if (value > 0) return { label: "增长", tone: "good" };
      if (value === 0) return { label: "持平", tone: "neutral" };
      return { label: "回落", tone: "warn" };
    case "median_issue_close_days":
      if (value <= 7) return { label: "关闭快", tone: "good" };
      if (value <= 21) return { label: "正常", tone: "neutral" };
      return { label: "偏慢", tone: "warn" };
    default:
      return { label: "已记录", tone: "neutral" };
  }
}

function formatPortraitMetricValue(metricKey, value) {
  switch (metricKey) {
    case "commit_frequency":
    case "median_issue_response_hours":
    case "median_issue_close_days":
      return formatDecimal(value, 1);
    case "active_week_ratio":
      return String(Math.round(value * 100));
    case "community_star_delta_window":
    case "community_fork_delta_window":
      return formatSignedInteger(value);
    default:
      return Math.round(value).toLocaleString();
  }
}

function getPortraitMetric(metricKey) {
  return projectPortraitGroups.flatMap((group) => group.metrics).find((metric) => metric.key === metricKey);
}

function getPortraitMetricDisplay(metricKey, portrait) {
  const metric = getPortraitMetric(metricKey);
  const value = metric ? getValueByPath(portrait, metric.path) : undefined;
  return {
    metric,
    value,
    formatted: formatPortraitMetricValue(metricKey, value),
    status: getPortraitMetricStatus(metricKey, value)
  };
}

function getPortraitNarratives(portrait) {
  const commit = getPortraitMetricDisplay("commit_frequency", portrait);
  const activeWeek = getPortraitMetricDisplay("active_week_ratio", portrait);
  const response = getPortraitMetricDisplay("median_issue_response_hours", portrait);
  const backlog = getPortraitMetricDisplay("open_pr_backlog_count", portrait);
  const starDelta = getPortraitMetricDisplay("community_star_delta_window", portrait);
  const forkDelta = getPortraitMetricDisplay("community_fork_delta_window", portrait);

  const activityHeadline =
    commit.status.tone === "good" && activeWeek.status.tone === "good"
      ? "开发节奏持续而且稳定"
      : commit.status.tone === "warn"
        ? "开发节奏偏弱，需要结合最近维护动作再判断"
        : "开发节奏整体稳定";

  const collabHeadline =
    response.status.tone === "good" && backlog.status.tone === "good"
      ? "协作效率健康，PR 和 Issue 压力可控"
      : backlog.status.tone === "warn"
        ? "协作负载偏高，优先关注 PR 积压"
        : response.status.tone === "warn"
          ? "响应链路偏慢，治理效率需要重点观察"
          : "协作节奏基本平衡";

  const communityHeadline =
    starDelta.value > 0 && forkDelta.value > 0
      ? "社区势能仍在增长"
      : starDelta.value < 0 || forkDelta.value < 0
        ? "社区热度出现回落"
        : "社区关注度大体持平";

  return [
    {
      title: "活跃判断",
      tag: "开发节奏",
      tone: commit.status.tone,
      headline: activityHeadline,
      detail: `近 12 周平均每周 ${commit.formatted} 次提交，活跃周占比 ${activeWeek.formatted}%。`
    },
    {
      title: "治理判断",
      tag: "协作治理",
      tone: backlog.status.tone === "warn" || response.status.tone === "warn" ? "warn" : "neutral",
      headline: collabHeadline,
      detail: `Issue 首响 ${response.formatted} 小时，当前打开 PR ${backlog.formatted} 个。`
    },
    {
      title: "社区判断",
      tag: "社区热度",
      tone: starDelta.value < 0 || forkDelta.value < 0 ? "warn" : "neutral",
      headline: communityHeadline,
      detail: `近 12 周 Star ${starDelta.formatted}，Fork ${forkDelta.formatted}。`
    }
  ];
}

function getPortraitGroupSummary(groupTitle, portrait) {
  if (groupTitle === "活跃度") {
    const commit = getPortraitMetricDisplay("commit_frequency", portrait);
    const activeWeek = getPortraitMetricDisplay("active_week_ratio", portrait);
    return {
      headline: commit.status.tone === "good" ? "持续更新" : "节奏一般",
      description: `平均 ${commit.formatted} 次/周提交，${activeWeek.formatted}% 的周处于活跃状态。`,
      metricKeys: ["commit_frequency", "active_week_ratio"]
    };
  }

  if (groupTitle === "协作治理") {
    const response = getPortraitMetricDisplay("median_issue_response_hours", portrait);
    const close = getPortraitMetricDisplay("median_issue_close_days", portrait);
    const backlog = getPortraitMetricDisplay("open_pr_backlog_count", portrait);
    return {
      headline: backlog.status.tone === "warn" ? "治理负载偏高" : "治理状态可读",
      description: `Issue 首响 ${response.formatted} 小时，关闭耗时 ${close.formatted} 天，PR backlog ${backlog.formatted} 个。`,
      metricKeys: [
        "issue_update_count_window",
        "median_issue_response_hours",
        "median_issue_close_days",
        "collab_index",
        "open_pr_backlog_count"
      ]
    };
  }

  const stars = getPortraitMetricDisplay("stargazer_count", portrait);
  const starDelta = getPortraitMetricDisplay("community_star_delta_window", portrait);
  const forkDelta = getPortraitMetricDisplay("community_fork_delta_window", portrait);
  return {
    headline: starDelta.value < 0 || forkDelta.value < 0 ? "热度回落" : "关注度稳定",
    description: `当前 Star ${stars.formatted}，近 12 周 Star ${starDelta.formatted}、Fork ${forkDelta.formatted}。`,
    metricKeys: ["stargazer_count", "community_star_delta_window", "community_fork_delta_window"]
  };
}

function renderSignalStat(metricKey, portrait) {
  const { metric, formatted, status } = getPortraitMetricDisplay(metricKey, portrait);
  return `
    <div class="signal-stat">
      <div class="signal-stat-top">
        <span class="signal-label">${metric.label}</span>
        <span class="metric-chip ${status.tone}">${status.label}</span>
      </div>
      <div class="signal-value">
        ${formatted}
        <span>${metric.unit}</span>
      </div>
    </div>
  `;
}

function renderPortraitSpecRow(groupTitle, metric, portrait) {
  const value = getValueByPath(portrait, metric.path);
  return `
    <div class="portrait-spec-row">
      <div class="portrait-spec-group">${groupTitle}</div>
      <div class="portrait-spec-name">
        <strong>${metric.label}</strong>
        <span class="muted">${metric.note}</span>
      </div>
      <div class="portrait-spec-value">${formatPortraitMetricValue(metric.key, value)} ${metric.unit}</div>
      <div class="portrait-spec-field"><code>project_portrait.${metric.path}</code></div>
    </div>
  `;
}

function renderProjectPortrait(repo) {
  const portrait = getProjectPortrait(repo);
  const narratives = getPortraitNarratives(portrait);

  return `
    <section class="card portrait-section" style="margin-top: 12px;">
      <div class="portrait-header">
        <div>
          <h3>项目画像</h3>
          <p class="muted">用户先看结论和信号，再决定要不要展开字段口径。这里不直接把画像做成一张字段表。</p>
        </div>
        <span class="portrait-window">12 周观察窗口</span>
      </div>

      <div class="portrait-story-grid">
        ${narratives
          .map((item) => `
              <article class="portrait-story-card">
                <div class="portrait-story-top">
                  <span class="muted">${item.title}</span>
                  <span class="metric-chip ${item.tone}">${item.tag}</span>
                </div>
                <div class="story-headline">${item.headline}</div>
                <div class="muted">${item.detail}</div>
              </article>
            `)
          .join("")}
      </div>

      <div class="signal-band-list">
        ${projectPortraitGroups
          .map(
            (group) => {
              const summary = getPortraitGroupSummary(group.title, portrait);
              return `
              <section class="signal-band">
                <div class="signal-band-main">
                  <div class="signal-kicker">${group.title}</div>
                  <h4>${summary.headline}</h4>
                  <p class="muted">${summary.description}</p>
                </div>
                <div class="signal-stat-grid">
                  ${summary.metricKeys.map((metricKey) => renderSignalStat(metricKey, portrait)).join("")}
                </div>
              </section>
            `;
            }
          )
          .join("")}
      </div>

      <details class="portrait-details">
        <summary>查看指标口径与字段映射</summary>
        <div class="portrait-spec-table">
          ${projectPortraitGroups
            .map((group) => group.metrics.map((metric) => renderPortraitSpecRow(group.title, metric, portrait)).join(""))
            .join("")}
        </div>
      </details>
    </section>
  `;
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
  let repos = [...DATA_ROOT.repos];

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
  const body = `
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

    ${renderProjectPortrait(repo)}

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

  return renderRepoPageFrame(body, repo, query);
}

function renderEntityList(title, rows, type, query, repo) {
  const filtered = rows.filter((r) => {
    const userOk = !query.user || r.userId === query.user;
    const riskOk = !query.risk || r.risk === query.risk;
    return userOk && riskOk;
  });

  const body = `
    <section class="card">
      <h2>${title}</h2>
      <p class="muted">当前仓库：${repo.fullName}</p>
      ${query.user ? `<p class="muted">当前按用户过滤：${userById(repo, query.user)?.name || query.user}</p>` : ""}
      ${renderEntityToolbar(type, query)}
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

  return renderRepoPageFrame(body, repo, query);
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

  const body = `
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

  return renderRepoPageFrame(body, repo, query);
}

function renderUsers(repo, query) {
  const body = `
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

  return renderRepoPageFrame(body, repo, query);
}

function renderUserDetail(repo, query, id) {
  const u = userById(repo, id);
  if (!u) return `<section class="empty">未找到用户</section>`;

  const body = `
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

  return renderRepoPageFrame(body, repo, query);
}

function renderRisk(repo, query) {
  const entities = [
    ...repo.commits.map((x) => ({ ...x, t: "commit" })),
    ...repo.issues.map((x) => ({ ...x, t: "issue" })),
    ...repo.prs.map((x) => ({ ...x, t: "pr" }))
  ];

  const body = `
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

  return renderRepoPageFrame(body, repo, query);
}

function renderSearch(query, repo) {
  if (!query.q) return `<section class="empty">请输入搜索关键词</section>`;
  const lowerQ = query.q.toLowerCase();
  const results = [];

  if (!repo) {
    const matchedRepos = DATA_ROOT.repos.filter((r) => {
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

  const body = `
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

  return renderRepoPageFrame(body, repo, query);
}

function renderRepoContextPanel(repo, query) {
  const metadata = getRepoMetadata(repo);
  const portrait = getProjectPortrait(repo);

  return `
    <aside class="repo-context card repo-sidebar">
      <div class="repo-sidebar-head">
        <h3>${repo.fullName}</h3>
        <p class="muted">${repo.description}</p>
      </div>
      <div class="repo-sidebar-meta">
        <span>${metadata.language}</span>
        <span>${repo.license}</span>
        <span>${metadata.defaultBranch}</span>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Repository</div>
        <div class="sidebar-kv"><span>Stars</span><strong>${repo.stars.toLocaleString()}</strong></div>
        <div class="sidebar-kv"><span>Forks</span><strong>${repo.forks.toLocaleString()}</strong></div>
        <div class="sidebar-kv"><span>Open Issues</span><strong>${repo.openIssues}</strong></div>
        <div class="sidebar-kv"><span>Open PRs</span><strong>${repo.openPrs}</strong></div>
        <div class="sidebar-kv"><span>Contributors</span><strong>${repo.contributors}</strong></div>
        <div class="sidebar-kv"><span>Last Sync</span><strong>${metadata.lastSync}</strong></div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Portrait</div>
        <div class="sidebar-kv"><span>Level</span><strong>${repo.riskLevel.toUpperCase()}</strong></div>
        <div class="sidebar-kv"><span>Score</span><strong>${repo.riskScore}</strong></div>
        <div class="sidebar-kv"><span>Commit / Week</span><strong>${formatPortraitMetricValue("commit_frequency", portrait.commit_frequency)}</strong></div>
        <div class="sidebar-kv"><span>Active Weeks</span><strong>${formatPortraitMetricValue("active_week_ratio", portrait.active_week_ratio)}%</strong></div>
      </div>
      <div class="context-stats">
        <span>First Seen ${metadata.firstSeen}</span>
        <span>Window ${metadata.dataWindow}</span>
      </div>
      <div class="context-tags">
        ${riskBadge(repo.riskLevel)}
        ${repo.riskTags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
      </div>
      <div class="inline-links" style="margin-top:10px;">
        <a href="${link("overview", query)}">Overview</a>
        <a href="${link("risk", query)}">Portrait</a>
        <a href="${link("home", query, {}, { keepRepo: false })}">Switch Repo</a>
      </div>
    </aside>
  `;
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
    <section class="card overview-chart-card" style="margin-top: 12px;">
      <div class="overview-section-head">
        <div>
          <h3>12-Week Activity</h3>
          <p class="muted">Commits, opened issues, merged PRs, and active contributors.</p>
        </div>
      </div>
      <div class="timeline-legend">
        <span><i class="dot commit"></i>Commits</span>
        <span><i class="dot issue"></i>Opened Issues</span>
        <span><i class="dot pr"></i>Merged PRs</span>
        <span><i class="dot user"></i>Active Contributors</span>
      </div>
      <div class="timeline-wrap">
        <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="12-week activity timeline">
          <path d="${commitPath}" class="line-commit" />
          <path d="${issuePath}" class="line-issue" />
          <path d="${prPath}" class="line-pr" />
          <path d="${contributorPath}" class="line-user" />
        </svg>
      </div>
      <div class="week-labels">
        ${series.map((item) => `<span>${item.label}</span>`).join("")}
      </div>
      <div class="metric-row muted">
        Latest week: ${latest.commits} commits, ${latest.openedIssues} opened issues, ${latest.mergedPrs} merged PRs, ${latest.activeContributors} active contributors.
      </div>
    </section>
  `;
}

function renderPortraitMetricCard(metricKey, portrait) {
  const { metric, formatted, status } = getPortraitMetricDisplay(metricKey, portrait);
  return `
    <article class="snapshot-card">
      <div class="snapshot-card-top">
        <span class="muted">${metric.label}</span>
        <span class="metric-chip ${status.tone}">${status.label}</span>
      </div>
      <div class="snapshot-value">
        ${formatted}
        <span>${metric.unit}</span>
      </div>
    </article>
  `;
}

function renderPortraitMetricRow(metricKey, portrait) {
  const { metric, formatted, status } = getPortraitMetricDisplay(metricKey, portrait);
  return `
    <div class="portrait-metric-line">
      <div>
        <div class="portrait-line-label">${metric.label}</div>
        <div class="muted">${metric.note}</div>
      </div>
      <div class="portrait-line-value">
        <strong>${formatted} ${metric.unit}</strong>
        <span class="metric-chip ${status.tone}">${status.label}</span>
      </div>
    </div>
  `;
}

function renderOverviewPreviewCard(title, viewHref, rows) {
  return `
    <section class="card overview-panel">
      <div class="overview-section-head">
        <h3>${title}</h3>
        <a class="chip" href="${viewHref}">View All</a>
      </div>
      <div class="compact-list">
        ${rows.join("")}
      </div>
    </section>
  `;
}

function renderOverviewEntityPanels(repo, query) {
  const recentCommits = [...repo.commits]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 3)
    .map((row) => {
      const user = userById(repo, row.userId);
      return `
        <div class="compact-item">
          <div>
            <a href="${link("commit-detail", query, { id: row.id })}">${row.title}</a>
            <div class="muted">${row.sha} · ${user.name} · ${row.date}</div>
          </div>
          ${riskBadge(row.risk)}
        </div>
      `;
    });

  const issueRows = repo.issues.slice(0, 3).map((row) => {
    const user = userById(repo, row.userId);
    return `
      <div class="compact-item">
        <div>
          <a href="${link("issue-detail", query, { id: row.id })}">${row.title}</a>
          <div class="muted">#${row.number} · ${row.status} · ${user.name}</div>
        </div>
        ${riskBadge(row.risk)}
      </div>
    `;
  });

  const prRows = repo.prs.slice(0, 3).map((row) => {
    const user = userById(repo, row.userId);
    return `
      <div class="compact-item">
        <div>
          <a href="${link("pr-detail", query, { id: row.id })}">${row.title}</a>
          <div class="muted">#${row.number} · ${row.status} · ${user.name}</div>
        </div>
        ${riskBadge(row.risk)}
      </div>
    `;
  });

  return `
    <section class="overview-panel-grid" style="margin-top: 12px;">
      ${renderOverviewPreviewCard("Recent Commits", link("commits", query), recentCommits)}
      ${renderOverviewPreviewCard("Open Issues", link("issues", query), issueRows)}
      ${renderOverviewPreviewCard("Pull Requests", link("prs", query), prRows)}
    </section>
  `;
}

function renderProjectPortrait(repo, query) {
  const portrait = getProjectPortrait(repo);
  const summaryMetrics = ["commit_frequency", "active_week_ratio", "collab_index", "community_star_delta_window"];

  return `
    <section class="card portrait-section portrait-summary-shell" style="margin-top: 12px;">
      <div class="overview-section-head">
        <div>
          <h3>Project Portrait</h3>
          <p class="muted">A compact snapshot of repository activity, collaboration, and community signals.</p>
        </div>
        <a class="chip" href="${link("risk", query)}">Open Portrait</a>
      </div>
      <div class="portrait-snapshot-grid">
        ${summaryMetrics.map((metricKey) => renderPortraitMetricCard(metricKey, portrait)).join("")}
      </div>
      <div class="portrait-tag-row">
        ${riskBadge(repo.riskLevel)}
        ${repo.riskTags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderOverview(repo, query) {
  const metadata = getRepoMetadata(repo);
  const body = `
    <section class="card repo-hero-card">
      <div class="repo-hero-top">
        <div>
          <div class="repo-path">${repo.fullName}</div>
          <h2>Repository Overview</h2>
          <p class="repo-description">${repo.description}</p>
        </div>
        <div class="hero-badges">
          ${riskBadge(repo.riskLevel)}
        </div>
      </div>
      <div class="repo-meta-pills">
        <span>${metadata.language}</span>
        <span>${repo.license}</span>
        <span>Branch ${metadata.defaultBranch}</span>
        <span>First Seen ${metadata.firstSeen}</span>
        <span>Last Sync ${metadata.lastSync}</span>
      </div>
      <div class="repo-summary-strip">
        <div class="summary-cell"><span>Stars</span><strong>${repo.stars.toLocaleString()}</strong></div>
        <div class="summary-cell"><span>Forks</span><strong>${repo.forks.toLocaleString()}</strong></div>
        <div class="summary-cell"><span>Open Issues</span><strong>${repo.openIssues}</strong></div>
        <div class="summary-cell"><span>Open PRs</span><strong>${repo.openPrs}</strong></div>
        <div class="summary-cell"><span>Contributors</span><strong>${repo.contributors}</strong></div>
      </div>
      <div class="inline-links">
        <a href="${link("home", query, {}, { keepRepo: false })}">Back to Home</a>
        <a href="${link("risk", query)}">Open Portrait</a>
      </div>
    </section>

    ${renderProjectPortrait(repo, query)}

    ${renderWeeklyChart(repo)}

    ${renderOverviewEntityPanels(repo, query)}
  `;

  return renderRepoPageFrame(body, repo, query);
}

function renderRisk(repo, query) {
  const portrait = getProjectPortrait(repo);
  const entityCount = repo.commits.length + repo.issues.length + repo.prs.length;

  const body = `
    <section class="card portrait-page-head">
      <div class="overview-section-head">
        <div>
          <div class="repo-path">${repo.fullName}</div>
          <h2>Portrait</h2>
          <p class="muted">Repository portrait across activity, collaboration, and community dimensions.</p>
        </div>
        <a class="chip" href="${link("overview", query)}">Back to Overview</a>
      </div>
      <div class="portrait-tag-row">
        ${riskBadge(repo.riskLevel)}
        ${repo.riskTags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
      </div>
      <div class="repo-summary-strip portrait-summary-strip">
        <div class="summary-cell"><span>Portrait Score</span><strong>${repo.riskScore}</strong></div>
        <div class="summary-cell"><span>Entity Count</span><strong>${entityCount}</strong></div>
        <div class="summary-cell"><span>Contributors</span><strong>${repo.contributors}</strong></div>
        <div class="summary-cell"><span>Stars</span><strong>${repo.stars.toLocaleString()}</strong></div>
      </div>
    </section>

    <section class="portrait-snapshot-grid" style="margin-top: 12px;">
      ${[
        "commit_frequency",
        "active_week_ratio",
        "collab_index",
        "open_pr_backlog_count",
        "stargazer_count",
        "community_star_delta_window"
      ]
        .map((metricKey) => renderPortraitMetricCard(metricKey, portrait))
        .join("")}
    </section>

    ${renderWeeklyChart(repo)}

    <section class="portrait-dimension-grid" style="margin-top: 12px;">
      ${projectPortraitGroups
        .map(
          (group) => `
            <section class="card portrait-dimension-card">
              <div class="overview-section-head">
                <div>
                  <h3>${group.title}</h3>
                  <p class="muted">${group.description}</p>
                </div>
              </div>
              <div class="portrait-dimension-list">
                ${group.metrics.map((metric) => renderPortraitMetricRow(metric.key, portrait)).join("")}
              </div>
            </section>
          `
        )
        .join("")}
    </section>

    <section class="overview-panel-grid" style="margin-top: 12px;">
      <section class="card overview-panel">
        <div class="overview-section-head">
          <h3>Entity Snapshot</h3>
        </div>
        <div class="repo-summary-strip entity-summary-strip">
          <div class="summary-cell"><span>Commits</span><strong>${repo.commits.length}</strong></div>
          <div class="summary-cell"><span>Issues</span><strong>${repo.issues.length}</strong></div>
          <div class="summary-cell"><span>PRs</span><strong>${repo.prs.length}</strong></div>
          <div class="summary-cell"><span>Users</span><strong>${repo.users.length}</strong></div>
        </div>
        <div class="inline-links">
          <a href="${link("commits", query)}">Commits</a>
          <a href="${link("issues", query)}">Issues</a>
          <a href="${link("prs", query)}">PRs</a>
          <a href="${link("users", query)}">Users</a>
        </div>
      </section>
    </section>
  `;

  return renderRepoPageFrame(body, repo, query);
}

function getHomeSortValue(repo, sort) {
  const portrait = getProjectPortrait(repo);
  const latestCommitDate = [...repo.commits]
    .map((item) => item.date || "")
    .sort()
    .slice(-1)[0] || "";

  switch (sort) {
    case "activity":
      return portrait.commit_frequency;
    case "collab":
      return portrait.pr_metrics.open_pr_backlog_count;
    case "community":
      return portrait.community_star_delta_window;
    case "updated":
      return Date.parse(latestCommitDate) || 0;
    case "random":
      return -repo.seed;
    case "stars":
    default:
      return repo.stars;
  }
}

function renderNav(activePage, query, repo) {
  const showRepoNav = Boolean(repo) && activePage !== "home";
  nav.style.display = showRepoNav ? "flex" : "none";

  if (!showRepoNav) {
    nav.innerHTML = "";
    return;
  }

  nav.innerHTML = navPages
    .filter(([id]) => id !== "home")
    .map(([id, name]) => {
      const active = id === activePage ? "active" : "";
      return `<a class="${active}" href="${link(id, query)}">${name}</a>`;
    })
    .join("");
}

function renderHome(query) {
  const searchText = query.q.trim().toLowerCase();
  const weekLabel = getCurrentIsoWeekLabel();
  let repos = [...DATA_ROOT.repos];

  if (query.sort === "random") {
    repos.sort((a, b) => a.seed - b.seed);
  } else {
    repos.sort((a, b) => getHomeSortValue(b, query.sort) - getHomeSortValue(a, query.sort));
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
        <div class="inline-links"><a href="${href}">View Details</a></div>
      </section>
    `;
  }

  return `
    <section class="card">
      <h2>Repository Explorer</h2>
      <p class="muted">首页只负责发现和选择仓库。进入具体仓库后，再展开 Overview / Commits / Issues / PRs / Users / Portrait。</p>
      <div class="toolbar">
        <a class="chip ${query.sort === "stars" ? "selected" : ""}" href="${link("home", query, { sort: "stars", q: query.q }, { keepRepo: false })}">Star</a>
        <a class="chip ${query.sort === "activity" ? "selected" : ""}" href="${link("home", query, { sort: "activity", q: query.q }, { keepRepo: false })}">活跃度</a>
        <a class="chip ${query.sort === "collab" ? "selected" : ""}" href="${link("home", query, { sort: "collab", q: query.q }, { keepRepo: false })}">协作压力</a>
        <a class="chip ${query.sort === "community" ? "selected" : ""}" href="${link("home", query, { sort: "community", q: query.q }, { keepRepo: false })}">社区增长</a>
        <a class="chip ${query.sort === "updated" ? "selected" : ""}" href="${link("home", query, { sort: "updated", q: query.q }, { keepRepo: false })}">最近更新</a>
        <a class="chip ${query.sort === "random" ? "selected" : ""}" href="${link("home", query, { sort: "random", q: query.q }, { keepRepo: false })}">随机探索</a>
      </div>
    </section>

    <section class="grid" style="margin-top: 12px;">
      ${
        insights
          ? actionCard(
              "本周新增 Commit 最高",
              insights.highestNewCommits.repo.fullName,
              `${weekLabel} commits ${insights.highestNewCommits.newCommits}`,
              link("overview", query, { repo: insights.highestNewCommits.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "本周新增 Issue 最高",
              insights.highestNewIssues.repo.fullName,
              `${weekLabel} issues ${insights.highestNewIssues.newIssues}`,
              link("overview", query, { repo: insights.highestNewIssues.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "PR Backlog 最高",
              insights.highestPendingReviewPrs.repo.fullName,
              `${weekLabel} backlog ${insights.highestPendingReviewPrs.pendingReviewPrs}`,
              link("overview", query, { repo: insights.highestPendingReviewPrs.repo.id }, { keepRepo: false })
            )
          : ""
      }
      ${
        insights
          ? actionCard(
              "贡献者活跃上升",
              insights.highestContributorRise.repo.fullName,
              `${weekLabel} contributor delta ${insights.highestContributorRise.contributorRise >= 0 ? "+" : ""}${insights.highestContributorRise.contributorRise}`,
              link("overview", query, { repo: insights.highestContributorRise.repo.id }, { keepRepo: false })
            )
          : ""
      }
    </section>

    <section class="repo-grid" style="margin-top: 12px;">
      ${
        repos.length
          ? repos
              .map((repo) => {
                const portrait = getProjectPortrait(repo);
                return `
                  <article class="repo-card">
                    <h3><a href="${link("overview", query, { repo: repo.id }, { keepRepo: false })}">${repo.fullName}</a></h3>
                    <p class="muted">${repo.description}</p>
                    <div class="metric-row muted">★ ${repo.stars} · Fork ${repo.forks} · ${repo.license}</div>
                    <div class="metric-row">
                      <span class="muted">Issue ${repo.openIssues} · PR ${repo.openPrs} · Contributors ${repo.contributors}</span>
                    </div>
                    <div class="context-tags" style="margin-top:10px;">
                      ${riskBadge(repo.riskLevel)}
                      <span class="badge">Commit/W ${formatPortraitMetricValue("commit_frequency", portrait.commit_frequency)}</span>
                      <span class="badge">Star Δ ${formatPortraitMetricValue("community_star_delta_window", portrait.community_star_delta_window)}</span>
                    </div>
                  </article>
                `;
              })
              .join("")
          : `<div class="empty">没有匹配的仓库，请更换关键词。</div>`
      }
    </section>
  `;
}

function render() {
  const query = getQuery();
  const repo = query.repo ? getRepoById(query.repo) : null;
  renderNav(query.page, query, repo);

  brandSubtitle.textContent = repo ? `repo: ${repo.fullName}` : "pick a repository to start";
  searchInput.value = query.q || "";

  if (!DATA_ROOT.repos.length) {
    app.innerHTML = `
      <section class="empty">
        当前未接入数据源。页面框架已就绪，可先联调静态布局；接入后端后只需替换数据访问层。
      </section>
    `;
    return;
  }

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
