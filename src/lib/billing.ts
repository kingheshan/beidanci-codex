import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ApiError } from "./api-client";
import {
  findProPlan,
  type BillingChannel,
  type ProBillingOrder,
  type ProCheckoutInput,
  type ProCheckoutResult,
  type ProPlanId,
  type ProSubscription
} from "./pro-data";

export type BillingRepository = {
  createOrder: (order: ProBillingOrder) => Promise<ProBillingOrder>;
  readSubscription: (userId: string) => Promise<ProSubscription | null>;
  writeSubscription: (userId: string, subscription: ProSubscription) => Promise<ProSubscription>;
  reset: () => Promise<void>;
};

type BillingCheckoutOptions = {
  userId: string;
  customerName: string;
  now?: Date;
  repository?: BillingRepository;
  env?: Record<string, string | undefined>;
};

type BillingStoreSnapshot = {
  version: 1;
  orders: ProBillingOrder[];
  subscriptions: Array<ProSubscription & { userId: string }>;
};

const DEFAULT_BILLING_STORE_PATH = join(process.cwd(), ".cache", "billing-store.json");
const EMPTY_BILLING_STORE: BillingStoreSnapshot = {
  version: 1,
  orders: [],
  subscriptions: []
};
const globalBillingStore = globalThis as typeof globalThis & {
  __aishangBillingRepository?: BillingRepository;
  __aishangBillingMemory?: BillingStoreSnapshot;
};

export function createMemoryBillingRepository(initial: BillingStoreSnapshot = { ...EMPTY_BILLING_STORE, orders: [], subscriptions: [] }): BillingRepository {
  const snapshot = initial;

  return {
    async createOrder(order) {
      snapshot.orders = [order, ...snapshot.orders.filter((item) => item.id !== order.id)];
      return { ...order };
    },
    async readSubscription(userId) {
      const subscription = snapshot.subscriptions.find((item) => item.userId === userId);
      return subscription ? stripUserId(subscription) : null;
    },
    async writeSubscription(userId, subscription) {
      const record = { ...subscription, userId };
      snapshot.subscriptions = [record, ...snapshot.subscriptions.filter((item) => item.userId !== userId)];
      return stripUserId(record);
    },
    async reset() {
      snapshot.orders = [];
      snapshot.subscriptions = [];
    }
  };
}

export function createFileBillingRepository(filePath = DEFAULT_BILLING_STORE_PATH): BillingRepository {
  return {
    async createOrder(order) {
      const snapshot = await readBillingSnapshot(filePath);
      await writeBillingSnapshot(filePath, {
        version: 1,
        orders: [order, ...snapshot.orders.filter((item) => item.id !== order.id)],
        subscriptions: snapshot.subscriptions
      });
      return { ...order };
    },
    async readSubscription(userId) {
      const snapshot = await readBillingSnapshot(filePath);
      const subscription = snapshot.subscriptions.find((item) => item.userId === userId);
      return subscription ? stripUserId(subscription) : null;
    },
    async writeSubscription(userId, subscription) {
      const snapshot = await readBillingSnapshot(filePath);
      const record = { ...subscription, userId };
      await writeBillingSnapshot(filePath, {
        version: 1,
        orders: snapshot.orders,
        subscriptions: [record, ...snapshot.subscriptions.filter((item) => item.userId !== userId)]
      });
      return stripUserId(record);
    },
    async reset() {
      await rm(filePath, { force: true });
    }
  };
}

export async function createProCheckout(input: ProCheckoutInput, options: BillingCheckoutOptions): Promise<ProCheckoutResult> {
  const repository = options.repository ?? getDefaultBillingRepository();
  const now = options.now ?? new Date();
  const env = options.env ?? process.env;
  const mode = getBillingMode(env);
  const plan = findProPlan(input.planId);
  const channel = input.channel ?? (mode === "demo" ? "demo" : "wechat");
  const createdAt = now.toISOString();
  const status = mode === "demo" ? "paid" : "pending";
  const order: ProBillingOrder = {
    id: `bill_${randomUUID()}`,
    userId: options.userId,
    customerName: options.customerName,
    planId: plan.id,
    planName: plan.name,
    amountCny: plan.price,
    channel,
    status,
    createdAt,
    paidAt: status === "paid" ? createdAt : null
  };

  if (mode === "production" && !env.BILLING_CHECKOUT_URL) {
    throw new ApiError("支付渠道未配置", { status: 503, code: "BILLING_PROVIDER_NOT_CONFIGURED" });
  }

  await repository.createOrder(order);
  const subscription = status === "paid" ? await repository.writeSubscription(options.userId, createSubscription(plan.id, order.id, now)) : await readUserSubscription(options.userId, { repository });

  return {
    order,
    subscription,
    payment: {
      provider: mode === "demo" ? "demo" : channel,
      status,
      message: status === "paid" ? "演示环境已自动完成支付" : getPendingPaymentMessage(channel),
      ...(status === "pending" && env.BILLING_CHECKOUT_URL ? { checkoutUrl: env.BILLING_CHECKOUT_URL } : {})
    }
  };
}

export async function readUserSubscription(userId: string, options: { repository?: BillingRepository } = {}): Promise<ProSubscription> {
  return (await (options.repository ?? getDefaultBillingRepository()).readSubscription(userId)) ?? {
    isPro: false,
    planId: null,
    startedAt: null,
    expiresAt: null,
    sourceOrderId: null
  };
}

export async function resetBillingStoreForTests() {
  await getDefaultBillingRepository().reset();
  globalBillingStore.__aishangBillingRepository = undefined;
  globalBillingStore.__aishangBillingMemory = undefined;
}

function createSubscription(planId: ProPlanId, orderId: string, now: Date): ProSubscription {
  return {
    isPro: true,
    planId,
    startedAt: now.toISOString(),
    expiresAt: getSubscriptionExpiry(planId, now),
    sourceOrderId: orderId
  };
}

function getSubscriptionExpiry(planId: ProPlanId, now: Date) {
  if (planId === "lifetime") return null;
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + (planId === "yearly" ? 365 : 30));
  return expiresAt.toISOString();
}

function getBillingMode(env: Record<string, string | undefined>) {
  return env.BILLING_PROVIDER_MODE === "production" ? "production" : "demo";
}

function getPendingPaymentMessage(channel: BillingChannel) {
  if (channel === "alipay") return "订单已创建，等待支付宝确认";
  if (channel === "apple") return "订单已创建，等待 Apple IAP 确认";
  return "订单已创建，等待微信支付确认";
}

function getDefaultBillingRepository() {
  if (globalBillingStore.__aishangBillingRepository) return globalBillingStore.__aishangBillingRepository;

  if (process.env.NODE_ENV === "test") {
    const memory = globalBillingStore.__aishangBillingMemory ?? { ...EMPTY_BILLING_STORE, orders: [], subscriptions: [] };
    globalBillingStore.__aishangBillingMemory = memory;
    globalBillingStore.__aishangBillingRepository = createMemoryBillingRepository(memory);
    return globalBillingStore.__aishangBillingRepository;
  }

  globalBillingStore.__aishangBillingRepository = createFileBillingRepository(process.env.BILLING_STORE_PATH ?? DEFAULT_BILLING_STORE_PATH);
  return globalBillingStore.__aishangBillingRepository;
}

async function readBillingSnapshot(filePath: string): Promise<BillingStoreSnapshot> {
  try {
    const payload = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    if (!isBillingStoreSnapshot(payload)) return EMPTY_BILLING_STORE;
    return payload;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return EMPTY_BILLING_STORE;
    }
    throw error;
  }
}

async function writeBillingSnapshot(filePath: string, snapshot: BillingStoreSnapshot) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function stripUserId(subscription: ProSubscription & { userId: string }): ProSubscription {
  const { userId: _userId, ...rest } = subscription;
  return rest;
}

function isBillingStoreSnapshot(value: unknown): value is BillingStoreSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<BillingStoreSnapshot>;
  return snapshot.version === 1 && Array.isArray(snapshot.orders) && Array.isArray(snapshot.subscriptions);
}
