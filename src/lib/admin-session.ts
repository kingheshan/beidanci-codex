import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminActor, AdminRole } from "./admin-api";
import type { AdminSessionRecord } from "./admin-auth";

export const ADMIN_SESSION_COOKIE = "aishang_admin_session";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 8;
const ADMIN_ROLES = new Set<AdminRole>(["owner", "ops", "research", "support", "finance", "auditor"]);

type AdminSessionClaims = {
  sub: string;
  name: string;
  role: AdminRole;
  iat: number;
  exp: number;
};

type AdminSessionIdClaims = {
  sid: string;
  iat: number;
  exp: number;
};

type CreateAdminSessionOptions = {
  now?: Date;
  maxAgeSeconds?: number;
};

export function createAdminSessionCookie(actor: AdminActor, options: CreateAdminSessionOptions = {}) {
  const maxAgeSeconds = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const token = createAdminSessionToken(actor, options);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

export function createAdminSessionIdCookie(session: AdminSessionRecord, options: CreateAdminSessionOptions = {}) {
  const token = createAdminSessionIdToken(session, options);
  const now = options.now ?? new Date();
  const maxAgeSeconds = options.maxAgeSeconds ?? Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - now.getTime()) / 1000));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

export function createAdminSessionToken(actor: AdminActor, options: CreateAdminSessionOptions = {}) {
  const maxAgeSeconds = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const issuedAt = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const claims: AdminSessionClaims = {
    sub: actor.id,
    name: actor.name,
    role: actor.role,
    iat: issuedAt,
    exp: issuedAt + maxAgeSeconds
  };
  const body = base64UrlEncode(JSON.stringify(claims));
  const signature = signSessionBody(body);

  return `${body}.${signature}`;
}

export function createAdminSessionIdToken(session: AdminSessionRecord, options: CreateAdminSessionOptions = {}) {
  const maxAgeSeconds = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const issuedAt = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const expiresAt = Math.floor(new Date(session.expiresAt).getTime() / 1000);
  const claims: AdminSessionIdClaims = {
    sid: session.id,
    iat: issuedAt,
    exp: Number.isFinite(expiresAt) ? expiresAt : issuedAt + maxAgeSeconds
  };
  const body = base64UrlEncode(JSON.stringify(claims));
  const signature = signSessionBody(body);

  return `${body}.${signature}`;
}

export function getAdminActorFromSession(request: Request, now = new Date()): AdminActor | null {
  const token = readCookie(request.headers.get("cookie") ?? "", ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const claims = verifyAdminSessionToken(token, now);
  if (!claims) return null;
  if ("sid" in claims) return null;

  return {
    id: claims.sub,
    name: claims.name,
    role: claims.role
  };
}

export function getAdminSessionIdFromRequest(request: Request, now = new Date()): string | null {
  const token = readCookie(request.headers.get("cookie") ?? "", ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const claims = verifyAdminSessionToken(token, now);
  if (!claims || !("sid" in claims)) return null;

  return claims.sid;
}

function verifyAdminSessionToken(token: string, now: Date): AdminSessionClaims | AdminSessionIdClaims | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !verifySignature(body, signature)) return null;

  try {
    const claims = JSON.parse(base64UrlDecode(body)) as Partial<AdminSessionClaims & AdminSessionIdClaims>;
    const nowSeconds = Math.floor(now.getTime() / 1000);
    if (typeof claims.sid === "string") {
      if (typeof claims.iat !== "number" || typeof claims.exp !== "number" || claims.exp <= nowSeconds) return null;

      return claims as AdminSessionIdClaims;
    }

    if (typeof claims.sub !== "string" || typeof claims.name !== "string" || !isAdminRole(claims.role)) return null;
    if (typeof claims.iat !== "number" || typeof claims.exp !== "number" || claims.exp <= nowSeconds) return null;

    return claims as AdminSessionClaims;
  } catch {
    return null;
  }
}

function verifySignature(body: string, signature: string) {
  const expected = signSessionBody(body);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length) return false;

  return timingSafeEqual(actualBytes, expectedBytes);
}

function signSessionBody(body: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(body).digest("base64url");
}

function getAdminSessionSecret() {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }

  return "dev-only-aishang-admin-session-secret";
}

function readCookie(cookieHeader: string, name: string) {
  const prefix = `${name}=`;
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && ADMIN_ROLES.has(role as AdminRole);
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
