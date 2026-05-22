import { beforeEach, describe, expect, it } from "vitest";
import { getAiUsageSummary, listAiUsageEvents, recordAiUsageEvent, resetAiUsageEventsForTests } from "./ai-usage";

describe("ai usage telemetry", () => {
  beforeEach(() => {
    resetAiUsageEventsForTests();
  });

  it("records DeepSeek usage events and summarizes tokens, latency, failures, and estimated cost", () => {
    recordAiUsageEvent(
      {
        feature: "story",
        model: "deepseek-chat",
        status: "success",
        promptTokens: 1000,
        completionTokens: 500,
        latencyMs: 1200
      },
      {
        now: new Date("2026-05-21T10:00:00.000Z"),
        pricing: { inputCnyPerMillionTokens: 1, outputCnyPerMillionTokens: 2 }
      }
    );
    recordAiUsageEvent(
      {
        feature: "example",
        model: "deepseek-chat",
        status: "error",
        promptTokens: 200,
        completionTokens: 0,
        latencyMs: 400,
        errorMessage: "429 rate limited"
      },
      {
        now: new Date("2026-05-21T10:01:00.000Z"),
        pricing: { inputCnyPerMillionTokens: 1, outputCnyPerMillionTokens: 2 }
      }
    );

    expect(listAiUsageEvents()).toEqual([
      expect.objectContaining({ feature: "example", status: "error", totalTokens: 200, costCny: 0.0002 }),
      expect.objectContaining({ feature: "story", status: "success", totalTokens: 1500, costCny: 0.002 })
    ]);
    expect(getAiUsageSummary({ budgetCny: 0.01 })).toMatchObject({
      totalCalls: 2,
      failedCalls: 1,
      totalTokens: 1700,
      estimatedCostCny: 0.0022,
      averageLatencyMs: 800,
      failureRate: 50,
      budgetCny: 0.01,
      budgetUsedPercent: 22
    });
  });

  it("keeps the newest events first and caps the in-memory window", () => {
    for (let index = 0; index < 505; index += 1) {
      recordAiUsageEvent(
        {
          feature: "memory-map",
          model: "deepseek-chat",
          status: "success",
          promptTokens: index,
          completionTokens: 0,
          latencyMs: 10
        },
        { now: new Date(`2026-05-21T10:${String(index % 60).padStart(2, "0")}:00.000Z`) }
      );
    }

    expect(listAiUsageEvents()).toHaveLength(500);
    expect(listAiUsageEvents()[0]).toMatchObject({ promptTokens: 504, totalTokens: 504 });
  });
});
