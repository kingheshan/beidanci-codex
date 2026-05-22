"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BrainIcon,
  CheckIcon,
  HeartIcon,
  ZapIcon
} from "@/components/icons";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ProductSidebar } from "@/components/product-navigation";
import { CTA, Card, GemPill, ProgressBar, ProgressRing, Skeleton, StreakChip, Tag } from "@/components/ui";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { formatWorkflowTemplate, type ReviewStatCardId } from "@/lib/learning-workflow-config";
import { REVIEW_FILTERS, REVIEW_STATS, getReviewWord, stateColor, stateLabel, type ReviewQueueItem, type ReviewState } from "@/lib/review-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useLearningWorkflowConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

function StatBlock({ value, label, sub, color, icon }: { value: string; label: string; sub?: string; color: string; icon: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 rounded-[16px] bg-white p-3 text-center shadow-card xl:p-4 xl:text-left">
      <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-[10px] xl:mx-0" style={{ background: `color-mix(in srgb, ${color} 16%, white)`, color }}>
        {icon}
      </div>
      <div className="aibd-display-en text-[17px] font-extrabold leading-none xl:text-[30px]" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)] xl:text-[11px]">{label}</div>
      {sub ? <div className="mt-1 hidden text-[11px] font-semibold text-[var(--c-ink-soft)] xl:block">{sub}</div> : null}
    </div>
  );
}

function ReviewQueueLoading() {
  return (
    <div className="space-y-2" aria-live="polite">
      <Skeleton label="正在加载复习队列" height={72} radius={16} />
      <Skeleton height={72} radius={16} />
      <Skeleton height={72} radius={16} />
    </div>
  );
}

function ReviewQueueError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[18px] bg-[rgba(255,90,111,0.08)] p-4 text-center">
      <h3 className="text-[18px] font-black text-[var(--c-ink)]">复习队列暂时加载失败</h3>
      <p className="mt-2 text-[12px] font-bold leading-relaxed text-[var(--c-ink-soft)]">{message}</p>
      <button
        className="mt-4 h-10 rounded-pill bg-[var(--c-primary)] px-5 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,0.14)] transition active:translate-y-0.5"
        type="button"
        onClick={onRetry}
      >
        重新加载复习队列
      </button>
    </div>
  );
}

function studyUrlFromQueue(source: "review", items: ReviewQueueItem[]) {
  const ids = items.map((item) => item.wordId).filter(Boolean);
  return ids.length > 0 ? `/study/mc?source=${source}&ids=${ids.map(encodeURIComponent).join(",")}` : "/study/mc";
}

function reviewStatIcon(id: ReviewStatCardId) {
  if (id === "mastered") return <CheckIcon size={16} />;
  if (id === "weak") return <HeartIcon size={16} />;
  if (id === "weekly") return <ZapIcon size={16} />;
  return <BrainIcon size={16} />;
}

export function ReviewScreen({ apiClient }: { apiClient?: Pick<ApiClient, "getReviewQueue"> }) {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const { config: workflowConfig } = useLearningWorkflowConfig();
  const reviewConfig = workflowConfig.review;
  const [filter, setFilter] = useState<"all" | ReviewState>("all");
  const [toast, setToast] = useState<string | null>(null);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const loadReviewQueue = useCallback(() => client.getReviewQueue(), [client]);
  const queueQuery = useApiQuery(loadReviewQueue);
  const filtered = useMemo<ReviewQueueItem[]>(() => {
    const reviewQueue = queueQuery.data ?? [];
    return reviewQueue.filter((item) => filter === "all" || item.state === filter);
  }, [filter, queueQuery.data]);

  const reviewStats = reviewConfig.statCards.map((stat) => ({
    ...stat,
    value: String(REVIEW_STATS[stat.id]),
    icon: reviewStatIcon(stat.id)
  }));
  const reviewHeroSubtitle = formatWorkflowTemplate(reviewConfig.heroSubtitleTemplate, { due: REVIEW_STATS.due });
  const reviewStartCta = formatWorkflowTemplate(reviewConfig.startCtaTemplate, { count: REVIEW_STATS.due });
  const filteredReviewStartCta = formatWorkflowTemplate(reviewConfig.startCtaTemplate, { count: filtered.length });
  const bookMasteryPercent = Math.round(REVIEW_STATS.bookMastery * 100);

  const navigate = (href: string) => {
    router.push(href);
  };

  const startReview = () => {
    router.push(studyUrlFromQueue("review", filtered));
  };

  const showComingSoon = (title: string) => {
    setToast(`${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <ProductSidebar activeId="review" onNavigate={navigate} onUnavailable={showComingSoon} labelOverrides={{ review: "复习队列" }} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <div className="aibd-display mt-1 text-[30px] leading-tight">复习中心</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={() => router.push("/dashboard")} className="h-10 rounded-pill bg-[var(--c-primary-soft)] px-4 text-[12px] font-black text-[var(--c-primary)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>

          <div className="aibd-scroll h-dvh w-full overflow-auto pb-40 pt-[max(44px,env(safe-area-inset-top))] xl:h-auto xl:flex-1 xl:pb-0 xl:pt-0">
            <div className="mx-auto w-full max-w-[430px] xl:max-w-none xl:px-7 xl:py-7">
              <section className="px-4 pb-3 xl:px-0">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h1 className="aibd-display text-[24px] xl:text-[30px]">智能复习</h1>
                    <p className="mt-1 text-xs font-semibold text-[var(--c-ink-soft)] xl:text-[13px]">{reviewHeroSubtitle}</p>
                  </div>
                  <CTA color="var(--c-primary)" size="md" full={false} icon={<ZapIcon size={18} fillColor="#fff" />} onClick={startReview} className="hidden xl:inline-flex" aria-label={reviewStartCta}>
                    {reviewStartCta}
                  </CTA>
                </div>
              </section>

              <section className="px-3.5 pb-3 xl:px-0">
                <div className="grid grid-cols-4 gap-2 xl:gap-3">
                  {reviewStats.map((stat) => (
                    <StatBlock key={stat.label} {...stat} />
                  ))}
                </div>
                <Card pad={14} radius={20} className="mt-3 xl:hidden">
                  <ProgressBar value={REVIEW_STATS.bookMastery} height={7} color="var(--c-success)" />
                  <div className="mt-1.5 text-right text-[10px] font-semibold text-[var(--c-ink-muted)]">本词书 · 掌握度 {bookMasteryPercent}%</div>
                </Card>
              </section>

              <section className="grid gap-4 px-3.5 pt-1 xl:grid-cols-[minmax(0,1fr)_320px] xl:px-0 xl:pt-2">
                <Card pad={18} radius={20}>
                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <h2 className="aibd-display text-lg">{reviewConfig.queueTitle}</h2>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {REVIEW_FILTERS.map((item) => {
                        const active = item.id === filter;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className="h-8 shrink-0 rounded-pill px-3 text-[11px] font-extrabold shadow-card"
                            style={{ background: active ? "var(--c-primary)" : "var(--c-bg)", color: active ? "#fff" : "var(--c-ink-soft)" }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {queueQuery.loading && !queueQuery.data ? <ReviewQueueLoading /> : null}
                  {queueQuery.error && !queueQuery.data ? <ReviewQueueError message={queueQuery.error.message} onRetry={queueQuery.reload} /> : null}
                  {queueQuery.data
                    ? filtered.map((item, index) => {
                        const word = getReviewWord(item);
                        if (!word) return null;
                        const color = stateColor(item.state);
                        return (
                          <button
                            type="button"
                            key={item.wordId}
                            onClick={() => router.push(`/word/${word.id}`)}
                            aria-label={`${word.word} ${word.cn}`}
                            className="mb-2 flex min-h-[72px] w-full items-center gap-3 rounded-[16px] bg-[var(--c-surface-soft)] px-3.5 py-3 text-left transition hover:bg-white hover:shadow-card xl:px-4"
                            style={{ animation: `slideUp .3s var(--ease) ${index * 0.04}s backwards` }}
                          >
                            <ProgressRing value={item.mastery} size={42} stroke={5} color={color}>
                              <span className="aibd-display-en text-[10px] font-extrabold">{Math.round(item.mastery * 100)}</span>
                            </ProgressRing>
                            <span className="min-w-0 flex-1">
                              <span className="aibd-display-en block text-[16px] text-[var(--c-ink)]">{word.word}</span>
                              <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-soft)]">{word.cn}</span>
                            </span>
                            <span className="text-right">
                              <Tag color={color} bg={`color-mix(in srgb, ${color} 15%, white)`} size="xs">
                                {stateLabel(item.state)}
                              </Tag>
                              <span className="mt-1 block text-[9px] font-semibold text-[var(--c-ink-muted)]">下次：{item.due}</span>
                            </span>
                          </button>
                        );
                      })
                    : null}
                </Card>

                <aside className="hidden space-y-4 xl:block">
                  <Card pad={22} radius={20} className="relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg,#2B1F6E 0%,#1A1340 100%)" }}>
                    <Tag color="#fff" bg="rgba(255,255,255,.2)" size="xs">记忆强度</Tag>
                    <div className="mt-4 flex items-center gap-4">
                      <ProgressRing value={REVIEW_STATS.bookMastery} size={86} stroke={9} color="var(--c-accent)" track="rgba(255,255,255,.16)" label="本词书掌握度">
                        <span className="aibd-display-en text-[20px] font-black text-white">{bookMasteryPercent}%</span>
                      </ProgressRing>
                      <div className="min-w-0">
                        <div className="aibd-display text-[22px] leading-tight">{reviewConfig.memoryCardTitle}</div>
                        <p className="mt-2 text-[12px] font-semibold leading-5 text-white/75">{reviewConfig.memoryCardBody}</p>
                      </div>
                    </div>
                  </Card>
                  <Card pad={18} radius={18}>
                    <h2 className="aibd-display text-lg">{reviewConfig.strategyTitle}</h2>
                    <div className="mt-4 space-y-3">
                      {reviewConfig.strategySteps.map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-3 rounded-[14px] bg-[var(--c-bg-deep)] p-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[12px] font-black text-[var(--c-primary)]">{step}</span>
                          <span>
                            <span className="block text-[13px] font-black text-[var(--c-ink)]">{title}</span>
                            <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{desc}</span>
                          </span>
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

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-[176px] w-full max-w-[430px] -translate-x-1/2 xl:hidden"
        style={{ background: "linear-gradient(to top, var(--c-bg) 0%, var(--c-bg) 74%, rgba(248,246,255,0) 100%)" }}
      />
      <div className="absolute bottom-[88px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-3.5 xl:hidden">
        <CTA color="var(--c-primary)" size="lg" icon={<ZapIcon size={20} fillColor="#fff" />} onClick={startReview}>
          {filteredReviewStartCta}
        </CTA>
      </div>

      <div className="xl:hidden">
        <MobileTabBar active="review" onUnavailable={showComingSoon} />
      </div>
      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
