import { describe, expect, it } from "vitest";
import { getOnboardingConfig, getOnboardingWordbookSummary, inferWordbookFromOnboarding } from "./onboarding-config";

describe("onboarding config", () => {
  it("keeps onboarding options and defaults in one managed config", () => {
    const config = getOnboardingConfig();

    expect(config.totalSteps).toBe(4);
    expect(config.defaults).toMatchObject({
      completed: false,
      goal: "gaokao",
      grade: "初三",
      dailyWords: 20,
      wordbookId: "zhongkao-1600"
    });
    expect(config.goals.map((goal) => goal.id)).toEqual(["zhongkao", "gaokao", "ielts_toefl", "interest"]);
    expect(config.grades).toEqual(["初一", "初二", "初三", "高一", "高二", "高三"]);
    expect(config.interests.map((interest) => interest.id)).toEqual(["sports", "anime", "music", "tech", "food", "travel"]);
    expect(config.copy.steps.goal).toMatchObject({
      title: "你的目标是？",
      subtitle: "Wordy 会据此定制学习计划"
    });
    expect(config.copy.completeCta).toBe("开始学习");
  });

  it("recommends wordbooks by explicit goal before grade fallback", () => {
    expect(inferWordbookFromOnboarding("zhongkao", "高一")).toBe("zhongkao-1600");
    expect(inferWordbookFromOnboarding("gaokao", "初三")).toBe("gaokao-3500");
    expect(inferWordbookFromOnboarding("ielts_toefl", "高二")).toBe("ielts");
    expect(inferWordbookFromOnboarding("interest", "高一")).toBe("gaokao-3500");
    expect(inferWordbookFromOnboarding("interest", "初二")).toBe("zhongkao-1600");
    expect(inferWordbookFromOnboarding("interest", "小学")).toBe("primary");
  });

  it("derives onboarding wordbook summaries from the real wordbook catalog", () => {
    expect(getOnboardingWordbookSummary("toefl")).toEqual({
      id: "toefl",
      title: "托福词库",
      total: 4600
    });
  });
});
