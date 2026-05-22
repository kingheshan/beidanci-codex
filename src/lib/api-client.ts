import type { MemoryMapModel } from "./memory-map-data";
import { ApiError, type ApiErrorOptions } from "./api-error";
import { getExperienceConfig, type ExperienceConfig } from "./experience-config";
import { getLearningPlanConfig, type LearningPlanConfig } from "./learning-plan-config";
import { getLearningWorkflowConfig, type LearningWorkflowConfig } from "./learning-workflow-config";
import { filterMistakes, type MistakeFilterId, type MistakeItem } from "./mistakes-data";
import { getMockOcrResult, type OcrResult } from "./ocr-data";
import { getOnboardingConfig, type OnboardingConfig } from "./onboarding-config";
import { PARENT_REPORT, type ParentReport } from "./parent-report-data";
import { getProductConfig, type ProductConfig } from "./product-config";
import { findProPlan, PRO_PLANS, type ProCheckoutInput, type ProCheckoutResult, type ProPlan, type ProSubscription } from "./pro-data";
import { REVIEW_QUEUE, type ReviewQueueItem } from "./review-data";
import { DAILY_STORY, type DailyStory } from "./story-data";
import { getStudyConfig, LESSONS, STUDY_MODES, USER_PROGRESS, type Lesson, type StudyConfig, type StudyMode, type StudyModeId } from "./study-config";
import type { Word, WordExample } from "./words";
import {
  COOKIE_SESSION_TOKEN,
  loginWithPhoneCode,
  loginWithWechatCode,
  validateChineseMobile,
  type AuthSession,
  type PhoneCodeIssueInput,
  type PhoneCodeIssueResult,
  type PhoneLoginInput,
  type WechatLoginInput
} from "./auth";
import { getAuthConfig, type AuthConfig } from "./auth-config";
import type { Wordbook, WordbookId } from "./wordbooks";

export type ApiUser = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  bookName: string;
  streak: number;
  gems: number;
  hearts: number;
  xp: number;
  dailyWords: number;
  isPro: boolean;
};

export type TodayPlan = {
  progress: typeof USER_PROGRESS;
  lessons: Lesson[];
  modes: StudyMode[];
};

export type WordbookCatalog = {
  active: Wordbook;
  books: Wordbook[];
};

export type MistakeSort = "recent" | "frequent" | "mastery";

export type GetMistakesInput = {
  filter?: MistakeFilterId;
  sort?: MistakeSort;
};

export type DailyStoryInput = {
  wordbookId?: WordbookId;
  grade?: string;
  interests?: string[];
  limit?: number;
};

export type SubmitAnswerInput = {
  wordId: string;
  mode: StudyModeId;
  correct: boolean;
  ms: number;
};

export type SubmitAnswerResult = {
  ok: true;
  xpAwarded: number;
  heartsLost: number;
  newMastery: number;
};

export type LogoutResult = {
  ok: true;
};

export type ApiClient = {
  getMe: () => Promise<ApiUser>;
  getProductConfig: () => Promise<ProductConfig>;
  getOnboardingConfig: () => Promise<OnboardingConfig>;
  getStudyConfig: () => Promise<StudyConfig>;
  getLearningPlanConfig: () => Promise<LearningPlanConfig>;
  getLearningWorkflowConfig: () => Promise<LearningWorkflowConfig>;
  getExperienceConfig: () => Promise<ExperienceConfig>;
  getAuthConfig: () => Promise<AuthConfig>;
  getTodayPlan: () => Promise<TodayPlan>;
  getWord: (wordId: string) => Promise<Word>;
  getReviewQueue: () => Promise<ReviewQueueItem[]>;
  getMistakes: (input?: GetMistakesInput) => Promise<MistakeItem[]>;
  ocrPhoto: (photo?: Blob | File | FormData) => Promise<OcrResult>;
  getParentReport: () => Promise<ParentReport>;
  submitAnswer: (input: SubmitAnswerInput) => Promise<SubmitAnswerResult>;
  getPlans: () => Promise<ProPlan[]>;
  createProCheckout: (input: ProCheckoutInput) => Promise<ProCheckoutResult>;
  getProSubscription: () => Promise<ProSubscription>;
  getDailyStory: (input?: DailyStoryInput) => Promise<DailyStory>;
  getExample: (wordId: string) => Promise<WordExample>;
  getMemoryMap: (wordId: string) => Promise<MemoryMapModel>;
  getWordbooks: (activeId?: string) => Promise<WordbookCatalog>;
  getWordbookWords: (wordbookId: WordbookId) => Promise<Word[]>;
  requestPhoneCode: (input: PhoneCodeIssueInput) => Promise<PhoneCodeIssueResult>;
  loginWithPhone: (input: PhoneLoginInput) => Promise<AuthSession>;
  loginWithWechat: (input: WechatLoginInput) => Promise<AuthSession>;
  getAuthSession: () => Promise<AuthSession>;
  logout: () => Promise<LogoutResult>;
};

export { ApiError, type ApiErrorOptions };

export type MockApiClientOptions = {
  delayMs?: number;
  failRate?: number;
  random?: () => number;
};

export type FetchApiClientOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
};

const DEFAULT_USER: ApiUser = {
  id: "u_xiaomin",
  name: USER_PROGRESS.name,
  avatar: "小",
  grade: "初三",
  bookName: USER_PROGRESS.bookName,
  streak: USER_PROGRESS.streak,
  gems: USER_PROGRESS.gems,
  hearts: 5,
  xp: 1280,
  dailyWords: USER_PROGRESS.todayTotal,
  isPro: false
};

function delay(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function resolveMock<T>(options: Required<MockApiClientOptions>, resolveValue: () => T | Promise<T>): Promise<T> {
  if (options.delayMs > 0) {
    await delay(options.delayMs);
  }

  if (options.failRate > 0 && options.random() < options.failRate) {
    throw new ApiError("Mock network failure", { status: 503, code: "MOCK_NETWORK" });
  }

  return resolveValue();
}

function sortMistakes(items: MistakeItem[], sort: MistakeSort) {
  return [...items].sort((a, b) => {
    if (sort === "frequent") return b.wrongTimes - a.wrongTimes;
    if (sort === "mastery") return a.mastery - b.mastery;
    return b.lastWrong.localeCompare(a.lastWrong);
  });
}

function answerResult(correct: boolean): SubmitAnswerResult {
  return {
    ok: true,
    xpAwarded: correct ? 12 : 0,
    heartsLost: correct ? 0 : 1,
    newMastery: correct ? 0.74 : 0.42
  };
}

function cookieBackedSession(session: AuthSession): AuthSession {
  return {
    ...session,
    token: COOKIE_SESSION_TOKEN
  };
}

function demoProCheckout(input: ProCheckoutInput): ProCheckoutResult {
  const plan = findProPlan(input.planId);
  const now = new Date().toISOString();
  const orderId = `bill_mock_${plan.id}`;

  return {
    order: {
      id: orderId,
      userId: "u_xiaomin",
      customerName: "小敏",
      planId: plan.id,
      planName: plan.name,
      amountCny: plan.price,
      channel: input.channel ?? "demo",
      status: "paid",
      createdAt: now,
      paidAt: now
    },
    subscription: {
      isPro: true,
      planId: plan.id,
      startedAt: now,
      expiresAt: plan.id === "lifetime" ? null : now,
      sourceOrderId: orderId
    },
    payment: {
      provider: "demo",
      status: "paid",
      message: "演示环境已自动完成支付"
    }
  };
}

export function createMockApiClient(options: MockApiClientOptions = {}): ApiClient {
  const config: Required<MockApiClientOptions> = {
    delayMs: options.delayMs ?? 180,
    failRate: options.failRate ?? 0,
    random: options.random ?? Math.random
  };

  return {
    getMe: () => resolveMock(config, () => DEFAULT_USER),
    getProductConfig: () => resolveMock(config, () => getProductConfig()),
    getOnboardingConfig: () => resolveMock(config, () => getOnboardingConfig()),
    getStudyConfig: () => resolveMock(config, () => getStudyConfig()),
    getLearningPlanConfig: () => resolveMock(config, () => getLearningPlanConfig()),
    getLearningWorkflowConfig: () => resolveMock(config, () => getLearningWorkflowConfig()),
    getExperienceConfig: () => resolveMock(config, () => getExperienceConfig()),
    getAuthConfig: () => resolveMock(config, () => getAuthConfig()),
    getTodayPlan: () =>
      resolveMock(config, () => ({
        progress: USER_PROGRESS,
        lessons: LESSONS,
        modes: STUDY_MODES
      })),
    getWord: (wordId) =>
      resolveMock(config, async () => {
        const { findAnyWord } = await import("./word-search");
        const word = findAnyWord(wordId);
        if (!word) {
          throw new ApiError(`Word ${wordId} was not found`, { status: 404, code: "WORD_NOT_FOUND" });
        }
        return word;
      }),
    getReviewQueue: () => resolveMock(config, () => REVIEW_QUEUE),
    getMistakes: (input = {}) =>
      resolveMock(config, () => {
        const filtered = filterMistakes(input.filter ?? "all");
        return sortMistakes(filtered, input.sort ?? "recent");
      }),
    ocrPhoto: () => resolveMock(config, () => getMockOcrResult()),
    getParentReport: () => resolveMock(config, () => PARENT_REPORT),
    submitAnswer: (input) => resolveMock(config, () => answerResult(input.correct)),
    getPlans: () => resolveMock(config, () => PRO_PLANS),
    createProCheckout: (input) => resolveMock(config, () => demoProCheckout(input)),
    getProSubscription: () =>
      resolveMock(config, () => ({
        isPro: false,
        planId: null,
        startedAt: null,
        expiresAt: null,
        sourceOrderId: null
      })),
    getDailyStory: () => resolveMock(config, () => DAILY_STORY),
    getExample: (wordId) =>
      resolveMock(config, async () => {
        const { findAnyWord } = await import("./word-search");
        const word = findAnyWord(wordId);
        if (!word) {
          throw new ApiError(`Word ${wordId} was not found`, { status: 404, code: "WORD_NOT_FOUND" });
        }
        return word.examples[1] ?? word.examples[0];
      }),
    getMemoryMap: (wordId) =>
      resolveMock(config, async () => {
        const { getMemoryMap } = await import("./memory-map-data");
        return getMemoryMap(wordId);
      }),
    getWordbooks: (activeId) =>
      resolveMock(config, async () => {
        const { getActiveWordbook, listWordbooks } = await import("./wordbooks");
        return { active: getActiveWordbook(activeId), books: listWordbooks() };
      }),
    getWordbookWords: (wordbookId) =>
      resolveMock(config, async () => {
        const { getWordbookWords } = await import("./wordbooks");
        return getWordbookWords(wordbookId);
      }),
    requestPhoneCode: (input) =>
      resolveMock(config, () => {
        if (!validateChineseMobile(input.phone)) {
          throw new ApiError("请输入正确的手机号", { status: 400, code: "INVALID_PHONE" });
        }

        return {
          ok: true,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          cooldownSeconds: 60,
          devCode: "123456"
        };
      }),
    loginWithPhone: async (input) => {
      await resolveMock(config, () => null);
      return loginWithPhoneCode(input);
    },
    loginWithWechat: async (input) => {
      await resolveMock(config, () => null);
      return loginWithWechatCode(input);
    },
    getAuthSession: () =>
      resolveMock(config, () => ({
        token: COOKIE_SESSION_TOKEN,
        method: "phone",
        user: {
          id: "u_xiaomin",
          name: "小敏",
          avatar: "小",
          phone: "13800138000"
        }
      })),
    logout: () => resolveMock(config, () => ({ ok: true }))
  };
}

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return (await response.json()) as unknown;
}

export function createFetchApiClient({ baseUrl = "/api/v1", fetcher = fetch }: FetchApiClientOptions = {}): ApiClient {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const method = init.method ?? "GET";
    const bodyIsJson = typeof init.body === "string";
    const response = await fetcher(buildUrl(baseUrl, path), {
      ...init,
      method,
      credentials: init.credentials ?? "same-origin",
      headers: {
        Accept: "application/json",
        ...(bodyIsJson ? { "Content-Type": "application/json" } : {}),
        ...init.headers
      }
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new ApiError(getMessage(payload, `Request failed with ${response.status}`), { status: response.status });
    }

    return payload as T;
  }

  function getMistakesPath(input: GetMistakesInput = {}) {
    const params = new URLSearchParams();
    if (input.filter) params.set("filter", input.filter);
    if (input.sort) params.set("sort", input.sort);
    const query = params.toString();
    return `/mistakes${query ? `?${query}` : ""}`;
  }

  function getDailyStoryPath(input: DailyStoryInput = {}) {
    const params = new URLSearchParams();
    if (input.wordbookId) params.set("wordbookId", input.wordbookId);
    if (input.grade) params.set("grade", input.grade);
    if (input.interests?.length) params.set("interests", input.interests.join(","));
    if (input.limit) params.set("limit", String(input.limit));
    const query = params.toString();
    return `/ai/story/today${query ? `?${query}` : ""}`;
  }

  return {
    getMe: () => request<ApiUser>("/me"),
    getProductConfig: () => request<ProductConfig>("/config"),
    getOnboardingConfig: () => request<OnboardingConfig>("/config/onboarding"),
    getStudyConfig: () => request<StudyConfig>("/config/study"),
    getLearningPlanConfig: () => request<LearningPlanConfig>("/config/learning-plan"),
    getLearningWorkflowConfig: () => request<LearningWorkflowConfig>("/config/workflow"),
    getExperienceConfig: () => request<ExperienceConfig>("/config/experience"),
    getAuthConfig: () => request<AuthConfig>("/config/auth"),
    getTodayPlan: () => request<TodayPlan>("/plan/today"),
    getWord: (wordId) => request<Word>(`/words/${encodeURIComponent(wordId)}`),
    getReviewQueue: () => request<ReviewQueueItem[]>("/review/queue"),
    getMistakes: (input) => request<MistakeItem[]>(getMistakesPath(input)),
    ocrPhoto: (photo) => request<OcrResult>("/ocr/photo", { method: "POST", body: photo instanceof FormData ? photo : undefined }),
    getParentReport: () => request<ParentReport>("/parent/report"),
    submitAnswer: (input) => request<SubmitAnswerResult>("/answers", { method: "POST", body: JSON.stringify(input) }),
    getPlans: () => request<ProPlan[]>("/billing/plans"),
    createProCheckout: (input) => request<ProCheckoutResult>("/billing/checkout", { method: "POST", body: JSON.stringify(input) }),
    getProSubscription: () => request<ProSubscription>("/billing/subscription"),
    getDailyStory: (input) => request<DailyStory>(getDailyStoryPath(input)),
    getExample: (wordId) => request<WordExample>(`/ai/example/${encodeURIComponent(wordId)}`),
    getMemoryMap: (wordId) => request<MemoryMapModel>(`/ai/memory-map/${encodeURIComponent(wordId)}`),
    getWordbooks: (activeId) => request<WordbookCatalog>(`/wordbooks${activeId ? `?active=${encodeURIComponent(activeId)}` : ""}`),
    getWordbookWords: (wordbookId) => request<Word[]>(`/wordbooks/${encodeURIComponent(wordbookId)}/words`),
    requestPhoneCode: (input) => request<PhoneCodeIssueResult>("/auth/phone/code", { method: "POST", body: JSON.stringify(input) }),
    loginWithPhone: async (input) => cookieBackedSession(await request<AuthSession>("/auth/phone", { method: "POST", body: JSON.stringify(input) })),
    loginWithWechat: async (input) => cookieBackedSession(await request<AuthSession>("/auth/wechat", { method: "POST", body: JSON.stringify(input) })),
    getAuthSession: async () => cookieBackedSession(await request<AuthSession>("/auth/session")),
    logout: () => request<LogoutResult>("/auth/logout", { method: "POST" })
  };
}

export const mockApiClient = createMockApiClient();
