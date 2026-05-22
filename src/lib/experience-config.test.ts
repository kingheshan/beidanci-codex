import { describe, expect, it } from "vitest";
import { formatExperienceTemplate, getExperienceConfig } from "./experience-config";

describe("experience config", () => {
  it("collects configurable copy for remaining product surfaces", () => {
    const config = getExperienceConfig();

    expect(config.version).toBe(1);
    expect(config.dictionary).toMatchObject({ heroTitle: "我的词书", reviewCta: "去复习中心" });
    expect(config.profile).toMatchObject({ headerTitle: "个人主页工作台", weeklyGoalTitle: "本周目标" });
    expect(config.pro.proofMetrics).toHaveLength(3);
    expect(config.rank.adviceSteps).toHaveLength(3);
    expect(config.parent.tabs.map((tab) => tab.id)).toEqual(["today", "analysis", "teacher", "me"]);
    expect(config.story.strategySteps).toHaveLength(3);
    expect(config.camera.workflowSteps).toHaveLength(3);
    expect(config.pk.rules).toHaveLength(3);
    expect(config.wordDetail.tabs.map((tab) => tab.id)).toEqual(["def", "map", "related"]);
    expect(config.memoryMap.modes.map((mode) => mode.id)).toEqual(["map", "roots", "tips"]);
  });

  it("formats CMS-style templates with runtime values", () => {
    expect(formatExperienceTemplate("{bookTitle} · {mastered} 已掌握", { bookTitle: "中考核心 1600", mastered: 1284 })).toBe("中考核心 1600 · 1284 已掌握");
    expect(formatExperienceTemplate("距第 {rank} 名还差 {gap} XP", { rank: 4, gap: 51 })).toBe("距第 4 名还差 51 XP");
  });
});
