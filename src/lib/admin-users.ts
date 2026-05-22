import type { AuthMethod } from "./auth";
import { getWordbook, listWordbooks, type WordbookId } from "./wordbook-catalog";

export type AdminUserStatus = "active" | "watch" | "frozen";
export type AdminUserAction = "freeze" | "unfreeze" | "watch";

export type AdminUserAccountRecord = {
  id: string;
  displayName: string;
  grade: string;
  phone: string;
  wechatOpenId: string | null;
  authMethods: AuthMethod[];
  activeWordbook: WordbookId;
  status: AdminUserStatus;
  streak: number;
  parentBound: boolean;
  lastSeenAt: string;
  updatedAt: string;
  updatedBy: string;
};

const USER_STATUS_ORDER: Record<AdminUserStatus, number> = {
  watch: 0,
  frozen: 1,
  active: 2
};

const WORDBOOK_ORDER = listWordbooks().map((book) => book.id);

export const DEFAULT_ADMIN_USER_ACCOUNTS: AdminUserAccountRecord[] = [
  {
    id: "user-xiaomin",
    displayName: "小敏",
    grade: "六年级",
    phone: "13800138000",
    wechatOpenId: "mock-openid-xiaomin",
    authMethods: ["phone", "wechat"],
    activeWordbook: "primary",
    status: "active",
    streak: 18,
    parentBound: true,
    lastSeenAt: "2026-05-21T09:45:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "系统"
  },
  {
    id: "user-ryan",
    displayName: "Ryan",
    grade: "初三",
    phone: "13900139000",
    wechatOpenId: "mock-openid-ryan",
    authMethods: ["phone", "wechat"],
    activeWordbook: "zhongkao-1600",
    status: "watch",
    streak: 7,
    parentBound: true,
    lastSeenAt: "2026-05-21T09:30:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "客服"
  },
  {
    id: "user-emma",
    displayName: "Emma",
    grade: "高二",
    phone: "13700137000",
    wechatOpenId: null,
    authMethods: ["phone"],
    activeWordbook: "gaokao-3500",
    status: "watch",
    streak: 3,
    parentBound: false,
    lastSeenAt: "2026-05-21T08:20:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "安全策略"
  },
  {
    id: "user-leo",
    displayName: "Leo",
    grade: "雅思",
    phone: "13600136000",
    wechatOpenId: "mock-openid-leo",
    authMethods: ["wechat"],
    activeWordbook: "ielts",
    status: "active",
    streak: 31,
    parentBound: false,
    lastSeenAt: "2026-05-21T10:10:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "增长运营"
  }
];

export function isAdminUserStatus(value: string): value is AdminUserStatus {
  return ["active", "watch", "frozen"].includes(value);
}

export function isAdminUserAction(value: string): value is AdminUserAction {
  return ["freeze", "unfreeze", "watch"].includes(value);
}

export function isAuthMethod(value: string): value is AuthMethod {
  return value === "phone" || value === "wechat";
}

export function isAdminUserAccountRecord(value: unknown): value is AdminUserAccountRecord {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<AdminUserAccountRecord>;

  return (
    typeof user.id === "string" &&
    typeof user.displayName === "string" &&
    typeof user.grade === "string" &&
    typeof user.phone === "string" &&
    (user.wechatOpenId === null || typeof user.wechatOpenId === "string") &&
    Array.isArray(user.authMethods) &&
    user.authMethods.every((method) => typeof method === "string" && isAuthMethod(method)) &&
    typeof user.activeWordbook === "string" &&
    Boolean(getWordbook(user.activeWordbook)) &&
    typeof user.status === "string" &&
    isAdminUserStatus(user.status) &&
    typeof user.streak === "number" &&
    typeof user.parentBound === "boolean" &&
    typeof user.lastSeenAt === "string" &&
    typeof user.updatedAt === "string" &&
    typeof user.updatedBy === "string"
  );
}

export function sortAdminUserAccounts(users: AdminUserAccountRecord[]) {
  return [...users].sort((a, b) => {
    const statusDiff = USER_STATUS_ORDER[a.status] - USER_STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;

    const lastSeenDiff = new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
    if (lastSeenDiff !== 0) return lastSeenDiff;

    return WORDBOOK_ORDER.indexOf(a.activeWordbook) - WORDBOOK_ORDER.indexOf(b.activeWordbook);
  });
}

export function applyAdminUserAction(user: AdminUserAccountRecord, action: AdminUserAction, actor: string, now = new Date()): AdminUserAccountRecord {
  const nextStatus: Record<AdminUserAction, AdminUserStatus> = {
    freeze: "frozen",
    unfreeze: "active",
    watch: "watch"
  };

  return {
    ...user,
    status: nextStatus[action],
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}
