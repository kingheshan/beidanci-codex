import { STUDY_WORDS, type Word } from "@/lib/words";

export type PkQuestion = {
  word: Word;
  options: Word[];
};

export type Opponent = {
  name: string;
  level: number;
  league: string;
};

export const PK_REWARD = {
  xp: 80,
  gems: 30
} as const;

export const PK_TOTAL_ROUNDS = 6;
export const PK_ROUND_SECONDS = 10;
export const PK_DAMAGE = 0.18;

export const PK_OPPONENT: Opponent = {
  name: "璐璐",
  level: 25,
  league: "翡翠组"
};

export const PK_OPPONENT_REACTIONS = ["fast", "wrong", "fast", "slow", "wrong", "fast"] as const;
export type PkOpponentReaction = (typeof PK_OPPONENT_REACTIONS)[number] | null;

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
