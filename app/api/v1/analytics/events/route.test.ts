import { describe, expect, it } from "vitest";
import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/v1/analytics/events", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
}

describe("analytics events route", () => {
  it("rejects invalid analytics payloads", async () => {
    const response = await POST(request({ events: [{ name: "page_view" }] }));

    expect(response.status).toBe(400);
  });

  it("accepts valid analytics events", async () => {
    const response = await POST(
      request({
        events: [
          {
            id: "evt_test",
            name: "page_view",
            timestamp: "2026-05-20T08:00:00.000Z",
            anonymousId: "anon_test",
            sessionId: "session_test",
            properties: { path: "/home" }
          }
        ]
      })
    );

    await expect(response.json()).resolves.toEqual({ ok: true, accepted: 1 });
  });
});
