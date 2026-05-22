"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronLeftIcon, SpeakerIcon, SparkleIcon, XIcon } from "@/components/icons";
import { CTA, ChoiceButton, HeartPill, ProgressBar, Tag } from "@/components/ui";
import type { ApiClient } from "@/lib/api-client";
import { trackStudyStarted } from "@/lib/analytics";
import { findClientWord, getClientWordbookWords } from "@/lib/client-wordbook-preview";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { STUDY_MODES, type StudyModeId } from "@/lib/study-data";
import { useStudySession, type StudySession } from "@/lib/use-study-session";
import type { ImageConcept, Word } from "@/lib/words";
import { useAppStore } from "@/store/app-store";

type StudySessionScreenProps = {
  mode: StudyModeId;
  wordIds?: string[];
  sourceLabel?: string;
  apiClient?: Pick<ApiClient, "submitAnswer"> & Partial<Pick<ApiClient, "getMistakeCoach">>;
};

type StudyModeBodyProps = {
  session: StudySession;
  showToast: (message: string) => void;
};

type WordOption = Word & {
  isCorrect: boolean;
};

function rotateOptions(word: Word, pool: Word[], count = 3) {
  const uniquePool = Array.from(new Map([word, ...pool].map((item) => [item.id, item])).values());
  const start = Math.max(0, uniquePool.findIndex((item) => item.id === word.id));
  const others = uniquePool.filter((item) => item.id !== word.id);
  const rotated = [...others.slice(start), ...others.slice(0, start)].slice(0, count);
  const options: WordOption[] = [...rotated.map((item) => ({ ...item, isCorrect: false })), { ...word, isCorrect: true }];
  return options.sort((a, b) => ((a.word.charCodeAt(0) + word.id.charCodeAt(1)) % 7) - ((b.word.charCodeAt(0) + word.id.charCodeAt(1)) % 7));
}

function choiceState(session: StudySession, option: WordOption, pickedId: string | null) {
  if (!pickedId) return "idle";
  if (option.id === pickedId) return option.isCorrect ? "correct" : "wrong";
  if (session.phase === "revealing" && option.isCorrect) return "correct";
  return "disabled";
}

function StudyHeader({ session, title, onClose }: { session: StudySession; title: string; onClose: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[var(--c-bg)]/95 px-4 pb-3 pt-[max(30px,env(safe-area-inset-top))] backdrop-blur">
      <button
        type="button"
        onClick={onClose}
        aria-label="返回选择方式"
        className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-[var(--c-ink)] shadow-card"
      >
        <XIcon size={19} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h1 className="truncate text-[13px] font-extrabold text-[var(--c-ink-soft)]">{title}</h1>
          <span className="aibd-mono text-[10px] font-bold text-[var(--c-ink-muted)]">
            {Math.min(session.idx + 1, session.total)}/{session.total}
          </span>
        </div>
        <ProgressBar value={session.progress} height={10} color="var(--c-primary)" label="学习进度" />
      </div>
      <HeartPill count={session.hearts} />
    </header>
  );
}

function StudyFeedback({ session }: { session: StudySession }) {
  const answer = session.results.at(-1);
  const word = session.current;
  if (!answer || !word) return null;

  const correct = answer.correct;
  const coach = !correct ? session.currentCoach : null;
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 z-40 max-h-[72dvh] overflow-auto border-t-2 px-4 pb-[max(22px,env(safe-area-inset-bottom))] pt-3 shadow-pop"
      style={{
        background: correct ? "#DCFCE7" : "#FFE2E5",
        borderColor: correct ? "var(--c-success)" : "var(--c-danger)"
      }}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: correct ? "var(--c-success)" : "var(--c-danger)" }}>
          {correct ? <CheckIcon size={18} /> : <XIcon size={18} />}
        </div>
        <div className="aibd-display flex-1 text-[17px]" style={{ color: correct ? "#0E4D24" : "#7A1620" }}>
          {correct ? "太棒了！" : "没关系，记住这个"}
        </div>
        {correct ? <Tag color="#0E4D24" bg="rgba(0,212,170,.25)" size="xs">+12 XP</Tag> : null}
      </div>
      <div className="mb-3 pl-[42px] text-[11px] leading-5" style={{ color: correct ? "#155F33" : "#7A2630" }}>
        <b className="aibd-display-en">{word.word}</b> <span className="opacity-70">{word.pos}</span> · {word.cn}
        <div className="mt-0.5 opacity-85">提示：{word.etym}</div>
      </div>
      {!correct ? (
        <div className="mb-3 rounded-[16px] bg-white/70 p-3 text-[11px] leading-5 text-[#7A2630] shadow-[0_1px_0_rgba(122,22,32,.08)]">
          <div className="mb-1.5 flex items-center gap-1.5 font-extrabold">
            <SparkleIcon size={13} />
            <span>AI 错因教练</span>
            <Tag color="#7A2630" bg="rgba(255,255,255,.58)" size="xs">
              {coach?.source === "ai" ? "DeepSeek" : "教研兜底"}
            </Tag>
          </div>
          {coach ? (
            <>
              <p>
                <b>错因：</b>
                {coach.cause}
              </p>
              <p className="mt-1">
                <b>记法：</b>
                {coach.memoryTip}
              </p>
              <div className="mt-2 rounded-[12px] bg-white/80 px-3 py-2">
                <div className="font-extrabold">10 秒微练习</div>
                <div className="mt-0.5">{coach.microDrill.prompt}</div>
                <div className="mt-1 text-[10px] opacity-75">答案：{coach.microDrill.answer}</div>
              </div>
              <p className="mt-2 font-bold">{coach.nextAction}</p>
            </>
          ) : (
            <p>正在分析这次错因...</p>
          )}
        </div>
      ) : null}
      <CTA color={correct ? "var(--c-success)" : "var(--c-danger)"} size="md" onClick={session.next}>继续</CTA>
    </motion.div>
  );
}

function StudyMC({ session }: StudyModeBodyProps) {
  const word = session.current;
  const [pickedId, setPickedId] = useState<string | null>(null);
  const options = useMemo(() => (word ? rotateOptions(word, session.wordPool) : []), [session.wordPool, word]);

  if (!word) return null;

  const pick = (option: WordOption) => {
    if (session.phase !== "asking" || pickedId) return;
    setPickedId(option.id);
    session.submit(option.isCorrect);
  };

  return (
    <section className="px-4 pb-44 pt-2" key={word.id}>
      <p className="mb-3 text-xs font-bold leading-5 text-[var(--c-ink-soft)]">
        下面哪个词意为「<b className="text-[var(--c-ink)]">{word.cn}</b>」？
      </p>
      <motion.div
        animate={session.shake ? { x: [-6, 6, -6, 6, 0] } : { x: 0 }}
        className="mb-4 rounded-[22px] bg-white px-4 py-6 text-center shadow-card"
      >
        <div className="aibd-display text-[24px]">{word.cn}</div>
        <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{word.pos}</div>
      </motion.div>
      <div className="grid gap-2.5">
        {options.map((option, index) => (
          <ChoiceButton
            key={option.id}
            shortcut={index + 1}
            en={option.word}
            label={option.cn}
            state={choiceState(session, option, pickedId)}
            disabled={session.phase !== "asking" && option.id !== pickedId && !option.isCorrect}
            onClick={() => pick(option)}
          />
        ))}
      </div>
    </section>
  );
}

function StudyFlip({ session, showToast }: StudyModeBodyProps) {
  const word = session.current;
  const [flipped, setFlipped] = useState(false);

  if (!word) return null;

  const rate = (correct: boolean) => {
    if (session.phase !== "asking") return;
    session.submit(correct);
  };

  return (
    <section className="flex min-h-[calc(100dvh-116px)] flex-col px-4 pb-36 pt-1" key={word.id}>
      <p className="mb-3 text-center text-[11px] font-bold text-[var(--c-ink-muted)]">{flipped ? "看完释义，评估熟悉度" : "点击卡片翻面"}</p>
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="relative mx-auto h-[360px] w-full max-w-[350px] rounded-[24px] text-left"
        style={{ perspective: 1200 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 rounded-[24px] bg-white p-5 shadow-pop"
          style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
        >
          <Tag>{word.tags[0]}</Tag>
          <div className="flex h-full -translate-y-4 flex-col items-center justify-center text-center">
            <div className="aibd-display-en text-[34px] text-[var(--c-ink)]">{word.word}</div>
            <div className="aibd-mono mt-2 text-xs font-bold text-[var(--c-ink-muted)]">{word.ipa}</div>
            <span className="mt-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--c-primary)] text-white shadow-cta">
              <SpeakerIcon size={20} />
            </span>
          </div>
        </motion.div>
        <motion.div
          animate={{ rotateY: flipped ? 0 : -180 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 rounded-[24px] bg-white p-5 shadow-pop"
          style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
        >
          <div className="flex h-full flex-col justify-center text-center">
            <div className="aibd-display-en text-[18px] text-[var(--c-ink-soft)]">{word.word}</div>
            <div className="mt-5 text-[11px] font-extrabold text-[var(--c-primary)]">{word.pos}</div>
            <div className="aibd-display mt-1 text-[24px]">{word.cn}</div>
            <p className="mt-2 text-xs leading-5 text-[var(--c-ink-soft)]">{word.cnLong}</p>
            <div className="mt-4 rounded-[14px] bg-[var(--c-primary-soft)] p-3 text-left">
              <div className="mb-1 text-[10px] font-extrabold text-[var(--c-primary)]">例句</div>
              <div className="text-xs leading-5 text-[var(--c-ink)]">{word.examples[0].en}</div>
              <div className="mt-0.5 text-[11px] text-[var(--c-ink-muted)]">{word.examples[0].cn}</div>
            </div>
          </div>
        </motion.div>
      </button>
      <div className="mt-auto grid gap-2">
        {flipped ? (
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => rate(false)} className="h-14 rounded-[16px] bg-[var(--c-danger)] text-xs font-extrabold text-white shadow-[0_4px_0_rgba(122,22,32,.35)]">不熟</button>
            <button type="button" onClick={() => rate(false)} className="h-14 rounded-[16px] bg-[var(--c-warning)] text-xs font-extrabold text-white shadow-[0_4px_0_rgba(138,90,0,.35)]">模糊</button>
            <button type="button" onClick={() => rate(true)} className="h-14 rounded-[16px] bg-[var(--c-success)] text-xs font-extrabold text-white shadow-[0_4px_0_rgba(14,139,92,.35)]">认识</button>
          </div>
        ) : (
          <CTA onClick={() => setFlipped(true)}>翻面查看释义</CTA>
        )}
        <button type="button" onClick={() => showToast("左右滑评估会在移动手势增强中继续打磨")} className="text-xs font-bold text-[var(--c-ink-muted)]">
          左滑不熟 · 右滑认识
        </button>
      </div>
    </section>
  );
}

function StudySpell({ session }: StudyModeBodyProps) {
  const word = session.current;
  const [typed, setTyped] = useState("");
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);

  const target = word?.word.toUpperCase() ?? "";
  const pad = useMemo(() => {
    if (!word) return [];
    const needed = target.split("");
    const distractors = ["X", "Z", "Q", "J", "K", "Y"].filter((letter) => !needed.includes(letter)).slice(0, 4);
    return [...needed, ...distractors].sort((a, b) => a.localeCompare(b) || a.charCodeAt(0) - b.charCodeAt(0));
  }, [target, word]);

  if (!word) return null;

  const tapLetter = (letter: string, index: number) => {
    if (session.phase !== "asking" || usedIndexes.includes(index) || typed.length >= target.length) return;
    const nextTyped = typed + letter;
    setTyped(nextTyped);
    setUsedIndexes((current) => [...current, index]);
    if (nextTyped.length === target.length) {
      window.setTimeout(() => session.submit(nextTyped === target), 180);
    }
  };

  const backspace = () => {
    if (session.phase !== "asking" || !typed) return;
    setTyped((value) => value.slice(0, -1));
    setUsedIndexes((current) => current.slice(0, -1));
  };

  return (
    <section className="flex min-h-[calc(100dvh-116px)] flex-col px-4 pb-44 pt-2" key={word.id}>
      <div className="mb-3 text-center">
        <Tag>拼写</Tag>
      </div>
      <div className="mb-4 rounded-[20px] bg-white p-4 text-center shadow-card">
        <div className="text-[11px] font-extrabold text-[var(--c-primary)]">{word.pos}</div>
        <div className="aibd-display mt-1 text-[22px]">{word.cn}</div>
        <button type="button" className="mt-2 inline-flex items-center gap-1 rounded-pill bg-[var(--c-primary-soft)] px-3 py-1 text-[11px] font-bold text-[var(--c-primary)]">
          <SpeakerIcon size={13} /> 听发音
        </button>
      </div>
      <motion.div animate={session.shake ? { x: [-6, 6, -6, 6, 0] } : { x: 0 }} className="mb-4 flex flex-wrap justify-center gap-1.5">
        {target.split("").map((letter, index) => {
          const filled = index < typed.length;
          const revealed = session.phase === "revealing";
          const ok = revealed && typed[index] === letter;
          const wrong = revealed && typed[index] !== letter;
          return (
            <span
              key={`${letter}-${index}`}
              className="grid h-8 w-6 place-items-center rounded-md border-2 font-displayEn text-sm font-extrabold"
              style={{
                borderColor: filled ? "transparent" : "var(--c-ink-faint)",
                background: wrong ? "var(--c-danger)" : ok ? "var(--c-success)" : filled ? "var(--c-primary)" : "transparent",
                color: filled ? "#fff" : "var(--c-ink)"
              }}
            >
              {filled ? typed[index] : ""}
            </span>
          );
        })}
      </motion.div>
      <div className="mb-4 rounded-[14px] bg-[rgba(255,176,32,.13)] px-3 py-2 text-center text-[11px] leading-5 text-[#8A5A00]">
        提示：{word.etym}
      </div>
      <div className="mt-auto rounded-[20px] bg-white p-3 shadow-card">
        <div className="mb-2 flex flex-wrap justify-center gap-1.5">
          {pad.map((letter, index) => {
            const used = usedIndexes.includes(index);
            return (
              <button
                type="button"
                key={`${letter}-${index}`}
                disabled={used}
                onClick={() => tapLetter(letter, index)}
                aria-label={`字母 ${letter}`}
                className="h-9 w-8 rounded-lg bg-[var(--c-surface-soft)] font-displayEn text-sm font-extrabold text-[var(--c-ink)] shadow-[0_2px_0_var(--c-line)] disabled:text-[var(--c-ink-faint)] disabled:opacity-40 disabled:shadow-none"
              >
                {letter}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={backspace} className="h-8 w-full rounded-lg text-xs font-bold text-[var(--c-ink-muted)]">删除</button>
      </div>
    </section>
  );
}

function StudyListen({ session }: StudyModeBodyProps) {
  const word = session.current;
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const options = useMemo(() => (word ? rotateOptions(word, session.wordPool) : []), [session.wordPool, word]);

  if (!word) return null;

  const play = () => {
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 900);
  };

  const pick = (option: WordOption) => {
    if (session.phase !== "asking" || pickedId) return;
    setPickedId(option.id);
    session.submit(option.isCorrect);
  };

  return (
    <section className="px-4 pb-44 pt-2" key={word.id}>
      <p className="mb-3 text-xs font-bold text-[var(--c-ink-soft)]">听一听，选出正确的释义</p>
      <div
        className="relative mb-4 w-full overflow-hidden rounded-[24px] px-4 py-7 text-center text-white shadow-pop"
        style={{ background: "linear-gradient(135deg,var(--c-primary),var(--c-primary-deep))" }}
      >
        {playing ? <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-white/60" /> : null}
        <button type="button" onClick={play} aria-label="重听发音" className="relative mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-white text-[var(--c-primary)] shadow-card">
          <SpeakerIcon size={28} />
        </button>
        <span className="relative block text-xs font-extrabold">点击重听 · 倍速 {speed}×</span>
        <span className="relative mt-2 flex justify-center gap-1">
          {[0.75, 1, 1.25].map((item) => (
            <button
              type="button"
              key={item}
              onClick={(event) => {
                event.stopPropagation();
                setSpeed(item);
              }}
              className="rounded-pill px-3 py-1 text-[10px] font-extrabold"
              style={{ background: item === speed ? "#fff" : "rgba(255,255,255,.18)", color: item === speed ? "var(--c-primary)" : "#fff" }}
            >
              {item}×
            </button>
          ))}
        </span>
      </div>
      <div className="grid gap-2.5">
        {options.map((option, index) => (
          <ChoiceButton
            key={option.id}
            shortcut={String.fromCharCode(65 + index)}
            label={option.cnLong}
            state={choiceState(session, option, pickedId)}
            disabled={session.phase !== "asking" && option.id !== pickedId && !option.isCorrect}
            onClick={() => pick(option)}
          />
        ))}
      </div>
    </section>
  );
}

function StudyContext({ session }: StudyModeBodyProps) {
  const word = session.current;
  const [pickedId, setPickedId] = useState<string | null>(null);
  const options = useMemo(() => (word ? rotateOptions(word, session.wordPool) : []), [session.wordPool, word]);

  if (!word) return null;

  const sentence = word.examples[1] ?? word.examples[0];
  const parts = sentence.en.split(new RegExp(`(${word.word})`, "i"));
  const picked = options.find((option) => option.id === pickedId) ?? null;

  const pick = (option: WordOption) => {
    if (session.phase !== "asking" || pickedId) return;
    setPickedId(option.id);
    session.submit(option.isCorrect);
  };

  return (
    <section className="px-4 pb-44 pt-2" key={word.id}>
      <div className="mb-3 flex items-center gap-2">
        <Tag color="var(--c-coral)" bg="#FFE9DE"><SparkleIcon size={10} /> AI 情景</Tag>
        <span className="text-[10px] font-bold text-[var(--c-ink-muted)]">{sentence.tag}</span>
      </div>
      <div className="relative mb-4 h-[112px] overflow-hidden rounded-[20px] text-white shadow-card" style={{ background: "linear-gradient(135deg,var(--c-primary),var(--c-pink),var(--c-coral))" }}>
        <span className="absolute right-4 top-4 h-12 w-12 animate-pulse rounded-full bg-white/25" />
        <div className="absolute bottom-3 left-4">
          <div className="text-[9px] font-extrabold tracking-widest opacity-80">SCENE</div>
          <div className="aibd-display text-[16px]">校园 · 你在初三</div>
        </div>
      </div>
      <div className="mb-4 rounded-[18px] bg-white p-4 shadow-card">
        <div className="mb-2 text-[11px] font-extrabold text-[var(--c-ink-muted)]">选出正确的词填入空格</div>
        <div className="aibd-display-en text-[16px] leading-7 text-[var(--c-ink)]">
          {parts.map((part, index) =>
            part.toLowerCase() === word.word.toLowerCase() ? (
              <span
                key={index}
                className="mx-1 inline-block min-w-20 rounded-md px-3 py-0.5 text-center font-extrabold"
                style={{
                  background: picked ? (picked.isCorrect ? "var(--c-success)" : "var(--c-danger)") : "var(--c-accent)",
                  color: picked ? "#fff" : "var(--c-ink)"
                }}
              >
                {picked ? picked.word : "______"}
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </div>
        <div className="mt-2 text-[11px] leading-5 text-[var(--c-ink-soft)]">「{sentence.cn}」</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <ChoiceButton
            key={option.id}
            en={option.word}
            label={option.cn}
            state={choiceState(session, option, pickedId)}
            disabled={session.phase !== "asking" && option.id !== pickedId && !option.isCorrect}
            onClick={() => pick(option)}
          />
        ))}
      </div>
    </section>
  );
}

function StudyImage({ session, showToast }: StudyModeBodyProps) {
  const word = session.current;
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  if (!word) return null;

  const concepts = word.imageConcepts ?? [];

  const pick = (concept: ImageConcept, index: number) => {
    if (session.phase !== "asking" || pickedIndex !== null) return;
    setPickedIndex(index);
    session.submit(concept.ok);
  };

  return (
    <section className="px-4 pb-44 pt-2" key={word.id}>
      <div className="mb-4 text-center">
        <div className="mb-2 text-xs font-bold text-[var(--c-ink-soft)]">下面哪幅图能表示</div>
        <div className="inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 shadow-card">
          <span className="aibd-display-en text-[21px]">{word.word}</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--c-primary-soft)] text-[var(--c-primary)]">
            <SpeakerIcon size={13} />
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {concepts.map((concept, index) => {
          const picked = pickedIndex === index;
          const showCorrect = session.phase === "revealing" && concept.ok;
          const showWrong = session.phase === "revealing" && picked && !concept.ok;
          return (
            <button
              type="button"
              key={concept.caption}
              onClick={() => pick(concept, index)}
              className="relative flex aspect-[1/1.05] flex-col justify-end overflow-hidden rounded-[18px] p-3 text-left text-white shadow-card"
              style={{
                background: concept.color,
                opacity: pickedIndex !== null && !picked && !concept.ok ? 0.55 : 1,
                border: showCorrect ? "4px solid var(--c-success)" : showWrong ? "4px solid var(--c-danger)" : "4px solid transparent"
              }}
            >
              <span className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-[44px]">{concept.emoji}</span>
              <span className="relative z-10 text-[11px] font-extrabold drop-shadow">{concept.caption}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => showToast(`Wordy：把 ${word.word} 想成「${word.cn}」的小画面`)}
        className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-[14px] bg-[rgba(108,92,231,.08)] text-xs font-extrabold text-[var(--c-primary)]"
      >
        <SparkleIcon size={14} /> 让 Wordy 给我编个谐音故事
      </button>
    </section>
  );
}

function ModeBody({ mode, session, showToast }: StudyModeBodyProps & { mode: StudyModeId }) {
  if (mode === "mc") return <StudyMC session={session} showToast={showToast} />;
  if (mode === "flip") return <StudyFlip session={session} showToast={showToast} />;
  if (mode === "spell") return <StudySpell session={session} showToast={showToast} />;
  if (mode === "listen") return <StudyListen session={session} showToast={showToast} />;
  if (mode === "context") return <StudyContext session={session} showToast={showToast} />;
  return <StudyImage session={session} showToast={showToast} />;
}

function uniqueWords(words: Word[]) {
  return Array.from(new Map(words.map((word) => [word.id, word])).values());
}

function resolveWordIds(wordIds: string[] | undefined) {
  if (!wordIds?.length) return [];
  return uniqueWords(wordIds.map((wordId) => findClientWord(wordId)).filter((word): word is Word => Boolean(word)));
}

export function StudySessionScreen({ mode, wordIds, sourceLabel, apiClient }: StudySessionScreenProps) {
  const { push, replace } = useRouter();
  const modeMeta = STUDY_MODES.find((item) => item.id === mode) ?? STUDY_MODES[0];
  const onboarding = useAppStore((state) => state.onboarding);
  const activeWordbookId = onboarding.wordbookId;
  const [toast, setToast] = useState<string | null>(null);
  const startTracked = useRef(false);
  const activeWordbookWords = useMemo(() => getClientWordbookWords(activeWordbookId), [activeWordbookId]);
  const queuedWords = useMemo(() => resolveWordIds(wordIds), [wordIds]);
  const words = useMemo(
    () => (queuedWords.length > 0 ? queuedWords : activeWordbookWords.slice(0, 6)),
    [activeWordbookWords, queuedWords]
  );
  const wordPool = useMemo(() => uniqueWords([...words, ...activeWordbookWords]).slice(0, 16), [activeWordbookWords, words]);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const coachContext = useMemo(() => ({ grade: onboarding.grade, interests: onboarding.interests }), [onboarding.grade, onboarding.interests]);
  const session = useStudySession({ mode, words, wordPool, submitAnswer: client.submitAnswer, getMistakeCoach: client.getMistakeCoach, coachContext });
  const headerTitle = sourceLabel ?? modeMeta.title;

  useEffect(() => {
    if (startTracked.current || words.length === 0) return;
    startTracked.current = true;
    trackStudyStarted({
      mode,
      total: words.length,
      source: sourceLabel ? "queue" : "mode_select",
      wordbookId: activeWordbookId
    });
  }, [activeWordbookId, mode, sourceLabel, words.length]);

  useEffect(() => {
    if (session.phase === "done") {
      replace("/result");
    }
  }, [replace, session.phase]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const close = () => push("/study");

  if (session.phase === "done") {
    return (
      <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-4 text-[var(--c-ink)]">
        <div className="text-center text-sm font-bold text-[var(--c-ink-soft)]">正在生成结果...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="aibd-scroll mx-auto h-dvh w-full max-w-[430px] overflow-auto">
        <StudyHeader session={session} title={headerTitle} onClose={close} />
        <button
          type="button"
          onClick={() => push("/study")}
          className="mx-4 mb-2 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--c-ink-muted)]"
        >
          <ChevronLeftIcon size={14} /> 切换模式
        </button>
        <ModeBody key={`${mode}-${session.idx}`} mode={mode} session={session} showToast={showToast} />
      </div>

      {session.phase === "revealing" ? <StudyFeedback session={session} /> : null}
      {toast ? (
        <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
