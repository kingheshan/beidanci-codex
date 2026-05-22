import { getMemoryMap, type MemoryMapModel } from "./memory-map-data";
import { DAILY_STORY, type DailyStory } from "./story-data";
import type { Word, WordExample } from "./words";
import { createAiUsageEvent, recordAiUsageEvent, type AiUsageEvent, type AiUsageFeature, type AiUsagePricing } from "./ai-usage";

type DeepseekMessage = {
  role: "system" | "user";
  content: string;
};

type DeepseekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type DeepseekAiClientOptions = {
  apiKey: string;
  fetcher?: typeof fetch;
  model?: string;
  timeoutMs?: number;
  telemetry?: {
    feature?: AiUsageFeature;
    now?: () => Date;
    pricing?: AiUsagePricing;
    record?: (event: AiUsageEvent) => void;
  };
};

export type StoryPromptInput = {
  words: Word[];
  grade: string;
  interests: string[];
};

export type ExamplePromptInput = {
  word: Word;
  grade: string;
  interests: string[];
};

export type MemoryMapPromptInput = {
  word: Word;
};

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 12_000;

export const DEEPSEEK_SYSTEM_PROMPT = [
  "你是爱上背单词的首席 K12 英语教研专家，服务中国学生。",
  "你必须以一线英语教师、词汇教研负责人和未成年人内容安全审核员的标准输出。",
  "输出必须适合未成年人，积极、安全、无广告、无政治/成人/暴力内容，不收集或推断任何隐私信息。",
  "所有返回必须是严格 JSON，不要 Markdown，不要解释，不要输出 schema 外字段。"
].join("\n");

function wordSummary(words: Word[]) {
  return words.map((word) => `${word.id}:${word.word}(${word.pos}, ${word.cn})`).join(", ");
}

export function createStoryPrompt({ words, grade, interests }: StoryPromptInput) {
  return [
    "任务：为中国 K12 学生生成一篇 AI 每日英文故事。",
    `学生年级：${grade}`,
    `兴趣：${interests.length ? interests.join("、") : "校园生活"}`,
    `必须自然包含这些复习词，每个词出现 1 次：${wordSummary(words)}`,
    `可用 wordId 清单：${words.map((word) => word.id).join(", ")}`,
    "难度：匹配学生年级，默认中考核心词汇水平；英文总长度 90-130 words，每段 1 句，语法自然。",
    "教研要求：故事要有明确情节、积极价值观、可跟读；避免生僻专名、复杂从句堆叠；英文句长尽量稳定。",
    "标注要求：wordId 必须来自给定清单；每个考察词只标注一次；同一个 token 不要同时设置 plain 和 wordId。",
    "题目要求：question 用中文提问，options 恰好 2 个且只有 1 个 correct:true，干扰项必须合理但不歧义。",
    "严格返回 JSON，结构：",
    '{"episode":number,"title":string,"cn":string,"theme":string,"paragraphs":[{"tokens":[{"text":string,"plain":true},{"text":string,"wordId":string}]}],"question":string,"options":[{"id":"a","label":string,"correct":boolean},{"id":"b","label":string,"correct":boolean}]}',
    "tokens 中被考察单词必须用 wordId 标记，其余文本用 plain:true。"
  ].join("\n");
}

export function createExamplePrompt({ word, grade, interests }: ExamplePromptInput) {
  return [
    "任务：生成一个个性化英文例句。",
    `学生年级：${grade}`,
    `兴趣：${interests.length ? interests.join("、") : "校园生活"}`,
    `目标词：${word.word}`,
    `词性/释义：${word.pos} ${word.cn}`,
    "教研要求：英文例句 8-15 个英文单词，语境真实，必须自然包含目标词；中文翻译准确口语化。",
    "词形要求：使用目标词的原形或自然屈折形式，不要改写成不相关词族。",
    "分级要求：语法和语境匹配学生年级，避免超纲长难句、负面内容、品牌广告、网络热梗。",
    "质量要求：中文翻译不能逐词硬译，tag 必须是 AI · DeepSeek。",
    '严格返回 JSON：{"en":string,"cn":string,"tag":"AI · DeepSeek"}'
  ].join("\n");
}

export function createMemoryMapPrompt({ word }: MemoryMapPromptInput) {
  return [
    "任务：生成单词记忆图谱。",
    `中心词：${word.word}`,
    `词性/释义：${word.pos} ${word.cn}`,
    `现有词根线索：${word.etym}`,
    "教研要求：给出 1-2 个派生词、1 个同义词、1 个反义词；每个 label 要包含词性和中文释义。",
    "真实性要求：不要编造不存在的词根、词源或派生词；不确定时优先给同义/反义关系。",
    "再给出适合初高中学生的 rootClue、memoryTip；memoryTip 必须 18 字以内、可直接显示在移动端。",
    '严格返回 JSON：{"related":[{"word":string,"label":string,"kind":"derive"|"syn"|"ant"}],"rootClue":string,"memoryTip":string}'
  ].join("\n");
}

export type AiGenerationContext = {
  grade: string;
  interests: string[];
};

export function createAiGenerationContextFromRequest(request: Request): AiGenerationContext {
  const params = new URL(request.url).searchParams;
  const grade = normalizeContextText(params.get("grade"), "初三");
  const interests = params
    .getAll("interests")
    .flatMap((value) => value.split(","))
    .map((value) => normalizeContextText(value, ""))
    .filter(Boolean)
    .slice(0, 5);

  return {
    grade,
    interests: interests.length ? interests : ["足球", "动漫"]
  };
}

function parseJson<T>(content: string): T {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    throw new Error("Deepseek returned invalid JSON");
  }
}

function normalizeStory(candidate: DailyStory): DailyStory {
  if (!candidate.title || !Array.isArray(candidate.paragraphs) || !Array.isArray(candidate.options)) {
    throw new Error("Deepseek story response is missing required fields");
  }

  return candidate;
}

function normalizeExample(candidate: WordExample): WordExample {
  if (!candidate.en || !candidate.cn) {
    throw new Error("Deepseek example response is missing required fields");
  }

  return {
    en: candidate.en,
    cn: candidate.cn,
    tag: candidate.tag || "AI · DeepSeek"
  };
}

export function mergeMemoryMap(word: Word, generated: { related?: Word["related"]; rootClue?: string; memoryTip?: string }): MemoryMapModel {
  const base = getMemoryMap(word.id);
  const related = generated.related?.length ? generated.related : word.related;
  const rootClues = generated.rootClue
    ? [{ ...(base.rootClues[0] ?? { title: "词根线索", body: "" }), body: generated.rootClue }, ...base.rootClues.slice(1)]
    : base.rootClues;
  const aiTips = generated.memoryTip ? [generated.memoryTip, ...base.aiTips.slice(1)] : base.aiTips;

  return {
    ...base,
    word: {
      ...base.word,
      related
    },
    rootClues,
    aiTips
  };
}

export function getDeepseekTimeoutMs(env: Record<string, string | undefined> = process.env) {
  const configured = Number(env.DEEPSEEK_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured >= 1_000 && configured <= 60_000) {
    return Math.round(configured);
  }

  return DEFAULT_TIMEOUT_MS;
}

export function createDeepseekAiClient({ apiKey, fetcher = fetch, model = DEFAULT_MODEL, timeoutMs = getDeepseekTimeoutMs(), telemetry }: DeepseekAiClientOptions) {
  async function completeJson<T>(userPrompt: string, feature: AiUsageFeature): Promise<T> {
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is required");
    }

    const startedAt = Date.now();
    let usage: DeepseekChatResponse["usage"] | undefined;
    const telemetryFeature = telemetry?.feature ?? feature;

    function emitTelemetry(status: "success" | "error", errorMessage?: string) {
      if (!telemetry) return;

      const promptTokens = usage?.prompt_tokens ?? 0;
      const completionTokens = usage?.completion_tokens ?? 0;
      const eventInput = {
        feature: telemetryFeature,
        model,
        status,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - startedAt,
        ...(errorMessage ? { errorMessage } : {})
      };
      const event = createAiUsageEvent(eventInput, {
        now: telemetry.now?.(),
        pricing: telemetry.pricing
      });

      if (telemetry.record) {
        telemetry.record(event);
        return;
      }

      recordAiUsageEvent(eventInput, {
        now: new Date(event.createdAt),
        pricing: telemetry.pricing
      });
    }

    const messages: DeepseekMessage[] = [
      { role: "system", content: DEEPSEEK_SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];
    const abortController = new AbortController();
    const timeout = globalThis.setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await fetcher(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        signal: abortController.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.45,
          max_tokens: 900,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`Deepseek request failed with ${response.status}`);
      }

      const payload = (await response.json()) as DeepseekChatResponse;
      usage = payload.usage;
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Deepseek response is empty");
      }

      const parsed = parseJson<T>(content);
      emitTelemetry("success");

      return parsed;
    } catch (error) {
      emitTelemetry("error", error instanceof Error ? error.message : "Deepseek request failed");
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  return {
    generateStory: async (input: StoryPromptInput) => normalizeStory(await completeJson<DailyStory>(createStoryPrompt(input), "story")),
    generateExample: async (input: ExamplePromptInput) => normalizeExample(await completeJson<WordExample>(createExamplePrompt(input), "example")),
    generateMemoryMap: async (input: MemoryMapPromptInput) => {
      const generated = await completeJson<{ related?: Word["related"]; rootClue?: string; memoryTip?: string }>(createMemoryMapPrompt(input), "memory-map");
      return mergeMemoryMap(input.word, generated);
    }
  };
}

export function getDeepseekApiKey() {
  return process.env.DEEPSEEK_API_KEY || "";
}

export function getDeepseekModel() {
  return process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
}

export function shouldUseDeepseek() {
  return Boolean(getDeepseekApiKey());
}

export const fallbackDailyStory = DAILY_STORY;

function normalizeContextText(value: string | null, fallback: string) {
  const normalized = (value ?? "").trim().replace(/[<>]/g, "").slice(0, 24);
  return normalized || fallback;
}
