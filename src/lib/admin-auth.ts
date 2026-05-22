import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { AdminActor, AdminRole } from "./admin-api";
import { ADMIN_MODULES, type AdminModuleId } from "./admin-data";
import type { AdminRepository } from "./admin-repository";

const PASSWORD_HASH_ALGORITHM = "pbkdf2-sha256";
const PASSWORD_HASH_ITERATIONS = 120_000;
const PASSWORD_HASH_KEY_LENGTH = 32;
const DEFAULT_ADMIN_SESSION_SECONDS = 60 * 60 * 8;

export type AdminAccount = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  passwordHash: string;
  mfaEnabled: boolean;
};

export type AdminSessionRecord = {
  id: string;
  actorId: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type AdminRolePermission = {
  role: AdminRole;
  moduleId: AdminModuleId;
};

export type ActiveAdminSession = {
  session: AdminSessionRecord;
  account: AdminAccount;
};

type AdminAccountSeed = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  envName: string;
};

const ADMIN_ACCOUNT_SEEDS: AdminAccountSeed[] = [
  { id: "admin-owner", email: "owner@aishang.local", displayName: "超级管理员", role: "owner", envName: "ADMIN_OWNER_PASSWORD" },
  { id: "admin-ops", email: "ops@aishang.local", displayName: "运营管理员", role: "ops", envName: "ADMIN_OPS_PASSWORD" },
  { id: "admin-research", email: "research@aishang.local", displayName: "教研管理员", role: "research", envName: "ADMIN_RESEARCH_PASSWORD" },
  { id: "admin-support", email: "support@aishang.local", displayName: "客服管理员", role: "support", envName: "ADMIN_SUPPORT_PASSWORD" },
  { id: "admin-finance", email: "finance@aishang.local", displayName: "财务管理员", role: "finance", envName: "ADMIN_FINANCE_PASSWORD" },
  { id: "admin-auditor", email: "auditor@aishang.local", displayName: "审计员", role: "auditor", envName: "ADMIN_AUDITOR_PASSWORD" }
];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: "超级管理员",
  ops: "运营管理员",
  research: "教研管理员",
  support: "客服管理员",
  finance: "财务管理员",
  auditor: "审计员"
};

export const DEFAULT_ADMIN_ROLE_MODULES: Record<AdminRole, AdminModuleId[]> = {
  owner: ADMIN_MODULES.map((module) => module.id),
  ops: ["dashboard", "users", "mistakes", "operations", "billing", "audit"],
  research: ["dashboard", "wordbooks", "vocabulary", "mistakes", "prompts", "import-quality", "curriculum", "safety"],
  support: ["dashboard", "users", "mistakes", "billing"],
  finance: ["dashboard", "billing", "audit"],
  auditor: ["dashboard", "audit", "roles", "approvals", "ai-usage", "safety", "system"]
};

export async function hashAdminPassword(password: string, salt = randomBytes(16).toString("base64url")) {
  const digest = pbkdf2Sync(password, salt, PASSWORD_HASH_ITERATIONS, PASSWORD_HASH_KEY_LENGTH, "sha256").toString("base64url");

  return `${PASSWORD_HASH_ALGORITHM}$${PASSWORD_HASH_ITERATIONS}$${salt}$${digest}`;
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  const [algorithm, iterationsValue, salt, digest] = passwordHash.split("$");
  const iterations = Number(iterationsValue);
  if (algorithm !== PASSWORD_HASH_ALGORITHM || !Number.isInteger(iterations) || !salt || !digest) return false;

  const expected = Buffer.from(digest, "base64url");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, "sha256");
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

export async function buildDefaultAdminAccounts(env: Record<string, string | undefined> = process.env) {
  const includeDevFallback = process.env.NODE_ENV !== "production";
  const accounts: AdminAccount[] = [];

  for (const seed of ADMIN_ACCOUNT_SEEDS) {
    const password = env[seed.envName] ?? (includeDevFallback ? "admin-demo" : null);
    if (!password) continue;

    accounts.push({
      id: seed.id,
      email: seed.email,
      displayName: seed.displayName,
      role: seed.role,
      passwordHash: await hashAdminPassword(password, `${seed.id}-seed`),
      mfaEnabled: false
    });
  }

  return accounts;
}

export async function ensureDefaultAdminAccounts(repository: AdminRepository, env: Record<string, string | undefined> = process.env) {
  const accounts = await buildDefaultAdminAccounts(env);

  for (const account of accounts) {
    await repository.upsertAdminAccount(account);
  }

  return accounts;
}

export function buildDefaultAdminRolePermissions() {
  return Object.entries(DEFAULT_ADMIN_ROLE_MODULES).flatMap(([role, moduleIds]) =>
    moduleIds.map((moduleId) => ({
      role: role as AdminRole,
      moduleId
    }))
  );
}

export async function ensureDefaultAdminRolePermissions(repository: AdminRepository) {
  const permissions = buildDefaultAdminRolePermissions();
  const roles = new Set(permissions.map((permission) => permission.role));

  for (const role of roles) {
    const existing = await repository.listAdminRolePermissions(role);
    if (existing.length === 0) {
      await repository.replaceAdminRolePermissions(
        role,
        permissions.filter((permission) => permission.role === role).map((permission) => permission.moduleId)
      );
      continue;
    }

    const defaultModuleIds = permissions.filter((permission) => permission.role === role).map((permission) => permission.moduleId);
    const existingModuleIds = existing.map((permission) => permission.moduleId);
    const missingModuleIds = defaultModuleIds.filter((moduleId) => !existingModuleIds.includes(moduleId));
    const shouldPatchSchemaDefaults = role === "owner" || missingModuleIds.includes("approvals");

    if (shouldPatchSchemaDefaults && missingModuleIds.length > 0) {
      await repository.replaceAdminRolePermissions(role, Array.from(new Set([...existingModuleIds, ...missingModuleIds])));
    }
  }

  return permissions;
}

export async function authenticateAdminCredentials(repository: AdminRepository, email: string, password: string) {
  await ensureDefaultAdminAccounts(repository);
  await ensureDefaultAdminRolePermissions(repository);
  const account = await repository.findAdminAccountByEmail(normalizeAdminEmail(email));
  if (!account) return null;

  return (await verifyAdminPassword(password, account.passwordHash)) ? account : null;
}

export function createAdminSessionRecord(account: AdminAccount, now = new Date(), maxAgeSeconds = DEFAULT_ADMIN_SESSION_SECONDS): AdminSessionRecord {
  return {
    id: randomUUID(),
    actorId: account.id,
    expiresAt: new Date(now.getTime() + maxAgeSeconds * 1000).toISOString(),
    revokedAt: null
  };
}

export function adminAccountToActor(account: AdminAccount): AdminActor {
  return {
    id: account.id,
    name: account.displayName,
    role: account.role
  };
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}
