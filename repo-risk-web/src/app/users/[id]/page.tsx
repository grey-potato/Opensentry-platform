import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
import { getGlobalUserDetailPageViewModel } from "@/lib/entity-view-models";

function getCapabilityCards(
  items: Array<{ label: string; value: string }>,
  locale: "zh-CN" | "en"
) {
  const map: Record<string, { zhTitle: string; enTitle: string; zhNote: string; enNote: string }> = {
    activity: {
      zhTitle: "活跃度",
      enTitle: "Activity",
      zhNote: "反映近期活跃程度和贡献频率。",
      enNote: "Recent activity and contribution frequency.",
    },
    maturity: {
      zhTitle: "成熟度",
      enTitle: "Maturity",
      zhNote: "反映协作稳定性和经验积累。",
      enNote: "Repository participation stability and experience.",
    },
    influence: {
      zhTitle: "影响力",
      enTitle: "Influence",
      zhNote: "反映在社区中的传播和影响范围。",
      enNote: "Reach and influence in the wider community.",
    },
    completeness: {
      zhTitle: "完整性",
      enTitle: "Completeness",
      zhNote: "反映资料与贡献信息的完整程度。",
      enNote: "Profile and contribution completeness.",
    },
    verification: {
      zhTitle: "验证情况",
      enTitle: "Verification",
      zhNote: "反映身份与证据验证质量。",
      enNote: "Identity and evidence verification quality.",
    },
    anomaly_penalty: {
      zhTitle: "异常扣分",
      enTitle: "Anomaly Penalty",
      zhNote: "反映异常行为带来的扣分。",
      enNote: "Penalty caused by anomalous behavior.",
    },
  };

  return items.map((item) => ({
    label:
      map[item.label]?.[locale === "en" ? "enTitle" : "zhTitle"] ??
      item.label.replaceAll("_", " "),
    value: item.value,
    note:
      map[item.label]?.[locale === "en" ? "enNote" : "zhNote"] ??
      (locale === "en"
        ? "Derived from the latest user portrait dimension score."
        : "来自最近一次用户画像中的维度得分。"),
  }));
}

export default async function GlobalUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const model = await getGlobalUserDetailPageViewModel(id, locale);
  const capabilityCards = getCapabilityCards(model.scoreBreakdown, locale);

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">
              {locale === "en" ? "Global User Portrait" : "全局用户画像"}
            </div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{locale === "en" ? "Back to Search" : "返回搜索"}</Link>
        </div>
      </section>

      <section className="repo-summary-grid">
        {model.summaryStats.map((item) => (
          <article key={item.label} className="card repo-summary-card">
            <div className="muted">{item.label}</div>
            <h3>{item.value}</h3>
          </article>
        ))}
      </section>

      <section className="detail-two-column">
        <article className="card">
          <h3>{t.entities.users.profile}</h3>
          <div className="detail-kv-grid">
            {model.profileStats.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <div className="overview-section-head">
            <div>
              <h3>{model.portraitTitle}</h3>
              <p className="muted">{t.entities.users.portraitDescription}</p>
            </div>
          </div>
          <div className="detail-kv-grid">
            {model.portraitStats.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>{t.entities.users.scoreBreakdown}</h3>
        {capabilityCards.length ? (
          <div className="capability-grid">
            {capabilityCards.map((item) => (
              <article key={item.label} className="capability-card">
                <div className="muted">{item.label}</div>
                <h4>{item.value}</h4>
                <p className="muted">{item.note}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">{t.entities.users.noScoreBreakdown}</div>
        )}
      </section>
    </div>
  );
}
