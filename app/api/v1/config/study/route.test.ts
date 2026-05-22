import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/study", () => {
  it("serves home learning path, quick tools and playable study modes", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      hub: {
        title: "选择刷词方式",
        recommendedModeId: "mc"
      },
      home: {
        aiToolboxTitle: "AI 工具箱"
      }
    });
    expect(body.lessons).toHaveLength(5);
    expect(body.quickTools).toEqual(expect.arrayContaining([expect.objectContaining({ id: "memory", enabled: false })]));
    expect(body.modes.map((mode: { id: string }) => mode.id)).toEqual(["mc", "flip", "spell", "listen", "context", "image"]);
  });
});
