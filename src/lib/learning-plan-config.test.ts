import { describe, expect, it } from "vitest";
import { clampDailyWords, estimatePlanMinutes, estimateRemainingMinutes, getLearningPlanConfig } from "./learning-plan-config";
import { createLearningPlanSummary } from "./learning-plan";

describe("learning plan config", () => {
  it("centralizes daily word range, quick values and estimate ratios", () => {
    const config = getLearningPlanConfig();

    expect(config.dailyWords).toMatchObject({
      defaultValue: 20,
      min: 5,
      max: 80,
      step: 5,
      quickValues: [15, 20, 40, 60],
      rangeMarks: [5, 20, 40, 60, 80]
    });
    expect(config.defaultCompletedToday).toBe(12);
    expect(config.defaultReviewWords).toBe(14);
    expect(config.settingsUi).toMatchObject({
      desktopTitle: "设置中心",
      planTitle: "计划控制台",
      reminderTitle: "提醒与护航",
      accountTitle: "设备与账号"
    });
  });

  it("clamps daily words using the configured range and step", () => {
    expect(clampDailyWords(Number.NaN)).toBe(20);
    expect(clampDailyWords(2)).toBe(5);
    expect(clampDailyWords(37)).toBe(35);
    expect(clampDailyWords(84)).toBe(80);
  });

  it("drives learning plan summaries from managed defaults", () => {
    const summary = createLearningPlanSummary({ wordbookId: "zhongkao-1600", dailyWords: 20 });

    expect(summary.completedToday).toBe(12);
    expect(summary.reviewWords).toBe(14);
    expect(summary.planMinutes).toBe(estimatePlanMinutes(20));
    expect(summary.estimatedMinutes).toBe(estimateRemainingMinutes(8));
    expect(summary.currentLessonLabel).toBe("情景闯关 · 20词");
  });
});
