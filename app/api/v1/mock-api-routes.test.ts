import { afterEach, describe, expect, it } from "vitest";
import { GET as getStory } from "./ai/story/today/route";
import { GET as getExample } from "./ai/example/[wordId]/route";
import { GET as getMemoryMap } from "./ai/memory-map/[wordId]/route";
import { POST as postPhoneLogin } from "./auth/phone/route";
import { POST as postPhoneCode } from "./auth/phone/code/route";
import { POST as postLogout } from "./auth/logout/route";
import { GET as getAuthSession } from "./auth/session/route";
import { POST as postWechatLogin } from "./auth/wechat/route";
import { POST as postAnswer } from "./answers/route";
import { GET as getPlans } from "./billing/plans/route";
import { GET as getMe } from "./me/route";
import { GET as getMistakes } from "./mistakes/route";
import { POST as postOcrPhoto } from "./ocr/photo/route";
import { GET as getParentReport } from "./parent/report/route";
import { GET as getTodayPlan } from "./plan/today/route";
import { GET as getReviewQueue } from "./review/queue/route";
import { GET as getWord } from "./words/[wordId]/route";
import { GET as getWordbooks } from "./wordbooks/route";
import { GET as getWordbookWords } from "./wordbooks/[bookId]/words/route";
import { resetPhoneCodeStoreForTests } from "@/lib/auth-server";
import { resetLearningRecordStoreForTests } from "@/lib/learning-records";

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

async function loginPhoneForTest(phone = "13800138000") {
  await postPhoneCode(
    request("/api/v1/auth/phone/code", {
      method: "POST",
      body: JSON.stringify({ phone })
    })
  );
  const response = await postPhoneLogin(
    request("/api/v1/auth/phone", {
      method: "POST",
      body: JSON.stringify({ phone, code: "123456" })
    })
  );

  return readJson<{ token: string }>(response);
}

describe("mock REST API routes", () => {
  afterEach(async () => {
    resetPhoneCodeStoreForTests();
    await resetLearningRecordStoreForTests();
  });

  it("serves user, plan, review, billing, parent, OCR and AI resources", async () => {
    await expect(readJson<{ name: string; streak: number }>(await getMe(request("/api/v1/me")))).resolves.toMatchObject({ name: "小敏", streak: 28 });
    await expect(readJson<{ progress: { todayDone: number } }>(await getTodayPlan())).resolves.toMatchObject({
      progress: { todayDone: 12 }
    });
    await expect(readJson<unknown[]>(await getReviewQueue(request("/api/v1/review/queue")))).resolves.toHaveLength(6);
    await expect(readJson<unknown[]>(await getPlans())).resolves.toHaveLength(3);
    await expect(readJson<{ childName: string }>(await getParentReport())).resolves.toMatchObject({ childName: "小敏" });
    await expect(readJson<{ title: string }>(await postOcrPhoto())).resolves.toMatchObject({ title: "Lesson 5 · The Bookworm" });
    await expect(readJson<{ title: string }>(await getStory(request("/api/v1/ai/story/today")))).resolves.toMatchObject({ title: "The Persistent Bookworm" });
    await expect(readJson<{ active: { id: string } }>(await getWordbooks(request("/api/v1/wordbooks?active=toefl")))).resolves.toMatchObject({
      active: { id: "toefl" }
    });
  });

  it("serves dynamic word and AI resources with not-found errors", async () => {
    await expect(readJson<{ word: string }>(await getWord(request("/api/v1/words/w3"), { params: { wordId: "w3" } }))).resolves.toMatchObject({
      word: "achieve"
    });
    await expect(readJson<{ word: string }>(await getWord(request("/api/v1/words/wb-hypothesis"), { params: { wordId: "wb-hypothesis" } }))).resolves.toMatchObject({
      word: "hypothesis"
    });
    await expect(readJson<{ en: string }>(await getExample(request("/api/v1/ai/example/w1"), { params: { wordId: "w1" } }))).resolves.toMatchObject({
      en: expect.stringContaining("persist")
    });
    await expect(readJson<{ word: { id: string } }>(await getMemoryMap(request("/api/v1/ai/memory-map/w1"), { params: { wordId: "w1" } }))).resolves.toMatchObject({
      word: { id: "w1" }
    });
    await expect(
      readJson<{ word: { word: string } }>(await getMemoryMap(request("/api/v1/ai/memory-map/wb-hypothesis"), { params: { wordId: "wb-hypothesis" } }))
    ).resolves.toMatchObject({
      word: { word: "hypothesis" }
    });
    await expect(readJson<Array<{ word: string }>>(await getWordbookWords(request("/api/v1/wordbooks/ielts/words"), { params: { bookId: "ielts" } }))).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ word: "sustainable" })])
    );

    const missing = await getWord(request("/api/v1/words/missing"), { params: { wordId: "missing" } });
    await expect(readJson<{ code: string; message: string }>(missing)).resolves.toMatchObject({ code: "WORD_NOT_FOUND" });
    expect(missing.status).toBe(404);
  });

  it("authenticates phone and WeChat login payloads", async () => {
    const code = await postPhoneCode(
      request("/api/v1/auth/phone/code", {
        method: "POST",
        body: JSON.stringify({ phone: "13800138000" })
      })
    );
    await expect(readJson<{ ok: true; devCode?: string }>(code)).resolves.toMatchObject({ ok: true, devCode: "123456" });

    const phone = await postPhoneLogin(
      request("/api/v1/auth/phone", {
        method: "POST",
        body: JSON.stringify({ phone: "13800138000", code: "123456" })
      })
    );
    const phoneBody = await readJson<{ method: string; token: string }>(phone);
    expect(phoneBody).toMatchObject({ method: "phone" });
    expect(phone.headers.get("set-cookie")).toContain("aishang_auth=");

    const me = await getMe(
      request("/api/v1/me", {
        headers: { authorization: `Bearer ${phoneBody.token}` }
      })
    );
    await expect(readJson<{ phone: string }>(me)).resolves.toMatchObject({ phone: "13800138000" });

    const wechat = await postWechatLogin(
      request("/api/v1/auth/wechat", {
        method: "POST",
        body: JSON.stringify({ code: "wx-login-code" })
      })
    );
    await expect(readJson<{ method: string }>(wechat)).resolves.toMatchObject({ method: "wechat" });
  });

  it("rejects invalid /me session tokens", async () => {
    const response = await getMe(
      request("/api/v1/me", {
        headers: { authorization: "Bearer invalid-token" }
      })
    );

    await expect(readJson<{ code: string }>(response)).resolves.toMatchObject({ code: "INVALID_AUTH_TOKEN" });
    expect(response.status).toBe(401);
  });

  it("clears the auth cookie on logout", async () => {
    const response = await postLogout(request("/api/v1/auth/logout", { method: "POST" }));

    await expect(readJson<{ ok: true }>(response)).resolves.toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain("aishang_auth=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("restores an authenticated session from the http-only auth cookie", async () => {
    await postPhoneCode(
      request("/api/v1/auth/phone/code", {
        method: "POST",
        body: JSON.stringify({ phone: "13800138000" })
      })
    );
    const phone = await postPhoneLogin(
      request("/api/v1/auth/phone", {
        method: "POST",
        body: JSON.stringify({ phone: "13800138000", code: "123456" })
      })
    );
    const cookie = phone.headers.get("set-cookie")?.split(";")[0] ?? "";

    const restored = await getAuthSession(request("/api/v1/auth/session", { headers: { cookie } }));
    await expect(readJson<{ token: string; method: string; user: { phone: string } }>(restored)).resolves.toMatchObject({
      token: "cookie-session",
      method: "phone",
      user: { phone: "13800138000" }
    });

    const missing = await getAuthSession(request("/api/v1/auth/session"));
    await expect(readJson<{ code: string }>(missing)).resolves.toMatchObject({ code: "AUTH_SESSION_REQUIRED" });
    expect(missing.status).toBe(401);
  });

  it("filters and sorts the mistake notebook via query params", async () => {
    const response = await getMistakes(request("/api/v1/mistakes?filter=frequent&sort=mastery"));
    const mistakes = await readJson<Array<{ wrongTimes: number; mastery: number }>>(response);

    expect(response.status).toBe(200);
    expect(mistakes).toHaveLength(3);
    expect(mistakes.map((item) => item.mastery)).toEqual([0.15, 0.35, 0.45]);
  });

  it("validates answer submissions before returning learning rewards", async () => {
    const valid = await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        body: JSON.stringify({ wordId: "w1", mode: "mc", correct: true, ms: 900 })
      })
    );
    await expect(readJson<{ xpAwarded: number; heartsLost: number }>(valid)).resolves.toMatchObject({ xpAwarded: 12, heartsLost: 0 });

    const invalid = await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        body: JSON.stringify({ wordId: "w1", mode: "unknown", correct: true, ms: 900 })
      })
    );
    await expect(readJson<{ code: string }>(invalid)).resolves.toMatchObject({ code: "INVALID_ANSWER_PAYLOAD" });
    expect(invalid.status).toBe(400);
  });

  it("persists authenticated answer outcomes into user progress and mistakes", async () => {
    const { token } = await loginPhoneForTest("13900139000");
    const authHeaders = { authorization: `Bearer ${token}` };
    const before = await readJson<{ xp: number; hearts: number }>(await getMe(request("/api/v1/me", { headers: authHeaders })));

    const firstWrong = await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ wordId: "w3", mode: "spell", correct: false, ms: 1600 })
      })
    );
    await expect(readJson<{ xpAwarded: number; heartsLost: number }>(firstWrong)).resolves.toMatchObject({ xpAwarded: 0, heartsLost: 1 });

    await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ wordId: "w3", mode: "spell", correct: false, ms: 1700 })
      })
    );
    const correct = await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ wordId: "w3", mode: "spell", correct: true, ms: 900 })
      })
    );
    await expect(readJson<{ xpAwarded: number; heartsLost: number }>(correct)).resolves.toMatchObject({ xpAwarded: 12, heartsLost: 0 });

    const after = await readJson<{ xp: number; hearts: number }>(await getMe(request("/api/v1/me", { headers: authHeaders })));
    expect(after.xp).toBe(before.xp + 12);
    expect(after.hearts).toBe(before.hearts - 2);

    const mistakes = await readJson<Array<{ wordId: string; wrongTimes: number; mode: string }>>(
      await getMistakes(request("/api/v1/mistakes?filter=frequent&sort=frequent", { headers: authHeaders }))
    );
    expect(mistakes).toEqual([
      expect.objectContaining({
        wordId: "w3",
        wrongTimes: 2,
        mode: "spell"
      })
    ]);

    const review = await readJson<Array<{ wordId: string; due: string; state: string; mastery: number }>>(
      await getReviewQueue(request("/api/v1/review/queue", { headers: authHeaders }))
    );
    expect(review[0]).toMatchObject({ wordId: "w3", due: "今天", state: "weak", mastery: 0.5 });
  });

  it("rejects invalid auth tokens on answer submissions", async () => {
    const response = await postAnswer(
      request("/api/v1/answers", {
        method: "POST",
        headers: { authorization: "Bearer invalid-token" },
        body: JSON.stringify({ wordId: "w1", mode: "mc", correct: true, ms: 900 })
      })
    );

    await expect(readJson<{ code: string }>(response)).resolves.toMatchObject({ code: "INVALID_AUTH_TOKEN" });
    expect(response.status).toBe(401);
  });
});
