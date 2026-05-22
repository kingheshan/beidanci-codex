import { describe, expect, it } from "vitest";
import {
  DEFAULT_MISTAKE_STATS,
  MISTAKE_FILTERS,
  REVIEW_FILTERS,
  REVIEW_STATS,
  formatWorkflowTemplate,
  getLearningWorkflowConfig
} from "./learning-workflow-config";

describe("learning workflow config", () => {
  it("exposes review and mistake defaults used by the workflow screens", () => {
    const config = getLearningWorkflowConfig();

    expect(config.version).toBe(1);
    expect(REVIEW_STATS).toMatchObject({ due: 14, weak: 9, bookMastery: 0.74 });
    expect(REVIEW_FILTERS.map((filter) => filter.id)).toEqual(["all", "weak", "fuzzy", "familiar", "mastered"]);
    expect(DEFAULT_MISTAKE_STATS).toMatchObject({ improvedPct: 32, correctedTotal: 284, accuracyPct: 89 });
    expect(MISTAKE_FILTERS.map((filter) => filter.id)).toEqual(["all", "frequent", "mc", "flip", "spell", "listen", "context", "image"]);
    expect(config.result.actions).toMatchObject({ repeat: "再练一次", review: "智能复习", mistakes: "查看错题本" });
  });

  it("formats configurable workflow templates", () => {
    expect(formatWorkflowTemplate("开始复习 {count} 词", { count: 14 })).toBe("开始复习 14 词");
    expect(formatWorkflowTemplate("{mode} 已完成 · 连胜保持到 {streak} 天", { mode: "选择闯关", streak: 29 })).toBe("选择闯关 已完成 · 连胜保持到 29 天");
  });
});
