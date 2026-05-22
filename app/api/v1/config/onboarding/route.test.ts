import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/onboarding", () => {
  it("serves onboarding options, recommendation rules and plan bounds", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      totalSteps: 4,
      defaults: {
        goal: "gaokao",
        dailyWords: 20,
        wordbookId: "zhongkao-1600"
      },
      learningPlan: {
        dailyWords: {
          min: 5,
          max: 80,
          step: 5
        },
        defaultReviewWords: 14
      },
      copy: {
        nextCta: "下一步",
        completeCta: "开始学习",
        steps: {
          dailyWords: {
            title: "每天打算学多少词？"
          }
        }
      }
    });
    expect(body.wordbookRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "goal-zhongkao", wordbookId: "zhongkao-1600" }),
        expect.objectContaining({ id: "grade-high-school", wordbookId: "gaokao-3500" })
      ])
    );
  });
});
