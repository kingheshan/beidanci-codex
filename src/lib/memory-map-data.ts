import { findClientWord } from "@/lib/client-wordbook-preview";
import { STUDY_WORDS, type RelatedWord, type Word } from "@/lib/words";

export type MemoryRelationKind = RelatedWord["kind"] | "center";

export type MemoryRelationMeta = {
  code: string;
  label: string;
  badge: string;
  color: string;
  bg: string;
};

export type MemoryMapNode = {
  id: string;
  word: string;
  label: string;
  kind: RelatedWord["kind"];
  x: number;
  y: number;
  clue: string;
};

export type MemoryMapModel = {
  word: Word;
  nodes: MemoryMapNode[];
  rootClues: Array<{ title: string; body: string }>;
  aiTips: string[];
};

export const RELATION_META: Record<MemoryRelationKind, MemoryRelationMeta> = {
  center: { code: "C", label: "中心词", badge: "C · 中心", color: "#FFFFFF", bg: "rgba(255,255,255,0.16)" },
  syn: { code: "S", label: "同义关系", badge: "S · 同义", color: "var(--c-success)", bg: "#DCFCE7" },
  ant: { code: "A", label: "反义关系", badge: "A · 反义", color: "var(--c-danger)", bg: "#FFE2E5" },
  derive: { code: "D", label: "派生关系", badge: "D · 派生", color: "var(--c-primary)", bg: "var(--c-primary-soft)" }
};

const NODE_POSITIONS = [
  { x: 18, y: 24 },
  { x: 78, y: 24 },
  { x: 14, y: 66 },
  { x: 84, y: 66 },
  { x: 50, y: 14 },
  { x: 30, y: 86 },
  { x: 74, y: 88 }
] as const;

function relationClue(relation: RelatedWord, word: Word) {
  if (relation.kind === "derive") {
    return `${relation.word} 和 ${word.word} 来自同一词族，记住中心动作后再扩展词性。`;
  }

  if (relation.kind === "syn") {
    return `${relation.word} 能帮助你用熟词解释 ${word.word}，适合放进同义替换题。`;
  }

  return `${relation.word} 是反向线索，用“不要 ${relation.word}”来提醒自己靠近 ${word.word}。`;
}

export function getMemoryMap(wordId: string): MemoryMapModel {
  const word = findClientWord(wordId) ?? STUDY_WORDS[0];
  const nodes = (word.related ?? []).slice(0, NODE_POSITIONS.length).map((relation, index) => ({
    id: `${word.id}-${relation.kind}-${index}`,
    word: relation.word,
    label: relation.label,
    kind: relation.kind,
    x: NODE_POSITIONS[index].x,
    y: NODE_POSITIONS[index].y,
    clue: relationClue(relation, word)
  }));

  return {
    word,
    nodes,
    rootClues: [
      { title: "词根拆解", body: word.etym },
      { title: "核心释义", body: `${word.pos} ${word.cn}：${word.cnLong}` },
      { title: "例句锚点", body: word.examples[0]?.en ?? `Use ${word.word} in one sentence.` }
    ],
    aiTips: [
      `先看中心词 ${word.word}，再按派生、同义、反义三条线记忆。`,
      "点击外圈节点查看它和中心词的关系，最后回到例句中复述一次。",
      "答题时如果卡住，先想反义词，再反推中心词含义。"
    ]
  };
}
