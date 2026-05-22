import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, ".cache");
const OUT_FILE = path.join(ROOT, "src/lib/generated/wordbook-data.json");

const SOURCES = {
  ecdict: {
    url: "https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv",
    file: "ecdict.csv"
  },
  primary: {
    url: "https://raw.githubusercontent.com/mahavivo/english-wordlists/master/%E5%B0%8F%E5%AD%A6%E8%8B%B1%E8%AF%AD%E5%A4%A7%E7%BA%B2%E8%AF%8D%E6%B1%87.txt",
    file: "primary.txt"
  },
  zhongkao: {
    url: "https://raw.githubusercontent.com/mahavivo/english-wordlists/master/%E4%B8%AD%E8%80%83%E8%8B%B1%E8%AF%AD%E8%AF%8D%E6%B1%87%E8%A1%A8.txt",
    file: "zk-mahavivo.txt"
  },
  highschool: {
    url: "https://raw.githubusercontent.com/mahavivo/english-wordlists/master/Highschool_edited.txt",
    file: "highschool.txt"
  },
  toefl: {
    url: "https://raw.githubusercontent.com/mahavivo/english-wordlists/master/TOEFL.txt",
    file: "toefl-mahavivo.txt"
  },
  nce: {
    url: "https://trigramser.github.io/NCE/",
    file: "nce.html"
  }
};

const BOOKS = {
  primary: { title: "小学词库", total: 800, tags: ["小学词库"], source: "小学英语大纲词汇 + ECDICT" },
  "zhongkao-1600": { title: "中考 1600", total: 1600, tags: ["中考 1600"], source: "ECDICT zk 标签 + 中考英语词汇表" },
  "gaokao-3500": { title: "高考 3500", total: 3500, tags: ["高考 3500"], source: "ECDICT gk 标签 + Highschool_edited" },
  ielts: { title: "雅思词库", total: 4200, tags: ["雅思词库"], source: "ECDICT IELTS 标签" },
  toefl: { title: "托福词库", total: 4600, tags: ["托福词库"], source: "ECDICT TOEFL 标签 + TOEFL.txt" },
  "new-concept": { title: "新概念英语", total: 2400, tags: ["新概念英语"], source: "NCE 公开词形索引 + ECDICT" }
};

const SEEDS = {
  primary: ["apple", "school", "teacher", "family", "friend", "breakfast", "weather", "favorite"],
  "zhongkao-1600": ["persist", "ambition", "achieve", "environment", "sustainable", "determine"],
  "gaokao-3500": ["phenomenon", "significant", "available", "consequence", "approach", "individual", "technology", "responsibility"],
  ielts: ["sustainable", "urbanization", "infrastructure", "biodiversity", "controversial", "allocate", "legislation", "prioritize"],
  toefl: ["hypothesis", "ecosystem", "archaeology", "photosynthesis", "migration", "contemporary", "derive", "constraint"],
  "new-concept": ["detective", "valuable", "parcel", "garage", "private", "conversation", "interrupt", "complain"]
};

const CN_OVERRIDES = {
  persist: "坚持",
  ambition: "抱负",
  achieve: "实现",
  environment: "环境",
  sustainable: "可持续的",
  determine: "决定",
  apple: "苹果",
  school: "学校",
  teacher: "老师",
  family: "家庭",
  friend: "朋友",
  breakfast: "早餐",
  weather: "天气",
  favorite: "最喜欢的",
  phenomenon: "现象",
  significant: "重要的；显著的",
  available: "可获得的",
  consequence: "结果；后果",
  approach: "方法；接近",
  individual: "个人；个体的",
  technology: "技术",
  responsibility: "责任",
  urbanization: "城市化",
  infrastructure: "基础设施",
  biodiversity: "生物多样性",
  controversial: "有争议的",
  allocate: "分配",
  legislation: "立法",
  prioritize: "优先考虑",
  hypothesis: "假设",
  ecosystem: "生态系统",
  archaeology: "考古学",
  photosynthesis: "光合作用",
  migration: "迁徙",
  contemporary: "当代的",
  derive: "源于；获得",
  constraint: "限制",
  detective: "侦探",
  valuable: "贵重的；有价值的",
  parcel: "包裹",
  garage: "车库",
  private: "私人的",
  conversation: "谈话",
  interrupt: "打断",
  complain: "抱怨"
};

const STOP_NCE = new Set(
  "the a an and or but to of in on at for with from by is are was were be been being it this that these those i you he she we they me him her us them my your his their our as not do does did can could will would shall should have has had yes no isn don didn new concept english lesson back top one two three four five six seven eight nine ten first second third".split(
    " "
  )
);

async function downloadSource({ url, file }) {
  await mkdir(CACHE_DIR, { recursive: true });
  const target = path.join(CACHE_DIR, file);
  if (existsSync(target)) return target;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char !== "\r") field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body.map((items) => Object.fromEntries(header.map((key, index) => [key, items[index] ?? ""])));
}

function normalizeWord(word) {
  return word.trim().toLowerCase();
}

function isSimpleWord(word) {
  return /^[a-z][a-z-]*$/.test(word) && word.length <= 24;
}

function uniqueWords(words) {
  const seen = new Set();
  const result = [];
  for (const raw of words) {
    const word = normalizeWord(raw);
    if (!isSimpleWord(word) || seen.has(word)) continue;
    seen.add(word);
    result.push(word);
  }
  return result;
}

function parseSimpleList(text) {
  return uniqueWords(text.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()));
}

function parseFirstTokenList(text) {
  return uniqueWords(
    text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^([A-Za-z][A-Za-z-]*)(?:\s|\(|$)/)?.[1] ?? "")
  );
}

function parseNceWords(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ");
  const words = text.match(/[A-Za-z]+(?:-[A-Za-z]+)?/g) ?? [];
  return uniqueWords(words).filter((word) => word.length > 2 && !STOP_NCE.has(word));
}

function numericRank(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 999999;
}

function rowScore(row) {
  return numericRank(row.bnc) * 2 + numericRank(row.frq);
}

function byFrequency(a, b) {
  return rowScore(a) - rowScore(b) || a.word.localeCompare(b.word);
}

function getTags(row) {
  return (row.tag || "").toLowerCase().split(/\s+/).filter(Boolean);
}

function stripNetworkLine(line) {
  return !/^\s*\[网络\]/.test(line);
}

function cleanTranslation(translation) {
  const lines = String(translation || "")
    .replace(/\\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(stripNetworkLine);
  const source = lines[0] ?? "";
  return source
    .replace(/\[[^\]]+\]/g, "")
    .replace(/^[a-z./\s]+/i, "")
    .replace(/[（(].*?[）)]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortCn(row) {
  const override = CN_OVERRIDES[normalizeWord(row.word)];
  if (override) return override;
  const clean = cleanTranslation(row.translation);
  const first = clean.split(/[；;,，]/).find(Boolean)?.trim();
  return first || clean || "释义待补充";
}

function longCn(row) {
  const override = CN_OVERRIDES[normalizeWord(row.word)];
  if (override) return override;
  const clean = cleanTranslation(row.translation);
  return clean || shortCn(row);
}

function inferPos(row) {
  if (row.pos) return row.pos;
  const match = String(row.translation || "").match(/\b(n|v|vt|vi|adj|a|adv|prep|conj|pron|num|art|int)\./i);
  if (!match) return "n.";
  const value = match[1].toLowerCase();
  if (value === "a") return "adj.";
  return `${value}.`;
}

function slug(word) {
  return word.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toWord(row, bookId, book) {
  const word = normalizeWord(row.word);
  const cn = shortCn(row);
  const tags = Array.from(new Set([...book.tags, ...(getTags(row).length ? [`ECDICT:${getTags(row).join("/")}`] : [])]));
  return {
    id: `wb-${slug(word)}`,
    word,
    ipa: row.phonetic ? `/${row.phonetic.replace(/^\/|\/$/g, "")}/` : "",
    pos: inferPos(row),
    cn,
    cnLong: longCn(row),
    etym: `${book.source} · 词频 BNC ${row.bnc || "NA"} / FRQ ${row.frq || "NA"}`,
    examples: [
      {
        en: `Learn ${word} in a real sentence.`,
        cn: `在真实语境中学习 ${word}。`,
        tag: "词书例句"
      }
    ],
    tags
  };
}

function pickWords({ bookId, ecdictByWord, taggedRows, sourceWords = [], fillerRows = [] }) {
  const book = BOOKS[bookId];
  const picked = [];
  const seen = new Set();

  const addWord = (word) => {
    const normalized = normalizeWord(word);
    const row = ecdictByWord.get(normalized);
    if (!row || seen.has(normalized) || !isSimpleWord(normalized)) return;
    if (!cleanTranslation(row.translation)) return;
    picked.push(toWord(row, bookId, book));
    seen.add(normalized);
  };

  for (const word of SEEDS[bookId] ?? []) addWord(word);
  for (const word of sourceWords) addWord(word);
  for (const row of taggedRows) addWord(row.word);
  for (const row of fillerRows) addWord(row.word);

  if (picked.length < book.total) {
    throw new Error(`${bookId} only has ${picked.length}/${book.total} words after import`);
  }

  return picked.slice(0, book.total);
}

async function main() {
  const paths = Object.fromEntries(await Promise.all(Object.entries(SOURCES).map(async ([key, source]) => [key, await downloadSource(source)])));
  const ecdictRows = parseCsv(await readFile(paths.ecdict, "utf8"))
    .map((row) => ({ ...row, word: normalizeWord(row.word) }))
    .filter((row) => isSimpleWord(row.word) && cleanTranslation(row.translation));

  const ecdictByWord = new Map();
  for (const row of ecdictRows.sort(byFrequency)) {
    if (!ecdictByWord.has(row.word)) ecdictByWord.set(row.word, row);
  }

  const rowsByTag = (tag) => ecdictRows.filter((row) => getTags(row).includes(tag)).sort(byFrequency);
  const commonRows = [...ecdictRows].sort(byFrequency);

  const primaryWords = parseSimpleList(await readFile(paths.primary, "utf8"));
  const zhongkaoWords = parseFirstTokenList(await readFile(paths.zhongkao, "utf8"));
  const highschoolWords = parseSimpleList(await readFile(paths.highschool, "utf8"));
  const toeflWords = parseFirstTokenList(await readFile(paths.toefl, "utf8"));
  const nceWords = parseNceWords(await readFile(paths.nce, "utf8"));

  const books = {
    primary: pickWords({
      bookId: "primary",
      ecdictByWord,
      taggedRows: [],
      sourceWords: primaryWords,
      fillerRows: rowsByTag("zk")
    }),
    "zhongkao-1600": pickWords({
      bookId: "zhongkao-1600",
      ecdictByWord,
      taggedRows: rowsByTag("zk"),
      sourceWords: zhongkaoWords,
      fillerRows: commonRows
    }),
    "gaokao-3500": pickWords({
      bookId: "gaokao-3500",
      ecdictByWord,
      taggedRows: rowsByTag("gk"),
      sourceWords: highschoolWords,
      fillerRows: rowsByTag("gk")
    }),
    ielts: pickWords({
      bookId: "ielts",
      ecdictByWord,
      taggedRows: rowsByTag("ielts"),
      fillerRows: rowsByTag("gk")
    }),
    toefl: pickWords({
      bookId: "toefl",
      ecdictByWord,
      taggedRows: rowsByTag("toefl"),
      sourceWords: toeflWords,
      fillerRows: rowsByTag("ielts")
    }),
    "new-concept": pickWords({
      bookId: "new-concept",
      ecdictByWord,
      taggedRows: [],
      sourceWords: nceWords,
      fillerRows: commonRows
    })
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    sources: Object.fromEntries(Object.entries(SOURCES).map(([key, source]) => [key, source.url])),
    books
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(payload)}\n`);

  for (const [bookId, words] of Object.entries(books)) {
    console.log(`${bookId}: ${words.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
