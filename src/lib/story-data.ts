import { findAnyWord } from "@/lib/word-search";
import { STUDY_WORDS, type Word } from "@/lib/words";

export type StoryToken =
  | { text: string; plain: true }
  | { text: string; plain?: false; wordId: string };

export type StoryParagraph = {
  tokens: StoryToken[];
};

export type StoryOption = {
  id: "a" | "b";
  label: string;
  correct: boolean;
};

export type DailyStory = {
  episode: number;
  title: string;
  cn: string;
  theme: string;
  paragraphs: StoryParagraph[];
  question: string;
  options: StoryOption[];
};

export const DAILY_STORY: DailyStory = {
  episode: 124,
  title: "The Persistent Bookworm",
  cn: "坚持不懈的书虫",
  theme: "校园物语",
  paragraphs: [
    {
      tokens: [
        { text: "Mia was an ", plain: true },
        { text: "ambitious", wordId: "w2" },
        { text: " ninth grader.", plain: true }
      ]
    },
    {
      tokens: [
        { text: "Every morning she would ", plain: true },
        { text: "determine", wordId: "w6" },
        { text: " to finish her vocabulary list before breakfast.", plain: true }
      ]
    },
    {
      tokens: [
        { text: "Her classmates thought she was too ", plain: true },
        { text: "persistent", wordId: "w1" },
        { text: ", but Mia knew that small daily effort would help her ", plain: true },
        { text: "achieve", wordId: "w3" },
        { text: " her goal.", plain: true }
      ]
    },
    {
      tokens: [
        { text: "She believed in a ", plain: true },
        { text: "sustainable", wordId: "w5" },
        { text: " pace, not in cramming all night.", plain: true }
      ]
    }
  ],
  question: "What kind of student was Mia?",
  options: [
    { id: "a", label: "An ambitious and persistent ninth grader", correct: true },
    { id: "b", label: "A lazy student who often gives up", correct: false }
  ]
};

export function getStoryWords(story: DailyStory = DAILY_STORY): Word[] {
  const ids = new Set<string>();
  for (const paragraph of story.paragraphs) {
    for (const token of paragraph.tokens) {
      if (!token.plain) ids.add(token.wordId);
    }
  }

  return Array.from(ids)
    .map((id) => findAnyWord(id))
    .filter(Boolean)
    .slice(0, 5) as Word[];
}

export function findStoryWord(wordId: string) {
  return findAnyWord(wordId) ?? STUDY_WORDS[0];
}
