"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronRightIcon, SparkleIcon, StarIcon, TrophyIcon, ZapIcon } from "@/components/icons";
import { ProductSidebar } from "@/components/product-navigation";
import { Card, CTA, GemPill, LessonNode, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL, DASHBOARD_LABS, DASHBOARD_STATS, type DashboardLab, type DashboardStat } from "@/lib/dashboard-data";
import { createLearningPlanSummary, type LearningPlanSummary } from "@/lib/learning-plan";
import { type StudyConfig } from "@/lib/study-config";
import { useStudyConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

function WebTile({ stat }: { stat: DashboardStat }) {
  return (
    <Card pad={18} radius={18}>
      <div className="mb-2 flex items-center gap-2" style={{ color: stat.color }}>
        <span className="grid h-8 w-8 place-items-center rounded-[10px] text-sm" style={{ background: `color-mix(in srgb, ${stat.color} 14%, white)` }}>{stat.icon}</span>
        <span className="text-[11px] font-extrabold tracking-[.04em] text-[var(--c-ink-muted)]">{stat.label}</span>
      </div>
      <div className="aibd-display-en text-[30px] font-black leading-none" style={{ color: stat.color }}>{stat.value}</div>
      <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-soft)]">{stat.sub}</div>
    </Card>
  );
}

function DashboardSidebarFooter({ onNavigate }: { onNavigate: (href: string) => void }) {
  const subscription = useAppStore((state) => state.subscription);
  return (
    <div className="rounded-[16px] bg-[linear-gradient(135deg,#2B1F6E,#1A1340)] p-3 text-white">
      <div className="text-[10px] font-black text-[var(--c-accent)]">{subscription.isPro ? "PRO 已开通" : "PRO 会员"}</div>
      <div className="mt-1 text-[11px] font-semibold text-white/75">{subscription.isPro ? "全部 AI 能力可用" : "解锁 AI 故事 / OCR / PK"}</div>
      <button type="button" onClick={() => onNavigate("/pro")} className="mt-3 h-8 rounded-[9px] bg-[var(--c-accent)] px-3 text-[11px] font-black text-[var(--c-ink)]">
        {subscription.isPro ? "管理订阅" : "升级 PRO"}
      </button>
    </div>
  );
}

function TopBar({ onNavigate }: { onNavigate: (href: string) => void }) {
  const learning = useAppStore((state) => state.learning);
  return (
    <header className="flex min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-5 backdrop-blur-xl lg:px-7">
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
        <h1 className="aibd-display mt-1 text-2xl leading-tight lg:text-[30px]">今日学习总览</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StreakChip days={learning.streak} size="sm" />
        <GemPill count={learning.gems} size="sm" />
        <button type="button" onClick={() => onNavigate("/me")} className="hidden h-10 items-center gap-2 rounded-pill bg-[var(--c-primary-soft)] pl-1.5 pr-3 text-[12px] font-black text-[var(--c-primary)] sm:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white">小</span>
          小敏
        </button>
      </div>
    </header>
  );
}

function DashboardHero({ plan, onNavigate }: { plan: LearningPlanSummary; onNavigate: (href: string) => void }) {
  return (
    <section className="relative min-h-[220px] overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,var(--c-primary)_0%,var(--c-primary-deep)_58%,#1A1340_100%)] p-5 text-white shadow-card lg:p-7">
      <div className="absolute right-[-36px] top-0 hidden opacity-95 md:block">
        <Wordy size={190} pose="study" mood="happy" form="star" glow={false} />
      </div>
      <div className="relative z-10 max-w-[560px]">
        <div className="text-[11px] font-black tracking-[.08em] text-white/82">{plan.unitLabel}</div>
        <div className="aibd-display mt-2 text-[30px] leading-tight lg:text-[36px]">下午好，小敏</div>
        <p className="mt-2 max-w-[430px] text-[13px] font-semibold leading-relaxed text-white/82">
          {plan.dailyWords} 个新词 + {plan.reviewWords} 个复习。预计 {plan.planMinutes} 分钟，完成后 Wordy 会进化形态。
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/study/mc"
            role="button"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/study/mc");
            }}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-white px-5 text-[13px] font-black text-[var(--c-primary)] shadow-[0_4px_0_rgba(0,0,0,.18)]"
            aria-label="开始今日学习"
          >
            开始今日学习 <ChevronRightIcon size={14} />
          </Link>
          <Link
            href="/story"
            role="button"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/story");
            }}
            className="inline-flex h-11 items-center rounded-[12px] border border-white/25 bg-white/15 px-5 text-[13px] font-extrabold text-white backdrop-blur-xl"
          >
            只看 AI 故事
          </Link>
        </div>
        <div className="mt-5 flex max-w-[390px] items-center gap-3">
          <ProgressBar value={plan.progressValue} height={7} color="var(--c-accent)" bg="rgba(255,255,255,.18)" label="今日学习进度" />
          <span className="aibd-display-en shrink-0 text-[12px] font-black text-white/85">{plan.completedToday} / {plan.dailyWords}</span>
        </div>
      </div>
    </section>
  );
}

function LearningPathCard({ studyConfig, onNavigate }: { studyConfig: StudyConfig; onNavigate: (href: string) => void }) {
  const lessons = studyConfig.lessons;
  const lessonIcons = [<CheckIcon key="check" size={22} />, <StarIcon key="star" size={23} fillColor="#fff" />, <ZapIcon key="zap" size={26} fillColor="#fff" />, <span key="listen">🎧</span>, <TrophyIcon key="trophy" size={24} />];
  return (
    <Card pad={22} radius={20}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="aibd-display text-lg">{studyConfig.home.learningPathTitle}</h2>
        <button type="button" onClick={() => onNavigate("/study")} className="text-[11px] font-black text-[var(--c-primary)]">所有刷词模式 ›</button>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="flex min-w-[118px] flex-1 items-center gap-3">
            <LessonNode state={lesson.state} icon={lessonIcons[index]} label={lesson.title} />
            {index < lessons.length - 1 ? (
              <div className="hidden h-[3px] flex-1 rounded-pill bg-[var(--c-line)] md:block" style={{ background: lesson.state === "locked" || lessons[index + 1].state === "locked" ? "var(--c-line)" : "var(--c-success)" }} />
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

function StoryCard({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <Card pad={22} radius={20} className="relative min-h-[220px] overflow-hidden bg-[linear-gradient(135deg,var(--c-coral)_0%,var(--c-pink)_100%)] text-white">
      <Tag color="#fff" bg="rgba(255,255,255,.25)" size="xs">
        <SparkleIcon size={10} /> AI · 今日新生成
      </Tag>
      <h2 className="aibd-display mt-3 text-[22px] leading-tight">The Persistent Bookworm</h2>
      <p className="mt-2 max-w-[230px] text-[12px] font-semibold leading-relaxed text-white/88">
        把今天复习的 12 个词编成校园故事，听 + 读双形态。
      </p>
      <CTA color="#fff" textColor="var(--c-coral)" size="sm" full={false} className="mt-4" onClick={() => onNavigate("/story")}>
        开始
      </CTA>
      <div className="absolute -bottom-4 -right-2 text-[82px] opacity-25">📚</div>
    </Card>
  );
}

function LabButton({ lab, onNavigate, onUnavailable }: { lab: DashboardLab; onNavigate: (href: string) => void; onUnavailable: (message: string) => void }) {
  const enabled = lab.enabled ?? true;

  return (
    <button
      type="button"
      onClick={() => (enabled ? onNavigate(lab.href) : onUnavailable(lab.unavailableCopy ?? "敬请期待"))}
      className="flex min-h-[86px] items-center gap-3 rounded-[16px] bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5"
      style={{ opacity: enabled ? 1 : 0.72 }}
      aria-label={`${lab.title} ${lab.sub}`}
      aria-disabled={!enabled}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-2xl" style={{ background: `color-mix(in srgb, ${lab.color} 15%, white)` }}>
        {lab.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-black text-[var(--c-ink)]">{lab.title}</span>
        <span className="mt-1 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{lab.sub}</span>
      </span>
      <ChevronRightIcon size={16} />
    </button>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const wordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const dailyWords = useAppStore((state) => state.onboarding.dailyWords);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { config: studyConfig } = useStudyConfig();
  const plan = createLearningPlanSummary({ wordbookId, dailyWords });
  const dashboardStats = DASHBOARD_STATS.map((stat) => {
    if (stat.id === "new") {
      return { ...stat, value: String(plan.remainingWords), sub: `还差 ${plan.remainingWords} 个` };
    }

    if (stat.id === "mastery") {
      return { ...stat, sub: plan.book.title };
    }

    return stat;
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
  };

  const showUnavailable = (label: string) => {
    setToast(label);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="dashboard-ready"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <ProductSidebar activeId="dashboard" onNavigate={navigate} onUnavailable={showUnavailable} footer={<DashboardSidebarFooter onNavigate={navigate} />} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onNavigate={navigate} />
          <div className="aibd-scroll flex-1 overflow-auto p-4 lg:p-7">
            <DashboardHero plan={plan} onNavigate={navigate} />
            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => (
                <WebTile key={stat.id} stat={stat} />
              ))}
            </section>
            <section className="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
              <LearningPathCard studyConfig={studyConfig} onNavigate={navigate} />
              <StoryCard onNavigate={navigate} />
            </section>
            <section className="mt-5">
              <h2 className="aibd-display mb-3 text-lg">AI 实验室</h2>
              <div className="grid gap-3 lg:grid-cols-3">
                {DASHBOARD_LABS.map((lab) => (
                  <LabButton key={lab.id} lab={lab} onNavigate={navigate} onUnavailable={showUnavailable} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {toast ? <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">{toast}</div> : null}
    </main>
  );
}
