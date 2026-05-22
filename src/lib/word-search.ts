import { findWordbookWord } from "./wordbooks";
import { findWord as findStudyWord } from "./words";

export function findAnyWord(wordId: string) {
  return findStudyWord(wordId) ?? findWordbookWord(wordId);
}
