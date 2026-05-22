export type WordExample = {
  en: string;
  cn: string;
  tag: string;
};

export type ImageConcept = {
  emoji: string;
  color: string;
  caption: string;
  ok: boolean;
};

export type RelatedWord = {
  word: string;
  label: string;
  kind: "syn" | "ant" | "derive";
};

export type Word = {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  cn: string;
  cnLong: string;
  etym: string;
  examples: WordExample[];
  related?: RelatedWord[];
  tags: string[];
  imageConcepts?: ImageConcept[];
};

export const STUDY_WORDS: Word[] = [
  {
    id: "w1",
    word: "persist",
    ipa: "/pərˈsɪst/",
    pos: "v.",
    cn: "坚持",
    cnLong: "坚持做某事，不因为困难而放弃",
    etym: "per 一直 + sist 站立，像一直站在目标旁边",
    examples: [
      { en: "I persist in reading every day.", cn: "我坚持每天阅读。", tag: "校园" },
      { en: "Mia will persist until the final whistle.", cn: "米娅会坚持到终场哨响。", tag: "AI · 运动" }
    ],
    related: [
      { word: "persistent", label: "adj. 坚持不懈的", kind: "derive" },
      { word: "persistence", label: "n. 坚持", kind: "derive" },
      { word: "continue", label: "v. 继续", kind: "syn" },
      { word: "quit", label: "v. 放弃", kind: "ant" }
    ],
    tags: ["中考核心", "高频 #284"],
    imageConcepts: [
      { emoji: "⛰️", color: "linear-gradient(135deg,#6C5CE7,#4A3BC7)", caption: "攀登不止", ok: true },
      { emoji: "🛏️", color: "linear-gradient(135deg,#FF8A65,#E55A2B)", caption: "躺下休息", ok: false },
      { emoji: "🌪️", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "被风吹走", ok: false },
      { emoji: "🍰", color: "linear-gradient(135deg,#FF6B9D,#C9314D)", caption: "甜点奖励", ok: false }
    ]
  },
  {
    id: "w2",
    word: "ambition",
    ipa: "/æmˈbɪʃn/",
    pos: "n.",
    cn: "抱负",
    cnLong: "强烈想达成目标或取得成功的愿望",
    etym: "ambit 原指四处奔走争取支持，引申为目标感",
    examples: [
      { en: "Her ambition is to become a scientist.", cn: "她的抱负是成为科学家。", tag: "校园" },
      { en: "Your ambition can turn practice into progress.", cn: "你的抱负会把练习变成进步。", tag: "AI · 励志" }
    ],
    related: [
      { word: "ambitious", label: "adj. 有抱负的", kind: "derive" },
      { word: "goal", label: "n. 目标", kind: "syn" },
      { word: "aimless", label: "adj. 无目标的", kind: "ant" }
    ],
    tags: ["中考核心", "目标表达"],
    imageConcepts: [
      { emoji: "🎯", color: "linear-gradient(135deg,#FF6B9D,#C9314D)", caption: "目标向上", ok: true },
      { emoji: "🍔", color: "linear-gradient(135deg,#FFB020,#E07B00)", caption: "立刻满足", ok: false },
      { emoji: "🌊", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "随波逐流", ok: false },
      { emoji: "🛋️", color: "linear-gradient(135deg,#9890B5,#5B5582)", caption: "舒服躺平", ok: false }
    ]
  },
  {
    id: "w3",
    word: "achieve",
    ipa: "/əˈtʃiːv/",
    pos: "v.",
    cn: "实现",
    cnLong: "通过努力成功完成目标",
    etym: "a + chief 到达顶点，完成目标",
    examples: [
      { en: "We can achieve the goal together.", cn: "我们可以一起实现目标。", tag: "校园" },
      { en: "The team achieved a new record after months of training.", cn: "这支队伍训练数月后创造了新纪录。", tag: "AI · 运动" }
    ],
    related: [
      { word: "achievement", label: "n. 成就", kind: "derive" },
      { word: "accomplish", label: "v. 完成", kind: "syn" },
      { word: "fail", label: "v. 失败", kind: "ant" }
    ],
    tags: ["中考核心"],
    imageConcepts: [
      { emoji: "🏆", color: "linear-gradient(135deg,#FFD60A,#E0A500)", caption: "到达终点", ok: true },
      { emoji: "🛑", color: "linear-gradient(135deg,#FF5A6F,#C9314D)", caption: "停在原地", ok: false },
      { emoji: "🌧️", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "计划落空", ok: false },
      { emoji: "😴", color: "linear-gradient(135deg,#9890B5,#5B5582)", caption: "还没开始", ok: false }
    ]
  },
  {
    id: "w4",
    word: "environment",
    ipa: "/ɪnˈvaɪrənmənt/",
    pos: "n.",
    cn: "环境",
    cnLong: "人、动物或植物周围的自然或生活条件",
    etym: "environ 围绕，周围包住我们的条件",
    examples: [
      { en: "A quiet environment helps me focus.", cn: "安静的环境帮助我集中注意力。", tag: "校园" },
      { en: "Protecting the environment starts with small choices.", cn: "保护环境从小选择开始。", tag: "AI · 环保" }
    ],
    related: [
      { word: "environmental", label: "adj. 环境的", kind: "derive" },
      { word: "surroundings", label: "n. 周围环境", kind: "syn" },
      { word: "pollution", label: "n. 污染", kind: "ant" }
    ],
    tags: ["中考核心", "环保"],
    imageConcepts: [
      { emoji: "🌍", color: "linear-gradient(135deg,#00D4AA,#0E8B5C)", caption: "我们的世界", ok: true },
      { emoji: "🚗", color: "linear-gradient(135deg,#FF5A6F,#C9314D)", caption: "一辆汽车", ok: false },
      { emoji: "📱", color: "linear-gradient(135deg,#9890B5,#5B5582)", caption: "电子设备", ok: false },
      { emoji: "🍕", color: "linear-gradient(135deg,#FFB020,#E07B00)", caption: "晚餐食物", ok: false }
    ]
  },
  {
    id: "w5",
    word: "sustainable",
    ipa: "/səˈsteɪnəbl/",
    pos: "adj.",
    cn: "可持续的",
    cnLong: "能够长期保持，不耗尽资源的",
    etym: "sustain 维持 + able 能够，能一直维持下去",
    examples: [
      { en: "We need sustainable habits.", cn: "我们需要可持续的习惯。", tag: "校园" },
      { en: "A sustainable city uses energy wisely.", cn: "可持续城市会明智使用能源。", tag: "AI · 环保" }
    ],
    related: [
      { word: "sustain", label: "v. 维持", kind: "derive" },
      { word: "lasting", label: "adj. 持久的", kind: "syn" },
      { word: "temporary", label: "adj. 临时的", kind: "ant" }
    ],
    tags: ["高频表达"],
    imageConcepts: [
      { emoji: "🌱", color: "linear-gradient(135deg,#2ECC71,#1F9D58)", caption: "持续生长", ok: true },
      { emoji: "🔥", color: "linear-gradient(135deg,#FF6B6B,#C9314D)", caption: "快速燃尽", ok: false },
      { emoji: "💨", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "马上消散", ok: false },
      { emoji: "⚡", color: "linear-gradient(135deg,#FFB020,#E07B00)", caption: "一瞬爆发", ok: false }
    ]
  },
  {
    id: "w6",
    word: "determine",
    ipa: "/dɪˈtɜːrmɪn/",
    pos: "v.",
    cn: "决定",
    cnLong: "决定某事，或坚定地下定决心",
    etym: "de 加强 + termin 边界，把边界定下来",
    examples: [
      { en: "Your choices determine your result.", cn: "你的选择决定你的结果。", tag: "校园" },
      { en: "The captain determined to train harder.", cn: "队长决定更努力训练。", tag: "AI · 运动" }
    ],
    related: [
      { word: "determined", label: "adj. 坚定的", kind: "derive" },
      { word: "decide", label: "v. 决定", kind: "syn" },
      { word: "hesitate", label: "v. 犹豫", kind: "ant" }
    ],
    tags: ["中考核心"],
    imageConcepts: [
      { emoji: "✊", color: "linear-gradient(135deg,#6C5CE7,#4A3BC7)", caption: "下定决心", ok: true },
      { emoji: "🤷", color: "linear-gradient(135deg,#9890B5,#5B5582)", caption: "犹豫不定", ok: false },
      { emoji: "🎲", color: "linear-gradient(135deg,#FF8A65,#E55A2B)", caption: "完全随机", ok: false },
      { emoji: "💭", color: "linear-gradient(135deg,#54C7FF,#1B7FB8)", caption: "只是幻想", ok: false }
    ]
  }
];

export function getStudyWords() {
  return STUDY_WORDS;
}

export function findWord(id: string) {
  return STUDY_WORDS.find((word) => word.id === id);
}
