"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookIcon, BrainIcon, CheckIcon, ChevronRightIcon, StarIcon, TrophyIcon, ZapIcon } from "@/components/icons";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Card, GemPill, LessonNode, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { createLearningPlanSummary } from "@/lib/learning-plan";
import { type Lesson, type QuickTool } from "@/lib/study-config";
import { useStudyConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

export function HomeScreen() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const wordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const dailyWords = useAppStore((state) => state.onboarding.dailyWords);
  const plan = createLearningPlanSummary({ wordbookId, dailyWords });
  const { config: studyConfig } = useStudyConfig();
  const [toast, setToast] = useState<string | null>(null);

  const showComingSoon = (title: string) => {
    setToast(`${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openQuickTool = (tool: QuickTool) => {
    if (tool.enabled && tool.href) {
      router.push(tool.href);
      return;
    }

    setToast(tool.unavailableCopy);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="aibd-scroll mx-auto h-dvh w-full max-w-[430px] overflow-auto pb-24">
        <section className="bg-gradient-to-b from-[var(--c-primary-soft)] to-transparent px-4 pb-3 pt-[max(30px,env(safe-area-inset-top))]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex min-h-9 items-center gap-1.5 rounded-pill bg-white py-1 pl-1 pr-2.5 shadow-card"
              aria-label={`当前词书 ${plan.book.title}`}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--c-primary-soft)] text-[var(--c-primary)]">
                <BookIcon size={13} />
              </span>
              <span className="text-[11px] font-bold">{plan.book.title}</span>
              <ChevronRightIcon size={11} />
            </button>
            <div className="flex shrink-0 gap-1.5">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
            </div>
          </div>

          <div className="mb-3.5 flex items-center gap-3">
            <Wordy size={58} pose="wave" mood="happy" glow={false} />
            <div>
              <div className="text-[11px] font-semibold text-[var(--c-ink-soft)]">下午好，小敏</div>
              <div className="aibd-display mt-0.5 text-[17px] leading-tight">
                <span>今天还差</span> <span className="text-[var(--c-primary)]">{plan.remainingWords} 个词</span>
              </div>
            </div>
          </div>

          <Card pad={12} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--c-ink-soft)]">今日任务 {plan.completedToday} / {plan.dailyWords}</span>
                <span className="text-[10px] font-bold text-[var(--c-primary)]">剩 {plan.estimatedMinutes} 分钟</span>
              </div>
              <ProgressBar value={plan.progressValue} height={7} />
            </div>
          </Card>
        </section>

        <section className="px-0 pt-1">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="h-px flex-1 bg-[var(--c-line)]" />
            <span className="text-[10px] font-bold tracking-[.08em] text-[var(--c-ink-muted)]">{plan.unitLabel}</span>
            <div className="h-px flex-1 bg-[var(--c-line)]" />
          </div>

          <LearningPath currentLessonLabel={plan.currentLessonLabel} lessons={studyConfig.lessons} onStart={() => router.push("/study")} />
        </section>

        <section className="px-3.5 pt-3">
          <h2 className="mb-2 text-[11px] font-bold tracking-[.04em] text-[var(--c-ink-soft)]">{studyConfig.home.aiToolboxTitle}</h2>
          <div className="grid grid-cols-2 gap-2">
            {studyConfig.quickTools.map((tool) => (
              <QuickToolButton key={tool.id} tool={tool} onClick={() => openQuickTool(tool)} />
            ))}
          </div>
        </section>
      </div>

      <MobileTabBar active="home" onUnavailable={showComingSoon} />

      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function LearningPath({ currentLessonLabel, lessons, onStart }: { currentLessonLabel: string; lessons: Lesson[]; onStart: () => void }) {
  const intro = lessons[0];
  const level = lessons[1];
  const listen = lessons[3];
  const boss = lessons[4];

  return (
    <div className="relative min-h-[420px] py-1.5">
      <svg viewBox="0 0 280 420" preserveAspectRatio="none" className="absolute left-0 right-0 top-7 z-0 h-[420px] w-full opacity-40" aria-hidden>
        <path d="M70 0 Q220 40 220 100 Q220 160 90 200 Q-30 240 90 300 Q190 350 210 410" stroke="var(--c-primary)" strokeWidth="3" strokeDasharray="5 7" fill="none" />
      </svg>
      <div className="relative z-10 flex flex-col gap-[18px]">
        <div className="flex justify-start pl-[50px]">
          <LessonNode state={intro?.state ?? "done"} icon={<CheckIcon size={26} />} label={intro?.label ?? "入门 · 完成"} />
        </div>
        <div className="flex justify-end pr-[38px]">
          <LessonNode state={level?.state ?? "done"} icon={<StarIcon size={26} fillColor="#fff" />} label={level?.label ?? "进阶 · 完成"} />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onStart}
            aria-label={`开始 ${currentLessonLabel}`}
            className="flex flex-col items-center gap-1.5 border-0 bg-transparent p-0"
          >
            <span className="relative animate-drift rounded-[10px] bg-[var(--c-primary)] px-2.5 py-1 text-[10px] font-extrabold text-white">
              开始
              <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-[var(--c-primary)]" />
            </span>
            <LessonNode state="current" icon={<ZapIcon size={30} fillColor="#fff" />} big />
            <span className="max-w-[130px] text-center text-[11px] font-bold">{currentLessonLabel}</span>
          </button>
        </div>
        <div className="flex justify-start pl-[50px]">
          <LessonNode state={listen?.state ?? "locked"} icon={<BrainIcon size={24} />} label={listen?.label ?? "听力 · 15词"} />
        </div>
        <div className="flex justify-end pr-[38px]">
          <LessonNode state={boss?.state ?? "boss"} icon={<TrophyIcon size={26} />} label={boss?.label ?? "BOSS 战"} />
        </div>
      </div>
    </div>
  );
}

function QuickToolButton({ tool, onClick }: { tool: QuickTool; onClick: () => void }) {
  const content = (
    <>
      <span className="mb-2 grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-white text-base" style={{ color: tool.color }} aria-hidden>
        {tool.icon}
      </span>
      <span className="block text-[13px] font-bold">{tool.title}</span>
      <span className="mt-0.5 block text-[10px] text-[var(--c-ink-muted)]">{tool.subtitle}</span>
    </>
  );

  if (tool.enabled && tool.href) {
    return (
      <Link
        href={tool.href}
        className="block min-h-[104px] rounded-[14px] border-0 p-3 text-left"
        style={{ background: tool.bg }}
        aria-label={`${tool.title} ${tool.subtitle}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block min-h-[104px] rounded-[14px] border-0 p-3 text-left"
      style={{ background: tool.bg }}
      aria-label={`${tool.title} ${tool.subtitle}`}
    >
      {content}
    </button>
  );
}
