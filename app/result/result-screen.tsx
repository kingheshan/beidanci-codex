"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XIcon } from "@/components/icons";
import { CTA, Confetti, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { formatWorkflowTemplate, type ResultConfig } from "@/lib/learning-workflow-config";
import { getStudyMode } from "@/lib/study-config";
import { useLearningWorkflowConfig } from "@/lib/use-remote-config";
import { useAppStore, type LastStudyResult } from "@/store/app-store";

function formatDuration(result: LastStudyResult) {
  const totalMs = result.results.reduce((sum, item) => sum + item.ms, 0);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function accuracy(result: LastStudyResult) {
  if (!result.total) return 0;
  return Math.round((result.correct / result.total) * 100);
}

function modeTitle(result: LastStudyResult) {
  return getStudyMode(result.mode)?.title ?? "学习闯关";
}

function ResultStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <div className="aibd-display-en text-[23px] font-extrabold leading-none" style={{ color }}>{value}</div>
      <div className="mt-1 text-[10px] font-bold text-white/80">{label}</div>
    </div>
  );
}

function EmptyResult({ resultConfig }: { resultConfig: ResultConfig }) {
  const router = useRouter();

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-4 text-[var(--c-ink)]">
      <section className="w-full max-w-[430px] rounded-[26px] bg-white p-6 text-center shadow-pop">
        <Wordy size={112} pose="think" mood="happy" form="sprout" />
        <h1 className="aibd-display mt-3 text-[25px]">{resultConfig.emptyTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--c-ink-soft)]">{resultConfig.emptyDescription}</p>
        <CTA className="mt-5" onClick={() => router.push("/study")}>{resultConfig.emptyCta}</CTA>
      </section>
    </main>
  );
}

export function ResultScreen() {
  const router = useRouter();
  const result = useAppStore((state) => state.lastStudyResult);
  const learning = useAppStore((state) => state.learning);
  const { config: workflowConfig } = useLearningWorkflowConfig();
  const resultConfig = workflowConfig.result;

  const wrongCount = result?.results.filter((item) => !item.correct).length ?? 0;
  const mode = result ? modeTitle(result) : "";
  const duration = result ? formatDuration(result) : "0:00";
  const pct = result ? accuracy(result) : 0;
  const masteredWords = useMemo(() => result?.results.slice(0, 8) ?? [], [result]);

  if (!result) {
    return <EmptyResult resultConfig={resultConfig} />;
  }

  const streakCopy = formatWorkflowTemplate(resultConfig.streakCopyTemplate, { mode, streak: learning.streak + 1 });
  const masteredSummary = formatWorkflowTemplate(resultConfig.masteredSummaryTemplate, {
    correct: result.correct,
    total: result.total,
    wrongCount
  });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,var(--c-primary)_0%,var(--c-primary-deep)_100%)] text-white">
      <Confetti count={28} />
      <div className="aibd-scroll relative z-10 mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-auto px-4 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))]">
        <section className="text-center">
          <div className="mb-1 text-[11px] font-extrabold tracking-[0.12em] text-white/80">{resultConfig.unitCompleteLabel}</div>
          <h1 className="aibd-display text-[30px] leading-tight">{resultConfig.successTitle}</h1>
          <p className="mx-auto mt-2 max-w-[300px] text-xs font-semibold leading-5 text-white/80">
            {streakCopy}
          </p>
          <div className="mt-3 flex justify-center">
            <Wordy size={130} pose="celebrate" mood="cheer" form="star" glow={false} />
          </div>
        </section>

        <section className="mt-3 rounded-[22px] border border-white/20 bg-white/15 p-3 shadow-pop backdrop-blur">
          <div className="flex items-stretch justify-around gap-2">
            <ResultStat label={resultConfig.stats.xp} value={`+${result.xpEarned}`} color="var(--c-accent)" />
            <div className="w-px bg-white/20" />
            <ResultStat label={resultConfig.stats.accuracy} value={`${pct}%`} color="var(--c-mint)" />
            <div className="w-px bg-white/20" />
            <ResultStat label={resultConfig.stats.duration} value={duration} color="#fff" />
          </div>
        </section>

        <section className="mt-3 rounded-[22px] bg-white/95 p-4 text-[var(--c-ink)] shadow-card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-[var(--c-ink-soft)]">{resultConfig.masteredTitle}</div>
              <div className="mt-0.5 text-[10px] font-semibold text-[var(--c-ink-muted)]">
                {masteredSummary}
              </div>
            </div>
            <Tag color={wrongCount ? "var(--c-warning)" : "var(--c-success)"} bg={wrongCount ? "#FFF1CC" : "#DCFCE7"} size="xs">
              {wrongCount ? resultConfig.needsPracticeTag : resultConfig.allCorrectTag}
            </Tag>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {masteredWords.map((item) => (
              <button
                type="button"
                key={`${item.wordId}-${item.ms}`}
                onClick={() => router.push(`/word/${item.wordId}`)}
                aria-label={`查看 ${item.word}`}
                className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 font-displayEn text-[11px] font-extrabold"
                style={{
                  background: item.correct ? "var(--c-primary-soft)" : "#FFE4E4",
                  color: item.correct ? "var(--c-primary-ink)" : "var(--c-danger)"
                }}
              >
                {item.correct ? <CheckIcon size={12} /> : <XIcon size={12} />}
                {item.word} {item.correct ? "✓" : "✗"}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-3 rounded-[20px] bg-white/10 p-3 text-xs leading-5 text-white/80">
          {resultConfig.syncMessage}
        </section>

        <div className="mt-auto grid gap-2 pt-4">
          <CTA color="#fff" textColor="var(--c-primary)" size="lg" onClick={() => router.push("/home")}>{resultConfig.primaryCta}</CTA>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => router.push(`/study/${result.mode}`)}
              className="h-11 rounded-[14px] bg-white/15 text-xs font-extrabold text-white"
            >
              {resultConfig.actions.repeat}
            </button>
            <button
              type="button"
              onClick={() => router.push("/review")}
              className="h-11 rounded-[14px] bg-white/15 text-xs font-extrabold text-white"
            >
              {resultConfig.actions.review}
            </button>
            <button
              type="button"
              onClick={() => router.push("/mistakes")}
              className="h-11 rounded-[14px] bg-white/15 text-xs font-extrabold text-white"
            >
              {resultConfig.actions.mistakes}
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}
