import { describe, expect, it, vi } from "vitest";
import { createFetchApiClient, createMockApiClient, ApiError } from "./api-client";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init
  });
}

describe("api client adapters", () => {
  it("serves the prototype data through the mock adapter", async () => {
    const client = createMockApiClient({ delayMs: 0, random: () => 0.9 });

    await expect(client.getMe()).resolves.toMatchObject({ name: "小敏", streak: 28 });
    await expect(client.getProductConfig()).resolves.toMatchObject({ brand: { name: "爱上背单词" } });
    await expect(client.getOnboardingConfig()).resolves.toMatchObject({ defaults: { wordbookId: "zhongkao-1600" } });
    await expect(client.getStudyConfig()).resolves.toMatchObject({ hub: { recommendedModeId: "mc" } });
    await expect(client.getLearningPlanConfig()).resolves.toMatchObject({ settingsUi: { planTitle: "计划控制台" } });
    await expect(client.getLearningWorkflowConfig()).resolves.toMatchObject({ result: { primaryCta: "继续" } });
    await expect(client.getExperienceConfig()).resolves.toMatchObject({ dictionary: { heroTitle: "我的词书" } });
    await expect(client.getAuthConfig()).resolves.toMatchObject({ login: { phoneLoginCta: "手机号登录" } });
    await expect(client.getTodayPlan()).resolves.toMatchObject({ progress: expect.objectContaining({ todayDone: 12 }) });
    await expect(client.getWord("w3")).resolves.toMatchObject({ word: "achieve" });
    await expect(client.getWord("wb-hypothesis")).resolves.toMatchObject({ word: "hypothesis", cn: "假设" });
    await expect(client.getReviewQueue()).resolves.toHaveLength(6);
    await expect(client.getMistakes({ filter: "frequent", sort: "frequent" })).resolves.toHaveLength(3);
    await expect(client.ocrPhoto()).resolves.toMatchObject({ title: "Lesson 5 · The Bookworm" });
    await expect(client.getParentReport()).resolves.toMatchObject({ childName: "小敏" });
    await expect(client.getPlans()).resolves.toHaveLength(3);
    await expect(client.getDailyStory()).resolves.toMatchObject({ title: "The Persistent Bookworm" });
    await expect(client.getExample("w1")).resolves.toMatchObject({ en: expect.stringContaining("persist") });
    await expect(client.getMemoryMap("w1")).resolves.toMatchObject({ word: expect.objectContaining({ id: "w1" }) });
    await expect(client.getMemoryMap("wb-hypothesis")).resolves.toMatchObject({ word: expect.objectContaining({ word: "hypothesis" }) });
    await expect(client.getMistakeCoach({ wordId: "w1", mode: "mc", ms: 1200 })).resolves.toMatchObject({
      title: "释义选择错因教练",
      source: "fallback"
    });
    await expect(client.getWordbooks("ielts")).resolves.toMatchObject({ active: expect.objectContaining({ id: "ielts" }) });
    await expect(client.getWordbookWords("toefl")).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ word: "hypothesis" })]));
    await expect(client.requestPhoneCode({ phone: "13800138000" })).resolves.toMatchObject({ ok: true, devCode: "123456" });
    await expect(client.loginWithPhone({ phone: "13800138000", code: "123456" })).resolves.toMatchObject({ method: "phone" });
    await expect(client.loginWithWechat({ code: "wx-code" })).resolves.toMatchObject({ method: "wechat" });
    await expect(client.getAuthSession()).resolves.toMatchObject({ token: "cookie-session", method: "phone" });
    await expect(client.logout()).resolves.toEqual({ ok: true });
  }, 15_000);

  it("returns typed learning outcome data for submitted answers", async () => {
    const client = createMockApiClient({ delayMs: 0 });

    await expect(client.submitAnswer({ wordId: "w1", mode: "mc", correct: true, ms: 1200 })).resolves.toEqual({
      ok: true,
      xpAwarded: 12,
      heartsLost: 0,
      newMastery: 0.74
    });
    await expect(client.submitAnswer({ wordId: "w1", mode: "mc", correct: false, ms: 1200 })).resolves.toMatchObject({
      xpAwarded: 0,
      heartsLost: 1,
      coach: expect.objectContaining({
        title: "释义选择错因教练",
        source: "fallback"
      })
    });
  });

  it("normalizes mock failures and not found responses into ApiError", async () => {
    const flaky = createMockApiClient({ delayMs: 0, failRate: 1, random: () => 0 });
    const client = createMockApiClient({ delayMs: 0 });

    await expect(flaky.getMe()).rejects.toBeInstanceOf(ApiError);
    await expect(client.getWord("missing")).rejects.toMatchObject({ status: 404, code: "WORD_NOT_FOUND" });
  });

  it("uses the fetch adapter paths, methods, query params, and JSON body shape", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      if (url.includes("/answers")) return jsonResponse({ ok: true, xpAwarded: 12, heartsLost: 0, newMastery: 0.8 });
      if (url.includes("/ai/mistake-coach")) return jsonResponse({ title: "AI 错因教练", cause: "释义混淆", explanation: "解释", memoryTip: "记法", microDrill: { prompt: "练习", answer: "答案" }, nextAction: "再练一次", tags: ["错因"], source: "ai" });
      if (url.includes("/mistakes")) return jsonResponse([]);
      if (url.includes("/auth/session")) return jsonResponse({ token: "server-token", method: "phone", user: { id: "u", name: "u", avatar: "u" } });
      if (url.includes("/auth/phone/code")) return jsonResponse({ ok: true, expiresAt: "2026-05-21T08:00:00.000Z", cooldownSeconds: 60 });
      if (url.includes("/auth/phone")) return jsonResponse({ token: "t", method: "phone", user: { id: "u", name: "u", avatar: "u" } });
      if (url.includes("/auth/logout")) return jsonResponse({ ok: true });
      if (url.includes("/wordbooks/ielts/words")) return jsonResponse([]);
      return jsonResponse({ ok: true });
    });
    const client = createFetchApiClient({ baseUrl: "https://api.test/v1", fetcher });

    await client.submitAnswer({ wordId: "w1", mode: "spell", correct: true, ms: 640 });
    await client.getMistakeCoach({ wordId: "w1", mode: "spell", ms: 640, grade: "初三", interests: ["sports"] });
    await client.getProductConfig();
    await client.getOnboardingConfig();
    await client.getStudyConfig();
    await client.getLearningPlanConfig();
    await client.getLearningWorkflowConfig();
    await client.getExperienceConfig();
    await client.getAuthConfig();
    await client.getMistakes({ filter: "spell", sort: "mastery" });
    await expect(client.getAuthSession()).resolves.toMatchObject({ token: "cookie-session" });
    await client.requestPhoneCode({ phone: "13800138000" });
    await expect(client.loginWithPhone({ phone: "13800138000", code: "123456" })).resolves.toMatchObject({ token: "cookie-session" });
    await client.logout();
    await client.getWordbookWords("ielts");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/answers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ wordId: "w1", mode: "spell", correct: true, ms: 640 })
      })
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/ai/mistake-coach",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ wordId: "w1", mode: "spell", ms: 640, grade: "初三", interests: ["sports"] })
      })
    );
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/onboarding", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/study", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/learning-plan", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/workflow", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/experience", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/config/auth", expect.objectContaining({ method: "GET" }));
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/mistakes?filter=spell&sort=mastery",
      expect.objectContaining({ method: "GET" })
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/auth/session",
      expect.objectContaining({ method: "GET", credentials: "same-origin" })
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/auth/phone/code",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "13800138000" })
      })
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/v1/auth/phone",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "13800138000", code: "123456" })
      })
    );
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/auth/logout", expect.objectContaining({ method: "POST" }));
    expect(fetcher).toHaveBeenCalledWith("https://api.test/v1/wordbooks/ielts/words", expect.objectContaining({ method: "GET" }));
  });

  it("surfaces server errors from the fetch adapter", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => jsonResponse({ message: "offline" }, { status: 503 }));
    const client = createFetchApiClient({ baseUrl: "/api/v1", fetcher });

    await expect(client.getMe()).rejects.toMatchObject({ status: 503, message: "offline" });
  });
});
