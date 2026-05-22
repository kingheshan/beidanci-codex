import { ApiError, createMockApiClient, type GetMistakesInput, type SubmitAnswerInput } from "./api-client";
import type { PhoneCodeIssueInput, PhoneLoginInput, WechatLoginInput } from "./auth";
import { MISTAKE_FILTERS, type MistakeFilterId } from "./mistakes-data";
import { isStudyModeId } from "./study-data";
import { getWordbook, type WordbookId } from "./wordbooks";

export const routeApi = createMockApiClient({ delayMs: 0 });

export type WordRouteContext = {
  params: {
    wordId: string;
  };
};

export type WordbookRouteContext = {
  params: {
    bookId: string;
  };
};

export type AdminModuleRouteContext = {
  params: {
    moduleId: string;
  };
};

const MISTAKE_FILTER_IDS = new Set<string>(MISTAKE_FILTERS.map((filter) => filter.id));
const MISTAKE_SORTS = new Set(["recent", "frequent", "mastery"]);

export function apiJson(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(data, {
    ...init,
    headers
  });
}

export function apiError(message: string, status: number, code: string) {
  return apiJson({ message, code }, { status });
}

export async function withApiErrors<T>(load: () => Promise<T>, init?: ResponseInit | ((data: T) => ResponseInit)) {
  try {
    const data = await load();
    const responseInit = typeof init === "function" ? init(data) : init;
    return apiJson(data, responseInit);
  } catch (error) {
    if (error instanceof ApiError) {
      return apiError(error.message, error.status ?? 500, error.code ?? "API_ERROR");
    }

    return apiError("Unexpected API error", 500, "INTERNAL_ERROR");
  }
}

export function parseMistakesQuery(request: Request): GetMistakesInput | Response {
  const params = new URL(request.url).searchParams;
  const filter = params.get("filter");
  const sort = params.get("sort");

  if (filter && !MISTAKE_FILTER_IDS.has(filter)) {
    return apiError("Unsupported mistake filter", 400, "INVALID_MISTAKE_FILTER");
  }

  if (sort && !MISTAKE_SORTS.has(sort)) {
    return apiError("Unsupported mistake sort", 400, "INVALID_MISTAKE_SORT");
  }

  return {
    filter: filter ? (filter as MistakeFilterId) : undefined,
    sort: sort ? (sort as GetMistakesInput["sort"]) : undefined
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function parseAnswerPayload(request: Request): Promise<SubmitAnswerInput | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError("Answer payload must be valid JSON", 400, "INVALID_ANSWER_PAYLOAD");
  }

  if (!isRecord(payload)) {
    return apiError("Answer payload must be an object", 400, "INVALID_ANSWER_PAYLOAD");
  }

  const { wordId, mode, correct, ms } = payload;
  if (typeof wordId !== "string" || typeof mode !== "string" || !isStudyModeId(mode) || typeof correct !== "boolean" || typeof ms !== "number") {
    return apiError("Answer payload is missing required fields", 400, "INVALID_ANSWER_PAYLOAD");
  }

  return { wordId, mode, correct, ms };
}

export function parseWordbookId(bookId: string): WordbookId | Response {
  const book = getWordbook(bookId);
  if (!book) {
    return apiError("Unsupported wordbook", 404, "WORDBOOK_NOT_FOUND");
  }

  return book.id;
}

export async function parsePhoneLoginPayload(request: Request): Promise<PhoneLoginInput | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError("Phone login payload must be valid JSON", 400, "INVALID_AUTH_PAYLOAD");
  }

  if (!isRecord(payload) || typeof payload.phone !== "string" || typeof payload.code !== "string") {
    return apiError("Phone login payload is missing required fields", 400, "INVALID_AUTH_PAYLOAD");
  }

  return { phone: payload.phone, code: payload.code };
}

export async function parsePhoneCodePayload(request: Request): Promise<PhoneCodeIssueInput | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError("Phone code payload must be valid JSON", 400, "INVALID_AUTH_PAYLOAD");
  }

  if (!isRecord(payload) || typeof payload.phone !== "string") {
    return apiError("Phone code payload is missing phone", 400, "INVALID_AUTH_PAYLOAD");
  }

  return { phone: payload.phone };
}

export async function parseWechatLoginPayload(request: Request): Promise<WechatLoginInput | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError("WeChat login payload must be valid JSON", 400, "INVALID_AUTH_PAYLOAD");
  }

  if (!isRecord(payload) || typeof payload.code !== "string") {
    return apiError("WeChat login payload is missing authorization code", 400, "INVALID_AUTH_PAYLOAD");
  }

  return { code: payload.code };
}

export async function parseJsonObject(request: Request, label: string): Promise<Record<string, unknown> | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError(`${label} payload must be valid JSON`, 400, "INVALID_JSON_PAYLOAD");
  }

  if (!isRecord(payload)) {
    return apiError(`${label} payload must be an object`, 400, "INVALID_JSON_PAYLOAD");
  }

  return payload;
}
