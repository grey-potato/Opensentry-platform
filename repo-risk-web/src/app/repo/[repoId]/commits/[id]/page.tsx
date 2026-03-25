import Link from "next/link";
import {
  EvidenceTagGroup,
  InsightHeroCards,
  MetricBarChartSection,
} from "@/components/insight-ui";
import { getCommitDetailPageViewModel } from "@/lib/entity-view-models";
import { getRequestLocale } from "@/lib/locale-server";

function numericValue(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function trustLevelProgress(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("trusted") || normalized.includes("high")) {
    return 100;
  }
  if (normalized.includes("untrusted") || normalized.includes("at_risk")) {
    return 28;
  }
  if (normalized.includes("unknown") || normalized.includes("medium")) {
    return 56;
  }
  return 40;
}

export default async function CommitDetailPage({
  params,
}: {
  params: Promise<{ repoId: string; id: string }>;
}) {
  const { repoId, id } = await params;
  const locale = await getRequestLocale();
  const model = await getCommitDetailPageViewModel(repoId, id, locale);
  const findingsItem = model.portraitStats.find(
    (item) => item.label === (locale === "en" ? "Semgrep Findings" : "Semgrep 命中数")
  );
  const trustItem = model.portraitStats.find(
    (item) => item.label === (locale === "en" ? "Trust Level" : "可信等级")
  );
  const assessedItem = model.portraitStats.find(
    (item) => item.label === (locale === "en" ? "Assessed At" : "评估时间")
  );
  const verificationItem = model.portraitStats.find(
    (item) => item.label === (locale === "en" ? "Verification" : "验证信息")
  );
  const signatureItem = model.portraitStats.find(
    (item) => item.label === (locale === "en" ? "Signature" : "签名类型")
  );

  const evidenceChartItems = model.portraitAvailable
    ? [
        {
          label: locale === "en" ? "Trust" : "可信等级",
          value: trustItem?.value ?? "-",
          description:
            locale === "en"
              ? "Mapped from the backend trust level field."
              : "根据后端 trust_level 字段映射为相对高度。",
          progress: trustLevelProgress(trustItem?.value ?? ""),
          tone: "neutral" as const,
        },
        {
          label: locale === "en" ? "Findings" : "命中数",
          value: findingsItem?.value ?? "0",
          description:
            locale === "en"
              ? "Number of findings reported by the latest commit portrait."
              : "最新提交画像返回的命中数量。",
          progress: Math.max(12, Math.min(100, numericValue(findingsItem?.value ?? "0") * 14)),
          tone: "critical" as const,
        },
        {
          label: locale === "en" ? "Rules" : "规则数",
          value: String(model.portraitRules.length),
          description:
            locale === "en"
              ? "Count of triggered rules returned by the latest portrait."
              : "最新画像返回的触发规则数量。",
          progress: Math.max(12, Math.min(100, model.portraitRules.length * 18)),
          tone: "warning" as const,
        },
        {
          label: locale === "en" ? "Tags" : "标签数",
          value: String(model.portraitTags.length),
          description:
            locale === "en"
              ? "Count of portrait tags attached to this commit."
              : "当前提交画像附带的标签数量。",
          progress: Math.max(12, Math.min(100, model.portraitTags.length * 20)),
          tone: "positive" as const,
        },
      ]
    : [];

  return (
    <div className="repo-overview-shell">
      <section className="card repo-hero-card">
        <div className="repo-hero-head">
          <div>
            <div className="repo-kicker">{locale === "en" ? "Commit Portrait" : "提交画像"}</div>
            <h2>{model.title}</h2>
            <p className="muted repo-hero-description">{model.subtitle}</p>
          </div>
        </div>
        <div className="inline-links">
          <Link href={model.backHref}>{locale === "en" ? "Back to Commits" : "返回提交列表"}</Link>
          <Link href={`/repo/${repoId}/users`}>{locale === "en" ? "View Users" : "查看用户"}</Link>
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
              <h3>{model.messageTitle}</h3>
              <p className="muted">
                {locale === "en"
                  ? "Read the commit title and extended message together."
                  : "将提交标题与扩展信息放在一起阅读。"}
              </p>
            </div>
          </div>
          <pre className="detail-body">{model.messageBody}</pre>
        </article>

        <article className="card insight-detail-card">
          <div className="overview-section-head">
            <div>
              <h3>{locale === "en" ? "Commit Metadata" : "提交元数据"}</h3>
              <p className="muted">
                {locale === "en"
                  ? "Basic commit identity, verification, and capture information."
                  : "提交身份、验证情况与抓取信息。"}
              </p>
            </div>
          </div>
          <div className="detail-kv-grid">
            {model.metadata.map((item) => (
              <div key={item.label} className="detail-kv-item">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="detail-two-column">
        <article className="card insight-detail-card">
          <div className="overview-section-head">
            <div>
              <h3>{locale === "en" ? "Portrait Snapshot" : "画像快照"}</h3>
              <p className="muted">
                {locale === "en"
                  ? "Use the latest portrait result to read trust level, assessment time, and evidence fields."
                  : "从最新画像结果中读出可信等级、评估时间与证据字段。"}
              </p>
            </div>
          </div>
          <InsightHeroCards
            columns={2}
            compact
            items={[
              trustItem,
              assessedItem,
              verificationItem,
              signatureItem,
            ]
              .filter(Boolean)
              .map((item) => ({
                label: item!.label,
                value: item!.value,
                description: item!.note,
                tone: "neutral" as const,
              }))}
          />
        </article>

        {model.portraitAvailable ? (
          <MetricBarChartSection
            title={locale === "en" ? "Portrait Evidence" : "画像证据"}
            description={
              locale === "en"
                ? "Use backend findings, rule counts, tag counts, and trust level to compare evidence strength."
                : "用后端返回的命中数、规则数、标签数和可信等级来观察这次画像的证据强度。"
            }
            items={evidenceChartItems}
          />
        ) : (
          <article className="card insight-detail-card">
            <div className="overview-section-head">
              <div>
                <h3>{locale === "en" ? "Portrait Evidence" : "画像证据"}</h3>
              </div>
            </div>
            <div className="empty">
              {locale === "en"
                ? "No portrait result is available for this commit."
                : "当前提交暂无可用的画像结果。"}
            </div>
          </article>
        )}
      </section>

      {model.portraitAvailable ? (
        <div className="portrait-evidence-grid">
          <article className="card evidence-panel-card">
            <EvidenceTagGroup
              title={locale === "en" ? "Portrait Tags" : "画像标签"}
              items={model.portraitTags}
              emptyText={locale === "en" ? "No portrait tags." : "暂无画像标签。"}
            />
          </article>
          <article className="card evidence-panel-card">
            <EvidenceTagGroup
              title={locale === "en" ? "Triggered Rules" : "触发规则"}
              items={model.portraitRules}
              emptyText={locale === "en" ? "No triggered rules." : "暂无触发规则。"}
            />
          </article>
        </div>
      ) : null}
    </div>
  );
}
