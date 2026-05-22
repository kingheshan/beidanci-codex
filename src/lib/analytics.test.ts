import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLocalAnalyticsEvents,
  resetLocalAnalyticsForTests,
  trackActivation,
  trackAppOpen,
  trackProConversion,
  trackReviewRecall,
  trackStudyCompleted
} from "./analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T08:00:00.000Z"));
    resetLocalAnalyticsForTests();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true })))));
  });

  afterEach(() => {
    resetLocalAnalyticsForTests();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("tracks app open once per session and emits retention checkpoints", () => {
    trackAppOpen("/home");
    trackAppOpen("/study");

    expect(getLocalAnalyticsEvents().filter((event) => event.name === "app_open")).toHaveLength(1);

    window.sessionStorage.clear();
    vi.setSystemTime(new Date("2026-05-21T08:00:00.000Z"));
    trackAppOpen("/home");

    window.sessionStorage.clear();
    vi.setSystemTime(new Date("2026-05-27T08:00:00.000Z"));
    trackAppOpen("/home");

    expect(getLocalAnalyticsEvents().map((event) => event.name)).toEqual([
      "app_open",
      "app_open",
      "retention_checkpoint",
      "app_open",
      "retention_checkpoint"
    ]);
    expect(getLocalAnalyticsEvents().filter((event) => event.properties.checkpoint === "D1")).toHaveLength(1);
    expect(getLocalAnalyticsEvents().filter((event) => event.properties.checkpoint === "D7")).toHaveLength(1);
  });

  it("deduplicates activation and records learning funnel metrics", () => {
    const first = trackActivation("onboarding_completed", { wordbookId: "zhongkao-1600" });
    const second = trackActivation("first_study_completed");

    trackStudyCompleted({
      mode: "mc",
      total: 6,
      correct: 5,
      xpEarned: 60,
      heartsLost: 1,
      results: [],
      completedAt: "2026-05-20T08:10:00.000Z"
    });
    trackReviewRecall({ source: "review_queue", count: 12 });
    trackProConversion({ planId: "yearly", sourceOrderId: "order_1" });

    expect(first?.name).toBe("activation");
    expect(second).toBeNull();
    expect(getLocalAnalyticsEvents().filter((event) => event.name === "activation")).toHaveLength(1);
    expect(getLocalAnalyticsEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "study_completed", properties: expect.objectContaining({ completionRate: 5 / 6 }) }),
        expect.objectContaining({ name: "review_recall", properties: expect.objectContaining({ count: 12 }) }),
        expect.objectContaining({ name: "pro_conversion", properties: expect.objectContaining({ planId: "yearly" }) })
      ])
    );
  });
});
