export type AdminPromptKey = "example" | "story" | "memory-map" | "ocr";

export type AdminPromptStatus = "online" | "draft" | "ab" | "archived";

export type AdminPromptVersionRecord = {
  id: string;
  key: AdminPromptKey;
  title: string;
  version: number;
  status: AdminPromptStatus;
  body: string;
  safetyRules: string[];
  outputSchema: string;
  notes: string;
  updatedAt: string;
  updatedBy: string;
};

export type AdminPromptCreateInput = {
  key: AdminPromptKey;
  title: string;
  body: string;
  safetyRules: string[];
  outputSchema: string;
  notes?: string;
};

const UPDATED_AT = "2026-05-20T10:00:00.000Z";

export const DEFAULT_ADMIN_PROMPT_VERSIONS: AdminPromptVersionRecord[] = [
  {
    id: "prompt-example-v8",
    key: "example",
    title: "K12 例句生成",
    version: 8,
    status: "online",
    body: [
      "任务：为中国 K12 学生生成个性化英文例句。",
      "未成年人安全：禁止成人、暴力、隐私、诱导消费、品牌广告和网络攻击内容。",
      "教研标准：英文 8-15 个词，自然包含目标词；中文翻译准确、口语化；难度适配学生年级。"
    ].join("\n"),
    safetyRules: ["未成年人安全", "禁止成人、暴力、隐私内容", "禁止品牌广告和网络热梗", "不得输出 Markdown"],
    outputSchema: '{"en":string,"cn":string,"tag":"AI · DeepSeek"}',
    notes: "当前线上版本",
    updatedAt: UPDATED_AT,
    updatedBy: "AI 教研"
  },
  {
    id: "prompt-story-v5",
    key: "story",
    title: "每日故事生成",
    version: 5,
    status: "ab",
    body: [
      "任务：生成一篇适合中国 K12 学生跟读的英文故事。",
      "未成年人安全：主题积极，避免成人、暴力、政治、隐私和攀比消费。",
      "教研标准：自然包含复习词，每词出现 1 次；90-130 words；段落短，情节清楚。"
    ].join("\n"),
    safetyRules: ["积极价值观", "K12 难度控制", "目标词自然出现", "严格 JSON"],
    outputSchema: '{"episode":number,"title":string,"paragraphs":[{"tokens":[{"text":string}]}],"question":string,"options":[{"id":string,"label":string,"correct":boolean}]}',
    notes: "A/B 测试版本",
    updatedAt: UPDATED_AT,
    updatedBy: "AI 教研"
  },
  {
    id: "prompt-memory-map-v4",
    key: "memory-map",
    title: "记忆图谱生成",
    version: 4,
    status: "online",
    body: [
      "任务：围绕中心词生成记忆图谱。",
      "未成年人安全：联想内容必须正向、校园友好，不使用恐吓或羞辱表达。",
      "教研标准：包含派生词、同义词、反义词、词根线索和 18 字以内中文记忆提示。"
    ].join("\n"),
    safetyRules: ["校园友好联想", "避免羞辱表达", "派生/近反义关系准确"],
    outputSchema: '{"related":[{"word":string,"label":string,"kind":"derive"|"syn"|"ant"}],"rootClue":string,"memoryTip":string}',
    notes: "当前线上版本",
    updatedAt: UPDATED_AT,
    updatedBy: "学习算法"
  },
  {
    id: "prompt-ocr-v3",
    key: "ocr",
    title: "OCR 解析纠错",
    version: 3,
    status: "draft",
    body: [
      "任务：对 OCR 识别出的英文教材文本做保守纠错和词汇解释。",
      "未成年人安全：不得扩写敏感内容，不对低置信度文本做臆测。",
      "教研标准：只解释明确识别的词；给出词性、中文释义和加入复习建议。"
    ].join("\n"),
    safetyRules: ["低置信度保守输出", "不扩写敏感内容", "仅解释明确识别文本"],
    outputSchema: '{"title":string,"words":[{"word":string,"cn":string,"confidence":number}]}',
    notes: "待评测版本",
    updatedAt: UPDATED_AT,
    updatedBy: "AI 平台"
  }
];

export function isAdminPromptKey(value: string): value is AdminPromptKey {
  return ["example", "story", "memory-map", "ocr"].includes(value);
}

export function isAdminPromptStatus(value: string): value is AdminPromptStatus {
  return ["online", "draft", "ab", "archived"].includes(value);
}

export function isAdminPromptVersionRecord(value: unknown): value is AdminPromptVersionRecord {
  if (!value || typeof value !== "object") return false;
  const prompt = value as Partial<AdminPromptVersionRecord>;

  return (
    typeof prompt.id === "string" &&
    typeof prompt.key === "string" &&
    isAdminPromptKey(prompt.key) &&
    typeof prompt.title === "string" &&
    typeof prompt.version === "number" &&
    typeof prompt.status === "string" &&
    isAdminPromptStatus(prompt.status) &&
    typeof prompt.body === "string" &&
    Array.isArray(prompt.safetyRules) &&
    prompt.safetyRules.every((rule) => typeof rule === "string") &&
    typeof prompt.outputSchema === "string" &&
    typeof prompt.notes === "string" &&
    typeof prompt.updatedAt === "string" &&
    typeof prompt.updatedBy === "string"
  );
}

export function sortAdminPromptVersions(prompts: AdminPromptVersionRecord[]) {
  return [...prompts].sort((a, b) => a.key.localeCompare(b.key) || b.version - a.version);
}

export function buildAdminPromptVersion(input: AdminPromptCreateInput, existing: AdminPromptVersionRecord[], actor: string, now = new Date()): AdminPromptVersionRecord {
  const version = Math.max(0, ...existing.filter((prompt) => prompt.key === input.key).map((prompt) => prompt.version)) + 1;

  return {
    id: `prompt-${input.key}-v${version}`,
    key: input.key,
    title: input.title.trim(),
    version,
    status: "draft",
    body: input.body.trim(),
    safetyRules: input.safetyRules.map((rule) => rule.trim()).filter(Boolean),
    outputSchema: input.outputSchema.trim(),
    notes: input.notes?.trim() ?? "",
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}
