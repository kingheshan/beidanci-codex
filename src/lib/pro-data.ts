export type ProPlanId = "monthly" | "yearly" | "lifetime";
export type BillingChannel = "wechat" | "alipay" | "apple" | "demo";
export type BillingOrderStatus = "pending" | "paid" | "failed";

export type ProPlan = {
  id: ProPlanId;
  name: string;
  price: number;
  perMonth: number;
  save: number;
  tag?: string;
  popular?: boolean;
};

export type ProFeature = {
  icon: string;
  title: string;
  subtitle: string;
  free: string;
  pro: string;
};

export type ProCheckoutInput = {
  planId: ProPlanId;
  channel?: BillingChannel;
};

export type ProBillingOrder = {
  id: string;
  userId: string;
  customerName: string;
  planId: ProPlanId;
  planName: string;
  amountCny: number;
  channel: BillingChannel;
  status: BillingOrderStatus;
  createdAt: string;
  paidAt: string | null;
};

export type ProSubscription = {
  isPro: boolean;
  planId: ProPlanId | null;
  startedAt: string | null;
  expiresAt: string | null;
  sourceOrderId: string | null;
};

export type ProPaymentIntent = {
  provider: BillingChannel;
  status: BillingOrderStatus;
  message: string;
  checkoutUrl?: string;
};

export type ProCheckoutResult = {
  order: ProBillingOrder;
  subscription: ProSubscription;
  payment: ProPaymentIntent;
};

export const PRO_FEATURES: ProFeature[] = [
  { icon: "✨", title: "AI 每日故事", subtitle: "不限次数生成兴趣故事", free: "1 次/天", pro: "不限" },
  { icon: "📷", title: "拍照查词 OCR", subtitle: "课本整页圈词加入复习", free: "5 次/月", pro: "不限" },
  { icon: "🧠", title: "完整记忆图谱", subtitle: "词根、词族和联想节点", free: "基础", pro: "完整" },
  { icon: "🎯", title: "AI 个性化例句", subtitle: "根据兴趣生成真实语境", free: "限量", pro: "不限" },
  { icon: "⚔️", title: "单词 PK 段位赛", subtitle: "解锁高阶赛季奖励", free: "青铜", pro: "王者" },
  { icon: "🏆", title: "专属 Pro 徽章", subtitle: "排行榜身份标识", free: "无", pro: "专属" },
  { icon: "🚫", title: "去除全部广告", subtitle: "纯净学习体验", free: "有广告", pro: "无广告" },
  { icon: "📊", title: "深度学习数据", subtitle: "导出周报 / 月报 PDF", free: "基础", pro: "可导出 PDF" }
];

export const PRO_PLANS: ProPlan[] = [
  { id: "monthly", name: "月会员", price: 18, perMonth: 18, save: 0 },
  { id: "yearly", name: "年会员", price: 168, perMonth: 14, save: 22, tag: "最划算", popular: true },
  { id: "lifetime", name: "终身会员", price: 488, perMonth: 0, save: 0, tag: "一次买断" }
];

export function findProPlan(planId: ProPlanId) {
  return PRO_PLANS.find((plan) => plan.id === planId) ?? PRO_PLANS[1];
}

export function isProPlanId(value: unknown): value is ProPlanId {
  return value === "monthly" || value === "yearly" || value === "lifetime";
}

export function isBillingChannel(value: unknown): value is BillingChannel {
  return value === "wechat" || value === "alipay" || value === "apple" || value === "demo";
}
