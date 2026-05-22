import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/workflow", () => {
  it("serves review, mistake notebook and result page workflow config", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      review: {
        stats: {
          due: 14,
          bookMastery: 0.74
        },
        queueTitle: "队列"
      },
      mistakes: {
        defaultStats: {
          correctedTotal: 284,
          accuracyPct: 89
        },
        insight: {
          suggestionTitle: "Wordy 建议"
        }
      },
      result: {
        emptyCta: "去学习",
        primaryCta: "继续"
      }
    });
    expect(body.review.filters.map((filter: { id: string }) => filter.id)).toEqual(["all", "weak", "fuzzy", "familiar", "mastered"]);
    expect(body.mistakes.filters.map((filter: { id: string }) => filter.id)).toEqual(["all", "frequent", "mc", "flip", "spell", "listen", "context", "image"]);
  });
});
