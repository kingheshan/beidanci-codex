"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BrainIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  SparkleIcon,
  ZapIcon,
} from "@/components/icons";
import { ProductSidebar } from "@/components/product-navigation";
import { Card, CTA, ProgressBar, ProgressRing, Skeleton, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { createFetchApiClient, type ApiClient } from "@/lib/api-client";
import { type MistakeDefaultStats } from "@/lib/learning-workflow-config";
import { hydrateMistake, MISTAKE_FILTERS, modeLabel, type MistakeFilterId, type MistakeItem } from "@/lib/mistakes-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useLearningWorkflowConfig } from "@/lib/use-remote-config";

type MistakesScreenProps = {
  apiClient?: Pick<ApiClient, "getMistakes">;
};

type HydratedMistake = NonNullable<ReturnType<typeof hydrateMistake>>;

function masteryColor(value: number) {
  if (value < 0.3) return "var(--c-danger)";
  if (value < 0.6) return "var(--c-warning)";
  return "var(--c-success)";
}

function filterMistakeItems(items: MistakeItem[], filter: MistakeFilterId) {
  if (filter === "all") return items;
  if (filter === "frequent") return items.filter((item) => item.wrongTimes >= 2);
  return items.filter((item) => item.mode === filter);
}

function getLoadedMistakeStats(items: MistakeItem[], defaults: MistakeDefaultStats) {
  const frequent = filterMistakeItems(items, "frequent").length;
  const avgMastery = items.length > 0 ? items.reduce((sum, item) => sum + item.mastery, 0) / items.length : 0;

  return {
    total: items.length,
    frequent,
    avgMastery,
    improvedPct: defaults.improvedPct,
    correctedTotal: defaults.correctedTotal,
    accuracyPct: defaults.accuracyPct
  };
}

function MistakesSidebarFooter() {
  return (
    <div className="rounded-[18px] bg-[linear-gradient(145deg,#ffe4e4,#fff)] p-4">
      <div className="flex items-center gap-3">
        <HeartIcon className="text-[color:var(--c-danger)]" size={24} />
        <div>
          <p className="text-[13px] font-black text-[color:var(--c-ink)]">错题诊断</p>
          <p className="mt-1 text-[11px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">优先重练高频错词。</p>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-[14px] text-[19px]" style={{ background: `color-mix(in srgb, ${color} 14%, white)`, color }}>
          {icon}
        </span>
        <span className="text-right text-[11px] font-black text-[color:var(--c-ink-muted)]">{label}</span>
      </div>
      <p className="aibd-display-en mt-3 text-[27px] font-black leading-none" style={{ color }}>{value}</p>
      <p className="mt-1 text-[11px] font-bold text-[color:var(--c-ink-soft)]">{sub}</p>
    </Card>
  );
}

function FilterStrip({ filter, setFilter }: { filter: MistakeFilterId; setFilter: (filter: MistakeFilterId) => void }) {
  return (
    <div className="flex gap-1.5 overflow-auto pb-1">
      {MISTAKE_FILTERS.map((item) => {
        const active = item.id === filter;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className="h-9 shrink-0 rounded-full px-3 text-[11px] font-extrabold shadow-sm transition xl:h-10 xl:px-4 xl:text-[12px]"
            style={{
              background: active ? "var(--c-danger)" : "#fff",
              color: active ? "#fff" : "var(--c-ink-soft)",
              boxShadow: active ? "0 4px 0 #C9314D" : "0 1px 0 rgba(28,46,43,0.08)",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function MistakeRow({ row, index, onOpen }: { row: HydratedMistake; index: number; onOpen: () => void }) {
  const color = masteryColor(row.mastery);

  return (
    <button
      key={row.wordId}
      type="button"
      onClick={onOpen}
      aria-label={`${row.word.word} ${row.word.cn} ${row.wrongTimes} 次错误`}
      className="grid min-h-[76px] w-full grid-cols-[40px_minmax(0,1fr)_44px_16px] items-center gap-3 rounded-[18px] border border-transparent bg-white px-3.5 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-[rgba(255,90,111,0.22)] xl:grid-cols-[46px_minmax(0,1fr)_150px_84px_18px] xl:px-4"
      style={{ animation: "slideUp .25s var(--ease) backwards", animationDelay: `${index * 0.04}s` }}
    >
      <div className="relative grid size-10 shrink-0 place-items-center rounded-[12px] xl:size-11" style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}>
        <span className="aibd-display-en text-base font-extrabold">{row.word.word[0]?.toUpperCase()}</span>
        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[color:var(--c-danger)] text-[9px] font-extrabold text-white xl:size-5">{row.wrongTimes}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="aibd-display-en truncate text-[15px] font-extrabold xl:text-[17px]">{row.word.word}</span>
          <span className="truncate text-[10px] font-semibold text-[color:var(--c-ink-muted)] xl:text-[12px]">{row.word.cn}</span>
        </div>
        <div className="mt-1 truncate text-[10px] text-[color:var(--c-ink-soft)] xl:text-[12px]">{row.reason}</div>
      </div>
      <div className="hidden min-w-0 xl:block">
        <Tag color="var(--c-danger)" bg="rgba(255,90,111,0.1)" size="xs">
          {modeLabel(row.mode)}
        </Tag>
        <p className="mt-1 text-[10px] font-bold text-[color:var(--c-ink-muted)]">最近：{row.lastWrong}</p>
      </div>
      <div className="justify-self-end text-right">
        <ProgressRing value={row.mastery} size={34} stroke={4} color={color} label={`${row.word.word} 掌握度`}>
          <span className="aibd-display-en text-[9px] font-extrabold">{Math.round(row.mastery * 100)}</span>
        </ProgressRing>
      </div>
      <ChevronRightIcon size={14} />
    </button>
  );
}

function MistakesStatusShell({
  title,
  message,
  action,
  onAction
}: {
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <main
      className="relative min-h-dvh bg-[color:var(--c-bg)] text-[color:var(--c-ink)]"
      data-hydrated="true"
      data-testid="mistakes-ready"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-[max(46px,env(safe-area-inset-top))] xl:max-w-[760px] xl:justify-center">
        <Card className="mt-10 p-5 xl:mt-0 xl:p-7">
          <div className="flex items-center gap-3">
            <Wordy size={54} pose="study" mood="happy" glow={false} />
            <div className="min-w-0">
              <h1 className="aibd-display text-[26px] leading-tight">{title}</h1>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[color:var(--c-ink-soft)]">{message}</p>
            </div>
          </div>
          {action && onAction ? (
            <CTA className="mt-5" color="var(--c-danger)" size="md" onClick={onAction}>
              {action}
            </CTA>
          ) : (
            <div className="mt-5 space-y-3">
              <Skeleton height={18} radius={9} label="正在加载错题本" />
              <Skeleton width="78%" height={18} radius={9} label="正在加载错题本" />
              <Skeleton height={76} radius={18} label="正在加载错题本" />
              <Skeleton height={76} radius={18} label="正在加载错题本" />
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function studyUrlFromMistakes(items: HydratedMistake[]) {
  const ids = items.map((item) => item.wordId).filter(Boolean);
  return ids.length > 0 ? `/study/mc?source=mistakes&ids=${ids.map(encodeURIComponent).join(",")}` : "/study/mc";
}

export function MistakesScreen({ apiClient }: MistakesScreenProps) {
  const router = useRouter();
  const { config: workflowConfig } = useLearningWorkflowConfig();
  const mistakesConfig = workflowConfig.mistakes;
  const [filter, setFilter] = useState<MistakeFilterId>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const loadMistakes = useCallback(() => client.getMistakes({ sort: "recent" }), [client]);
  const mistakesQuery = useApiQuery(loadMistakes);
  const mistakeItems = useMemo(() => mistakesQuery.data ?? [], [mistakesQuery.data]);
  const stats = useMemo(() => getLoadedMistakeStats(mistakeItems, mistakesConfig.defaultStats), [mistakeItems, mistakesConfig.defaultStats]);
  const rows = useMemo(
    () => filterMistakeItems(mistakeItems, filter).map(hydrateMistake).filter((row): row is HydratedMistake => Boolean(row)),
    [filter, mistakeItems]
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  const navigate = (href: string) => router.push(href);
  const showComingSoon = (title: string) => {
    setToast(`${title} 会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };
  const startMistakeSession = () => {
    router.push(studyUrlFromMistakes(rows));
  };
  const exportPdf = () => {
    setToast("已生成本页错题摘要，可直接使用浏览器打印为 PDF。");
    window.setTimeout(() => setToast(null), 2200);
    if (process.env.NODE_ENV !== "test" && typeof window.print === "function") {
      window.print();
    }
  };

  if (mistakesQuery.loading && !mistakesQuery.data) {
    return <MistakesStatusShell title="加载错题本" message="正在同步错词、错误原因和掌握度。" />;
  }

  if (mistakesQuery.error && !mistakesQuery.data) {
    return (
      <MistakesStatusShell
        title="错题本暂时加载失败"
        message={mistakesQuery.error.message}
        action="重新加载错题本"
        onAction={mistakesQuery.reload}
      />
    );
  }

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[color:var(--c-bg)] text-[color:var(--c-ink)]"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="mistakes-ready"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[color:var(--c-bg)]">
        <ProductSidebar
          activeId="mistakes"
          activeBg="rgba(255,90,111,0.12)"
          activeColor="var(--c-danger)"
          brandHref="/dashboard"
          brandSubtitle="Mistake Lab"
          footer={<MistakesSidebarFooter />}
          labelOverrides={{ mistakes: "错题中心" }}
          onNavigate={navigate}
          onUnavailable={showComingSoon}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-transparent px-4 pb-3 pt-[max(46px,env(safe-area-inset-top))] xl:min-h-[76px] xl:border-[rgba(28,46,43,0.08)] xl:bg-white/85 xl:px-7 xl:pt-3 xl:backdrop-blur-xl">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="返回"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[color:var(--c-ink-soft)] shadow-card xl:hidden"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="hidden text-[11px] font-black uppercase tracking-[0.08em] text-[color:var(--c-danger)] xl:block">错题工作台</p>
              <h1 className="aibd-display text-base leading-tight xl:mt-1 xl:text-[30px]">错题本</h1>
              <p className="mt-1 hidden text-[13px] font-bold text-[color:var(--c-ink-soft)] xl:block">AI 自动追踪你的弱项 · 重做错题效率提升 3 倍</p>
            </div>
            <button
              type="button"
              onClick={exportPdf}
              className="min-h-9 rounded-full bg-white px-3 text-[11px] font-extrabold text-[color:var(--c-primary)] shadow-card xl:h-10 xl:px-4 xl:text-[12px]"
            >
              导出 PDF
            </button>
          </header>

          <div className="aibd-scroll flex-1 overflow-auto px-3.5 pb-28 xl:px-7 xl:py-7">
            <div className="mx-auto w-full max-w-[430px] xl:max-w-none">
              <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5">
                <div className="min-w-0 space-y-4">
                  <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <StatTile label="本月错词" value={`${stats.total}`} sub={`↓ 比上月 -${stats.improvedPct}%`} color="var(--c-danger)" icon="📛" />
                    <StatTile label="高频错（≥2 次）" value={`${stats.frequent}`} sub="优先进入重练" color="var(--c-warning)" icon={<BrainIcon size={20} />} />
                    <StatTile label="已纠正" value={`${stats.correctedTotal}`} sub="累计不再考错" color="var(--c-success)" icon="✅" />
                    <StatTile label="纠错效率" value={`${stats.accuracyPct}%`} sub="本月重练正确率" color="var(--c-primary)" icon={<SparkleIcon size={20} />} />
                  </section>

                  <Card className="p-4 xl:p-5">
                    <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <h2 className="text-[16px] font-black text-[color:var(--c-ink)] xl:text-[18px]">所有错词</h2>
                        <p className="mt-1 hidden text-[12px] font-bold text-[color:var(--c-ink-soft)] xl:block">按错误类型过滤，优先处理掌握度最低的词。</p>
                      </div>
                      <FilterStrip filter={filter} setFilter={setFilter} />
                    </div>
                    <div className="space-y-2">
                      {rows.map((row, index) => {
                        if (!row) return null;
                        return <MistakeRow key={row.wordId} row={row} index={index} onOpen={() => navigate(`/word/${row.wordId}`)} />;
                      })}
                    </div>
                  </Card>
                </div>

                <aside className="hidden space-y-4 xl:block">
                  <Card className="overflow-hidden p-0">
                    <div className="bg-[linear-gradient(145deg,#ff5a6f,#ff8a65)] p-5 text-white">
                      <Tag bg="rgba(255,255,255,0.2)" color="#fff" size="xs">AI 诊断</Tag>
                      <h2 className="mt-3 text-[21px] font-black leading-tight">{mistakesConfig.insight.title}</h2>
                      <p className="mt-2 text-[12px] font-bold leading-relaxed text-white/82">{mistakesConfig.insight.body}</p>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between text-[12px] font-black text-[color:var(--c-ink-soft)]">
                        <span>{mistakesConfig.insight.progressTitle}</span>
                        <span>{Math.round(stats.avgMastery * 100)}%</span>
                      </div>
                      <ProgressBar label={mistakesConfig.insight.progressTitle} value={stats.avgMastery} height={8} color="var(--c-danger)" />
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <Wordy form="sprout" glow={false} mood="happy" pose="study" size={78} />
                      <div>
                        <h2 className="text-[15px] font-black text-[color:var(--c-ink)]">{mistakesConfig.insight.suggestionTitle}</h2>
                        <p className="mt-1 text-[12px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">{mistakesConfig.insight.suggestionBody}</p>
                      </div>
                    </div>
                  </Card>
                </aside>
              </section>
            </div>
          </div>

          <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-3.5 right-3.5 z-30 xl:absolute xl:bottom-7 xl:left-auto xl:right-7 xl:w-[320px]">
            <CTA color="var(--c-danger)" size="lg" icon={<ZapIcon size={20} fillColor="#fff" />} onClick={startMistakeSession}>
              再练这 {rows.length} 个错词
            </CTA>
          </div>
        </section>
      </div>

      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
