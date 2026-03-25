import Link from "next/link";
import {
  InsightHeroCards,
  MetricBarChartSection,
  type MetricProgressItem,
} from "@/components/insight-ui";
import { getUserDetailPageViewModel } from "@/lib/entity-view-models";
import { getRequestLocale } from "@/lib/locale-server";

function parseMetricProgress(value: string) {
  const cleaned = value.replace(/,/g, "");
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  const number = match ? Number(match[0]) : 0;

  if (value.includes("/")) {
    const [current, total] = value.split("/").map((item) => Number(item.trim()));
    if (Number.isFinite(current) && Number.isFinite(total) && total > 0) {
      return Math.max(0, Math.min(100, (current / total) * 100));
    }
  }

  return Math.max(0, Math.min(100, number));
}

function getCapabilityCards(
  items: Array<{ label: string; value: string }>,
  locale: "zh-CN" | "en"
): MetricProgressItem[] {
  const map: Record<
    string,
    { zhTitle: string; enTitle: string; zhNote: string; enNote: string; tone: MetricProgressItem["tone"] }
  > = {
    activity: {
      zhTitle: "活跃度",
      enTitle: "Activity",
      zhNote: "反映最近的活跃程度与贡献频率。",
      enNote: "Recent activity level and contribution cadence.",
      tone: "positive",
    },
    maturity: {
      zhTitle: "成熟度",
      enTitle: "Maturity",
      zhNote: "反映协作稳定性与经验积累。",
      enNote: "Collaboration stability and accumulated experience.",
      tone: "neutral",
    },
    influence: {
      zhTitle: "影响力",
      enTitle: "Influence",
      zhNote: "反映在更大社区中的传播与影响范围。",
      enNote: "Reach and influence in the broader community.",
      tone: "warning",
    },
    completeness: {
      zhTitle: "完整性",
      enTitle: "Completeness",
      zhNote: "反映资料与行为信息的完整程度。",
      enNote: "Completeness of profile and behavior signals.",
      tone: "neutral",
    },
    verification: {
      zhTitle: "验证情况",
      enTitle: "Verification",
      zhNote: "反映身份与证据的验证质量。",
      enNote: "Identity and evidence verification quality.",
      tone: "positive",
    },
    anomaly_penalty: {
      zhTitle: "异常扣分",
      enTitle: "Anomaly Penalty",
      zhNote: "反映异常行为带来的扣分影响。",
      enNote: "Penalty impact caused by anomalous behavior.",
      tone: "critical",
    },
  };

  return items.map((item) => ({
    label:
      map[item.label]?.[locale === "en" ? "enTitle" : "zhTitle"] ??
      item.label.replaceAll("_", " "),
    value: item.value,
    description:
      map[item.label]?.[locale === "en" ? "enNote" : "zhNote"] ??
      (locale === "en"
        ? "Derived from the latest user portrait dimension score."
        : "来自最新用户画像中的能力维度得分。"),
    progress: parseMetricProgress(item.value),
    tone: map[item.label]?.tone ?? "neutral",
  }));
}

function getPortraitSnapshotColumns(
  items: Array<{ label: string; value: string; note?: string }>,
  locale: "zh-CN" | "en"
) {
  const preferredOrder = [
    locale === "en" ? "Trust Level" : "可信等级",
    locale === "en" ? "Total Score" : "总分",
    locale === "en" ? "Assessed At" : "评估时间",
  ];

  return [...items].sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left.label);
    const rightIndex = preferredOrder.indexOf(right.label);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;
  const locale = await getRequestLocale();
  const model = await getUserDetailPageViewModel(repoId, id, locale);
  const capabilityCards = getCapabilityCards(model.scoreBreakdown, locale);
  const portraitCards = getPortraitSnapshotColumns(model.portraitStats, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{locale === "en" ? "User Portrait" : "用户画像"}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{locale === "en" ? "Back to Users" : "返回用户列表"}</Link>
          <Link href={`/repo/${repoId}/commits`}>{locale === "en" ? "View Commits" : "查看提交"}</Link>
        </div>
      </section>

      <InsightHeroCards
        items={model.summaryStats.map((item) => ({
          label: item.label,
          value: item.value,
          description: item.note,
          tone: "neutral" as const,
        }))}
      />

      <section className="detail-two-column">
        <article className="card insight-detail-card">
          <div className="overview-section-head">
            <div>
              <h3>{locale === "en" ? "Profile" : "用户资料"}</h3>
              <p className="muted">
                {locale === "en"
                  ? "Basic identity and profile information captured from the platform."
                  : "来自平台侧的基础身份与资料信息。"}
              </p>
            </div>
          </div>
          <div className="detail-kv-grid">
            {model.profileStats.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card insight-detail-card">
          <div className="overview-section-head">
            <div>
              <h3>{locale === "en" ? "Portrait Snapshot" : "画像快照"}</h3>
              <p className="muted">
                {locale === "en"
                  ? "Use score, trust level, and assessment time to understand the latest portrait result."
                  : "用总分、可信等级和评估时间快速读懂这位贡献者的最新画像结果。"}
              </p>
            </div>
          </div>
          <InsightHeroCards
            columns={2}
            compact
            items={portraitCards.map((item) => ({
              label: item.label,
              value: item.value,
              description: item.note,
              tone: "neutral" as const,
            }))}
          />
        </article>
      </section>

      {capabilityCards.length ? (
        <MetricBarChartSection
          title={locale === "en" ? "Capability Dimensions" : "能力维度"}
          description={
            locale === "en"
              ? "Each column is scaled by the backend portrait score and max value for that dimension."
              : "每根柱的高度都按后端返回的该维度 score / max 计算，满分上限由画像模型定义。"
          }
          items={capabilityCards.map((item) => ({
            label: item.label,
            value: item.value,
            description: item.description,
            progress: item.progress,
            tone: item.tone,
          }))}
        />
      ) : (
        <section className="card insight-detail-card">
          <div className="overview-section-head">
            <div>
              <h3>{locale === "en" ? "Capability Dimensions" : "能力维度"}</h3>
            </div>
          </div>
          <div className="empty">
            {locale === "en"
              ? "No capability breakdown is available for this user yet."
              : "当前没有可用的能力维度信息。"}
          </div>
        </section>
      )}
    </div>
  );
}
