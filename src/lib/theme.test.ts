import { describe, expect, it } from "vitest";
import { THEMES, clamp01, getThemeVariables } from "./theme";

describe("theme helpers", () => {
  it("exposes all three prototype themes", () => {
    expect(THEMES).toEqual(["purple", "orange", "green"]);
  });

  it("returns CSS variable mappings for the active theme", () => {
    expect(getThemeVariables("purple")["--c-primary"]).toBe("#6C5CE7");
    expect(getThemeVariables("orange")["--c-bg"]).toBe("#FFF6EE");
    expect(getThemeVariables("green")["--c-primary-deep"]).toBe("#1F9D58");
  });

  it("clamps decimal values for progress components", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.45)).toBe(0.45);
    expect(clamp01(2)).toBe(1);
  });
});
