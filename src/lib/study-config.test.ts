import { describe, expect, it } from "vitest";
import { formatRecommendedModeCopy, getRecommendedStudyMode, getStudyConfig, isStudyModeId } from "./study-config";

describe("study config", () => {
  it("centralizes home path lessons, quick tools and study modes", () => {
    const config = getStudyConfig();

    expect(config.home.learningPathTitle).toBe("学习路径 · 第 3 单元");
    expect(config.lessons.map((lesson) => lesson.id)).toEqual(["intro", "level", "context", "listen", "boss"]);
    expect(config.quickTools.map((tool) => tool.id)).toEqual(["story", "pk", "camera", "memory"]);
    expect(config.modes.map((mode) => mode.id)).toEqual(["mc", "flip", "spell", "listen", "context", "image"]);
  });

  it("marks implemented quick tools with real routes", () => {
    const config = getStudyConfig();

    expect(config.quickTools.filter((tool) => tool.enabled).map((tool) => tool.href)).toEqual(["/story", "/pk", "/map"]);
    expect(config.quickTools.find((tool) => tool.id === "camera")).toMatchObject({
      enabled: false,
      unavailableCopy: "敬请期待"
    });
    expect(config.quickTools.find((tool) => tool.id === "memory")).toMatchObject({
      enabled: true,
      href: "/map",
      unavailableCopy: "错词记忆星云会在后续阶段接入"
    });
  });

  it("resolves recommended mode and validates mode ids", () => {
    const config = getStudyConfig();

    expect(getRecommendedStudyMode(config)).toMatchObject({ id: "mc", title: "选择闯关" });
    expect(formatRecommendedModeCopy(8, config)).toBe("当前队列还剩 8 个新词，选择题能最快完成热身。");
    expect(isStudyModeId("context")).toBe(true);
    expect(isStudyModeId("unknown")).toBe(false);
  });
});
