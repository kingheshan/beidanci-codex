import { describe, expect, it } from "vitest";
import type { AdminActor } from "./admin-api";
import { ADMIN_SESSION_COOKIE, createAdminSessionCookie, getAdminActorFromSession } from "./admin-session";

const owner: AdminActor = {
  id: "admin-owner",
  name: "超级管理员",
  role: "owner"
};

function requestWithCookie(cookie: string) {
  return new Request("http://localhost/api/v1/admin/overview", {
    headers: {
      cookie: cookie.split(";")[0]
    }
  });
}

describe("admin session cookies", () => {
  it("signs an http-only admin cookie that resolves back to an actor", () => {
    const cookie = createAdminSessionCookie(owner, { now: new Date("2026-05-20T10:00:00.000Z"), maxAgeSeconds: 60 });

    expect(cookie).toContain(`${ADMIN_SESSION_COOKIE}=`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(getAdminActorFromSession(requestWithCookie(cookie), new Date("2026-05-20T10:00:20.000Z"))).toEqual(owner);
  });

  it("rejects tampered or expired admin session cookies", () => {
    const cookie = createAdminSessionCookie(owner, { now: new Date("2026-05-20T10:00:00.000Z"), maxAgeSeconds: 10 });
    const [cookiePair, ...attributes] = cookie.split(";");
    const tamperedPair = `${cookiePair.slice(0, -1)}${cookiePair.endsWith("a") ? "b" : "a"}`;
    const tampered = [tamperedPair, ...attributes].join(";");

    expect(getAdminActorFromSession(requestWithCookie(tampered), new Date("2026-05-20T10:00:02.000Z"))).toBeNull();
    expect(getAdminActorFromSession(requestWithCookie(cookie), new Date("2026-05-20T10:00:11.000Z"))).toBeNull();
  });
});
