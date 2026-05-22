import type { Word } from "./words";
import { STUDY_WORDS } from "./words";
import { getActiveWordbook as getCatalogActiveWordbook, WORDBOOKS, type WordbookId } from "./wordbook-catalog";
export { getActiveWordbook, getWordbook, listWordbooks, WORDBOOKS } from "./wordbook-catalog";
export type { Wordbook, WordbookId } from "./wordbook-catalog";
import generatedWordbookData from "./generated/wordbook-data.json";

type GeneratedWord = Omit<Word, "imageConcepts"> & {
  imageConcepts?: Word["imageConcepts"];
};

type GeneratedWordbookData = {
  generatedAt: string;
  sources: Record<string, string>;
  books: Record<WordbookId, GeneratedWord[]>;
};

const GENERATED_DATA = generatedWordbookData as GeneratedWordbookData;

export const WORDBOOK_DATA_GENERATED_AT = GENERATED_DATA.generatedAt;
export const WORDBOOK_DATA_SOURCES = GENERATED_DATA.sources;

function defaultImageConcepts(word: Word): NonNullable<Word["imageConcepts"]> {
  return [
    { emoji: "✨", color: "linear-gradient(135deg,#6C5CE7,#4A3BC7)", caption: word.cn.split("；")[0], ok: true },
    { emoji: "🧩", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "干扰联想", ok: false },
    { emoji: "🌙", color: "linear-gradient(135deg,#9890B5,#5B5582)", caption: "相反情境", ok: false },
    { emoji: "⚡", color: "linear-gradient(135deg,#FFB020,#E07B00)", caption: "近形干扰", ok: false }
  ];
}

function hydrateWord(word: GeneratedWord): Word {
  return {
    ...word,
    imageConcepts: word.imageConcepts ?? defaultImageConcepts(word)
  };
}

function withPinnedStudyWords(bookId: WordbookId, words: Word[]) {
  if (bookId !== "zhongkao-1600") return words;

  const pinned = STUDY_WORDS.map((word) => ({
    ...word,
    tags: Array.from(new Set([...word.tags, "中考 1600"]))
  }));
  const pinnedWords = new Set(pinned.map((word) => word.word.toLowerCase()));
  const merged = [...pinned, ...words.filter((word) => !pinnedWords.has(word.word.toLowerCase()))];
  return merged.slice(0, getCatalogActiveWordbook(bookId).total);
}

const WORDS_BY_BOOK = Object.fromEntries(
  WORDBOOKS.map((book) => {
    const words = GENERATED_DATA.books[book.id].map(hydrateWord);
    return [book.id, withPinnedStudyWords(book.id, words)];
  })
) as Record<WordbookId, Word[]>;

const WORDBOOK_WORD_INDEX = new Map(Object.values(WORDS_BY_BOOK).flat().map((word) => [word.id, word]));

export function getWordbookWords(id: string | null | undefined) {
  return WORDS_BY_BOOK[getCatalogActiveWordbook(id).id];
}

export function findWordbookWord(wordId: string) {
  return WORDBOOK_WORD_INDEX.get(wordId);
}
