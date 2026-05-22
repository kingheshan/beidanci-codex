import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { AnalyticsEvent } from "@/lib/analytics";

const ANALYTICS_LOG_PATH = join(process.cwd(), ".cache", "analytics-events.jsonl");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.anonymousId === "string" &&
    typeof value.sessionId === "string" &&
    isRecord(value.properties)
  );
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as unknown;
  const events = isRecord(payload) && Array.isArray(payload.events) ? payload.events.filter(isAnalyticsEvent) : [];

  if (events.length === 0) {
    return Response.json({ ok: false, message: "No valid analytics events" }, { status: 400 });
  }

  await mkdir(dirname(ANALYTICS_LOG_PATH), { recursive: true });
  await appendFile(ANALYTICS_LOG_PATH, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`, "utf8");

  return Response.json({ ok: true, accepted: events.length });
}
