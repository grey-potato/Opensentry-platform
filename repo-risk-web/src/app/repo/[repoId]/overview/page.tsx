import {
  DimensionSection,
  type MetricProgressItem,
  InsightHeroCards,
} from "@/components/insight-ui";
import {
  RepoOverviewHero,
  RepoPreviewPanel,
  RepoTimelineChart,
} from "@/components/repo-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getRepoOverviewViewModel } from "@/lib/repo-view-models";

function parseMetricProgress(value: string) {
  const cleaned = value.replace(/,/g, "");
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  const number = match ? Number(match[0]) : 0;

  if (value.includes("%")) {
    return Math.max(0, Math.min(100, number));
  }

  if (value.startsWith("+") || value.startsWith("-")) {
    return Math.max(0, Math.min(100, 50 + Math.max(-50, Math.min(50, number))));
  }

  return Math.max(8, Math.min(100, number * 8));
}

function buildOverviewDimensionItems(
  locale: "zh-CN" | "en",
  portraitSummary: Array<{ label: string; value: string }>,
  summaryStats: Array<{ label: string; value: string }>
) {
  const activity: MetricProgressItem[] = [
    {
      label: portraitSummary[0]?.label ?? (locale === "en" ? "Commit / Week" : "周提交频率"),
      value: portraitSummary[0]?.value ?? "-",
      description:
        locale === "en" ? "Observe the recent weekly commit rhythm." : "观察最近窗口内的周提交节奏。",
      progress: parseMetricProgress(portraitSummary[0]?.value ?? "0"),
      tone: "positive",
      showProgress: false,
      featured: true,
    },
    {
      label: portraitSummary[1]?.label ?? (locale === "en" ? "Active Week Ratio" : "活跃周占比"),
      value: portraitSummary[1]?.value ?? "-",
      description:
        locale === "en" ? "Measure how steadily the repository stays active." : "衡量仓库保持活跃的稳定程度。",
      progress: parseMetricProgress(portraitSummary[1]?.value ?? "0"),
      tone: "positive",
      showProgress: true,
    },
  ];

  const collaboration: MetricProgressItem[] = [
    {
      label: portraitSummary[2]?.label ?? (locale === "en" ? "Collaboration Index" : "协作指数"),
      value: portraitSummary[2]?.value ?? "-",
      description:
        locale === "en"
          ? "Approximate scale of participants involved in collaboration."
          : "反映当前协作参与规模的近似信号。",
      progress: parseMetricProgress(portraitSummary[2]?.value ?? "0"),
      tone: "warning",
      showProgress: false,
      featured: true,
    },
    {
      label: summaryStats[4]?.label ?? (locale === "en" ? "Open Issues" : "Open Issue"),
      value: summaryStats[4]?.value ?? "-",
      description:
        locale === "en" ? "Current unresolved issue load." : "当前仍待处理的问题数量。",
      progress: parseMetricProgress(summaryStats[4]?.value ?? "0"),
      tone: "warning",
      showProgress: false,
    },
  ];

  const community: MetricProgressItem[] = [
    {
      label: portraitSummary[3]?.label ?? (locale === "en" ? "Star Delta" : "Star 增量"),
      value: portraitSummary[3]?.value ?? "-",
      description:
        locale === "en" ? "Recent movement in community attention." : "最近窗口内的社区关注变化。",
      progress: parseMetricProgress(portraitSummary[3]?.value ?? "0"),
      tone: "positive",
      showProgress: false,
      featured: true,
    },
    {
      label: summaryStats[0]?.label ?? "Stars",
      value: summaryStats[0]?.value ?? "-",
      description: locale === "en" ? "Current star snapshot." : "当前社区关注规模快照。",
      progress: parseMetricProgress(summaryStats[0]?.value ?? "0"),
      tone: "neutral",
      showProgress: false,
    },
    {
      label: summaryStats[1]?.label ?? "Forks",
      value: summaryStats[1]?.value ?? "-",
      description: locale === "en" ? "Current fork snapshot." : "当前社区派生参与规模快照。",
      progress: parseMetricProgress(summaryStats[1]?.value ?? "0"),
      tone: "neutral",
      showProgress: false,
    },
  ];

  return { activity, collaboration, community };
}

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();
  const model = await getRepoOverviewViewModel(repoId, locale);
  const dimensions = buildOverviewDimensionItems(locale, model.portraitSummary, model.summaryStats);

  return (
    <div className="repo-overview-shell">
      <RepoOverviewHero repoId={repoId} model={model} locale={locale} />

      <InsightHeroCards
        items={model.summaryStats.map((item) => ({
          label: item.label,
          value: item.value,
          description: item.note,
          tone: "neutral" as const,
        }))}
      />

      <section className="card overview-portrait-summary">
        <div className="overview-section-head">
          <div>
            <h3>{locale === "en" ? "Project Portrait Snapshot" : "项目画像快照"}</h3>
            <p className="muted">
              {locale === "en"
                ? "Start with the latest portrait window, then scan the most representative repository signals."
                : "先看最新画像窗口，再快速扫读这一阶段最有代表性的仓库信号。"}
            </p>
          </div>
          <span className="badge">{model.windowLabel}</span>
        </div>
        <InsightHeroCards
          items={model.portraitSummary.map((item, index) => ({
            label: item.label,
            value: item.value,
            description:
              [
                locale === "en" ? "Commit rhythm over the latest window." : "最近窗口内的提交节奏。",
                locale === "en" ? "Consistency of active weeks." : "保持活跃的稳定程度。",
                locale === "en" ? "Current collaboration participation scale." : "当前协作参与规模。",
                locale === "en" ? "Recent community star movement." : "最近窗口内的社区增长变化。",
              ][index] ?? "",
            tone: index === 2 ? "warning" : "positive",
          }))}
        />
      </section>

      <section className="insight-dimension-grid">
        <DimensionSection
          title={locale === "en" ? "Activity" : "活跃度"}
          description={
            locale === "en"
              ? "Start from contribution rhythm and continuity."
              : "先看项目最近一段时间的活跃节奏与持续性。"
          }
          items={dimensions.activity}
        />
        <DimensionSection
          title={locale === "en" ? "Collaboration" : "协作治理"}
          description={
            locale === "en"
              ? "Then check issue pressure and coordination load."
              : "再看当前的协作负载与待处理压力。"
          }
          items={dimensions.collaboration}
        />
        <DimensionSection
          title={locale === "en" ? "Community" : "社区关注"}
          description={
            locale === "en"
              ? "Finally read current attention and recent movement."
              : "最后看社区关注规模以及最近的变化方向。"
          }
          items={dimensions.community}
        />
      </section>

      <RepoTimelineChart
        title={locale === "en" ? "Repository History" : "仓库历史时序"}
        description={
          locale === "en"
            ? "A quick view of repository metadata movement across the latest snapshots."
            : "用一张趋势图快速看最近几次抓取中的仓库元数据变化。"
        }
        caption={
          locale === "en"
            ? "Latest 12 repository metadata snapshots."
            : "最近 12 次抓取的仓库元数据变化。"
        }
        points={model.timeline}
        locale={locale}
      />

      <section className="overview-preview-grid">
        <RepoPreviewPanel
          title={locale === "en" ? "Recent Commits" : "最近提交"}
          href={`/repo/${repoId}/commits`}
          items={model.recentCommits}
          locale={locale}
        />
        <RepoPreviewPanel
          title={locale === "en" ? "Open Issues" : "Open Issues"}
          href={`/repo/${repoId}/issues`}
          items={model.openIssues}
          locale={locale}
        />
        <RepoPreviewPanel
          title={locale === "en" ? "Pull Requests" : "Pull Requests"}
          href={`/repo/${repoId}/prs`}
          items={model.pullRequests}
          locale={locale}
        />
      </section>
    </div>
  );
}
