import { describe, expect, it } from "vitest";
import {
  getProductConfig,
  getProductFeatureUnavailableCopy,
  getProductNavBadge,
  getProductNavSections,
  isProductFeatureEnabled
} from "./product-config";

describe("product config", () => {
  it("exposes the configurable brand, navigation sections and mobile tabs", () => {
    const config = getProductConfig();

    expect(config.brand).toEqual({ name: "爱上背单词", subtitle: "AI · K12" });
    expect(config.navigation.sections.map((section) => section.id)).toEqual(["learning", "ai", "personal"]);
    expect(config.navigation.mobileTabs.map((tab) => tab.href)).toEqual(["/home", "/review", "/rank", "/me"]);
  });

  it("resolves badges and feature flags for navigation items", () => {
    const config = getProductConfig();
    const learningItems = config.navigation.sections.find((section) => section.id === "learning")?.items ?? [];
    const review = learningItems.find((item) => item.id === "review");
    const mistakes = learningItems.find((item) => item.id === "mistakes");

    expect(review && getProductNavBadge(config, review)).toBe("14");
    expect(mistakes && getProductNavBadge(config, mistakes)).toBe("5");
    expect(isProductFeatureEnabled(config, "study")).toBe(true);
    expect(getProductFeatureUnavailableCopy(config, "camera")).toBe("拍照查词会在后续阶段接入");
  });

  it("filters sidebar sections for page-specific navigation", () => {
    const config = getProductConfig();

    expect(getProductNavSections(config, ["learning"]).map((section) => section.title)).toEqual(["学习"]);
    expect(getProductNavSections(config, ["ai", "personal"]).flatMap((section) => section.items.map((item) => item.id))).toEqual([
      "story",
      "pk",
      "pro",
      "leaderboard",
      "parent",
      "me",
      "settings"
    ]);
  });
});
