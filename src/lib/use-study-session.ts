"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubmitAnswerInput } from "./api-client";
import type { LastStudyResult, StudyResultItem } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";
import type { StudyModeId } from "./study-data";
import type { Word } from "./words";

export type StudyPhase = "asking" | "revealing" | "done";

export type StudySessionOptions = {
  mode: StudyModeId;
  words: Word[];
  wordPool?: Word[];
  submitAnswer?: (input: SubmitAnswerInput) => Promise<unknown>;
};

export type StudySession = {
  current: Word | null;
  idx: number;
  total: number;
  progress: number;
  phase: StudyPhase;
  results: StudyResultItem[];
  wordPool: Word[];
  shake: boolean;
  correctCount: number;
  hearts: number;
  submit: (correct: boolean) => void;
  next: () => void | Promise<void>;
  restart: () => void;
};

export function useStudySession({ mode, words, wordPool, submitAnswer }: StudySessionOptions): StudySession {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<StudyPhase>(words.length ? "asking" : "done");
  const [results, setResults] = useState<StudyResultItem[]>([]);
  const [shake, setShake] = useState(false);
  const phaseRef = useRef<StudyPhase>(words.length ? "asking" : "done");
  const startedAtRef = useRef(Date.now());
  const shakeTimerRef = useRef<number | null>(null);
  const pendingSubmissionsRef = useRef<Array<Promise<unknown>>>([]);

  const hearts = useAppStore((state) => state.learning.hearts);
  const applyAnswerReward = useAppStore((state) => state.applyAnswerReward);
  const recordStudyResult = useAppStore((state) => state.recordStudyResult);

  const total = words.length;
  const current = words[idx] ?? null;
  const optionPool = wordPool ?? words;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [idx]);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const setSessionPhase = useCallback((nextPhase: StudyPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const progress = useMemo(() => {
    if (!total) return 1;
    if (phase === "done") return 1;
    return (idx + (phase === "revealing" ? 1 : 0)) / total;
  }, [idx, phase, total]);

  const submit = useCallback(
    (correct: boolean) => {
      if (phaseRef.current !== "asking" || !current) return;

      phaseRef.current = "revealing";
      const ms = Date.now() - startedAtRef.current;
      const answer: StudyResultItem = {
        wordId: current.id,
        word: current.word,
        cn: current.cn,
        correct,
        ms
      };

      setResults((existing) => [...existing, answer]);
      setPhase("revealing");
      applyAnswerReward(correct);
      const pending = submitAnswer?.({
        wordId: current.id,
        mode,
        correct,
        ms
      }).catch(() => null);
      if (pending) pendingSubmissionsRef.current.push(pending);

      if (!correct) {
        setShake(true);
        if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = window.setTimeout(() => setShake(false), 500);
      }
    },
    [applyAnswerReward, current, mode, submitAnswer]
  );

  const next = useCallback(async () => {
    if (phaseRef.current !== "revealing") return;

    if (idx + 1 >= total) {
      if (pendingSubmissionsRef.current.length > 0) {
        await Promise.allSettled(pendingSubmissionsRef.current);
      }
      const correctCount = results.filter((result) => result.correct).length;
      const summary: LastStudyResult = {
        mode,
        total,
        correct: correctCount,
        xpEarned: correctCount * 12,
        heartsLost: results.length - correctCount,
        results,
        completedAt: new Date().toISOString()
      };
      recordStudyResult(summary);
      setSessionPhase("done");
      return;
    }

    setIdx((value) => value + 1);
    setSessionPhase("asking");
  }, [idx, mode, recordStudyResult, results, setSessionPhase, total]);

  const restart = useCallback(() => {
    setIdx(0);
    setResults([]);
    setShake(false);
    pendingSubmissionsRef.current = [];
    setSessionPhase(words.length ? "asking" : "done");
  }, [setSessionPhase, words.length]);

  return {
    current,
    idx,
    total,
    progress,
    phase,
    results,
    wordPool: optionPool,
    shake,
    correctCount: results.filter((result) => result.correct).length,
    hearts,
    submit,
    next,
    restart
  };
}
