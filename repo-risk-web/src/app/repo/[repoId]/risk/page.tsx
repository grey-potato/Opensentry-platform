import {
  DimensionSection,
  InsightHeroCards,
  MetricBarChartSection,
  type MetricProgressItem,
} from "@/components/insight-ui";
import { getRequestLocale } from "@/lib/locale-server";
import { getRepoRiskViewModel, type RiskLevel } from "@/lib/repo-view-models";

function getTone(level: RiskLevel): "positive" | "warning" | "critical" {
  switch (level) {
    case "low":
      return "positive";
    case "high":
      return "critical";
    default:
      return "warning";
  }
}

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

function getSnapshotSummary(label: string, locale: "zh-CN" | "en") {
  if (/commit/i.test(label) || label.includes("提交")) {
    return locale === "en" ? "Weekly contribution rhythm." : "用于观察最近窗口内的周提交节奏。";
  }

  if (/ratio/i.test(label) || label.includes("占比")) {
    return locale === "en" ? "Consistency of active weeks." : "用于观察项目保持活跃的稳定程度。";
  }

  if (/collab/i.test(label) || label.includes("协作")) {
    return locale === "en" ? "Approximate collaboration participation scale." : "用于观察当前协作参与规模。";
  }

  if (/backlog/i.test(label) || label.includes("积压")) {
    return locale === "en"
      ? "Open pull requests still waiting in backlog."
      : "用于观察当前仍在排队等待处理的 PR 数量。";
  }

  if (/response/i.test(label) || label.includes("首响")) {
    return locale === "en" ? "Typical first response time." : "用于观察 Issue 获得首次响应的典型时长。";
  }

  if (/delta/i.test(label) || label.includes("增量")) {
    return locale === "en" ? "Recent movement over the latest window." : "用于观察最近窗口内的变化趋势。";
  }

  return locale === "en" ? "Latest portrait snapshot." : "来自最新项目画像快照。";
}

function shouldShowProgress(label: string, value: string) {
  if (value.includes("%")) {
    return true;
  }

  return /ratio/i.test(label) || label.includes("占比");
}

export default async function RiskPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const locale = await getRequestLocale();
  const model = await getRepoRiskViewModel(repoId, locale);

  const heroCards = [
    ...model.summaryStats.map((item) => ({
      label: item.label,
      value: item.value,
      description:
        item.label.toLowerCase().includes("window") || item.label.includes("窗口")
          ? locale === "en"
            ? "Observation range used by the latest portrait."
            : "本次画像评估使用的观测范围。"
          : undefined,
      tone: "neutral" as const,
    })),
    ...model.snapshots.slice(0, 4).map((item) => ({
      label: item.label,
      value: item.value,
      description: getSnapshotSummary(item.label, locale),
      tone: getTone(item.level),
    })),
  ].slice(0, 8);

  const dimensionItems = model.dimensions.map((dimension) => ({
    title: dimension.title,
    description: dimension.description,
    items: dimension.metrics.map(
      (metric, index): MetricProgressItem => ({
        label: metric.label,
        value: metric.value,
        description: metric.note,
        progress: parseMetricProgress(metric.value),
        tone: getTone(metric.level),
        showProgress: shouldShowProgress(metric.label, metric.value),
        featured: index === 0,
      })
    ),
  }));

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{locale === "en" ? "Project Portrait" : "项目画像"}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.description}</p>
          </div>
        </div>
        <div className="context-tags">
          {model.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <InsightHeroCards items={heroCards} />

      <section className="insight-dimension-grid">
        {dimensionItems.map((dimension) => (
          <DimensionSection
            key={dimension.title}
            title={dimension.title}
            description={dimension.description}
            items={dimension.items}
          />
        ))}
      </section>

      <MetricBarChartSection
        title={locale === "en" ? "Detailed Snapshot Metrics" : "详细快照指标"}
        description={
          locale === "en"
            ? "Read the latest project portrait snapshot as a compact set of comparable columns."
            : "把最新项目画像快照收成一组便于横向比较的指标柱。"
        }
        items={model.snapshots.map((item) => ({
          label: item.label,
          value: item.value,
          description: getSnapshotSummary(item.label, locale),
          progress: parseMetricProgress(item.value),
          tone: getTone(item.level),
        }))}
      />
    </div>
  );
}
