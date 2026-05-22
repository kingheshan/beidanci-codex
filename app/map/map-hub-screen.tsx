"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon, SparkleIcon, ZapIcon } from "@/components/icons";
import { ProductSidebar } from "@/components/product-navigation";
import { Card, CTA, ProgressBar, ProgressRing, Skeleton, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { hydrateMistake, MISTAKES, modeLabel, type MistakeItem } from "@/lib/mistakes-data";
import { useApiQuery } from "@/lib/use-api-query";

type MemoryMapHubScreenProps = {
  apiClient?: Pick<ApiClient, "getMistakes">;
};

type HydratedMistake = NonNullable<ReturnType<typeof hydrateMistake>>;

const NODE_POSITIONS = [
  { x: "50%", y: "18%" },
  { x: "20%", y: "38%" },
  { x: "80%", y: "38%" },
  { x: "32%", y: "72%" },
  { x: "68%", y: "74%" }
] as const;

function masteryColor(value: number) {
  if (value < 0.3) return "var(--c-danger)";
  if (value < 0.6) return "var(--c-warning)";
  return "var(--c-success)";
}

function priorityScore(item: MistakeItem) {
  return item.wrongTimes * 100 + Math.round((1 - item.mastery) * 100);
}

function sortMistakesByRisk(items: MistakeItem[]) {
  return [...items].sort((a, b) => priorityScore(b) - priorityScore(a) || a.mastery - b.mastery || b.lastWrong.localeCompare(a.lastWrong));
}

function resolveRows(items: MistakeItem[]) {
  return sortMistakesByRisk(items).map(hydrateMistake).filter((row): row is HydratedMistake => Boolean(row));
}

function showUnavailableToast(setToast: (message: string | null) => void, message: string) {
  setToast(message);
  window.setTimeout(() => setToast(null), 1800);
}

function RiskBadge({ row }: { row: HydratedMistake }) {
  const color = masteryColor(row.mastery);

  return (
    <div className="flex items-center gap-2">
      <ProgressRing value={row.mastery} size={38} stroke={4} color={color} label={`${row.word.word} 掌握度`}>
        <span className="aibd-display-en text-[9px] font-black">{Math.round(row.mastery * 100)}</span>
      </ProgressRing>
      <div className="min-w-0">
        <div className="text-[10px] font-black text-[var(--c-ink-muted)]">错误 {row.wrongTimes} 次</div>
        <div className="mt-0.5 text-[10px] font-bold" style={{ color }}>
          掌握度 {Math.round(row.mastery * 100)}%
        </div>
      </div>
    </div>
  );
}

function NebulaPreview({ rows, activeWord }: { rows: HydratedMistake[]; activeWord?: string }) {
  const previewRows = rows.slice(0, NODE_POSITIONS.length);

  return (
    <div className="relative h-[292px] overflow-hidden rounded-[28px] bg-[#130F2F] text-white shadow-pop xl:h-[440px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(108,92,231,.4),transparent_44%),linear-gradient(180deg,#21185A_0%,#100C27_100%)]" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true">
        {previewRows.map((row, index) => {
          const position = NODE_POSITIONS[index];
          return (
            <line
              key={row.wordId}
              x1="50"
              y1="50"
              x2={Number.parseFloat(position.x)}
              y2={Number.parseFloat(position.y)}
              stroke={masteryColor(row.mastery)}
              strokeWidth="0.5"
              strokeDasharray="1 1.6"
            />
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_24%,var(--c-primary),var(--c-primary-deep))] text-center shadow-[0_20px_54px_rgba(108,92,231,.52)]">
        <div>
          <div className="text-[10px] font-black text-white/65">WEAK MAP</div>
          <div className="aibd-display text-[18px] leading-none">{activeWord ?? "错词"}</div>
        </div>
      </div>
      {previewRows.map((row, index) => {
        const position = NODE_POSITIONS[index];
        const color = masteryColor(row.mastery);
        return (
          <Link
            key={row.wordId}
            href={`/map/${row.wordId}`}
            className="absolute grid h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white px-2 text-center shadow-[0_12px_26px_rgba(0,0,0,.28)] transition hover:scale-105 xl:h-[82px] xl:w-[82px]"
            style={{ left: position.x, top: position.y, outline: `3px solid ${color}` }}
            aria-label={`打开 ${row.word.word} 图谱`}
          >
            <span className="aibd-display-en block max-w-[58px] text-[10px] font-black leading-none text-[var(--c-ink)] [overflow-wrap:anywhere] xl:max-w-[72px] xl:text-[12px]">
              {row.word.word}
            </span>
            <span className="mt-0.5 text-[8px] font-black" style={{ color }}>
              {row.wrongTimes}x
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MistakeMapRow({ row, index, onOpen }: { row: HydratedMistake; index: number; onOpen: () => void }) {
  const color = masteryColor(row.mastery);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid min-h-[86px] w-full grid-cols-[44px_minmax(0,1fr)_80px_16px] items-center gap-3 rounded-[18px] bg-white px-3.5 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
      style={{ animation: "slideUp .25s var(--ease) backwards", animationDelay: `${index * 0.04}s` }}
      aria-label={`打开 ${row.word.word} 图谱`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-[14px] text-[17px] font-black" style={{ background: `color-mix(in srgb, ${color} 14%, white)`, color }}>
        <BrainIcon size={21} />
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-1.5">
          <span className="aibd-display-en truncate text-[16px] font-black">{row.word.word}</span>
          <span className="truncate text-[11px] font-bold text-[var(--c-ink-muted)]">{row.word.cn}</span>
        </span>
        <span className="mt-1 block truncate text-[11px] font-semibold text-[var(--c-ink-soft)]">{row.reason}</span>
        <span className="mt-1 flex items-center gap-1.5">
          <Tag size="xs" color={color} bg={`color-mix(in srgb, ${color} 12%, white)`}>
            {modeLabel(row.mode)}
          </Tag>
          <span className="text-[10px] font-bold text-[var(--c-ink-muted)]">最近 {row.lastWrong}</span>
        </span>
      </span>
      <RiskBadge row={row} />
      <ChevronRightIcon size={15} />
    </button>
  );
}

function EmptyMapState({ onReview }: { onReview: () => void }) {
  return (
    <main className="min-h-dvh bg-[var(--c-bg)] px-4 py-[max(40px,env(safe-area-inset-top))] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[430px] flex-col justify-center">
        <Card className="p-5 text-center">
          <Wordy size={72} pose="study" mood="happy" glow={false} />
          <h1 className="aibd-display mt-3 text-[28px] leading-tight">还没有错词星云</h1>
          <p className="mt-2 text-[13px] font-semibold leading-6 text-[var(--c-ink-soft)]">完成一组练习或复习后，系统会把薄弱单词聚合成可视化图谱。</p>
          <CTA className="mt-5" onClick={onReview}>
            去复习队列
          </CTA>
        </Card>
      </div>
    </main>
  );
}

export function MemoryMapHubScreen({ apiClient }: MemoryMapHubScreenProps) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const loadMistakes = useCallback(() => client.getMistakes({ sort: "frequent" }), [client]);
  const mistakesQuery = useApiQuery(loadMistakes, { initialData: MISTAKES });
  const rows = useMemo(() => resolveRows(mistakesQuery.data ?? MISTAKES), [mistakesQuery.data]);
  const top = rows[0];
  const avgMastery = rows.length ? rows.reduce((sum, row) => sum + row.mastery, 0) / rows.length : 0;
  const totalWrong = rows.reduce((sum, row) => sum + row.wrongTimes, 0);
  const navigate = (href: string) => router.push(href);

  if (!mistakesQuery.loading && rows.length === 0) {
    return <EmptyMapState onReview={() => router.push("/review")} />;
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]" data-testid="memory-map-hub-ready">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <ProductSidebar activeId="mistakes" activeBg="rgba(108,92,231,0.12)" activeColor="var(--c-primary)" onNavigate={navigate} onUnavailable={(title) => showUnavailableToast(setToast, title)} />

        <div className="aibd-scroll h-dvh min-w-0 flex-1 overflow-auto pb-10">
          <header className="sticky top-0 z-20 flex items-center gap-3 bg-[var(--c-bg)]/92 px-4 pb-3 pt-[max(30px,env(safe-area-inset-top))] backdrop-blur xl:hidden">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--c-ink)] shadow-card"
              aria-label="返回首页"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--c-ink-muted)]">AI Memory</div>
              <h1 className="aibd-display truncate text-[20px]">错词记忆星云</h1>
            </div>
            <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">P1</Tag>
          </header>

          <div className="mx-auto w-full max-w-[430px] px-3.5 pb-8 xl:max-w-none xl:px-7 xl:py-7">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <div className="mb-5 hidden items-end justify-between gap-4 xl:flex">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--c-primary)]">AI Memory Nebula</div>
                    <h1 className="aibd-display mt-1 text-[34px] leading-tight">错词记忆星云</h1>
                    <p className="mt-2 max-w-[640px] text-[13px] font-semibold leading-6 text-[var(--c-ink-soft)]">按错误频次和掌握度自动聚合薄弱词，点击节点进入完整 AI 记忆图谱。</p>
                  </div>
                  <Link
                    href="/home"
                    className="inline-flex h-11 items-center gap-2 rounded-[13px] bg-white px-4 text-[12px] font-black text-[var(--c-primary)] shadow-card"
                  >
                    <HomeIcon size={16} /> 返回首页
                  </Link>
                </div>

                <NebulaPreview rows={rows} activeWord={top?.word.word} />

                <div className="mt-4 grid gap-2.5">
                  {mistakesQuery.loading ? (
                    <Card className="p-4">
                      <Skeleton height={16} radius={8} label="同步错词星云" />
                      <Skeleton className="mt-2" width="70%" height={16} radius={8} label="同步错词星云" />
                    </Card>
                  ) : null}
                  {rows.slice(0, 6).map((row, index) => (
                    <MistakeMapRow key={row.wordId} row={row} index={index} onOpen={() => router.push(`/map/${row.wordId}`)} />
                  ))}
                </div>
              </div>

              <aside className="space-y-4">
                <Card className="overflow-hidden p-0">
                  <div className="bg-[linear-gradient(135deg,var(--c-primary),var(--c-primary-deep))] p-5 text-white">
                    <div className="flex items-center gap-3">
                        <Wordy size={58} pose="think" mood="happy" form="star" glow={false} />
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[.16em] text-white/60">Focus Word</div>
                        <h2 className="aibd-display-en mt-1 truncate text-[25px] font-black">{top?.word.word ?? "loading"}</h2>
                        <p className="mt-1 text-[12px] font-semibold text-white/72">{top?.word.cn ?? "正在同步错词"}</p>
                      </div>
                    </div>
                    {top ? (
                      <Link
                        href={`/map/${top.wordId}`}
                        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-white text-[13px] font-black text-[var(--c-primary)] shadow-[0_4px_0_rgba(0,0,0,.18)]"
                        aria-label={`打开 ${top.word.word} 图谱`}
                      >
                        打开重点图谱 <ChevronRightIcon size={15} />
                      </Link>
                    ) : null}
                  </div>
                </Card>

                <Card className="p-4">
                  <h2 className="aibd-display text-[19px]">星云诊断</h2>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-[14px] bg-[var(--c-primary-soft)] px-2 py-3">
                      <div className="aibd-display-en text-[22px] font-black text-[var(--c-primary)]">{rows.length}</div>
                      <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">薄弱词</div>
                    </div>
                    <div className="rounded-[14px] bg-[#FFE2E5] px-2 py-3">
                      <div className="aibd-display-en text-[22px] font-black text-[var(--c-danger)]">{totalWrong}</div>
                      <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">错误次</div>
                    </div>
                    <div className="rounded-[14px] bg-[#FFF1CC] px-2 py-3">
                      <div className="aibd-display-en text-[22px] font-black text-[var(--c-warning)]">{Math.round(avgMastery * 100)}%</div>
                      <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">平均掌握</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-black text-[var(--c-ink-muted)]">
                      <span>补强进度</span>
                      <span>{Math.round(avgMastery * 100)}%</span>
                    </div>
                    <ProgressBar value={avgMastery} height={8} color="var(--c-primary)" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <SparkleIcon size={19} className="text-[var(--c-coral)]" />
                    <h2 className="aibd-display text-[19px]">下一步</h2>
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">先打开重点图谱理解词根，再回到选择题快速验证。</p>
                  <button
                    type="button"
                    onClick={() => router.push(top ? `/study/mc?source=mistakes&ids=${encodeURIComponent(top.wordId)}` : "/study/mc")}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[var(--c-ink)] text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.18)]"
                  >
                    <ZapIcon size={16} /> 练重点词
                  </button>
                </Card>
              </aside>
            </section>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
