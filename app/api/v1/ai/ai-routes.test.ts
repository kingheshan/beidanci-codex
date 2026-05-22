import { afterEach, describe, expect, it, vi } from "vitest";
import { DAILY_STORY } from "@/lib/story-data";
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
});
