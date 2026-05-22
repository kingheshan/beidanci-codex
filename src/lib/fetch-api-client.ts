import { COOKIE_SESSION_TOKEN, type AuthSession, type PhoneCodeIssueInput, type PhoneCodeIssueResult, type PhoneLoginInput, type WechatLoginInput } from "./auth";
import { ApiError } from "./api-error";
import type {
  ApiClient,
  ApiUser,
  DailyStoryInput,
  FetchApiClientOptions,
  GetMistakesInput,
  LogoutResult,
  SubmitAnswerInput,
  SubmitAnswerResult,
  TodayPlan,
  WordbookCatalog
} from "./api-client";
import type { AuthConfig } from "./auth-config";
import type { ExperienceConfig } from "./experience-config";
import type { LearningPlanConfig } from "./learning-plan-config";
import type { LearningWorkflowConfig } from "./learning-workflow-config";
import type { MemoryMapModel } from "./memory-map-data";
import type { MistakeItem } from "./mistakes-data";
import type { OcrResult } from "./ocr-data";
import type { OnboardingConfig } from "./onboarding-config";
import type { ParentReport } from "./parent-report-data";
import type { ProductConfig } from "./product-config";
import type { ProCheckoutInput, ProCheckoutResult, ProPlan, ProSubscription } from "./pro-data";
import type { ReviewQueueItem } from "./review-data";
import type { DailyStory } from "./story-data";
import type { StudyConfig } from "./study-config";
import type { Word, WordExample } from "./words";
import type { WordbookId } from "./wordbook-catalog";

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

function cookieBackedSession(session: AuthSession): AuthSession {
  return {
    ...session,
    token: COOKIE_SESSION_TOKEN
  };
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
    submitAnswer: (input: SubmitAnswerInput) => request<SubmitAnswerResult>("/answers", { method: "POST", body: JSON.stringify(input) }),
    getPlans: () => request<ProPlan[]>("/billing/plans"),
    createProCheckout: (input: ProCheckoutInput) => request<ProCheckoutResult>("/billing/checkout", { method: "POST", body: JSON.stringify(input) }),
    getProSubscription: () => request<ProSubscription>("/billing/subscription"),
    getDailyStory: (input) => request<DailyStory>(getDailyStoryPath(input)),
    getExample: (wordId) => request<WordExample>(`/ai/example/${encodeURIComponent(wordId)}`),
    getMemoryMap: (wordId) => request<MemoryMapModel>(`/ai/memory-map/${encodeURIComponent(wordId)}`),
    getWordbooks: (activeId) => request<WordbookCatalog>(`/wordbooks${activeId ? `?active=${encodeURIComponent(activeId)}` : ""}`),
    getWordbookWords: (wordbookId: WordbookId) => request<Word[]>(`/wordbooks/${encodeURIComponent(wordbookId)}/words`),
    requestPhoneCode: (input: PhoneCodeIssueInput) => request<PhoneCodeIssueResult>("/auth/phone/code", { method: "POST", body: JSON.stringify(input) }),
    loginWithPhone: async (input: PhoneLoginInput) => cookieBackedSession(await request<AuthSession>("/auth/phone", { method: "POST", body: JSON.stringify(input) })),
    loginWithWechat: async (input: WechatLoginInput) => cookieBackedSession(await request<AuthSession>("/auth/wechat", { method: "POST", body: JSON.stringify(input) })),
    getAuthSession: async () => cookieBackedSession(await request<AuthSession>("/auth/session")),
    logout: () => request<LogoutResult>("/auth/logout", { method: "POST" })
  };
}
