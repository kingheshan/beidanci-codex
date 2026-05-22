export type WordbookId = "primary" | "zhongkao-1600" | "gaokao-3500" | "ielts" | "toefl" | "new-concept";

export type Wordbook = {
  id: WordbookId;
  title: string;
  subtitle: string;
  total: number;
  source: string;
  accent: string;
  cefr: string;
};

export const WORDBOOKS: Wordbook[] = [
  { id: "primary", title: "小学词库", subtitle: "校内基础 · 常用表达", total: 800, source: "小学英语课标核心词", accent: "#54C7FF", cefr: "A1-A2" },
  { id: "zhongkao-1600", title: "中考 1600", subtitle: "初中课标 · 高频考点", total: 1600, source: "ECDICT zk 标签 + 中考核心词", accent: "#35C86A", cefr: "A2-B1" },
  { id: "gaokao-3500", title: "高考 3500", subtitle: "高中课标 · 读写拓展", total: 3500, source: "ECDICT gk 标签 + 高考核心词", accent: "#FFB43B", cefr: "B1-B2" },
  { id: "ielts", title: "雅思词库", subtitle: "学术阅读 · 写作表达", total: 4200, source: "ECDICT IELTS 标签 + 学术词表", accent: "#FF6B8B", cefr: "B2-C1" },
  { id: "toefl", title: "托福词库", subtitle: "校园学术 · 听说读写", total: 4600, source: "ECDICT TOEFL 标签 + 学术词表", accent: "#6C5CE7", cefr: "B2-C1" },
  { id: "new-concept", title: "新概念英语", subtitle: "课文语感 · 高频短语", total: 2400, source: "新概念课文高频词种子", accent: "#00D4AA", cefr: "A2-B2" }
];

export function listWordbooks() {
  return WORDBOOKS;
}

export function getWordbook(id: string | null | undefined) {
  return WORDBOOKS.find((book) => book.id === id);
}

export function getActiveWordbook(id: string | null | undefined) {
  return getWordbook(id) ?? getWordbook("zhongkao-1600")!;
}
