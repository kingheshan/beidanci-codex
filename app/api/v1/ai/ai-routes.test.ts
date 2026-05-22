import { afterEach, describe, expect, it, vi } from "vitest";
import { DAILY_STORY } from "@/lib/story-data";
import { POST as postMistakeCoach } from "./mistake-coach/route";
import { GET as getStory } from "./story/today/route";

function deepseekResponse(content: unknown) {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
      usage: { prompt_tokens: 120, completion_tokens: 32, total_tokens: 152 }
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

describe("AI API routes", () => {
  const originalKey = process.env.DEEPSEEK_API_KEY;
  const originalModel = process.env.DEEPSEEK_MODEL;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.DEEPSEEK_MODEL;
    else process.env.DEEPSEEK_MODEL = originalModel;
    vi.unstubAllGlobals();
  });

  it("uses DeepSeek for daily story generation with request grade and interests", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";
    process.env.DEEPSEEK_MODEL = "deepseek-chat";
    const fetcher = vi.fn<typeof fetch>(async () => deepseekResponse({ ...DAILY_STORY, title: "DeepSeek Story" }));
    vi.stubGlobal("fetch", fetcher);

    const response = await getStory(new Request("http://localhost/api/v1/ai/story/today?grade=%E9%AB%98%E4%B8%80&interests=%E7%A7%91%E5%B9%BB&wordbookId=toefl&limit=3"));
    const body = (await response.json()) as { title: string };
    const payload = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as { messages: Array<{ role: string; content: string }> };

    expect(response.status).toBe(200);
    expect(body.title).toBe("DeepSeek Story");
    expect(payload.messages[1].content).toContain("学生年级：高一");
    expect(payload.messages[1].content).toContain("兴趣：科幻");
    expect(payload.messages[1].content).toContain("hypothesis");
    expect(payload.messages[1].content).toContain("archaeology");
    expect(payload.messages[1].content).not.toContain("persist");
  });

  it("uses DeepSeek for mistake coaching and keeps the prompt structured", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";
    process.env.DEEPSEEK_MODEL = "deepseek-chat";
    const fetcher = vi.fn<typeof fetch>(async () =>
      deepseekResponse({
        title: "释义选择错因教练",
        cause: "学生把中文释义当成孤立标签，缺少例句语境。",
        explanation: "persist 表示遇到困难仍坚持做某事。",
        memoryTip: "一直站住，就是 persist。",
        microDrill: { prompt: "补全：I ____ in reading every day.", answer: "persist" },
        nextAction: "读例句后再选一次。",
        tags: ["释义选择", "错因定位"]
      })
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await postMistakeCoach(
      new Request("http://localhost/api/v1/ai/mistake-coach", {
        method: "POST",
        body: JSON.stringify({ wordId: "w1", mode: "mc", selectedWordId: "w2", ms: 1300, grade: "初三", interests: ["足球"] })
      })
    );
    const body = (await response.json()) as { source: string; cause: string };
    const payload = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as { messages: Array<{ role: string; content: string }> };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ source: "ai", cause: "学生把中文释义当成孤立标签，缺少例句语境。" });
    expect(payload.messages[1].content).toContain("任务：生成一次 AI 错因教练反馈");
    expect(payload.messages[1].content).toContain("学生误选词：ambition");
    expect(payload.messages[1].content).toContain("microDrill");
  });
});
