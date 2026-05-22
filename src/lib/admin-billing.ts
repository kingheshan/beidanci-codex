import type { AdminRole } from "./admin-api";

export type AdminBillingPlan = "pro-monthly" | "pro-yearly" | "family-yearly" | "coupon";
export type AdminBillingChannel = "wechat" | "alipay" | "apple" | "coupon";
export type AdminBillingStatus = "paid" | "refund_requested" | "refunded" | "failed" | "comped";
export type AdminBillingEntitlementStatus = "active" | "pending-review" | "revoked" | "expired";
export type AdminBillingAction = "approve-refund";

export type AdminBillingOrderRecord = {
  id: string;
  userId: string;
  customerName: string;
  plan: AdminBillingPlan;
  amountCny: number;
  channel: AdminBillingChannel;
  status: AdminBillingStatus;
  entitlementStatus: AdminBillingEntitlementStatus;
  refundReason: string | null;
  couponCode: string | null;
  updatedAt: string;
  updatedBy: string;
};

export type AdminBillingSummary = {
  mrrCny: number;
  activeSubscriptionCount: number;
  refundRequestCount: number;
  refundAmountCny: number;
  couponActiveCount: number;
};

export const DEFAULT_ADMIN_BILLING_ORDERS: AdminBillingOrderRecord[] = [
  {
    id: "billing-refund-ryan",
    userId: "user-ryan",
    customerName: "Ryan 家长",
    plan: "pro-monthly",
    amountCny: 29,
    channel: "wechat",
    status: "refund_requested",
    entitlementStatus: "pending-review",
    refundReason: "家长误购后 24 小时内申请退款。",
    couponCode: null,
    updatedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "finance"
  },
  {
    id: "billing-pro-year-leo",
    userId: "user-leo",
    customerName: "Leo 家长",
    plan: "pro-yearly",
    amountCny: 199,
    channel: "wechat",
    status: "paid",
    entitlementStatus: "active",
    refundReason: null,
    couponCode: null,
    updatedAt: "2026-05-21T09:40:00.000Z",
    updatedBy: "system"
  },
  {
    id: "billing-family-emma",
    userId: "user-emma",
    customerName: "Emma 家长",
    plan: "family-yearly",
    amountCny: 299,
    channel: "alipay",
    status: "paid",
    entitlementStatus: "active",
    refundReason: null,
    couponCode: null,
    updatedAt: "2026-05-21T09:25:00.000Z",
    updatedBy: "system"
  },
  {
    id: "billing-coupon-school",
    userId: "user-school-001",
    customerName: "城市小学合作班",
    plan: "coupon",
    amountCny: 0,
    channel: "coupon",
    status: "comped",
    entitlementStatus: "active",
    refundReason: null,
    couponCode: "SCH-2026-0420",
    updatedAt: "2026-05-21T09:10:00.000Z",
    updatedBy: "ops"
  }
];

export function isAdminBillingAction(value: string): value is AdminBillingAction {
  return value === "approve-refund";
}

export function isAdminBillingOrderRecord(value: unknown): value is AdminBillingOrderRecord {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<AdminBillingOrderRecord>;

  return (
    typeof order.id === "string" &&
    typeof order.userId === "string" &&
    typeof order.customerName === "string" &&
    isAdminBillingPlan(order.plan) &&
    typeof order.amountCny === "number" &&
    isAdminBillingChannel(order.channel) &&
    isAdminBillingStatus(order.status) &&
    isAdminBillingEntitlementStatus(order.entitlementStatus) &&
    (order.refundReason === null || typeof order.refundReason === "string") &&
    (order.couponCode === null || typeof order.couponCode === "string") &&
    typeof order.updatedAt === "string" &&
    typeof order.updatedBy === "string"
  );
}

export function sortAdminBillingOrders(orders: AdminBillingOrderRecord[]) {
  return [...orders].sort((a, b) => {
    const statusDelta = getBillingStatusRank(a.status) - getBillingStatusRank(b.status);
    if (statusDelta) return statusDelta;

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function summarizeAdminBillingOrders(orders: AdminBillingOrderRecord[]): AdminBillingSummary {
  return {
    mrrCny: orders
      .filter((order) => order.status === "paid" && order.entitlementStatus === "active")
      .reduce((sum, order) => sum + order.amountCny, 0),
    activeSubscriptionCount: orders.filter((order) => order.entitlementStatus === "active").length,
    refundRequestCount: orders.filter((order) => order.status === "refund_requested").length,
    refundAmountCny: orders
      .filter((order) => order.status === "refund_requested")
      .reduce((sum, order) => sum + order.amountCny, 0),
    couponActiveCount: orders.filter((order) => order.channel === "coupon" && order.entitlementStatus === "active").length
  };
}

export function applyAdminBillingAction(order: AdminBillingOrderRecord, action: AdminBillingAction, actorRole: AdminRole): AdminBillingOrderRecord {
  if (action !== "approve-refund") return order;

  return {
    ...order,
    status: "refunded",
    entitlementStatus: "revoked",
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function isAdminBillingPlan(value: unknown): value is AdminBillingPlan {
  return value === "pro-monthly" || value === "pro-yearly" || value === "family-yearly" || value === "coupon";
}

function isAdminBillingChannel(value: unknown): value is AdminBillingChannel {
  return value === "wechat" || value === "alipay" || value === "apple" || value === "coupon";
}

function isAdminBillingStatus(value: unknown): value is AdminBillingStatus {
  return value === "paid" || value === "refund_requested" || value === "refunded" || value === "failed" || value === "comped";
}

function isAdminBillingEntitlementStatus(value: unknown): value is AdminBillingEntitlementStatus {
  return value === "active" || value === "pending-review" || value === "revoked" || value === "expired";
}

function getBillingStatusRank(status: AdminBillingStatus) {
  return ({ refund_requested: 0, paid: 1, comped: 2, failed: 3, refunded: 4 } satisfies Record<AdminBillingStatus, number>)[status];
}
