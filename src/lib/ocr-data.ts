import { findWord, type Word } from "@/lib/words";

export type OcrWordStatus = "known" | "review" | "new";

export type OcrDetectedWord = {
  id: string;
  word: string;
  x: number;
  y: number;
  confidence: number;
  status: OcrWordStatus;
  wordId?: string;
};

export type OcrResult = {
  detected: number;
  title: string;
  passage: string;
  words: OcrDetectedWord[];
};

export const MOCK_OCR_RESULT: OcrResult = {
  detected: 142,
  title: "Lesson 5 · The Bookworm",
  passage: "Mia is an ambitious student. She wants to achieve her dream. Her teacher says she is persistent and willing to determine her own path with perseverance and aspiration for a brighter future.",
  words: [
    { id: "ocr-achieve", word: "achieve", wordId: "w3", x: 22, y: 31, confidence: 0.94, status: "known" },
    { id: "ocr-persistent", word: "persistent", wordId: "w1", x: 58, y: 28, confidence: 0.91, status: "review" },
    { id: "ocr-sustainable", word: "sustainable", wordId: "w5", x: 41, y: 52, confidence: 0.88, status: "review" },
    { id: "ocr-determine", word: "determine", wordId: "w6", x: 72, y: 47, confidence: 0.92, status: "known" },
    { id: "ocr-perseverance", word: "perseverance", x: 30, y: 71, confidence: 0.86, status: "new" },
    { id: "ocr-aspiration", word: "aspiration", x: 64, y: 76, confidence: 0.83, status: "new" }
  ]
};

export function getMockOcrResult() {
  return MOCK_OCR_RESULT;
}

export function getDefaultOcrSelection(result: OcrResult = MOCK_OCR_RESULT) {
  return new Set(result.words.filter((word) => word.status !== "known").map((word) => word.id));
}

export function getOcrWordDefinition(word: OcrDetectedWord): Pick<Word, "pos" | "cn"> {
  const linked = word.wordId ? findWord(word.wordId) : null;
  if (linked) return { pos: linked.pos, cn: linked.cn };
  return { pos: "n.", cn: word.status === "new" ? "新识别词" : "待复习词" };
}
