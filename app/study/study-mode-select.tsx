"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, GemIcon } from "@/components/icons";
import { ProductSidebar } from "@/components/product-navigation";
import { Card, GemPill, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { createLearningPlanSummary } from "@/lib/learning-plan";
import { formatRecommendedModeCopy, getRecommendedStudyMode } from "@/lib/study-config";
import { useStudyConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

export function StudyModeSelect() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const wordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const dailyWords = useAppStore((state) => state.onboarding.dailyWords);
  const plan = createLearningPlanSummary({ wordbookId, dailyWords });
  const { config: studyConfig } = useStudyConfig();
  const recommendedMode = getRecommendedStudyMode(studyConfig);
  const [toast, setToast] = useState<string | null>(null);

  const navigate = (href: string) => {
    router.push(href);
  };

  const showUnavailable = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <ProductSidebar activeId="study" onNavigate={navigate} onUnavailable={showUnavailable} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <div className="aibd-display mt-1 text-[30px] leading-tight">刷词模式 Hub</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={() => navigate("/dashboard")} className="h-10 rounded-pill bg-[var(--c-primary-soft)] px-4 text-[12px] font-black text-[var(--c-primary)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>

          <div className="aibd-scroll h-dvh w-full overflow-auto pb-8 xl:h-auto xl:flex-1 xl:pb-0">
            <header className="sticky top-0 z-20 flex items-center gap-2 bg-[var(--c-bg)]/90 px-4 pb-3 pt-[max(30px,env(safe-area-inset-top))] backdrop-blur xl:hidden">
              <button
                type="button"
                onClick={() => router.push("/home")}
                aria-label="返回首页"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-[var(--c-ink)] shadow-card"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <div className="min-w-0 flex-1" />
              <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">{studyConfig.hub.mobileGateLabel}</Tag>
            </header>

            <div className="mx-auto w-full max-w-[430px] px-3.5 xl:max-w-none xl:px-7 xl:py-7">
              <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <h1 className="aibd-display text-[28px] leading-tight xl:text-[30px]">{studyConfig.hub.title}</h1>
                      <p className="mt-1 max-w-[560px] text-[13px] font-medium leading-6 text-[var(--c-ink-soft)]">
                        {studyConfig.hub.subtitle}
                      </p>
                    </div>
                    <button type="button" onClick={() => navigate("/dashboard")} className="inline-flex h-11 w-fit items-center gap-2 rounded-[12px] bg-white px-4 text-[13px] font-black text-[var(--c-primary)] shadow-card xl:hidden" aria-label="返回今日学习移动入口">
                      返回今日学习 <ChevronRightIcon size={14} />
                    </button>
                  </div>

                  <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3 xl:gap-3.5">
                    {studyConfig.modes.map((mode) => {
                      const detail = studyConfig.modeDetails[mode.id];

                      return (
                        <Link
                          role="button"
                          href={`/study/${mode.id}`}
                          key={mode.id}
                          onClick={(event) => {
                            event.preventDefault();
                            router.push(`/study/${mode.id}`);
                          }}
                          className="group flex min-h-[112px] items-center gap-3.5 rounded-2xl bg-white px-4 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pop xl:min-h-[224px] xl:flex-col xl:items-start xl:gap-0 xl:rounded-[18px] xl:p-5"
                          aria-label={`${mode.order} ${mode.title} ${detail.prompt} ${detail.desc}`}
                        >
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-[26px] xl:h-14 xl:w-14 xl:text-[30px]" style={{ background: `color-mix(in srgb, ${mode.color} 15%, white)` }} aria-hidden>
                            {mode.icon}
                          </span>
                          <span className="min-w-0 flex-1 xl:mt-4">
                            <span className="flex items-center gap-2">
                              <span className="aibd-display block text-[15px] font-extrabold xl:text-lg">{mode.order} {mode.title}</span>
                              <Tag size="xs" color={mode.color} bg={mode.bg}>{detail.badge}</Tag>
                            </span>
                            <span className="mt-0.5 block text-[11px] font-bold xl:text-[12px]" style={{ color: mode.color }}>{detail.prompt}</span>
                            <span className="mt-2 hidden text-[12px] font-medium leading-[1.55] text-[var(--c-ink-soft)] xl:block">{detail.desc}</span>
                            <span className="mt-3 hidden items-center gap-2 text-[11px] font-bold text-[var(--c-ink-muted)] xl:flex">
                              <span>{detail.words} 词</span>
                              <span className="h-1 w-1 rounded-full bg-[var(--c-line-strong)]" />
                              <span>{detail.minutes} 分钟</span>
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[12px] font-black xl:mt-4" style={{ color: mode.color }}>
                            开始 <ChevronRightIcon size={14} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <aside className="space-y-4">
                  <Card
                    pad={22}
                    radius={20}
                    className="relative overflow-hidden text-white"
                    style={{ background: "linear-gradient(135deg,#2B1F6E 0%,#1A1340 100%)" }}
                  >
                    <div className="relative z-10">
                      <Tag color="#fff" bg="rgba(255,255,255,.2)" size="xs">
                        {plan.unitLabel}
                      </Tag>
                      <h2 className="aibd-display mt-3 text-[24px] leading-tight">{studyConfig.hub.recommendedTitle}</h2>
                      <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
                        {formatRecommendedModeCopy(plan.remainingWords, studyConfig)}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <ProgressBar value={plan.progressValue} height={7} color="var(--c-accent)" bg="rgba(255,255,255,.18)" label="今日学习进度" />
                        <span className="aibd-display-en shrink-0 text-[12px] font-black text-white/85">{plan.completedToday}/{plan.dailyWords}</span>
                      </div>
                      <Link
                        role="button"
                        href={`/study/${recommendedMode.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          router.push(`/study/${recommendedMode.id}`);
                        }}
                        className="mt-5 inline-flex h-11 items-center rounded-[12px] bg-white px-5 text-[13px] font-black text-[var(--c-primary)] shadow-[0_4px_0_rgba(0,0,0,.18)]"
                      >
                        开始推荐模式
                      </Link>
                    </div>
                    <div className="absolute -bottom-8 -right-8 opacity-35">
                      <Wordy size={150} pose="study" mood="happy" form="rocket" glow={false} />
                    </div>
                  </Card>

                  <Card pad={18} radius={18}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="aibd-display text-lg">学习能量</h2>
                      <GemIcon size={20} className="text-[var(--c-primary)]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "连胜", value: `${learning.streak}天`, color: "var(--c-streak)" },
                        { label: "宝石", value: learning.gems.toString(), color: "var(--c-primary)" },
                        { label: "红心", value: learning.hearts.toString(), color: "var(--c-danger)" }
                      ].map((item) => (
                        <div key={item.label} className="rounded-[14px] bg-[var(--c-bg-deep)] px-2 py-3">
                          <div className="aibd-display-en text-[18px] font-black" style={{ color: item.color }}>{item.value}</div>
                          <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>
      {toast ? <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">{toast}</div> : null}
    </main>
  );
}
