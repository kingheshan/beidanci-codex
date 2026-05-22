"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookIcon, BrainIcon, CheckIcon, ChevronRightIcon, HomeIcon, SparkleIcon, TrophyIcon, UserIcon } from "@/components/icons";
import { Card, ProgressBar, Skeleton, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { PARENT_ACCOUNT_ROWS, PARENT_MESSAGES, PARENT_RADAR, PARENT_REPORT, type ParentReport } from "@/lib/parent-report-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useExperienceConfig } from "@/lib/use-remote-config";

type ParentTab = "today" | "analysis" | "teacher" | "me";

const tabs: Array<{ id: ParentTab; label: string; icon: JSX.Element }> = [
  { id: "today", label: "今日", icon: <HomeIcon size={18} /> },
  { id: "analysis", label: "分析", icon: <BrainIcon size={18} /> },
  { id: "teacher", label: "老师", icon: <BookIcon size={18} /> },
  { id: "me", label: "我的", icon: <UserIcon size={18} /> },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function WeekChart({ report, config }: { report: ParentReport; config: ExperienceConfig["parent"] }) {
  const maxMinutes = Math.max(1, ...report.weekMinutes);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-black text-[color:var(--c-ink)]">{config.weekChartTitle}</p>
          <p className="mt-1 text-[11px] font-bold text-[color:var(--c-ink-muted)]">{config.weekChartSubtitle}</p>
        </div>
        <Tag color="var(--c-primary-deep)">+12%</Tag>
      </div>
      <div className="flex h-[132px] items-end gap-2">
        {report.weekDays.map((day, index) => {
          const height = Math.max(8, Math.round((report.weekMinutes[index] / maxMinutes) * 96));
          return (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={day}>
              <div className="flex h-[100px] w-full items-end justify-center rounded-full bg-[color:var(--c-bg)] px-1.5 py-1">
                <div
                  className={cx(
                    "w-full max-w-[24px] rounded-full",
                    report.weekMinutes[index] === 0 ? "bg-[color:var(--c-line)]" : "bg-[color:var(--c-primary)]",
                  )}
                  style={{ height }}
                />
              </div>
              <span className="text-[11px] font-black text-[color:var(--c-ink-muted)]">{day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ParentHome({ report, config }: { report: ParentReport; config: ExperienceConfig["parent"] }) {
  const progress = report.mastered / report.target;
  const heroTitle = formatExperienceTemplate(config.homeTitleTemplate, { childName: report.childName });
  const heroBody = formatExperienceTemplate(config.homeBodyTemplate, {
    streak: report.streak,
    pct: report.timeRank.pct
  });

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,var(--c-primary)_0%,#36b4ff_58%,#2b1f6e_100%)] p-5 text-white shadow-pop">
        <div className="absolute -right-5 -top-3 opacity-95">
          <Wordy form="star" glow={false} mood="happy" pose="wave" size={132} />
        </div>
        <div className="relative z-10 max-w-[250px]">
          <Tag bg="rgba(255,255,255,0.22)" color="#fff" size="xs">
            {report.grade} · {config.reportDateLabel}
          </Tag>
          <h1 className="mt-4 text-[31px] font-black leading-tight">{heroTitle}</h1>
          <p className="mt-2 text-[13px] font-bold leading-relaxed text-white/82">
            {heroBody}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[12px] font-black text-[color:var(--c-ink-muted)]">{config.weeklyXpLabel}</p>
          <p className="mt-2 text-[28px] font-black leading-none text-[color:var(--c-primary-deep)]">
            {report.weekXP.toLocaleString("en-US")} XP
          </p>
          <p className="mt-2 text-[11px] font-bold text-[color:var(--c-ink-soft)]">平均每天 {report.weekAvg} 分钟</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] font-black text-[color:var(--c-ink-muted)]">{config.targetProgressLabel}</p>
          <p className="mt-2 text-[28px] font-black leading-none text-[color:var(--c-ink)]">{Math.round(progress * 100)}%</p>
          <div className="mt-3">
            <ProgressBar label="词书目标进度" value={progress} height={8} />
          </div>
        </Card>
      </section>

      <WeekChart report={report} config={config} />

      <section className="grid grid-cols-2 gap-3">
        {[
          ["连胜天数", `${report.streak} 天`, "🔥"],
          ["已掌握", `${report.mastered}`, "✅"],
          ["新学单词", `${report.weekWords.reduce((sum, value) => sum + value, 0)}`, "📚"],
          ["同年级排名", `前 ${report.timeRank.pct}%`, "🏆"],
        ].map(([label, value, icon]) => (
          <div className="rounded-[20px] bg-white p-4 shadow-card" key={label}>
            <span className="text-[22px]" aria-hidden>
              {icon}
            </span>
            <p className="mt-2 text-[18px] font-black text-[color:var(--c-ink)]">{value}</p>
            <p className="mt-1 text-[11px] font-black text-[color:var(--c-ink-muted)]">{label}</p>
          </div>
        ))}
      </section>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-black text-[color:var(--c-ink)]">{config.recentBadgesTitle}</h2>
          <TrophyIcon className="text-[color:var(--c-warning)]" size={20} />
        </div>
        <div className="flex flex-wrap gap-2">
          {report.recentBadges.map((badge) => (
            <span className="rounded-full bg-[color:var(--c-bg)] px-3 py-2 text-[12px] font-black text-[color:var(--c-ink)]" key={badge}>
              {badge}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-[color:var(--c-primary-soft)] text-2xl">{report.teacher.avatar}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-[color:var(--c-ink)]">{report.teacher.name}</p>
              <span className="text-[10px] font-black text-[color:var(--c-ink-muted)]">{report.teacher.time}</span>
            </div>
            <p className="mt-1 text-[13px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">{report.teacher.lastMessage}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RadarChart() {
  const points = useMemo(() => {
    const center = 82;
    const radius = 58;
    return PARENT_RADAR.map((item, index) => {
      const angle = -Math.PI / 2 + (index / PARENT_RADAR.length) * Math.PI * 2;
      return {
        ...item,
        x: center + Math.cos(angle) * radius * item.value,
        y: center + Math.sin(angle) * radius * item.value,
        labelX: center + Math.cos(angle) * (radius + 22),
        labelY: center + Math.sin(angle) * (radius + 22),
      };
    });
  }, []);
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-[22px] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-black text-[color:var(--c-ink)]">六维能力雷达</p>
        <SparkleIcon className="text-[color:var(--c-primary)]" size={20} />
      </div>
      <svg className="mx-auto block" width="164" height="164" viewBox="0 0 164 164" role="img" aria-label="六维能力雷达图">
        {[1, 0.75, 0.5, 0.25].map((ratio) => {
          const ring = PARENT_RADAR.map((_, index) => {
            const angle = -Math.PI / 2 + (index / PARENT_RADAR.length) * Math.PI * 2;
            return `${82 + Math.cos(angle) * 58 * ratio},${82 + Math.sin(angle) * 58 * ratio}`;
          }).join(" ");
          return <polygon key={ratio} points={ring} fill="none" stroke="rgba(28,46,43,0.08)" strokeWidth="1" />;
        })}
        {PARENT_RADAR.map((_, index) => {
          const angle = -Math.PI / 2 + (index / PARENT_RADAR.length) * Math.PI * 2;
          return <line key={index} x1="82" y1="82" x2={82 + Math.cos(angle) * 58} y2={82 + Math.sin(angle) * 58} stroke="rgba(28,46,43,0.08)" />;
        })}
        <polygon points={polygon} fill="rgba(53,200,106,0.26)" stroke="var(--c-primary)" strokeWidth="3" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill="var(--c-primary)" />
            <text x={point.labelX} y={point.labelY} textAnchor="middle" dominantBaseline="middle" className="fill-[color:var(--c-ink-muted)] text-[10px] font-black">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ParentAnalysis({ report, config, onAddPlan }: { report: ParentReport; config: ExperienceConfig["parent"]; onAddPlan: () => void }) {
  return (
    <div className="space-y-4">
      <section className="rounded-[26px] bg-white p-5 shadow-card">
        <Tag color="var(--c-primary-deep)">{config.aiReportTag}</Tag>
        <h1 className="mt-3 text-[30px] font-black leading-tight text-[color:var(--c-ink)]">{config.analysisTitle}</h1>
        <p className="mt-2 text-[13px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">
          {config.analysisBody}
        </p>
      </section>

      <RadarChart />

      <Card className="p-4">
        <h2 className="text-[16px] font-black text-[color:var(--c-ink)]">{config.strengthsTitle}</h2>
        <div className="mt-3 space-y-2">
          {report.strengths.map((strength) => (
            <div className="flex items-center gap-2 rounded-[16px] bg-[color:var(--c-bg)] px-3 py-2" key={strength}>
              <CheckIcon className="text-[color:var(--c-primary)]" size={17} />
              <span className="text-[13px] font-black text-[color:var(--c-ink-soft)]">{strength}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-[16px] font-black text-[color:var(--c-ink)]">{config.weaknessTitle}</h2>
        <div className="mt-3 space-y-3">
          {report.weakness.map((item) => (
            <div className="rounded-[18px] border border-[rgba(255,90,111,0.16)] bg-[rgba(255,90,111,0.06)] p-3" key={item.type}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-black text-[color:var(--c-ink)]">{item.type}</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[color:var(--c-danger)]">{item.count} 次</span>
              </div>
              <p className="mt-1 text-[12px] font-bold text-[color:var(--c-ink-soft)]">{item.desc}</p>
            </div>
          ))}
        </div>
        <button
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--c-primary)] text-[14px] font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.14)] transition active:translate-y-0.5"
          type="button"
          onClick={onAddPlan}
        >
          {config.addPlanCta}
          <ChevronRightIcon size={16} />
        </button>
      </Card>
    </div>
  );
}

function ParentTeacher({ report, config }: { report: ParentReport; config: ExperienceConfig["parent"] }) {
  const placeholder = formatExperienceTemplate(config.teacherReplyPlaceholderTemplate, { teacherName: report.teacher.name });

  return (
    <div className="flex min-h-[calc(100dvh-112px)] flex-col gap-4 pb-1">
      <section className="rounded-[26px] bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-[20px] bg-[color:var(--c-primary-soft)] text-3xl">{report.teacher.avatar}</div>
          <div>
            <h1 className="text-[26px] font-black leading-none text-[color:var(--c-ink)]">{report.teacher.name}</h1>
            <p className="mt-2 text-[12px] font-black text-[color:var(--c-ink-muted)]">{config.teacherStatus}</p>
          </div>
        </div>
      </section>

      <div className="flex-1 space-y-3">
        {PARENT_MESSAGES.map((message) => (
          <div
            className={cx(
              "flex",
              message.from === "parent" ? "justify-end" : "justify-start",
            )}
            key={message.id}
          >
            <div
              className={cx(
                "max-w-[82%] rounded-[20px] px-4 py-3 shadow-sm",
                message.from === "parent"
                  ? "rounded-br-[6px] bg-[color:var(--c-primary)] text-white"
                  : "rounded-bl-[6px] bg-white text-[color:var(--c-ink)]",
              )}
            >
              <p className={cx("text-[11px] font-black", message.from === "parent" ? "text-white/72" : "text-[color:var(--c-ink-muted)]")}>{message.time}</p>
              <p className="mt-1 text-[13px] font-bold leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      <label className="sticky bottom-[86px] block rounded-[24px] bg-white p-2 shadow-pop">
        <span className="sr-only">{placeholder}</span>
        <input
          className="h-12 w-full rounded-[18px] bg-[color:var(--c-bg)] px-4 text-[14px] font-bold outline-none placeholder:text-[color:var(--c-ink-faint)]"
          placeholder={placeholder}
          type="text"
        />
      </label>
    </div>
  );
}

function ParentAccount({ config }: { config: ExperienceConfig["parent"] }) {
  return (
    <div className="space-y-4">
      <section className="rounded-[26px] bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid size-16 place-items-center rounded-[24px] bg-[linear-gradient(145deg,#ffe9de,#fff7d0)] text-[28px]">吴</div>
          <div>
            <h1 className="text-[28px] font-black leading-none text-[color:var(--c-ink)]">{config.accountTitle}</h1>
            <p className="mt-2 text-[15px] font-black text-[color:var(--c-primary-deep)]">{config.accountName}</p>
          </div>
        </div>
      </section>

      <Card className="p-4">
        <h2 className="text-[16px] font-black text-[color:var(--c-ink)]">{config.settingsTitle}</h2>
        <div className="mt-3 divide-y divide-[rgba(28,46,43,0.08)]">
          {PARENT_ACCOUNT_ROWS.map((row) => (
            <button className="flex min-h-[56px] w-full items-center justify-between gap-3 py-2 text-left" key={row.label} type="button">
              <span className="text-[14px] font-black text-[color:var(--c-ink)]">{row.label}</span>
              <span className="flex items-center gap-2 text-[12px] font-bold text-[color:var(--c-ink-muted)]">
                {row.value}
                <ChevronRightIcon size={15} />
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Wordy form="bean" glow={false} mood="happy" pose="study" size={70} />
          <div>
            <p className="text-[14px] font-black text-[color:var(--c-ink)]">{config.suggestionTitle}</p>
            <p className="mt-1 text-[12px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">
              {config.suggestionBody}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ParentReportLoading({ label }: { label: string }) {
  return (
    <div className="space-y-4" aria-live="polite">
      <section className="rounded-[28px] bg-white p-5 shadow-card">
        <Skeleton label={label} height={18} width={120} radius={9} />
        <div className="mt-5 space-y-3">
          <Skeleton height={34} width="72%" radius={12} />
          <Skeleton height={14} width="92%" radius={7} />
          <Skeleton height={14} width="64%" radius={7} />
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <Skeleton height={14} width={70} radius={7} />
          <Skeleton className="mt-4" height={30} width={116} radius={12} />
          <Skeleton className="mt-3" height={12} width={96} radius={6} />
        </Card>
        <Card className="p-4">
          <Skeleton height={14} width={70} radius={7} />
          <Skeleton className="mt-4" height={30} width={78} radius={12} />
          <Skeleton className="mt-4" height={8} width="100%" radius={8} />
        </Card>
      </section>
      <Card className="p-4">
        <Skeleton height={16} width={118} radius={8} />
        <div className="mt-4 flex h-[132px] items-end gap-2">
          {[48, 72, 24, 84, 96, 62, 42].map((height, index) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={index}>
              <Skeleton height={height} width={24} radius={999} />
              <Skeleton height={11} width={14} radius={6} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ParentReportError({ message, config, onRetry }: { message: string; config: ExperienceConfig["parent"]; onRetry: () => void }) {
  return (
    <section className="rounded-[28px] bg-white p-5 text-center shadow-card">
      <div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-[rgba(255,90,111,0.1)] text-[color:var(--c-danger)]">
        <SparkleIcon size={26} />
      </div>
      <h1 className="mt-4 text-[24px] font-black text-[color:var(--c-ink)]">{config.errorTitle}</h1>
      <p className="mt-2 text-[13px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">{message}</p>
      <button
        className="mt-5 h-12 rounded-full bg-[color:var(--c-primary)] px-6 text-[14px] font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.14)] transition active:translate-y-0.5"
        type="button"
        onClick={onRetry}
      >
        {config.retryLabel}
      </button>
    </section>
  );
}

export function ParentScreen({ apiClient }: { apiClient?: Pick<ApiClient, "getParentReport"> }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTab>("today");
  const [toast, setToast] = useState<string | null>(null);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const loadParentReport = useCallback(() => client.getParentReport(), [client]);
  const reportQuery = useApiQuery(loadParentReport, apiClient ? undefined : { initialData: PARENT_REPORT });
  const report = reportQuery.data;
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.parent;
  const tabLabels = new Map(config.tabs.map((tab) => [tab.id, tab.label]));

  useEffect(() => {
    setHydrated(true);
  }, []);

  const showPlanToast = () => {
    setToast(config.planToast);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main
      className="min-h-dvh bg-[linear-gradient(180deg,#eff8f1_0%,var(--c-bg)_48%,#f8f5ff_100%)] text-[color:var(--c-ink)]"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="parent-ready"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[color:var(--c-bg)] shadow-[0_24px_90px_rgba(28,46,43,0.12)] sm:my-6 sm:min-h-[calc(100dvh-48px)] sm:overflow-hidden sm:rounded-[32px]">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[color:var(--c-bg)]/92 px-4 pb-3 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-2xl">
          <button
            aria-label="返回学生端"
            className="grid size-11 place-items-center rounded-full bg-white text-[color:var(--c-ink-soft)] shadow-sm"
            type="button"
            onClick={() => router.push("/dashboard")}
          >
            <HomeIcon size={20} />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[color:var(--c-ink-muted)]">Parent App</p>
            <p className="mt-0.5 text-[15px] font-black text-[color:var(--c-ink)]">
              {report ? `${report.childName} · ${report.grade}` : config.loadingChildLabel}
            </p>
          </div>
          <button
            aria-label="查看孩子主页"
            className="grid size-11 place-items-center rounded-full bg-white text-[color:var(--c-primary-deep)] shadow-sm"
            type="button"
            onClick={() => router.push("/me")}
          >
            <UserIcon size={20} />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto px-4 pb-[112px]">
          {reportQuery.loading && !report ? <ParentReportLoading label={config.loadingLabel} /> : null}
          {reportQuery.error && !report ? <ParentReportError message={reportQuery.error.message} config={config} onRetry={reportQuery.reload} /> : null}
          {report ? (
            <>
              {activeTab === "today" ? <ParentHome report={report} config={config} /> : null}
              {activeTab === "analysis" ? <ParentAnalysis report={report} config={config} onAddPlan={showPlanToast} /> : null}
              {activeTab === "teacher" ? <ParentTeacher report={report} config={config} /> : null}
              {activeTab === "me" ? <ParentAccount config={config} /> : null}
            </>
          ) : null}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[rgba(28,46,43,0.08)] bg-white/94 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_36px_rgba(28,46,43,0.1)] backdrop-blur-2xl sm:bottom-6 sm:rounded-b-[32px]">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                aria-label={tab.label}
                className={cx(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[18px] text-[11px] font-black transition",
                  active ? "bg-[color:var(--c-primary-soft)] text-[color:var(--c-primary-deep)]" : "text-[color:var(--c-ink-muted)]",
                )}
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tabLabels.get(tab.id) ?? tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {toast ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--c-ink)] px-5 py-3 text-[13px] font-black text-white shadow-pop"
          initial={{ opacity: 0, y: -10 }}
        >
          {toast}
        </motion.div>
      ) : null}
    </main>
  );
}
