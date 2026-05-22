export type DictionaryBook = {
  id: string;
  title: string;
  subtitle: string;
  total: number;
  mastered: number;
  newWords: number;
  streak: number;
  current?: boolean;
  accent: string;
};

export const DICTIONARY_BOOKS: DictionaryBook[] = [
  {
    id: "middle-core",
    title: "中考核心 1600",
    subtitle: "校内同步 · 高频考点",
    total: 1600,
    mastered: 1284,
    newWords: 316,
    streak: 18,
    current: true,
    accent: "#35C86A",
  },
  {
    id: "new-concept-2",
    title: "新概念二册",
    subtitle: "语法语感 · 课文词汇",
    total: 820,
    mastered: 426,
    newWords: 394,
    streak: 9,
    accent: "#4F7BFF",
  },
  {
    id: "gaokao-3500",
    title: "高考 3500",
    subtitle: "升学预备 · 词根拓展",
    total: 3500,
    mastered: 948,
    newWords: 2552,
    streak: 6,
    accent: "#FFB43B",
  },
  {
    id: "ielts-65",
    title: "雅思 6.5+",
    subtitle: "学术阅读 · 写作表达",
    total: 2400,
    mastered: 378,
    newWords: 2022,
    streak: 3,
    accent: "#FF6B8B",
  },
];

export const DICTIONARY_OVERVIEW = {
  activeBook: "中考核心 1600",
  mastered: 1284,
  total: 1600,
  dueToday: 42,
  difficult: 18,
};
