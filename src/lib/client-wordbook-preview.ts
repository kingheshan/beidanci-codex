import { getActiveWordbook, type WordbookId } from "./wordbook-catalog";
import { findWord, STUDY_WORDS, type Word } from "./words";

type PreviewSeed = {
  id: string;
  word: string;
  pos: string;
  cn: string;
  cnLong?: string;
  tag: string;
  example?: string;
};

function previewWord(seed: PreviewSeed): Word {
  return {
    id: seed.id,
    word: seed.word,
    ipa: "",
    pos: seed.pos,
    cn: seed.cn,
    cnLong: seed.cnLong ?? seed.cn,
    etym: `${seed.tag} · 首屏预览词`,
    examples: [
      {
        en: seed.example ?? `Learn ${seed.word} in a real sentence.`,
        cn: `在真实语境中学习 ${seed.word}。`,
        tag: "词书预览"
      }
    ],
    tags: [seed.tag]
  };
}

const PREVIEW_WORDS_BY_BOOK: Record<WordbookId, Word[]> = {
  primary: [
    previewWord({ id: "wb-apple", word: "apple", pos: "n.", cn: "苹果", tag: "小学词库" }),
    previewWord({ id: "wb-school", word: "school", pos: "n.", cn: "学校", tag: "小学词库" }),
    previewWord({ id: "wb-teacher", word: "teacher", pos: "n.", cn: "老师", tag: "小学词库" }),
    previewWord({ id: "wb-family", word: "family", pos: "n.", cn: "家庭", tag: "小学词库" }),
    previewWord({ id: "wb-friend", word: "friend", pos: "n.", cn: "朋友", tag: "小学词库" }),
    previewWord({ id: "wb-breakfast", word: "breakfast", pos: "n.", cn: "早餐", tag: "小学词库" })
  ],
  "zhongkao-1600": STUDY_WORDS,
  "gaokao-3500": [
    previewWord({ id: "wb-phenomenon", word: "phenomenon", pos: "n.", cn: "现象", tag: "高考 3500" }),
    previewWord({ id: "wb-significant", word: "significant", pos: "adj.", cn: "重要的；显著的", tag: "高考 3500" }),
    previewWord({ id: "wb-available", word: "available", pos: "adj.", cn: "可获得的", tag: "高考 3500" }),
    previewWord({ id: "wb-consequence", word: "consequence", pos: "n.", cn: "结果；后果", tag: "高考 3500" }),
    previewWord({ id: "wb-approach", word: "approach", pos: "n.", cn: "方法；接近", tag: "高考 3500" }),
    previewWord({ id: "wb-individual", word: "individual", pos: "n.", cn: "个人；个体的", tag: "高考 3500" })
  ],
  ielts: [
    previewWord({ id: "wb-sustainable", word: "sustainable", pos: "adj.", cn: "可持续的", tag: "雅思词库" }),
    previewWord({ id: "wb-urbanization", word: "urbanization", pos: "n.", cn: "城市化", tag: "雅思词库" }),
    previewWord({ id: "wb-infrastructure", word: "infrastructure", pos: "n.", cn: "基础设施", tag: "雅思词库" }),
    previewWord({ id: "wb-biodiversity", word: "biodiversity", pos: "n.", cn: "生物多样性", tag: "雅思词库" }),
    previewWord({ id: "wb-controversial", word: "controversial", pos: "adj.", cn: "有争议的", tag: "雅思词库" }),
    previewWord({ id: "wb-allocate", word: "allocate", pos: "v.", cn: "分配", tag: "雅思词库" })
  ],
  toefl: [
    previewWord({ id: "wb-hypothesis", word: "hypothesis", pos: "n.", cn: "假设", tag: "托福词库" }),
    previewWord({ id: "wb-ecosystem", word: "ecosystem", pos: "n.", cn: "生态系统", tag: "托福词库" }),
    previewWord({ id: "wb-archaeology", word: "archaeology", pos: "n.", cn: "考古学", tag: "托福词库" }),
    previewWord({ id: "wb-photosynthesis", word: "photosynthesis", pos: "n.", cn: "光合作用", tag: "托福词库" }),
    previewWord({ id: "wb-migration", word: "migration", pos: "n.", cn: "迁徙", tag: "托福词库" }),
    previewWord({ id: "wb-contemporary", word: "contemporary", pos: "adj.", cn: "当代的", tag: "托福词库" })
  ],
  "new-concept": [
    previewWord({ id: "wb-detective", word: "detective", pos: "n.", cn: "侦探", tag: "新概念英语" }),
    previewWord({ id: "wb-valuable", word: "valuable", pos: "adj.", cn: "贵重的；有价值的", tag: "新概念英语" }),
    previewWord({ id: "wb-parcel", word: "parcel", pos: "n.", cn: "包裹", tag: "新概念英语" }),
    previewWord({ id: "wb-garage", word: "garage", pos: "n.", cn: "车库", tag: "新概念英语" }),
    previewWord({ id: "wb-private", word: "private", pos: "adj.", cn: "私人的", tag: "新概念英语" }),
    previewWord({ id: "wb-conversation", word: "conversation", pos: "n.", cn: "谈话", tag: "新概念英语" })
  ]
};

const PREVIEW_WORD_INDEX = new Map(Object.values(PREVIEW_WORDS_BY_BOOK).flat().map((word) => [word.id, word]));

export function getClientWordbookWords(id: string | null | undefined) {
  return PREVIEW_WORDS_BY_BOOK[getActiveWordbook(id).id];
}

export function findClientWord(wordId: string) {
  return findWord(wordId) ?? PREVIEW_WORD_INDEX.get(wordId);
}
