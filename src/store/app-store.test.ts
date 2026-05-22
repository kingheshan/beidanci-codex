import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LEARNING_STATE, DEFAULT_ONBOARDING, useAppStore } from "./app-store";

describe("app store onboarding state", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().resetOnboarding();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetSubscription();
  });

  it("starts with incomplete onboarding defaults", () => {
    expect(useAppStore.getState().onboarding).toEqual(DEFAULT_ONBOARDING);
  });

  it("persists completed onboarding preferences", () => {
    useAppStore.getState().completeOnboarding({
      goal: "gaokao",
      grade: "高一",
      interests: ["sports", "anime"],
      dailyWords: 35,
      wordbookId: "zhongkao-1600"
    });

    expect(useAppStore.getState().onboarding).toEqual({
      completed: true,
      goal: "gaokao",
      grade: "高一",
      interests: ["sports", "anime"],
      dailyWords: 35,
      wordbookId: "zhongkao-1600"
    });

    const raw = localStorage.getItem("aishang-vocab-store");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}").state.onboarding.completed).toBe(true);
  });

  it("awards XP and clamps hearts while recording the latest study result", () => {
    useAppStore.getState().applyAnswerReward(true);
    useAppStore.getState().applyAnswerReward(false);
    useAppStore.getState().applyAnswerReward(false);

    expect(useAppStore.getState().learning).toMatchObject({
      xp: DEFAULT_LEARNING_STATE.xp + 12,
      hearts: DEFAULT_LEARNING_STATE.hearts - 2
    });

    useAppStore.getState().recordStudyResult({
      mode: "mc",
      total: 2,
      correct: 1,
      xpEarned: 12,
      heartsLost: 1,
      results: [
        {
          wordId: "w1",
          word: "persist",
          cn: "坚持",
          correct: true,
          ms: 1200
        }
      ],
      completedAt: "2026-05-19T04:00:00.000Z"
    });

    expect(useAppStore.getState().lastStudyResult).toMatchObject({
      mode: "mc",
      total: 2,
      correct: 1,
      xpEarned: 12
    });
  });

  it("updates and persists study plan preferences", () => {
    useAppStore.getState().updateDailyWords(45);
    useAppStore.getState().selectWordbook("toefl");
    useAppStore.getState().updatePlanSettings({
      reviewReminderOn: false,
      aiExamplesOn: false
    });

    expect(useAppStore.getState().onboarding.dailyWords).toBe(45);
    expect(useAppStore.getState().onboarding.wordbookId).toBe("toefl");
    expect(useAppStore.getState().planSettings).toMatchObject({
      reviewReminderOn: false,
      aiExamplesOn: false
    });

    const raw = localStorage.getItem("aishang-vocab-store");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}").state.onboarding.dailyWords).toBe(45);
    expect(JSON.parse(raw ?? "{}").state.onboarding.wordbookId).toBe("toefl");
    expect(JSON.parse(raw ?? "{}").state.planSettings.reviewReminderOn).toBe(false);
  });

  it("persists auth sessions and logout", () => {
    useAppStore.getState().setAuthSession({
      token: "token",
      method: "phone",
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    });

    expect(useAppStore.getState().auth).toMatchObject({ method: "phone" });
    expect(JSON.parse(localStorage.getItem("aishang-vocab-store") ?? "{}").state.auth.method).toBe("phone");

    useAppStore.getState().logout();
    expect(useAppStore.getState().auth).toBeNull();
  });

  it("activates and persists a PRO subscription", () => {
    expect(useAppStore.getState().subscription.isPro).toBe(false);

    useAppStore.getState().activatePro("yearly", "2026-05-22T12:00:00.000Z", "bill_test");

    expect(useAppStore.getState().subscription).toMatchObject({
      isPro: true,
      planId: "yearly",
      sourceOrderId: "bill_test"
    });
    expect(useAppStore.getState().subscription.startedAt).toBe("2026-05-22T12:00:00.000Z");

    const raw = localStorage.getItem("aishang-vocab-store");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}").state.subscription).toMatchObject({
      isPro: true,
      planId: "yearly",
      sourceOrderId: "bill_test"
    });
  });
});
