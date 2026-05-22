export type AiUsageFeature = "story" | "example" | "memory-map" | "ocr";

export type AiUsageStatus = "success" | "error" | "fallback";

export type AiUsagePricing = {
  inputCnyPerMillionTokens: number;
  outputCnyPerMillionTokens: number;
};

export type AiUsageEventInput = {
  feature: AiUsageFeature;
  model: string;
  status: AiUsageStatus;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  errorMessage?: string;
};

export type AiUsageEvent = AiUsageEventInput & {
  id: string;
  totalTokens: number;
  costCny: number;
  createdAt: string;
};

export type AiUsageSummary = {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostCny: number;
  averageLatencyMs: number;
  failureRate: number;
  budgetCny: number;
  budgetUsedPercent: number;
};

export type AiUsageRecordOptions = {
  now?: Date;
  pricing?: AiUsagePricing;
};

export type AiUsageSummaryOptions = {
  budgetCny?: number;
};

const MAX_AI_USAGE_EVENTS = 500;
const DEFAULT_DAILY_BUDGET_CNY = 670;
let aiUsageEvents: AiUsageEvent[] = [];
let aiUsageCounter = 0;

export function createAiUsageEvent(input: AiUsageEventInput, options: AiUsageRecordOptions = {}): AiUsageEvent {
  const now = options.now ?? new Date();
  const pricing = options.pricing ?? getAiUsagePricing();
  const totalTokens = normalizeTokenCount(input.promptTokens) + normalizeTokenCount(input.completionTokens);
  const costCny = roundMetric((normalizeTokenCount(input.promptTokens) / 1_000_000) * pricing.inputCnyPerMillionTokens + (normalizeTokenCount(input.completionTokens) / 1_000_000) * pricing.outputCnyPerMillionTokens);

  aiUsageCounter += 1;

  return {
    ...input,
    promptTokens: normalizeTokenCount(input.promptTokens),
    completionTokens: normalizeTokenCount(input.completionTokens),
    latencyMs: Math.max(0, Math.round(input.latencyMs)),
    id: `ai-usage-${now.getTime()}-${aiUsageCounter}`,
    totalTokens,
    costCny,
    createdAt: now.toISOString()
  };
}

export function recordAiUsageEvent(input: AiUsageEventInput, options: AiUsageRecordOptions = {}) {
  const event = createAiUsageEvent(input, options);
  aiUsageEvents = [event, ...aiUsageEvents].slice(0, MAX_AI_USAGE_EVENTS);

  return event;
}

export function listAiUsageEvents() {
  return aiUsageEvents;
}

export function getAiUsageSummary(options: AiUsageSummaryOptions = {}): AiUsageSummary {
  const totalCalls = aiUsageEvents.length;
  const failedCalls = aiUsageEvents.filter((event) => event.status === "error").length;
  const successfulCalls = aiUsageEvents.filter((event) => event.status === "success").length;
  const promptTokens = aiUsageEvents.reduce((sum, event) => sum + event.promptTokens, 0);
  const completionTokens = aiUsageEvents.reduce((sum, event) => sum + event.completionTokens, 0);
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostCny = roundMetric(aiUsageEvents.reduce((sum, event) => sum + event.costCny, 0));
  const averageLatencyMs = totalCalls ? Math.round(aiUsageEvents.reduce((sum, event) => sum + event.latencyMs, 0) / totalCalls) : 0;
  const failureRate = totalCalls ? roundMetric((failedCalls / totalCalls) * 100) : 0;
  const budgetCny = options.budgetCny ?? getAiUsageBudgetCny();
  const budgetUsedPercent = budgetCny > 0 ? roundMetric((estimatedCostCny / budgetCny) * 100) : 0;

  return {
    totalCalls,
    successfulCalls,
    failedCalls,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostCny,
    averageLatencyMs,
    failureRate,
    budgetCny,
    budgetUsedPercent
  };
}

export function resetAiUsageEventsForTests() {
  aiUsageEvents = [];
  aiUsageCounter = 0;
}

function getAiUsagePricing(): AiUsagePricing {
  return {
    inputCnyPerMillionTokens: normalizePrice(process.env.DEEPSEEK_INPUT_PRICE_CNY_PER_M_TOKENS, 1),
    outputCnyPerMillionTokens: normalizePrice(process.env.DEEPSEEK_OUTPUT_PRICE_CNY_PER_M_TOKENS, 2)
  };
}

function getAiUsageBudgetCny() {
  return normalizePrice(process.env.DEEPSEEK_DAILY_BUDGET_CNY, DEFAULT_DAILY_BUDGET_CNY);
}

function normalizeTokenCount(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function normalizePrice(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function roundMetric(value: number) {
  return Number(value.toFixed(6));
}
