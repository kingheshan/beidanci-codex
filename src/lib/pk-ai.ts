import {
  getNextHp,
  PK_AI_COUNTER_DAMAGE,
  PK_DAMAGE,
  PK_OPPONENT,
  PK_ROUND_SECONDS,
  PK_TOTAL_ROUNDS,
  type PkOpponentReaction,
  type PkQuestion
} from "@/lib/pk-data";
import type { Word } from "@/lib/words";

export type PkAiDecision = {
  correct: boolean;
  reaction: Exclude<PkOpponentReaction, null>;
  confidence: number;
  replyMs: number;
  strategy: string;
};

export type PkRoundResolution = {
  userCorrect: boolean;
  aiDecision: PkAiDecision;
  aiCountered: boolean;
  nextMyHp: number;
  nextOppHp: number;
};

export type PkRoundInput = {
  question: PkQuestion;
  optionId: string | null;
  round: number;
  myHp: number;
  oppHp: number;
  secondsLeft: number;
};

export function estimatePkWordDifficulty(word: Word) {
  const lengthScore = Math.min(word.word.length / 14, 1);
  const longDefinitionScore = Math.min(word.cnLong.length / 28, 1);
  const advancedTagScore = word.tags.some((tag) => /高频|高考|雅思|托福|核心/.test(tag)) ? 0.18 : 0;

  return clamp(0.22 + lengthScore * 0.36 + longDefinitionScore * 0.24 + advancedTagScore, 0.18, 0.92);
}

export function createPkAiDecision({
  word,
  round,
  myHp,
  oppHp,
  secondsLeft
}: {
  word: Word;
  round: number;
  myHp: number;
  oppHp: number;
  secondsLeft: number;
}): PkAiDecision {
  const difficulty = estimatePkWordDifficulty(word);
  const normalizedRound = clamp(round / Math.max(1, PK_TOTAL_ROUNDS - 1), 0, 1);
  const elapsedRatio = clamp((PK_ROUND_SECONDS - secondsLeft) / PK_ROUND_SECONDS, 0, 1);
  const pressureBonus = myHp < oppHp ? 0.08 : myHp > oppHp ? -0.04 : 0;
  const accuracyNoise = seededRatio(`${PK_OPPONENT.id}:${word.id}:${round}:accuracy`) - 0.5;
  const confidence = clamp(0.74 - difficulty * 0.2 + normalizedRound * 0.05 + elapsedRatio * 0.08 + pressureBonus + accuracyNoise * 0.16, 0.42, 0.93);
  const correct = seededRatio(`${PK_OPPONENT.id}:${word.id}:${round}:answer`) <= confidence;
  const speedNoise = seededRatio(`${PK_OPPONENT.id}:${word.id}:${round}:speed`);
  const replyMs = Math.round(clamp(920 + difficulty * 1_180 + (1 - confidence) * 620 + speedNoise * 760 - normalizedRound * 140, 780, 3_600));
  const reaction: Exclude<PkOpponentReaction, null> = correct ? (replyMs <= 1_720 ? "fast" : "slow") : "wrong";
  const strategy = correct ? (reaction === "fast" ? "抢答压迫" : "稳态作答") : "高难词误判";

  return {
    correct,
    reaction,
    confidence: Number(confidence.toFixed(2)),
    replyMs,
    strategy
  };
}

export function resolvePkRound({ question, optionId, round, myHp, oppHp, secondsLeft }: PkRoundInput): PkRoundResolution {
  const userCorrect = optionId === question.word.id;
  const aiDecision = createPkAiDecision({
    word: question.word,
    round,
    myHp,
    oppHp,
    secondsLeft
  });
  const aiCountered = userCorrect && shouldAiCounter(aiDecision, secondsLeft);
  const myDamage = userCorrect ? (aiCountered ? PK_AI_COUNTER_DAMAGE : 0) : PK_DAMAGE;
  const oppDamage = userCorrect ? PK_DAMAGE : 0;

  return {
    userCorrect,
    aiDecision,
    aiCountered,
    nextMyHp: myDamage > 0 ? getNextHp(myHp, myDamage) : myHp,
    nextOppHp: oppDamage > 0 ? getNextHp(oppHp, oppDamage) : oppHp
  };
}

export function shouldAiCounter(decision: PkAiDecision, secondsLeft: number) {
  return decision.correct && decision.reaction === "fast" && secondsLeft <= PK_ROUND_SECONDS - 3;
}

function seededRatio(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4_294_967_295;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
