import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/learning-plan", () => {
  it("serves daily word bounds and settings screen copy", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      dailyWords: {
        min: 5,
        max: 80,
        quickValues: [15, 20, 40, 60]
      },
      settingsUi: {
        desktopTitle: "设置中心",
        planTitle: "计划控制台",
        navItems: expect.arrayContaining([expect.objectContaining({ id: "dictionary", href: "/dictionary" })])
      }
    });
  });
});
