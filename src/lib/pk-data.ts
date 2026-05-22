import { STUDY_WORDS, type Word } from "@/lib/words";

export type PkQuestion = {
  word: Word;
  options: Word[];
};

export type Opponent = {
  id: string;
  name: string;
  level: number;
  league: string;
  style: string;
};

export const PK_REWARD = {
  xp: 80,
  gems: 30
} as const;

export const PK_TOTAL_ROUNDS = 6;
export const PK_ROUND_SECONDS = 10;
export const PK_DAMAGE = 0.18;
export const PK_AI_COUNTER_DAMAGE = 0.12;

export const PK_OPPONENT: Opponent = {
  id: "wordy-ai",
  name: "Wordy AI",
  level: 25,
  league: "AI 翡翠组",
  style: "自适应策略"
};

export type PkOpponentReaction = "fast" | "wrong" | "slow" | null;

export function getPkQuestions(): PkQuestion[] {
  return STUDY_WORDS.slice(0, PK_TOTAL_ROUNDS).map((word, index) => {
    const distractors = STUDY_WORDS.filter((item) => item.id !== word.id).slice(index % 2, index % 2 + 3);
    const fallback = STUDY_WORDS.filter((item) => item.id !== word.id && !distractors.includes(item)).slice(0, 3 - distractors.length);
    const options = [word, ...distractors, ...fallback].slice(0, 4);
    const pivot = index % options.length;

    return {
      word,
      options: [...options.slice(pivot), ...options.slice(0, pivot)]
    };
  });
}

export function getNextHp(value: number, damage = PK_DAMAGE) {
  return Math.max(0, Number((value - damage).toFixed(2)));
}
