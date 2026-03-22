window.DEMO_DATA = {
  repos: [
    {
      id: "repo-opensentry-platform",
      fullName: "opensentry/platform",
      description: "Risk indexing and metadata service for open-source repositories.",
      stars: 3894,
      forks: 612,
      openIssues: 37,
      openPrs: 11,
      contributors: 18,
      license: "Apache-2.0",
      riskScore: 72,
      riskLevel: "high",
      riskTags: ["supply-chain", "stale-dependency", "token-leak-pattern"],
      trend: "up",
      seed: 5,
      projectPortrait: {
        commit_frequency: 9.4,
        active_week_ratio: 0.92,
        collab_index: 15,
        stargazer_count: 3894,
        community_star_delta_window: 214,
        community_fork_delta_window: 37,
        issue_metrics: {
          issue_update_count_window: 86,
          median_issue_response_hours: 5.5,
          median_issue_close_days: 4.2
        },
        pr_metrics: {
          open_pr_backlog_count: 11
        }
      },
      users: [
        { id: "u1", name: "alice", role: "maintainer", risk: "medium" },
        { id: "u2", name: "bob", role: "contributor", risk: "high" },
        { id: "u3", name: "charlie", role: "reviewer", risk: "low" }
      ],
      commits: [
        {
          id: "c1",
          sha: "a6f2b1c",
          title: "fix: sanitize token parsing in pipeline",
          date: "2026-03-10",
          userId: "u1",
          risk: "medium"
        },
        {
          id: "c2",
          sha: "9bd13ef",
          title: "feat: add dependency source validation",
          date: "2026-03-08",
          userId: "u2",
          risk: "high"
        },
        {
          id: "c3",
          sha: "f22de66",
          title: "chore: docs and cleanup",
          date: "2026-03-05",
          userId: "u3",
          risk: "low"
        }
      ],
      issues: [
        {
          id: "i1",
          number: 128,
          title: "Auth flow allows legacy token fallback",
          status: "open",
          label: "security",
          userId: "u2",
          risk: "high"
        },
        {
          id: "i2",
          number: 121,
          title: "Release script timeout at low network quality",
          status: "open",
          label: "infra",
          userId: "u1",
          risk: "medium"
        }
      ],
      prs: [
        {
          id: "p1",
          number: 76,
          title: "refactor: split scanner worker by queue",
          status: "open",
          review: "changes_requested",
          userId: "u1",
          risk: "medium"
        },
        {
          id: "p2",
          number: 73,
          title: "fix: prevent empty key material export",
          status: "merged",
          review: "approved",
          userId: "u3",
          risk: "low"
        }
      ]
    },
    {
      id: "repo-cloudshield-core",
      fullName: "cloudshield/core",
      description: "Cloud runtime posture scanner for CI and deployment pipelines.",
      stars: 2568,
      forks: 420,
      openIssues: 22,
      openPrs: 8,
      contributors: 13,
      license: "MIT",
      riskScore: 54,
      riskLevel: "medium",
      riskTags: ["review-delay", "dependency-age"],
      trend: "flat",
      seed: 2,
      projectPortrait: {
        commit_frequency: 6.1,
        active_week_ratio: 0.83,
        collab_index: 9,
        stargazer_count: 2568,
        community_star_delta_window: 97,
        community_fork_delta_window: 18,
        issue_metrics: {
          issue_update_count_window: 41,
          median_issue_response_hours: 11.3,
          median_issue_close_days: 6.8
        },
        pr_metrics: {
          open_pr_backlog_count: 8
        }
      },
      users: [
        { id: "u1", name: "nina", role: "maintainer", risk: "medium" },
        { id: "u2", name: "oscar", role: "contributor", risk: "medium" },
        { id: "u3", name: "lee", role: "reviewer", risk: "low" }
      ],
      commits: [
        {
          id: "c1",
          sha: "1fa9b1e",
          title: "feat: scanner baseline for multi-region",
          date: "2026-03-12",
          userId: "u1",
          risk: "medium"
        },
        {
          id: "c2",
          sha: "2ad31bb",
          title: "fix: retry policy for failed policy fetch",
          date: "2026-03-09",
          userId: "u2",
          risk: "low"
        }
      ],
      issues: [
        {
          id: "i1",
          number: 87,
          title: "Scanner misses private mirror in fallback mode",
          status: "open",
          label: "bug",
          userId: "u2",
          risk: "medium"
        }
      ],
      prs: [
        {
          id: "p1",
          number: 55,
          title: "perf: cache policy compilation results",
          status: "merged",
          review: "approved",
          userId: "u3",
          risk: "low"
        }
      ]
    },
    {
      id: "repo-auditkit-web",
      fullName: "auditkit/web",
      description: "Web console for incident timelines, owners, and evidence snapshots.",
      stars: 1830,
      forks: 240,
      openIssues: 41,
      openPrs: 14,
      contributors: 15,
      license: "BSD-3-Clause",
      riskScore: 63,
      riskLevel: "high",
      riskTags: ["permission-drift", "owner-gap"],
      trend: "up",
      seed: 7,
      projectPortrait: {
        commit_frequency: 7.6,
        active_week_ratio: 0.75,
        collab_index: 13,
        stargazer_count: 1830,
        community_star_delta_window: 163,
        community_fork_delta_window: 24,
        issue_metrics: {
          issue_update_count_window: 93,
          median_issue_response_hours: 18.7,
          median_issue_close_days: 9.4
        },
        pr_metrics: {
          open_pr_backlog_count: 14
        }
      },
      users: [
        { id: "u1", name: "yuki", role: "maintainer", risk: "high" },
        { id: "u2", name: "sam", role: "contributor", risk: "medium" },
        { id: "u3", name: "tom", role: "reviewer", risk: "low" }
      ],
      commits: [
        {
          id: "c1",
          sha: "74da9f0",
          title: "feat: evidence panel with source badges",
          date: "2026-03-11",
          userId: "u1",
          risk: "high"
        },
        {
          id: "c2",
          sha: "72ba10c",
          title: "fix: remove stale permission from team map",
          date: "2026-03-07",
          userId: "u2",
          risk: "medium"
        }
      ],
      issues: [
        {
          id: "i1",
          number: 219,
          title: "User role badge not aligned in mobile drawer",
          status: "open",
          label: "ui",
          userId: "u3",
          risk: "low"
        }
      ],
      prs: [
        {
          id: "p1",
          number: 144,
          title: "fix: harden invite token verification",
          status: "open",
          review: "changes_requested",
          userId: "u1",
          risk: "high"
        }
      ]
    },
    {
      id: "repo-gatekeeper-engine",
      fullName: "gatekeeper/engine",
      description: "Policy decision engine and metadata adapters for CI workflows.",
      stars: 4112,
      forks: 701,
      openIssues: 17,
      openPrs: 6,
      contributors: 21,
      license: "Apache-2.0",
      riskScore: 48,
      riskLevel: "medium",
      riskTags: ["rule-churn", "release-gap"],
      trend: "down",
      seed: 1,
      projectPortrait: {
        commit_frequency: 4.8,
        active_week_ratio: 0.67,
        collab_index: 8,
        stargazer_count: 4112,
        community_star_delta_window: -12,
        community_fork_delta_window: -3,
        issue_metrics: {
          issue_update_count_window: 28,
          median_issue_response_hours: 7.8,
          median_issue_close_days: 5.1
        },
        pr_metrics: {
          open_pr_backlog_count: 6
        }
      },
      users: [
        { id: "u1", name: "marta", role: "maintainer", risk: "medium" },
        { id: "u2", name: "ian", role: "contributor", risk: "low" },
        { id: "u3", name: "zoe", role: "reviewer", risk: "low" }
      ],
      commits: [
        {
          id: "c1",
          sha: "ab89cce",
          title: "refactor: isolate policy resolver context",
          date: "2026-03-13",
          userId: "u1",
          risk: "medium"
        }
      ],
      issues: [
        {
          id: "i1",
          number: 64,
          title: "Rule conflict not reported in summary panel",
          status: "open",
          label: "bug",
          userId: "u2",
          risk: "medium"
        }
      ],
      prs: [
        {
          id: "p1",
          number: 39,
          title: "feat: export policy graph metadata",
          status: "merged",
          review: "approved",
          userId: "u3",
          risk: "low"
        }
      ]
    }
  ]
};
