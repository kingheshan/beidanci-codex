import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildDefaultAdminAccounts, buildDefaultAdminRolePermissions, ensureDefaultAdminRolePermissions, hashAdminPassword, verifyAdminPassword } from "./admin-auth";
import { JsonFileAdminRepository } from "./admin-repository";

let tempDir: string | null = null;

describe("admin auth helpers", () => {
  afterEach(() => {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it("hashes admin passwords and verifies them without storing plaintext", async () => {
    const hash = await hashAdminPassword("owner-pass", "fixed-salt-for-tests");

    expect(hash).not.toContain("owner-pass");
    await expect(verifyAdminPassword("owner-pass", hash)).resolves.toBe(true);
    await expect(verifyAdminPassword("wrong-pass", hash)).resolves.toBe(false);
  });

  it("builds configured default admin account seeds with hashed passwords", async () => {
    const accounts = await buildDefaultAdminAccounts({
      ADMIN_OWNER_PASSWORD: "owner-pass",
      ADMIN_OPS_PASSWORD: "ops-pass"
    });

    const owner = accounts.find((account) => account.role === "owner");
    const ops = accounts.find((account) => account.role === "ops");

    expect(owner).toMatchObject({
      id: "admin-owner",
      email: "owner@aishang.local",
      displayName: "超级管理员",
      role: "owner"
    });
    expect(owner?.passwordHash).not.toContain("owner-pass");
    expect(ops?.passwordHash).not.toContain("ops-pass");
    await expect(verifyAdminPassword("owner-pass", owner?.passwordHash ?? "")).resolves.toBe(true);
    await expect(verifyAdminPassword("ops-pass", ops?.passwordHash ?? "")).resolves.toBe(true);
  });

  it("builds default RBAC permissions for operational admin roles", () => {
    const permissions = buildDefaultAdminRolePermissions();

    expect(permissions).toEqual(
      expect.arrayContaining([
        { role: "owner", moduleId: "prompts" },
        { role: "research", moduleId: "prompts" },
        { role: "support", moduleId: "users" }
      ])
    );
    expect(permissions).not.toEqual(expect.arrayContaining([{ role: "support", moduleId: "prompts" }]));
  });

  it("patches schema-added default modules into existing privileged role permissions", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "aishang-admin-auth-"));
    const repository = new JsonFileAdminRepository(join(tempDir, "admin-store.json"));
    await repository.replaceAdminRolePermissions("owner", ["dashboard", "users"]);
    await repository.replaceAdminRolePermissions("auditor", ["dashboard", "audit"]);

    await ensureDefaultAdminRolePermissions(repository);

    await expect(repository.listAdminRolePermissions("owner")).resolves.toEqual(expect.arrayContaining([{ role: "owner", moduleId: "approvals" }]));
    await expect(repository.listAdminRolePermissions("auditor")).resolves.toEqual(expect.arrayContaining([{ role: "auditor", moduleId: "approvals" }]));
  });
});
