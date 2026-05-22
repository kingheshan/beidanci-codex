import { describe, expect, it, vi } from "vitest";
import {
  createAiGenerationContextFromRequest,
  createDeepseekAiClient,
  createExamplePrompt,
  createMistakeCoachPrompt,
  createMemoryMapPrompt,
  createStoryPrompt,
  DEEPSEEK_SYSTEM_PROMPT,
  getDeepseekTimeoutMs,
  mergeMemoryMap
} from "./deepseek-ai";
import { STUDY_WORDS } from "./words";

function deepseekResponse(content: unknown) {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(content)
          }
        }
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 32,
        total_tokens: 152
      }
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

describe("deepseek ai client", () => {
  it("builds professional K12 prompts for story, example, memory map, and mistake coaching", () => {
    expect(createStoryPrompt({ words: STUDY_WORDS.slice(0, 3), grade: "初三", interests: ["足球", "动漫"] })).toContain("中国 K12");
    expect(createStoryPrompt({ words: STUDY_WORDS.slice(0, 3), grade: "初三", interests: ["足球"] })).toContain("严格返回 JSON");
    expect(createStoryPrompt({ words: STUDY_WORDS.slice(0, 3), grade: "初三", interests: ["足球"] })).toContain("wordId 必须来自给定清单");
    expect(createStoryPrompt({ words: STUDY_WORDS.slice(0, 3), grade: "初三", interests: ["足球"] })).toContain("每个考察词只标注一次");
    expect(createExamplePrompt({ word: STUDY_WORDS[0], grade: "初三", interests: ["足球"] })).toContain("8-15 个英文单词");
    expect(createExamplePrompt({ word: STUDY_WORDS[0], grade: "初三", interests: ["足球"] })).toContain("使用目标词的原形或自然屈折形式");
    expect(createMemoryMapPrompt({ word: STUDY_WORDS[0] })).toContain("派生词");
    expect(createMemoryMapPrompt({ word: STUDY_WORDS[0] })).toContain("不要编造不存在的词根");
    expect(createMistakeCoachPrompt({ word: STUDY_WORDS[0], mode: "mc", ms: 1400, grade: "初三", interests: ["足球"] })).toContain("错因教练");
    expect(createMistakeCoachPrompt({ word: STUDY_WORDS[0], mode: "mc", ms: 1400, grade: "初三", interests: ["足球"] })).toContain("不羞辱");
    expect(createMistakeCoachPrompt({ word: STUDY_WORDS[0], mode: "mc", ms: 1400, grade: "初三", interests: ["足球"] })).toContain("microDrill");
    expect(DEEPSEEK_SYSTEM_PROMPT).toContain("未成年人");
    expect(DEEPSEEK_SYSTEM_PROMPT).toContain("严格 JSON");
  });

  it("derives AI generation context from request query safely", () => {
    const request = new Request("http://localhost/api/v1/ai/story/today?grade=%E9%AB%98%E4%B8%80&interests=%E7%AF%AE%E7%90%83,%E7%A7%91%E5%B9%BB&interests=%E7%BC%96%E7%A8%8B");

    expect(createAiGenerationContextFromRequest(request)).toEqual({
      grade: "高一",
      interests: ["篮球", "科幻", "编程"]
    });
  });

  it("uses a configurable DeepSeek timeout with a production-safe default", () => {
    expect(getDeepseekTimeoutMs({})).toBe(12_000);
    expect(getDeepseekTimeoutMs({ DEEPSEEK_TIMEOUT_MS: "8000" })).toBe(8_000);
    expect(getDeepseekTimeoutMs({ DEEPSEEK_TIMEOUT_MS: "10" })).toBe(12_000);
  });

  it("calls the Deepseek chat completions API and parses typed JSON content", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      deepseekResponse({
        en: "Mia will persist until the final whistle.",
        cn: "米娅会坚持到终场哨响。",
        tag: "AI · DeepSeek"
      })
    );
    const client = createDeepseekAiClient({ apiKey: "test-key", fetcher });

    await expect(client.generateExample({ word: STUDY_WORDS[0], grade: "初三", interests: ["足球"] })).resolves.toEqual({
      en: "Mia will persist until the final whistle.",
      cn: "米娅会坚持到终场哨响。",
      tag: "AI · DeepSeek"
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json"
        }),
        signal: expect.any(AbortSignal)
      })
    );
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({
      model: "deepseek-chat",
      temperature: 0.45,
      response_format: { type: "json_object" }
    });
  });

  it("generates normalized mistake coaching feedback", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      deepseekResponse({
        title: "释义选择错因教练",
        cause: "你把中文释义当成孤立标签，缺少例句语境。",
        explanation: "persist 表示遇到困难仍坚持做某事。",
        memoryTip: "一直站住，就是 persist。",
        microDrill: {
          prompt: "补全：I ____ in reading every day.",
          answer: "persist"
        },
        nextAction: "读例句后再选一次。",
        tags: ["释义选择", "错因定位"]
      })
    );
    const client = createDeepseekAiClient({ apiKey: "test-key", fetcher });

    await expect(client.generateMistakeCoach({ word: STUDY_WORDS[0], mode: "mc", ms: 1200, grade: "初三", interests: ["足球"] })).resolves.toEqual({
      title: "释义选择错因教练",
      cause: "你把中文释义当成孤立标签，缺少例句语境。",
      explanation: "persist 表示遇到困难仍坚持做某事。",
      memoryTip: "一直站住，就是 persist。",
      microDrill: {
        prompt: "补全：I ____ in reading every day.",
        answer: "persist"
      },
      nextAction: "读例句后再选一次。",
      tags: ["释义选择", "错因定位"],
      source: "ai"
    });
  });

  it("records successful and failed DeepSeek usage with feature, latency, and token metadata", async () => {
    const events: unknown[] = [];
    const successClient = createDeepseekAiClient({
      apiKey: "test-key",
      fetcher: vi.fn<typeof fetch>(async () =>
        deepseekResponse({
          en: "Mia will persist until the final whistle.",
          cn: "米娅会坚持到终场哨响。",
          tag: "AI · DeepSeek"
        })
      ),
      telemetry: {
        feature: "example",
        now: () => new Date("2026-05-21T10:00:00.000Z"),
        record: (event) => {
          events.push(event);
        }
      }
    });

    await successClient.generateExample({ word: STUDY_WORDS[0], grade: "初三", interests: ["足球"] });

    expect(events).toEqual([
      expect.objectContaining({
        feature: "example",
        model: "deepseek-chat",
        status: "success",
        promptTokens: 120,
        completionTokens: 32,
        totalTokens: 152,
        createdAt: "2026-05-21T10:00:00.000Z"
      })
    ]);

    const failureClient = createDeepseekAiClient({
      apiKey: "test-key",
      fetcher: vi.fn<typeof fetch>(async () => new Response("rate limited", { status: 429 })),
      telemetry: {
        feature: "story",
        now: () => new Date("2026-05-21T10:01:00.000Z"),
        record: (event) => {
          events.push(event);
        }
      }
    });

    await expect(failureClient.generateStory({ words: STUDY_WORDS.slice(0, 3), grade: "初三", interests: ["足球"] })).rejects.toThrow("Deepseek request failed with 429");
    expect(events[1]).toEqual(
      expect.objectContaining({
        feature: "story",
        status: "error",
        promptTokens: 0,
        completionTokens: 0,
        errorMessage: "Deepseek request failed with 429"
      })
    );
  });

  it("normalizes malformed model output into a useful error", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "not json" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    const client = createDeepseekAiClient({ apiKey: "test-key", fetcher });

    await expect(client.generateExample({ word: STUDY_WORDS[0], grade: "初三", interests: ["足球"] })).rejects.toThrow(
      "Deepseek returned invalid JSON"
    );
  });

  it("merges generated memory-map fields into the frontend model shape", () => {
    const model = mergeMemoryMap(STUDY_WORDS[0], {
      rootClue: "per 表示一直，sist 表示站立。",
      memoryTip: "一直站住，就是 persist。",
      related: [{ word: "continue", label: "v. 继续", kind: "syn" }]
    });

    expect(model.rootClues[0].body).toBe("per 表示一直，sist 表示站立。");
    expect(model.aiTips[0]).toBe("一直站住，就是 persist。");
    expect(model.word.related).toEqual([{ word: "continue", label: "v. 继续", kind: "syn" }]);
  });
});
