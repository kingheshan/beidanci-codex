"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_AI_USAGE_ROWS,
  ADMIN_AUDIT_LOGS,
  ADMIN_CATEGORY_LABELS,
  ADMIN_IMPORT_ROWS,
  ADMIN_KPIS,
  ADMIN_MISTAKE_ROWS,
  ADMIN_MODULES,
  ADMIN_OPERATIONS_ROWS,
  ADMIN_PROMPT_ROWS,
  ADMIN_SYSTEM_ROWS,
  ADMIN_TRAFFIC_SERIES,
  ADMIN_USER_ROWS,
  ADMIN_VOCABULARY_ROWS,
  ADMIN_WORDBOOK_ROWS,
  type AdminModule,
  type AdminModuleCategory,
  type AdminModuleId,
  type AdminTableRow
} from "@/lib/admin-data";
import type {
  AdminAccountsPayload,
  AdminActionPayload,
  AdminApprovalActionPayload,
  AdminApprovalsPayload,
  AdminBillingActionPayload,
  AdminBillingPayload,
  AdminCurriculumActionPayload,
  AdminCurriculumPayload,
  AdminDashboardActionPayload,
  AdminDashboardPayload,
  AdminAiUsageActionPayload,
  AdminAiUsagePayload,
  AdminAppConfigUpdatePayload,
  AdminAppConfigsPayload,
  AdminAuditPolicyActionPayload,
  AdminAuditPayload,
  AdminImportJobPayload,
  AdminImportQualityPayload,
  AdminMistakeActionPayload,
  AdminMistakesPayload,
  AdminModulePayload,
  AdminOperationActionPayload,
  AdminOperationsPayload,
  AdminOverviewPayload,
  AdminPromptCreatePayload,
  AdminPromptsPayload,
  AdminRole,
  AdminRoleUpdatePayload,
  AdminRolesPayload,
  AdminSafetyActionPayload,
  AdminSafetyPayload,
  AdminSessionRevokePayload,
  AdminSystemActionPayload,
  AdminSystemPayload,
  AdminUserActionPayload,
  AdminUsersPayload,
  AdminVocabularyIssuePayload,
  AdminVocabularyPayload,
  AdminWordbookReleasePayload,
  AdminWordbookReleasesPayload
} from "@/lib/admin-api";
import { DEFAULT_ADMIN_IMPORT_JOBS } from "@/lib/admin-content";
import { BookIcon, BrainIcon, CheckIcon, ChevronRightIcon, GemIcon, HomeIcon, SearchIcon, SparkleIcon, TrophyIcon, UserIcon, ZapIcon } from "@/components/icons";
import { Card, ProgressBar, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";

const CATEGORY_ORDER: AdminModuleCategory[] = ["overview", "users", "content", "ai", "governance", "growth", "platform"];

const MODULE_ICONS: Record<AdminModuleId, JSX.Element> = {
  dashboard: <HomeIcon size={17} />,
  users: <UserIcon size={17} />,
  wordbooks: <BookIcon size={17} />,
  vocabulary: <SearchIcon size={17} />,
  mistakes: <BrainIcon size={17} />,
  "ai-usage": <ZapIcon size={17} />,
  prompts: <SparkleIcon size={17} />,
  audit: <CheckIcon size={17} />,
  roles: <UserIcon size={17} />,
  approvals: <CheckIcon size={17} />,
  "import-quality": <BookIcon size={17} />,
  curriculum: <TrophyIcon size={17} />,
  operations: <SparkleIcon size={17} />,
  billing: <GemIcon size={17} />,
  safety: <BrainIcon size={17} />,
  system: <ZapIcon size={17} />
};

const HEALTH_LABELS = {
  healthy: { label: "正常", bg: "rgba(0,212,170,.12)", color: "var(--c-success)" },
  watch: { label: "观察", bg: "rgba(255,176,32,.14)", color: "var(--c-warning)" },
  risk: { label: "风险", bg: "rgba(255,90,111,.13)", color: "var(--c-danger)" }
} satisfies Record<AdminModule["health"], { label: string; bg: string; color: string }>;

type AdminActionHandler = (module: AdminModule, action: string) => void;
type AdminRoleDrafts = Partial<Record<AdminRole, AdminModuleId[]>>;
type AuditRiskFilter = "all" | "低" | "中" | "高";
type PendingAdminAction = {
  module: AdminModule;
  action: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCategoryModules(modules: AdminModule[], category: AdminModuleCategory) {
  return modules.filter((module) => module.category === category);
}

function isSensitiveAdminAction(action: string) {
  return /导出|退款|熔断|冻结|提权|回滚/.test(action);
}

function formatAdminTokens(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} tokens`;
}

function formatAdminCny(value: number) {
  return `¥${value.toFixed(2)}`;
}

function formatAdminWholeCny(value: number) {
  return `¥${Math.round(value).toLocaleString("en-US")}`;
}

function formatAdminPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatAiUsageAlertStatus(status: AdminAiUsagePayload["alerts"][number]["status"]) {
  const labels = {
    open: "待处理",
    mitigated: "已处理",
    resolved: "已关闭"
  } satisfies Record<AdminAiUsagePayload["alerts"][number]["status"], string>;

  return labels[status];
}

function formatAiUsageAlertKind(kind: AdminAiUsagePayload["alerts"][number]["kind"]) {
  const labels = {
    budget: "预算",
    latency: "延迟",
    "failure-rate": "失败率",
    quota: "额度"
  } satisfies Record<AdminAiUsagePayload["alerts"][number]["kind"], string>;

  return labels[kind];
}

function formatAiUsageAlertSeverity(severity: AdminAiUsagePayload["alerts"][number]["severity"]) {
  const labels = {
    high: "高",
    medium: "中",
    low: "低"
  } satisfies Record<AdminAiUsagePayload["alerts"][number]["severity"], string>;

  return labels[severity];
}

function formatAiUsageAlertValue(alert: AdminAiUsagePayload["alerts"][number], value: number) {
  if (alert.unit === "budget" || alert.unit === "percent") return formatAdminPercent(value * 100);
  if (alert.unit === "ms") return `${Math.round(value)}ms`;

  return `${Math.round(value).toLocaleString("en-US")} 次`;
}

function formatAuditAlertChannel(channel: AdminAuditPayload["policy"]["highRiskAlertChannel"]) {
  const labels = {
    "lark-email": "飞书 + 邮件",
    email: "邮件",
    disabled: "关闭"
  } satisfies Record<AdminAuditPayload["policy"]["highRiskAlertChannel"], string>;

  return labels[channel];
}

function formatAuditReviewStatus(status: AdminAuditPayload["policy"]["highRiskReviewStatus"]) {
  const labels = {
    pending: "待复核",
    reviewed: "已复核"
  } satisfies Record<AdminAuditPayload["policy"]["highRiskReviewStatus"], string>;

  return labels[status];
}

function formatSystemHealthStatus(status: AdminSystemPayload["checks"][number]["status"]) {
  const labels = {
    healthy: "正常",
    watch: "观察",
    risk: "风险",
    down: "中断"
  } satisfies Record<AdminSystemPayload["checks"][number]["status"], string>;

  return labels[status];
}

function formatSystemHealthService(service: AdminSystemPayload["checks"][number]["service"]) {
  const labels = {
    api: "API",
    deepseek: "DeepSeek",
    sms: "短信",
    wechat: "微信",
    ocr: "OCR",
    queue: "队列",
    cache: "缓存"
  } satisfies Record<AdminSystemPayload["checks"][number]["service"], string>;

  return labels[service];
}

function formatBillingPlan(plan: AdminBillingPayload["orders"][number]["plan"]) {
  const labels = {
    "pro-monthly": "PRO 月卡",
    "pro-yearly": "PRO 年卡",
    "family-yearly": "家庭年卡",
    coupon: "兑换码权益"
  } satisfies Record<AdminBillingPayload["orders"][number]["plan"], string>;

  return labels[plan];
}

function formatBillingStatus(status: AdminBillingPayload["orders"][number]["status"]) {
  const labels = {
    paid: "已支付",
    refund_requested: "退款申请",
    refunded: "已退款",
    failed: "失败",
    comped: "已赠送"
  } satisfies Record<AdminBillingPayload["orders"][number]["status"], string>;

  return labels[status];
}

function formatBillingEntitlementStatus(status: AdminBillingPayload["orders"][number]["entitlementStatus"]) {
  const labels = {
    active: "权益有效",
    "pending-review": "待复核",
    revoked: "权益已撤销",
    expired: "已过期"
  } satisfies Record<AdminBillingPayload["orders"][number]["entitlementStatus"], string>;

  return labels[status];
}

function formatBillingChannel(channel: AdminBillingPayload["orders"][number]["channel"]) {
  const labels = {
    wechat: "微信支付",
    alipay: "支付宝",
    apple: "Apple IAP",
    coupon: "兑换码"
  } satisfies Record<AdminBillingPayload["orders"][number]["channel"], string>;

  return labels[channel];
}

function formatCurriculumStatus(status: AdminCurriculumPayload["policies"][number]["status"]) {
  const labels = {
    active: "已启用",
    gray: "灰度中",
    draft: "待灰度"
  } satisfies Record<AdminCurriculumPayload["policies"][number]["status"], string>;

  return labels[status];
}

function formatCurriculumSrsProfile(profile: AdminCurriculumPayload["policies"][number]["srsProfile"]) {
  const labels = {
    light: "轻量复习",
    standard: "标准 SRS",
    exam: "考试强化",
    abroad: "留学学术"
  } satisfies Record<AdminCurriculumPayload["policies"][number]["srsProfile"], string>;

  return labels[profile];
}

function formatCurriculumWordbook(wordbookId: AdminCurriculumPayload["policies"][number]["wordbookId"]) {
  const labels = {
    primary: "小学词库",
    "zhongkao-1600": "中考 1600",
    "gaokao-3500": "高考 3500",
    ielts: "雅思",
    toefl: "托福",
    "new-concept": "新概念"
  } satisfies Record<AdminCurriculumPayload["policies"][number]["wordbookId"], string>;

  return labels[wordbookId];
}

function formatOperationKind(kind: AdminOperationsPayload["configs"][number]["kind"]) {
  const labels = {
    announcement: "公告",
    experiment: "实验",
    campaign: "活动",
    "feature-flag": "功能开关",
    slot: "资源位"
  } satisfies Record<AdminOperationsPayload["configs"][number]["kind"], string>;

  return labels[kind];
}

function formatOperationSurface(surface: AdminOperationsPayload["configs"][number]["surface"]) {
  const labels = {
    home: "首页",
    study: "学习",
    story: "故事",
    ocr: "OCR",
    billing: "订阅"
  } satisfies Record<AdminOperationsPayload["configs"][number]["surface"], string>;

  return labels[surface];
}

function formatOperationStatus(status: AdminOperationsPayload["configs"][number]["status"]) {
  const labels = {
    active: "已发布",
    draft: "草稿",
    scheduled: "已排期",
    paused: "已暂停"
  } satisfies Record<AdminOperationsPayload["configs"][number]["status"], string>;

  return labels[status];
}

function formatOperationAudience(audience: AdminOperationsPayload["configs"][number]["audience"]) {
  const labels = {
    all: "全部用户",
    free: "免费用户",
    pro: "PRO 用户",
    "new-users": "新用户",
    parents: "家长端"
  } satisfies Record<AdminOperationsPayload["configs"][number]["audience"], string>;

  return labels[audience];
}

function formatApprovalStatus(status: AdminApprovalsPayload["requests"][number]["status"]) {
  const labels = {
    pending: "待审批",
    approved: "已通过",
    rejected: "已驳回",
    expired: "已过期"
  } satisfies Record<AdminApprovalsPayload["requests"][number]["status"], string>;

  return labels[status];
}

function formatApprovalAction(action: AdminApprovalsPayload["requests"][number]["action"]) {
  return action;
}

function formatPromptStatus(status: AdminPromptsPayload["prompts"][number]["status"]) {
  const labels = {
    online: "线上",
    draft: "草稿",
    ab: "A/B 测试",
    archived: "归档"
  } satisfies Record<AdminPromptsPayload["prompts"][number]["status"], string>;

  return labels[status];
}

function formatWordbookStatus(status: AdminWordbookReleasesPayload["releases"][number]["status"]) {
  const labels = {
    published: "已发布",
    gray: "灰度中",
    draft: "草稿"
  } satisfies Record<AdminWordbookReleasesPayload["releases"][number]["status"], string>;

  return labels[status];
}

function formatVocabularyIssueStatus(status: AdminVocabularyPayload["issues"][number]["status"]) {
  const labels = {
    open: "待处理",
    reviewing: "复核中",
    fixed: "已修复"
  } satisfies Record<AdminVocabularyPayload["issues"][number]["status"], string>;

  return labels[status];
}

function formatVocabularySeverity(severity: AdminVocabularyPayload["issues"][number]["severity"]) {
  const labels = {
    high: "高",
    medium: "中",
    low: "低"
  } satisfies Record<AdminVocabularyPayload["issues"][number]["severity"], string>;

  return labels[severity];
}

function formatUserStatus(status: AdminUsersPayload["users"][number]["status"]) {
  const labels = {
    active: "正常",
    watch: "风控观察",
    frozen: "已冻结"
  } satisfies Record<AdminUsersPayload["users"][number]["status"], string>;

  return labels[status];
}

function formatUserAuthMethods(authMethods: AdminUsersPayload["users"][number]["authMethods"]) {
  const labels = {
    phone: "手机号",
    wechat: "微信"
  } satisfies Record<AdminUsersPayload["users"][number]["authMethods"][number], string>;

  return authMethods.map((method) => labels[method]).join(" + ");
}

function formatMistakeStatus(status: AdminMistakesPayload["insights"][number]["status"]) {
  const labels = {
    open: "待干预",
    watching: "干预中",
    resolved: "已关闭"
  } satisfies Record<AdminMistakesPayload["insights"][number]["status"], string>;

  return labels[status];
}

function formatMistakeSeverity(severity: AdminMistakesPayload["insights"][number]["severity"]) {
  const labels = {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级"
  } satisfies Record<AdminMistakesPayload["insights"][number]["severity"], string>;

  return labels[severity];
}

function formatAdminStudyMode(mode: AdminMistakesPayload["insights"][number]["mode"]) {
  const labels = {
    mc: "选择题",
    flip: "翻卡",
    spell: "拼写",
    listen: "听力",
    context: "情景",
    image: "图像"
  } satisfies Record<AdminMistakesPayload["insights"][number]["mode"], string>;

  return labels[mode];
}

function formatSafetyStatus(status: AdminSafetyPayload["reviews"][number]["status"]) {
  const labels = {
    pending: "待审核",
    blocked: "已拦截",
    approved: "已通过"
  } satisfies Record<AdminSafetyPayload["reviews"][number]["status"], string>;

  return labels[status];
}

function formatSafetyRiskType(riskType: AdminSafetyPayload["reviews"][number]["riskType"]) {
  const labels = {
    "minor-safety": "未成年人安全",
    privacy: "隐私字段",
    violence: "暴力表达",
    adult: "成人内容",
    "prompt-injection": "Prompt 注入"
  } satisfies Record<AdminSafetyPayload["reviews"][number]["riskType"], string>;

  return labels[riskType];
}

function formatSafetySurface(surface: AdminSafetyPayload["reviews"][number]["surface"]) {
  const labels = {
    story: "每日故事",
    example: "AI 例句",
    ocr: "OCR",
    "memory-map": "记忆星云",
    image: "图像联想"
  } satisfies Record<AdminSafetyPayload["reviews"][number]["surface"], string>;

  return labels[surface];
}

function StatusPill({ status }: { status: string }) {
  const danger = /风险|高危|待处理|待审核|需|冻结|拦截/.test(status);
  const warn = /观察|灰度|排队|上升|待/.test(status);
  const color = danger ? "var(--c-danger)" : warn ? "var(--c-warning)" : "var(--c-success)";
  const bg = danger ? "rgba(255,90,111,.12)" : warn ? "rgba(255,176,32,.14)" : "rgba(0,212,170,.12)";

  return <Tag color={color} bg={bg} size="xs">{status}</Tag>;
}

function ModuleButton({ module, active, onSelect }: { module: AdminModule; active: boolean; onSelect: (id: AdminModuleId) => void }) {
  const health = HEALTH_LABELS[module.health];
  return (
    <button
      type="button"
      onClick={() => onSelect(module.id)}
      className={cx(
        "group flex min-h-[50px] w-full items-center gap-3 rounded-[12px] px-3.5 text-left transition",
        active ? "bg-[var(--c-primary-soft)] text-[var(--c-primary)]" : "text-[var(--c-ink-soft)] hover:bg-[var(--c-bg)]"
      )}
      aria-label={`${module.label} ${module.description}`}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"
        style={{ background: active ? "#fff" : `color-mix(in srgb, ${module.accent} 12%, white)`, color: module.accent }}
      >
        {MODULE_ICONS[module.id]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-black">{module.label}</span>
        <span className="mt-0.5 block truncate text-[10px] font-bold text-[var(--c-ink-muted)]">{module.metric}</span>
      </span>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: health.color }} />
    </button>
  );
}

function AdminSidebar({ activeId, modules, onSelect }: { activeId: AdminModuleId; modules: AdminModule[]; onSelect: (id: AdminModuleId) => void }) {
  return (
    <aside className="hidden w-[292px] shrink-0 flex-col border-r border-[var(--c-line)] bg-white xl:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <Wordy size={42} pose="study" mood="happy" form="rocket" glow={false} />
        <div className="min-w-0">
          <div className="aibd-display text-[18px] leading-none">爱上背单词</div>
          <div className="mt-1 text-[10px] font-black tracking-[.12em] text-[var(--c-ink-muted)]">ADMIN OPS</div>
        </div>
      </div>
      <div className="aibd-scroll flex-1 overflow-auto px-2 pb-5">
        {CATEGORY_ORDER.map((category) => (
          <section key={category} className="mt-2">
            <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">
              {ADMIN_CATEGORY_LABELS[category]}
            </div>
            <div className="space-y-1">
              {formatCategoryModules(modules, category).map((module) => (
                <ModuleButton key={module.id} module={module} active={module.id === activeId} onSelect={onSelect} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function MobileModuleStrip({ activeId, modules, onSelect }: { activeId: AdminModuleId; modules: AdminModule[]; onSelect: (id: AdminModuleId) => void }) {
  return (
    <div className="aibd-scroll flex gap-2 overflow-x-auto border-b border-[var(--c-line)] bg-white px-4 py-3 xl:hidden">
      {modules.map((module) => (
        <button
          key={module.id}
          type="button"
          onClick={() => onSelect(module.id)}
          className={cx(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-pill px-3 text-[12px] font-black",
            module.id === activeId ? "bg-[var(--c-primary)] text-white" : "bg-[var(--c-bg)] text-[var(--c-ink-soft)]"
          )}
          aria-label={`${module.label} ${module.description}`}
        >
          {MODULE_ICONS[module.id]}
          {module.label}
        </button>
      ))}
    </div>
  );
}

function AdminHeader({ activeModule, search, onSearchChange }: { activeModule: AdminModule; search: string; onSearchChange: (value: string) => void }) {
  const health = HEALTH_LABELS[activeModule.health];
  return (
    <header className="border-b border-[var(--c-line)] bg-white/90 px-4 py-4 backdrop-blur-xl lg:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color={health.color} bg={health.bg} size="xs">{health.label}</Tag>
            <span className="text-[11px] font-bold text-[var(--c-ink-muted)]">{activeModule.owner}</span>
          </div>
          <h1 className="aibd-display mt-2 text-[28px] leading-tight lg:text-[34px]">管理员后台</h1>
          <p className="mt-1 max-w-[720px] text-[12px] font-semibold leading-relaxed text-[var(--c-ink-soft)]">
            {activeModule.description}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[13px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] px-3 lg:w-[280px]">
            <SearchIcon size={16} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="搜索用户 / 词条 / 日志"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-[var(--c-ink-muted)]"
            />
          </label>
          <button type="button" className="h-11 rounded-[13px] bg-[var(--c-primary)] px-4 text-[13px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)]">
            创建任务
          </button>
        </div>
      </div>
    </header>
  );
}

function KpiCard({ kpi }: { kpi: (typeof ADMIN_KPIS)[number] }) {
  return (
    <Card pad={18} radius={16}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-black tracking-[.04em] text-[var(--c-ink-muted)]">{kpi.label}</div>
          <div className="aibd-display-en mt-2 text-[30px] font-black leading-none" style={{ color: kpi.accent }}>{kpi.value}</div>
          <div className="mt-2 text-[11px] font-semibold text-[var(--c-ink-soft)]">{kpi.sub}</div>
        </div>
        <Tag color={kpi.accent} bg={`color-mix(in srgb, ${kpi.accent} 12%, white)`} size="xs">{kpi.trend}</Tag>
      </div>
    </Card>
  );
}

function TrafficBars({ traffic }: { traffic: typeof ADMIN_TRAFFIC_SERIES }) {
  return (
    <Card pad={20} radius={18} className="min-h-[260px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="aibd-display text-lg">学习与 AI 调用趋势</h3>
          <p className="mt-1 text-[11px] font-semibold text-[var(--c-ink-muted)]">最近 7 天活跃、学习会话和 AI 请求综合指数</p>
        </div>
        <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">实时</Tag>
      </div>
      <div className="flex h-[160px] items-end gap-3 rounded-[16px] bg-[var(--c-surface-soft)] p-4">
        {traffic.map((item) => (
          <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-[116px] w-full items-end rounded-pill bg-white">
              <div
                className="w-full rounded-pill bg-[linear-gradient(180deg,var(--c-primary),var(--c-mint))]"
                style={{ height: `${item.value}%` }}
                aria-label={`${item.day} ${item.value}`}
              />
            </div>
            <span className="text-[10px] font-black text-[var(--c-ink-muted)]">{item.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DataTable({ rows, title, actionLabel = "查看详情", pagination }: { rows: AdminTableRow[]; title: string; actionLabel?: string; pagination?: AdminModulePayload["pagination"] }) {
  return (
    <Card pad={0} radius={18} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--c-line)] px-5 py-4">
        <div>
          <h3 className="aibd-display text-lg">{title}</h3>
          {pagination ? <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">第 {pagination.page} / {Math.max(1, pagination.totalPages)} 页 · 共 {pagination.total} 行</div> : null}
        </div>
        <button type="button" className="shrink-0 text-[11px] font-black text-[var(--c-primary)]">{actionLabel}</button>
      </div>
      <div className="divide-y divide-[var(--c-line)]">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 px-5 py-4 text-[12px] sm:grid-cols-[1.25fr_0.7fr_0.7fr_86px] sm:items-center">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-black text-[var(--c-ink)]">{row.primary}</div>
              <div className="mt-1 truncate text-[11px] font-semibold text-[var(--c-ink-muted)]">{row.secondary}</div>
            </div>
            <div className="font-bold text-[var(--c-ink-soft)]">{row.value}</div>
            <div className="font-semibold text-[var(--c-ink-muted)]">{row.owner}</div>
            <StatusPill status={row.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ModuleHeader({ module, onAction }: { module: AdminModule; onAction?: AdminActionHandler }) {
  const health = HEALTH_LABELS[module.health];
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Tag color={health.color} bg={health.bg} size="xs">{health.label}</Tag>
            <span className="text-[11px] font-bold text-[var(--c-ink-muted)]">{module.metric}</span>
          </div>
          <h2 className="aibd-display text-[26px] leading-tight">{module.label}</h2>
          <p className="mt-1 max-w-[760px] text-[12px] font-semibold leading-relaxed text-[var(--c-ink-soft)]">{module.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {module.actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction?.(module, action)}
              className="h-10 rounded-[12px] bg-[var(--c-bg)] px-3.5 text-[12px] font-black text-[var(--c-primary)]"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewModule({
  activeModule,
  dashboardManagement,
  dashboardRefreshing,
  kpis,
  modules,
  traffic,
  onAction,
  onRefreshDashboard
}: {
  activeModule: AdminModule;
  dashboardManagement: AdminDashboardPayload | null;
  dashboardRefreshing: boolean;
  kpis: typeof ADMIN_KPIS;
  modules: AdminModule[];
  traffic: typeof ADMIN_TRAFFIC_SERIES;
  onAction: AdminActionHandler;
  onRefreshDashboard: () => void;
}) {
  const watchRows = dashboardManagement?.snapshot.riskRows ?? modules
    .filter((module) => module.health !== "healthy")
    .map((module) => ({
      id: module.id,
      primary: module.label,
      secondary: module.description,
      value: module.metric,
      status: HEALTH_LABELS[module.health].label,
      owner: module.owner
    }));

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={onAction} />
      <section className="flex flex-col gap-3 rounded-[18px] bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="aibd-display text-lg leading-tight">数据快照 · 更新 {dashboardManagement?.snapshot.updatedBy ?? "system"}</h3>
          <p className="mt-1 truncate text-[11px] font-semibold text-[var(--c-ink-muted)]">
            {dashboardManagement?.snapshot.updatedAt ?? "等待后台数据同步"}
          </p>
        </div>
        <button
          type="button"
          disabled={dashboardRefreshing}
          onClick={onRefreshDashboard}
          className="h-10 shrink-0 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
        >
          {dashboardRefreshing ? "刷新中..." : "刷新看板"}
        </button>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <TrafficBars traffic={traffic} />
        <Card pad={20} radius={18}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="aibd-display text-lg">风险与待办</h3>
            <Tag color="var(--c-warning)" bg="rgba(255,176,32,.14)" size="xs">SLA 4h</Tag>
          </div>
          <div className="space-y-3">
            {watchRows.map((row) => (
              <div key={row.id} className="rounded-[14px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black text-[var(--c-ink)]">{row.primary}</div>
                  <StatusPill status={row.status} />
                </div>
                <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-muted)]">{row.secondary}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <AdminMiniPanel title="本周重点" value="词书导入验收" sub="完成 6 套词书全量数据后，下一步是抽样质检和版权留痕。" />
        <AdminMiniPanel title="需要补齐" value="RBAC + 审批流" sub="上线前必须限制 Prompt、导出、退款、词书发布等高危操作权限。" />
        <AdminMiniPanel title="后端边界" value="Admin API" sub="建议拆出 /api/v1/admin/*，统一鉴权、审计、分页和导出。" />
      </section>
    </div>
  );
}

function AdminMiniPanel({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <Card pad={18} radius={16}>
      <div className="text-[11px] font-black text-[var(--c-ink-muted)]">{title}</div>
      <div className="mt-2 text-[16px] font-black text-[var(--c-ink)]">{value}</div>
      <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[var(--c-ink-soft)]">{sub}</p>
    </Card>
  );
}

function MiniMetric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-[13px] bg-[var(--c-surface-soft)] p-3">
      <div className="text-[10px] font-black text-[var(--c-ink-muted)]">{title}</div>
      <div className="mt-1 text-[18px] font-black text-[var(--c-ink)]">{value}</div>
      <div className="mt-1 text-[10px] font-semibold text-[var(--c-ink-soft)]">{sub}</div>
    </div>
  );
}

function getDetailRows(context: ModuleRenderContext, moduleId: AdminModuleId, fallback: AdminTableRow[]) {
  return context.detail?.module.id === moduleId ? context.detail.rows : fallback;
}

function getDetailTitle(context: ModuleRenderContext, moduleId: AdminModuleId, fallback: string) {
  return context.detail?.module.id === moduleId ? context.detail.title : fallback;
}

function getDetailPagination(context: ModuleRenderContext, moduleId: AdminModuleId) {
  return context.detail?.module.id === moduleId ? context.detail.pagination : undefined;
}

function WordbooksModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const releases = context.wordbookManagement?.releases ?? [];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">词书发布中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">六套词书版本、授权来源、质量分和灰度状态统一留痕</div>
          </div>
          <button
            type="button"
            disabled={context.wordbookPublishing}
            onClick={context.onPublishWordbookRelease}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.wordbookPublishing ? "发布中..." : "发布今日版本"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {releases.length ? releases.map((release) => (
            <article key={release.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{release.title} · {release.version}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{release.total.toLocaleString("en-US")} 词 · {release.cefr}</div>
                </div>
                <StatusPill status={formatWordbookStatus(release.status)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="质量分" value={`${Math.round(release.qualityScore * 100)}%`} sub="释义/音标/例句" />
                <MiniMetric title="待处理" value={`${release.issueCount}`} sub="抽检问题" />
              </div>
              <p className="mt-3 line-clamp-2 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{release.source}</p>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">词书版本数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={getDetailRows(context, "wordbooks", ADMIN_WORDBOOK_ROWS)} title={getDetailTitle(context, "wordbooks", "词书版本与发布")} actionLabel="导出目录" pagination={getDetailPagination(context, "wordbooks")} />
    </div>
  );
}

function UsersModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const users = context.userManagement?.users ?? [];
  const liveUserLabels = new Set(users.map((user) => `${user.displayName} · ${user.grade}`));
  const tableRows = getDetailRows(context, "users", ADMIN_USER_ROWS).filter((row) => !liveUserLabels.has(row.primary));

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">用户账号中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">手机号、微信登录、词书状态、家长绑定和风控状态统一管理</div>
          </div>
          <button
            type="button"
            disabled={context.userFreezing}
            onClick={context.onFreezeUserAccount}
            className="h-10 rounded-[12px] bg-[var(--c-danger)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.userFreezing ? "冻结中..." : "冻结风险账号"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {users.length ? users.map((user) => (
            <article key={user.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{user.displayName} · {user.grade}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{formatUserAuthMethods(user.authMethods)}</div>
                </div>
                <StatusPill status={formatUserStatus(user.status)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="连续学习" value={`${user.streak} 天`} sub={user.parentBound ? "已绑定家长" : "未绑定家长"} />
                <MiniMetric title="当前词书" value={user.activeWordbook} sub={user.phone} />
              </div>
              <p className="mt-3 truncate text-[11px] font-semibold text-[var(--c-ink-soft)]">最近在线 {user.lastSeenAt} · 更新 {user.updatedBy}</p>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">用户账号数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={tableRows} title={getDetailTitle(context, "users", "用户列表与账号状态")} actionLabel="导出用户" pagination={getDetailPagination(context, "users")} />
    </div>
  );
}

function MistakesModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const insights = context.mistakeManagement?.insights ?? [];
  const totalWrong = insights.reduce((sum, insight) => sum + insight.wrongCount, 0);
  const affectedUsers = insights.reduce((sum, insight) => sum + insight.affectedUsers, 0);
  const avgMastery = insights.length ? insights.reduce((sum, insight) => sum + insight.masteryAvg, 0) / insights.length : 0;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">错题归因中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">按错因、模式、受影响用户和掌握度生成干预任务</div>
          </div>
          <button
            type="button"
            disabled={context.mistakeIntervening}
            onClick={context.onCreateMistakeIntervention}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.mistakeIntervening ? "创建中..." : "创建干预任务"}
          </button>
        </div>
        <div className="grid gap-3 border-b border-[var(--c-line)] p-4 lg:grid-cols-3">
          <MiniMetric title="错误总量" value={totalWrong.toLocaleString("en-US")} sub="近 7 天归因样本" />
          <MiniMetric title="影响用户" value={`${affectedUsers} 人`} sub="去重学习账号" />
          <MiniMetric title="平均掌握度" value={`${Math.round(avgMastery * 100)}%`} sub="干预优先级参考" />
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {insights.length ? insights.map((insight) => (
            <article key={insight.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{insight.category} · {insight.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[var(--c-ink-muted)]">
                    <span>{formatAdminStudyMode(insight.mode)}</span>
                    <span>{insight.affectedUsers} 人受影响</span>
                  </div>
                </div>
                <StatusPill status={formatMistakeStatus(insight.status)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag color="var(--c-danger)" bg="rgba(255,90,111,.12)" size="xs">{formatMistakeSeverity(insight.severity)}</Tag>
                <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{insight.wrongCount} 次错误</Tag>
                <Tag color="var(--c-warning)" bg="rgba(255,176,32,.14)" size="xs">掌握度 {Math.round(insight.masteryAvg * 100)}%</Tag>
              </div>
              <p className="mt-3 line-clamp-2 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{insight.recommendation}</p>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">错题归因数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={getDetailRows(context, "mistakes", ADMIN_MISTAKE_ROWS)} title={getDetailTitle(context, "mistakes", "错题类型排行")} actionLabel="导出归因" pagination={getDetailPagination(context, "mistakes")} />
    </div>
  );
}

type ModuleRenderContext = {
  kpis: typeof ADMIN_KPIS;
  modules: AdminModule[];
  traffic: typeof ADMIN_TRAFFIC_SERIES;
  dashboardManagement: AdminDashboardPayload | null;
  dashboardRefreshing: boolean;
  auditLogs: typeof ADMIN_AUDIT_LOGS;
  auditPolicy: AdminAuditPayload["policy"] | null;
  aiUsage: AdminAiUsagePayload | null;
  aiUsageMitigating: boolean;
  auditExporting: boolean;
  auditReviewing: boolean;
  auditRetentionUpdating: boolean;
  auditRiskFilter: AuditRiskFilter;
  accountManagement: AdminAccountsPayload | null;
  userManagement: AdminUsersPayload | null;
  userFreezing: boolean;
  mistakeManagement: AdminMistakesPayload | null;
  mistakeIntervening: boolean;
  safetyManagement: AdminSafetyPayload | null;
  safetyBlocking: boolean;
  systemHealth: AdminSystemPayload | null;
  systemChecking: boolean;
  billingManagement: AdminBillingPayload | null;
  billingProcessing: boolean;
  curriculumManagement: AdminCurriculumPayload | null;
  curriculumStarting: boolean;
  operationsManagement: AdminOperationsPayload | null;
  operationsPublishing: boolean;
  appConfigManagement: AdminAppConfigsPayload | null;
  appConfigSaving: boolean;
  approvalsManagement: AdminApprovalsPayload | null;
  approvalResolving: boolean;
  detail: AdminModulePayload | null;
  promptCreating: boolean;
  promptManagement: AdminPromptsPayload | null;
  wordbookManagement: AdminWordbookReleasesPayload | null;
  wordbookPublishing: boolean;
  vocabularyManagement: AdminVocabularyPayload | null;
  vocabularyScanning: boolean;
  importQuality: AdminImportQualityPayload | null;
  importStarting: boolean;
  onAuditRiskChange: (risk: AuditRiskFilter) => void;
  onAction: AdminActionHandler;
  onRefreshDashboard: () => void;
  onReviewHighRiskAudit: () => void;
  onExtendAuditRetention: () => void;
  onMitigateAiUsageAlert: () => void;
  onCreatePromptVersion: () => void;
  onStartVocabularyScan: () => void;
  onExportAuditLogs: () => void;
  onPublishWordbookRelease: () => void;
  onRerunImportJob: () => void;
  onFreezeUserAccount: () => void;
  onCreateMistakeIntervention: () => void;
  onBlockSafetyReview: () => void;
  onRunSystemHealthCheck: () => void;
  onProcessBillingRefund: () => void;
  onStartCurriculumGray: () => void;
  onPublishOperationAnnouncement: () => void;
  onSaveAppConfig: (key: string, payloadJson: string) => void;
  onResolveApprovalRequest: () => void;
  onRevokeSession: (sessionId: string) => void;
  onSaveRolePermissions: (role: AdminRole) => void;
  onSelectRole: (role: AdminRole) => void;
  onToggleRoleModule: (role: AdminRole, moduleId: AdminModuleId) => void;
  roleDrafts: AdminRoleDrafts;
  roleManagement: AdminRolesPayload | null;
  roleSaving: boolean;
  selectedRole: AdminRole;
};

function PromptModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const prompts = context.promptManagement?.prompts ?? [];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">Prompt 版本库</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">DeepSeek 生产 Prompt 留存、审计和回滚基础数据</div>
          </div>
          <button
            type="button"
            disabled={context.promptCreating}
            onClick={context.onCreatePromptVersion}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.promptCreating ? "创建中..." : "创建专业版本"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {prompts.length ? prompts.map((prompt) => (
            <article key={prompt.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{prompt.title} · v{prompt.version}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{prompt.notes || "未填写版本备注"}</div>
                </div>
                <StatusPill status={formatPromptStatus(prompt.status)} />
              </div>
              <p className="mt-3 line-clamp-3 whitespace-pre-line text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{prompt.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {prompt.safetyRules.slice(0, 4).map((rule) => (
                  <Tag key={rule} color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{rule}</Tag>
                ))}
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">Prompt 版本数据加载中</div>
          )}
        </div>
      </Card>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable rows={getDetailRows(context, "prompts", ADMIN_PROMPT_ROWS)} title={getDetailTitle(context, "prompts", "Prompt 版本")} actionLabel="打开评测集" pagination={getDetailPagination(context, "prompts")} />
        <Card pad={20} radius={18}>
          <h3 className="aibd-display text-lg">上线前检查</h3>
          <div className="mt-4 space-y-3">
            {["结构化 JSON 输出", "K12 安全语料约束", "年级难度分层", "版本回滚", "A/B 质量评测"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-[13px] bg-[var(--c-surface-soft)] p-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--c-primary-soft)] text-[11px] font-black text-[var(--c-primary)]">{index + 1}</span>
                <span className="text-[12px] font-black text-[var(--c-ink)]">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function AiUsageModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const summary = context.aiUsage?.summary;
  const events = context.aiUsage?.events ?? [];
  const alerts = context.aiUsage?.alerts ?? [];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-3">
        <AdminMiniPanel
          title="实时 tokens"
          value={summary ? formatAdminTokens(summary.totalTokens) : "1.28M tokens"}
          sub={summary ? `Prompt ${formatAdminTokens(summary.promptTokens)} / Completion ${formatAdminTokens(summary.completionTokens)}` : "DeepSeek 日调用统计加载中。"}
        />
        <AdminMiniPanel
          title="预算消耗"
          value={summary ? formatAdminCny(summary.estimatedCostCny) : "72%"}
          sub={summary ? `日预算 ${formatAdminCny(summary.budgetCny)}，已用 ${formatAdminPercent(summary.budgetUsedPercent)}。` : "DeepSeek 日预算 ¥670，超过 85% 自动触发降级。"}
        />
        <AdminMiniPanel
          title="失败率"
          value={summary ? formatAdminPercent(summary.failureRate) : "0.64%"}
          sub={summary ? `近 ${summary.totalCalls} 次调用，平均延迟 ${summary.averageLatencyMs}ms。` : "主要来自网络超时，已保留 mock fallback 和重试边界。"}
        />
      </section>
      {events.length ? (
        <Card pad={0} radius={18} className="overflow-hidden">
          <div className="border-b border-[var(--c-line)] px-5 py-4">
            <h3 className="aibd-display text-lg">实时调用明细</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">来自服务端 DeepSeek adapter 的最近调用窗口</div>
          </div>
          <div className="divide-y divide-[var(--c-line)]">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="grid gap-3 px-5 py-4 text-[12px] sm:grid-cols-[1fr_120px_90px_100px] sm:items-center">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-black text-[var(--c-ink)]">{event.feature} · {event.status}</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-[var(--c-ink-muted)]">{event.model} · {event.createdAt}</div>
                </div>
                <div className="font-black text-[var(--c-ink-soft)]">{formatAdminTokens(event.totalTokens)}</div>
                <div className="font-bold text-[var(--c-ink-muted)]">{event.latencyMs}ms</div>
                <StatusPill status={event.status === "error" ? "失败" : "成功"} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--c-line)] px-5 py-4">
          <div>
            <h3 className="aibd-display text-lg">AI 预算告警</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">预算、延迟、失败率和额度策略统一留痕</div>
          </div>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">DeepSeek Governance</Tag>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {alerts.length ? alerts.map((alert) => (
            <article key={alert.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{alert.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[var(--c-ink-muted)]">
                    <span>{formatAiUsageAlertKind(alert.kind)}</span>
                    <span>{alert.feature === "all" ? "全能力" : alert.feature}</span>
                  </div>
                </div>
                <StatusPill status={formatAiUsageAlertStatus(alert.status)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag color="var(--c-danger)" bg="rgba(255,90,111,.12)" size="xs">{formatAiUsageAlertSeverity(alert.severity)}优先级</Tag>
                <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">当前 {formatAiUsageAlertValue(alert, alert.currentValue)}</Tag>
                <Tag color="var(--c-warning)" bg="rgba(255,176,32,.14)" size="xs">阈值 {formatAiUsageAlertValue(alert, alert.threshold)}</Tag>
              </div>
              <p className="mt-3 min-h-[40px] text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{alert.recommendation}</p>
              {alert.id === "ai-budget-deepseek-daily" ? (
                <button
                  type="button"
                  onClick={context.onMitigateAiUsageAlert}
                  disabled={context.aiUsageMitigating}
                  className="mt-4 h-10 w-full rounded-[13px] bg-[var(--c-primary)] text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
                >
                  {context.aiUsageMitigating ? "处理中..." : "启用降级策略"}
                </button>
              ) : null}
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">AI 用量告警加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={getDetailRows(context, "ai-usage", ADMIN_AI_USAGE_ROWS)} title={getDetailTitle(context, "ai-usage", "AI 能力用量")} actionLabel="查看调用明细" pagination={getDetailPagination(context, "ai-usage")} />
    </div>
  );
}

function AuditModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const filters: Array<{ label: string; value: AuditRiskFilter }> = [
    { label: "全部", value: "all" },
    { label: "高风险", value: "高" },
    { label: "中风险", value: "中" },
    { label: "低风险", value: "低" }
  ];
  const policy = context.auditPolicy;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card pad={0} radius={18} className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="aibd-display text-lg">最近审计日志</h3>
              <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">按风险等级筛选并导出当前结果</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => context.onAuditRiskChange(filter.value)}
                  className={cx(
                    "h-9 rounded-[12px] px-3 text-[11px] font-black transition",
                    context.auditRiskFilter === filter.value ? "bg-[var(--c-primary)] text-white" : "bg-[var(--c-surface-soft)] text-[var(--c-ink-soft)]"
                  )}
                >
                  {filter.label}
                </button>
              ))}
              <button
                type="button"
                disabled={context.auditExporting}
                onClick={context.onExportAuditLogs}
                className="h-9 rounded-[12px] bg-[var(--c-ink)] px-3 text-[11px] font-black text-white disabled:opacity-60"
              >
                {context.auditExporting ? "导出中..." : "导出当前审计日志"}
              </button>
            </div>
          </div>
          <div className="divide-y divide-[var(--c-line)]">
            {context.auditLogs.length ? context.auditLogs.map((log) => (
              <div key={log.id} className="grid gap-3 px-5 py-4 text-[12px] sm:grid-cols-[70px_1fr_74px] sm:items-center">
                <div className="aibd-display-en font-black text-[var(--c-primary)]">{log.time}</div>
                <div>
                  <div className="font-black text-[var(--c-ink)]">{log.actor} · {log.action}</div>
                  <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-muted)]">{log.target}</div>
                </div>
                <StatusPill status={`${log.risk}风险`} />
              </div>
            )) : (
              <div className="px-5 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">暂无匹配的审计日志</div>
            )}
          </div>
        </Card>
        <Card pad={20} radius={18}>
          <h3 className="aibd-display text-lg">审计策略</h3>
          <div className="mt-4 space-y-3">
            <AdminPolicyRow label="敏感导出" value={policy?.sensitiveExportPolicy ?? "双人审批"} />
            <AdminPolicyRow label="Prompt 发布" value={policy?.promptReleasePolicy ?? "自动留存 diff"} />
            <AdminPolicyRow label="日志保留" value={`${policy?.retentionDays ?? 365} 天`} />
            <AdminPolicyRow label="高危告警" value={policy ? formatAuditAlertChannel(policy.highRiskAlertChannel) : "飞书 + 邮件"} />
            <AdminPolicyRow label="高危复核" value={policy ? formatAuditReviewStatus(policy.highRiskReviewStatus) : "待复核"} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button
              type="button"
              disabled={context.auditReviewing}
              onClick={context.onReviewHighRiskAudit}
              className="h-10 rounded-[12px] bg-[var(--c-primary)] px-3 text-[11px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
            >
              {context.auditReviewing ? "复核中..." : "复核高危日志"}
            </button>
            <button
              type="button"
              disabled={context.auditRetentionUpdating}
              onClick={context.onExtendAuditRetention}
              className="h-10 rounded-[12px] bg-[var(--c-ink)] px-3 text-[11px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
            >
              {context.auditRetentionUpdating ? "更新中..." : "延长保留期"}
            </button>
          </div>
          {policy?.highRiskReviewedAt ? (
            <p className="mt-3 text-[11px] font-semibold leading-5 text-[var(--c-ink-muted)]">最近由 {policy.highRiskReviewedBy} 在 {new Date(policy.highRiskReviewedAt).toLocaleString("zh-CN")} 完成高危日志复核。</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

function AdminPolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[13px] bg-[var(--c-surface-soft)] p-3">
      <span className="text-[12px] font-bold text-[var(--c-ink-soft)]">{label}</span>
      <span className="text-[12px] font-black text-[var(--c-ink)]">{value}</span>
    </div>
  );
}

function VocabularyModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const issues = context.vocabularyManagement?.issues ?? [];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">词库质检队列</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">释义、音标、例句、图像联想和重复词的真实待办队列</div>
          </div>
          <button
            type="button"
            disabled={context.vocabularyScanning}
            onClick={context.onStartVocabularyScan}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.vocabularyScanning ? "扫描中..." : "启动质量扫描"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {issues.length ? issues.map((issue) => (
            <article key={issue.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{issue.word} · {issue.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{issue.bookId} · {issue.owner}</div>
                </div>
                <StatusPill status={formatVocabularyIssueStatus(issue.status)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{issue.kind}</Tag>
                <Tag color="var(--c-warning)" bg="rgba(255,176,32,.14)" size="xs">{formatVocabularySeverity(issue.severity)}优先级</Tag>
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">词库质检数据加载中</div>
          )}
        </div>
      </Card>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card pad={18} radius={16}>
          <div className="mb-3 text-[11px] font-black text-[var(--c-ink-muted)]">全量词库覆盖</div>
          <div className="aibd-display-en text-[30px] font-black text-[var(--c-coral)]">17,100</div>
          <ProgressBar value={1} height={8} color="var(--c-coral)" label="全量词库覆盖" />
        </Card>
        <AdminMiniPanel title="质量目标" value="98% 完整度" sub="释义、音标、词性、例句、标签、学习模式素材需分层验收。" />
        <AdminMiniPanel title="抽检节奏" value="每日 300 词" sub="优先抽检中高频词、考试词、AI 图像联想缺口。" />
      </section>
      <DataTable rows={getDetailRows(context, "vocabulary", ADMIN_VOCABULARY_ROWS)} title={getDetailTitle(context, "vocabulary", "词库质量队列")} actionLabel="创建质检任务" pagination={getDetailPagination(context, "vocabulary")} />
    </div>
  );
}

function SafetyModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const reviews = context.safetyManagement?.reviews ?? [];
  const pendingCount = reviews.filter((review) => review.status === "pending").length;
  const blockedCount = reviews.filter((review) => review.status === "blocked").length;
  const highCount = reviews.filter((review) => review.severity === "high").length;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Card pad={0} radius={18} className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="aibd-display text-lg">安全审核队列</h3>
              <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">AI 故事、例句、OCR 和记忆图谱的未成年人安全审核</div>
            </div>
            <button
              type="button"
              disabled={context.safetyBlocking}
              onClick={context.onBlockSafetyReview}
              className="h-10 rounded-[12px] bg-[var(--c-danger)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
            >
              {context.safetyBlocking ? "处理中..." : "处理高危内容"}
            </button>
          </div>
          <div className="grid gap-3 border-b border-[var(--c-line)] p-4 sm:grid-cols-3">
            <MiniMetric title="待审核" value={`${pendingCount}`} sub={`高危 ${highCount}`} />
            <MiniMetric title="拦截数" value={`${blockedCount}`} sub="策略拦截" />
            <MiniMetric title="审核项" value={`${reviews.length || 4}`} sub="近 7 天样本" />
          </div>
          <div className="divide-y divide-[var(--c-line)]">
            {reviews.length ? reviews.map((review) => (
              <article key={review.id} className="grid gap-3 px-5 py-4 text-[12px] xl:grid-cols-[1fr_124px_92px] xl:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-[13px] font-black text-[var(--c-ink)]">{review.title}</div>
                    <StatusPill status={formatSafetyStatus(review.status)} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[var(--c-ink-muted)]">
                    <span>{formatSafetyRiskType(review.riskType)}</span>
                    <span>{formatSafetySurface(review.surface)}</span>
                    <span>{review.owner}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{review.sample}</p>
                </div>
                <Tag color={review.severity === "high" ? "var(--c-danger)" : "var(--c-warning)"} bg={review.severity === "high" ? "rgba(255,90,111,.12)" : "rgba(255,176,32,.14)"} size="xs">
                  {review.severity === "high" ? "高风险" : review.severity === "medium" ? "中风险" : "低风险"}
                </Tag>
                <div className="text-[11px] font-black text-[var(--c-ink-soft)]">{review.aiDecision}</div>
              </article>
            )) : (
              <div className="px-5 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">安全审核数据加载中</div>
            )}
          </div>
        </Card>
        <Card pad={20} radius={18}>
          <h3 className="aibd-display text-lg">未成年人保护</h3>
          <div className="mt-4 space-y-3">
            <AdminPolicyRow label="AI 输出抽检" value={`${reviews.length || 4} 项`} />
            <AdminPolicyRow label="隐私字段" value="默认脱敏" />
            <AdminPolicyRow label="夜间提醒" value="22:00 后收敛" />
            <AdminPolicyRow label="家长绑定" value="高风险操作确认" />
            <AdminPolicyRow label="内容分级" value="按年级过滤" />
          </div>
        </Card>
      </section>
    </div>
  );
}

function GenericModule({ activeModule, rows, title, context }: { activeModule: AdminModule; rows: AdminTableRow[]; title: string; context: ModuleRenderContext }) {
  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <DataTable rows={getDetailRows(context, activeModule.id, rows)} title={getDetailTitle(context, activeModule.id, title)} pagination={getDetailPagination(context, activeModule.id)} />
    </div>
  );
}

function ImportQualityModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const jobs = context.importQuality?.jobs ?? DEFAULT_ADMIN_IMPORT_JOBS;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">导入任务队列</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">词书数据源同步、进度、错误数和重跑动作统一审计</div>
          </div>
          <button
            type="button"
            disabled={context.importStarting}
            onClick={context.onRerunImportJob}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.importStarting ? "启动中..." : "重跑 ECDICT 导入"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {jobs.length ? jobs.map((job) => (
            <article key={job.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{job.source} · {job.status}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{job.bookId} · {job.totalRows.toLocaleString("en-US")} rows</div>
                </div>
                <StatusPill status={job.status} />
              </div>
              <div className="mt-3">
                <ProgressBar value={job.progress} height={8} color="var(--c-primary)" label={`${job.source} 进度`} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="错误数" value={`${job.errorCount}`} sub="需处理行" />
                <MiniMetric title="进度" value={`${Math.round(job.progress * 100)}%`} sub="导入完成度" />
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">导入任务数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={getDetailRows(context, "import-quality", ADMIN_IMPORT_ROWS)} title={getDetailTitle(context, "import-quality", "导入任务与数据质量")} actionLabel="查看差异" pagination={getDetailPagination(context, "import-quality")} />
    </div>
  );
}

function CurriculumModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const fallbackRows: AdminTableRow[] = [
    { id: "c-01", primary: "小学轻量计划", secondary: "每日 8 新词 + 8 复习", value: "启用", status: "正常", owner: "教研" },
    { id: "c-02", primary: "中考冲刺计划", secondary: "每日 20 新词 + 错题优先", value: "启用", status: "灰度", owner: "教研" },
    { id: "c-03", primary: "高考阅读计划", secondary: "语境题权重提升 20%", value: "启用", status: "正常", owner: "学习算法" },
    { id: "c-04", primary: "雅思托福计划", secondary: "听力 + 学术搭配优先", value: "排期", status: "待评测", owner: "留学线" }
  ];
  const policies = context.curriculumManagement?.policies ?? [];
  const summary = context.curriculumManagement?.summary;
  const rows: AdminTableRow[] = policies.length ? policies.map((policy) => ({
    id: policy.id,
    primary: policy.title,
    secondary: `${formatCurriculumWordbook(policy.wordbookId)} · ${policy.gradeBand} · ${policy.dailyNewWords} 新词`,
    value: `${policy.rolloutPercent}%`,
    status: formatCurriculumStatus(policy.status),
    owner: policy.owner
  })) : fallbackRows;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-4">
        <AdminMiniPanel title="策略总数" value={summary ? `${summary.total}` : "4"} sub="按词书和学习阶段配置" />
        <AdminMiniPanel title="已启用" value={summary ? `${summary.activeCount}` : "2"} sub="当前线上学习路径" />
        <AdminMiniPanel title="灰度中" value={summary ? `${summary.grayCount}` : "1"} sub="小流量策略实验" />
        <AdminMiniPanel title="平均新词" value={summary ? `${summary.averageDailyNewWords}` : "16"} sub="每日新词配置均值" />
      </section>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">课程策略中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">每日新词、复习量、SRS 档位和六模式权重统一发布</div>
          </div>
          <button
            type="button"
            disabled={context.curriculumStarting}
            onClick={context.onStartCurriculumGray}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.curriculumStarting ? "启动中..." : "启动策略灰度"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {policies.length ? policies.map((policy) => (
            <article key={policy.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{policy.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{formatCurriculumWordbook(policy.wordbookId)} · {policy.gradeBand}</div>
                </div>
                <StatusPill status={formatCurriculumStatus(policy.status)} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MiniMetric title="新词" value={`${policy.dailyNewWords} 新词`} sub="每日新增" />
                <MiniMetric title="复习" value={`${policy.dailyReviewWords}`} sub="每日复习" />
                <MiniMetric title="灰度" value={`${policy.rolloutPercent}%`} sub={formatCurriculumSrsProfile(policy.srsProfile)} />
              </div>
              <div className="mt-3">
                <ProgressBar value={policy.rolloutPercent / 100} height={8} color="var(--c-primary)" label={`${policy.title} 灰度进度`} />
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">课程策略数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={rows} title="课程与 SRS 策略" actionLabel="导出策略" />
    </div>
  );
}

function OperationsModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const configs = context.operationsManagement?.configs ?? [];
  const summary = context.operationsManagement?.summary;
  const appConfigs = useMemo(() => context.appConfigManagement?.configs ?? [], [context.appConfigManagement]);
  const appSummary = context.appConfigManagement?.summary;
  const [selectedAppConfigKey, setSelectedAppConfigKey] = useState<string>("product");
  const selectedAppConfig = appConfigs.find((config) => config.key === selectedAppConfigKey) ?? appConfigs[0] ?? null;
  const [draftPayload, setDraftPayload] = useState("");
  const rows: AdminTableRow[] = configs.length ? configs.map((config) => ({
    id: config.id,
    primary: config.title,
    secondary: `${formatOperationKind(config.kind)} · ${formatOperationSurface(config.surface)} · ${formatOperationAudience(config.audience)}`,
    value: `${config.rolloutPercent}%`,
    status: formatOperationStatus(config.status),
    owner: config.owner
  })) : ADMIN_OPERATIONS_ROWS;

  useEffect(() => {
    if (!selectedAppConfig && appConfigs[0]) {
      setSelectedAppConfigKey(appConfigs[0].key);
      return;
    }

    if (selectedAppConfig) {
      setDraftPayload(JSON.stringify(selectedAppConfig.payload, null, 2));
    }
  }, [appConfigs, selectedAppConfig]);

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-4">
        <AdminMiniPanel title="配置总数" value={summary ? `${summary.total}` : "4"} sub="公告、实验、活动、开关" />
        <AdminMiniPanel title="已发布" value={summary ? `${summary.activeCount}` : "2"} sub="当前线上配置" />
        <AdminMiniPanel title="草稿" value={summary ? `${summary.draftCount}` : "1"} sub="待发布运营配置" />
        <AdminMiniPanel title="平均灰度" value={summary ? `${summary.averageRolloutPercent}%` : "38%"} sub="按配置覆盖估算" />
      </section>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="aibd-display text-lg">应用配置中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">
              编辑并发布 /api/v1/config/* 输出，前台配置 API 会优先读取这里的已发布 JSON。
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniMetric title="配置组" value={appSummary ? `${appSummary.total}` : `${appConfigs.length || 7}`} sub="前台配置 API" />
            <MiniMetric title="已发布" value={appSummary ? `${appSummary.activeCount}` : `${appConfigs.length || 7}`} sub="active" />
            <MiniMetric title="最近更新" value={appSummary?.updatedAt ? new Date(appSummary.updatedAt).toLocaleDateString("zh-CN") : "待同步"} sub="配置仓库" />
          </div>
        </div>
        <div className="grid gap-4 p-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-2">
            {appConfigs.length ? appConfigs.map((config) => (
              <button
                key={config.key}
                type="button"
                onClick={() => setSelectedAppConfigKey(config.key)}
                className={cx(
                  "w-full rounded-[14px] border px-3 py-3 text-left transition",
                  selectedAppConfig?.key === config.key ? "border-[var(--c-primary)] bg-[var(--c-primary-soft)]" : "border-[var(--c-line)] bg-[var(--c-surface-soft)]"
                )}
                aria-label={`编辑 ${config.title}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] font-black text-[var(--c-ink)]">{config.title}</span>
                  <StatusPill status={config.status === "active" ? "已发布" : config.status === "draft" ? "草稿" : "归档"} />
                </div>
                <div className="mt-1 truncate text-[10px] font-bold text-[var(--c-ink-muted)]">{config.endpoint} · v{config.version}</div>
              </button>
            )) : (
              <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">应用配置数据加载中</div>
            )}
          </div>
          <div className="min-w-0">
            {selectedAppConfig ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 rounded-[14px] bg-[var(--c-surface-soft)] p-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[14px] font-black text-[var(--c-ink)]">{selectedAppConfig.title}</div>
                    <div className="mt-1 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{selectedAppConfig.description}</div>
                    <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">更新 {selectedAppConfig.updatedBy} · {new Date(selectedAppConfig.updatedAt).toLocaleString("zh-CN")}</div>
                  </div>
                  <Tag color="var(--c-primary)" bg="white" size="xs">{selectedAppConfig.endpoint}</Tag>
                </div>
                <textarea
                  value={draftPayload}
                  onChange={(event) => setDraftPayload(event.target.value)}
                  aria-label={`${selectedAppConfig.title} JSON 配置`}
                  className="min-h-[360px] w-full resize-y rounded-[16px] border border-[var(--c-line)] bg-[#111827] px-4 py-3 font-mono text-[11px] leading-5 text-[#E5E7EB] outline-none focus:border-[var(--c-primary)] focus:ring-4 focus:ring-[rgba(108,92,231,.18)]"
                  spellCheck={false}
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[11px] font-semibold text-[var(--c-ink-muted)]">保存会立即发布为 active，并写入审计日志。</div>
                  <button
                    type="button"
                    disabled={context.appConfigSaving}
                    onClick={() => context.onSaveAppConfig(selectedAppConfig.key, draftPayload)}
                    className="h-11 rounded-[13px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
                  >
                    {context.appConfigSaving ? "保存中..." : `发布 ${selectedAppConfig.title}`}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">运营发布中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">公告、活动、首页资源位、实验分组和功能开关统一发布审计</div>
          </div>
          <button
            type="button"
            disabled={context.operationsPublishing}
            onClick={context.onPublishOperationAnnouncement}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.operationsPublishing ? "发布中..." : "发布首页公告"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {configs.length ? configs.map((config) => (
            <article key={config.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{config.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{formatOperationKind(config.kind)} · {formatOperationSurface(config.surface)} · {formatOperationAudience(config.audience)}</div>
                </div>
                <StatusPill status={formatOperationStatus(config.status)} />
              </div>
              <p className="mt-3 line-clamp-2 min-h-[40px] text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{config.payload}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="覆盖" value={`${config.rolloutPercent}%`} sub={formatOperationSurface(config.surface)} />
                <MiniMetric title="负责人" value={config.owner} sub={`更新 ${config.updatedBy}`} />
              </div>
              <div className="mt-3">
                <ProgressBar value={config.rolloutPercent / 100} height={8} color="var(--c-primary)" label={`${config.title} 灰度进度`} />
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">运营配置数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={rows} title="功能开关与运营配置" actionLabel="导出配置" />
    </div>
  );
}

function ApprovalsModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const requests = context.approvalsManagement?.requests ?? [];
  const summary = context.approvalsManagement?.summary;
  const approvalTarget = requests.find((request) => request.status === "pending" && request.risk === "高") ?? requests.find((request) => request.status === "pending");
  const rows: AdminTableRow[] = requests.length ? requests.map((request) => ({
    id: request.id,
    primary: request.title,
    secondary: `${formatApprovalAction(request.action)} · ${request.target}`,
    value: request.requesterName,
    status: formatApprovalStatus(request.status),
    owner: request.resolvedBy ?? request.requesterRole
  })) : [
    { id: "approval-01", primary: "导出 PRO 到期用户", secondary: "导出用户 · PRO 到期用户 1,203 条", value: "运营管理员", status: "待审批", owner: "ops" },
    { id: "approval-02", primary: "Prompt 生产版本上线", secondary: "版本回滚 · K12 例句生成 v8", value: "教研管理员", status: "待审批", owner: "research" }
  ];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-5">
        <AdminMiniPanel title="审批总数" value={summary ? `${summary.total}` : "4"} sub="敏感操作请求" />
        <AdminMiniPanel title="待审批" value={summary ? `${summary.pendingCount}` : "3"} sub="需二次确认" />
        <AdminMiniPanel title="高风险" value={summary ? `${summary.highRiskCount}` : "2"} sub="导出 / 退款 / 权限" />
        <AdminMiniPanel title="已通过" value={summary ? `${summary.approvedCount}` : "1"} sub="保留完整链路" />
        <AdminMiniPanel title="已驳回" value={summary ? `${summary.rejectedCount}` : "0"} sub="风险操作拦截" />
      </section>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">审批流中心</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">高危操作必须经过授权角色审批，并自动写入审计日志</div>
          </div>
          <button
            type="button"
            disabled={context.approvalResolving || !approvalTarget}
            onClick={context.onResolveApprovalRequest}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.approvalResolving ? "审批中..." : "通过最高风险审批"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {requests.length ? requests.map((request) => (
            <article key={request.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{request.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{request.requesterName} · {request.moduleId} · {request.requestedAt}</div>
                </div>
                <StatusPill status={formatApprovalStatus(request.status)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag color={request.risk === "高" ? "var(--c-danger)" : "var(--c-warning)"} bg={request.risk === "高" ? "rgba(255,90,111,.12)" : "rgba(255,176,32,.14)"} size="xs">
                  {request.risk}风险
                </Tag>
                <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{formatApprovalAction(request.action)}</Tag>
                <Tag color="var(--c-ink-soft)" bg="#fff" size="xs">{request.resolvedBy ? `处理 ${request.resolvedBy}` : `截止 ${request.expiresAt}`}</Tag>
              </div>
              <p className="mt-3 line-clamp-2 min-h-[40px] text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{request.reason}</p>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">审批请求数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={rows} title="审批请求" actionLabel="导出审批链路" />
    </div>
  );
}

function BillingModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const fallbackRows: AdminTableRow[] = [
    { id: "b-01", primary: "PRO 月卡", secondary: "AI 故事、OCR、PK、家长报告", value: "¥29", status: "在线", owner: "商业化" },
    { id: "b-02", primary: "PRO 年卡", secondary: "家庭账户优先推荐", value: "¥199", status: "在线", owner: "商业化" },
    { id: "b-03", primary: "退款审核", secondary: "近 7 天订单退款", value: "31 单", status: "待处理", owner: "客服" },
    { id: "b-04", primary: "兑换码", secondary: "机构合作批量发放", value: "420 个", status: "正常", owner: "增长运营" }
  ];
  const orders = context.billingManagement?.orders ?? [];
  const summary = context.billingManagement?.summary;
  const rows: AdminTableRow[] = orders.length ? orders.map((order) => ({
    id: order.id,
    primary: order.customerName,
    secondary: `${formatBillingPlan(order.plan)} · ${formatBillingChannel(order.channel)}`,
    value: formatAdminWholeCny(order.amountCny),
    status: formatBillingStatus(order.status),
    owner: formatBillingEntitlementStatus(order.entitlementStatus)
  })) : fallbackRows;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-4">
        <AdminMiniPanel title="MRR" value={summary ? formatAdminWholeCny(summary.mrrCny) : "¥38,420"} sub="当前有效 PRO 订阅估算" />
        <AdminMiniPanel title="活跃订阅" value={summary ? `${summary.activeSubscriptionCount}` : "2,104"} sub="付费、家庭和兑换码权益" />
        <AdminMiniPanel title="待退款" value={summary ? `${summary.refundRequestCount}` : "31"} sub="需财务复核的申请" />
        <AdminMiniPanel title="兑换码" value={summary ? `${summary.couponActiveCount}` : "420"} sub="机构合作有效权益" />
      </section>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">订阅与订单治理</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">PRO 权益、退款、支付渠道和兑换码发放统一留痕</div>
          </div>
          <button
            type="button"
            disabled={context.billingProcessing}
            onClick={context.onProcessBillingRefund}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.billingProcessing ? "处理中..." : "处理退款申请"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {orders.length ? orders.map((order) => (
            <article key={order.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{order.customerName}</div>
                  <div className="mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{formatBillingPlan(order.plan)} · {formatBillingChannel(order.channel)}</div>
                </div>
                <StatusPill status={formatBillingStatus(order.status)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="金额" value={formatAdminWholeCny(order.amountCny)} sub={order.couponCode ?? "订单实付"} />
                <MiniMetric title="权益" value={formatBillingEntitlementStatus(order.entitlementStatus)} sub={order.updatedBy} />
              </div>
              <p className="mt-3 line-clamp-2 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{order.refundReason ?? "权益正常，无退款申请。"}</p>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">订阅订单数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={rows} title="订阅与订单" actionLabel="导出订单" />
    </div>
  );
}

function SystemModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const checks = context.systemHealth?.checks ?? [];
  const summary = context.systemHealth?.summary;

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 lg:grid-cols-4">
        <AdminMiniPanel title="服务总数" value={summary ? `${summary.total}` : "6"} sub="API、DeepSeek、短信、微信、OCR、缓存" />
        <AdminMiniPanel title="正常服务" value={summary ? `${summary.healthyCount}` : "4"} sub="最近一次健康状态" />
        <AdminMiniPanel title="风险服务" value={summary ? `${summary.riskCount}` : "1"} sub="需要上线前处理" />
        <AdminMiniPanel title="平均延迟" value={summary ? `${summary.averageLatencyMs}ms` : "486ms"} sub="按最近检查窗口估算" />
      </section>
      <Card pad={0} radius={18} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--c-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="aibd-display text-lg">系统健康检查</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">上线依赖、外部供应商、队列和缓存状态统一巡检</div>
          </div>
          <button
            type="button"
            disabled={context.systemChecking}
            onClick={context.onRunSystemHealthCheck}
            className="h-10 rounded-[12px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
          >
            {context.systemChecking ? "检查中..." : "运行健康检查"}
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
          {checks.length ? checks.map((check) => (
            <article key={check.id} className="rounded-[16px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-black text-[var(--c-ink)]">{check.label}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[var(--c-ink-muted)]">
                    <span>{formatSystemHealthService(check.service)}</span>
                    <span>{check.owner}</span>
                  </div>
                </div>
                <StatusPill status={formatSystemHealthStatus(check.status)} />
              </div>
              <p className="mt-3 line-clamp-2 min-h-[40px] text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{check.detail}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric title="延迟" value={`${check.latencyMs}ms`} sub="最近检查" />
                <MiniMetric title="可用性" value={`${check.uptimePercent.toFixed(2)}%`} sub="近 24 小时" />
              </div>
            </article>
          )) : (
            <div className="rounded-[16px] bg-[var(--c-surface-soft)] px-4 py-8 text-[12px] font-bold text-[var(--c-ink-muted)]">系统健康数据加载中</div>
          )}
        </div>
      </Card>
      <DataTable rows={getDetailRows(context, "system", ADMIN_SYSTEM_ROWS)} title={getDetailTitle(context, "system", "服务健康与队列")} actionLabel="查看队列" pagination={getDetailPagination(context, "system")} />
    </div>
  );
}

function RolesModule({ activeModule, context }: { activeModule: AdminModule; context: ModuleRenderContext }) {
  const roles = context.roleManagement?.roles ?? [];
  const modules = context.roleManagement?.modules ?? ADMIN_MODULES.map((module) => ({ id: module.id, label: module.label, category: module.category }));
  const accounts = context.accountManagement?.accounts ?? [];
  const selectedRole = roles.some((role) => role.role === context.selectedRole) ? context.selectedRole : roles[0]?.role ?? "owner";
  const selectedModules = context.roleDrafts[selectedRole] ?? roles.find((role) => role.role === selectedRole)?.moduleIds ?? [];

  return (
    <div className="space-y-5">
      <ModuleHeader module={activeModule} onAction={context.onAction} />
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <Card pad={0} radius={18} className="overflow-hidden">
          <div className="border-b border-[var(--c-line)] px-5 py-4">
            <h3 className="aibd-display text-lg">管理员账号</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">登录身份、MFA 状态和活跃 session</div>
          </div>
          <div className="divide-y divide-[var(--c-line)]">
            {accounts.length ? accounts.map((account) => {
              const activeSessionId = account.activeSessions?.[0]?.id;

              return (
              <div key={account.id} className="grid gap-3 px-5 py-4 text-[12px] sm:grid-cols-[1fr_90px_92px_86px] sm:items-center">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-black text-[var(--c-ink)]">{account.displayName}</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-[var(--c-ink-muted)]">{account.email}</div>
                </div>
                <StatusPill status={account.mfaEnabled ? "MFA 已启用" : "MFA 待启用"} />
                <div className="text-[11px] font-black text-[var(--c-ink-soft)]">{account.activeSessionCount} 个会话</div>
                {activeSessionId ? (
                  <button
                    type="button"
                    onClick={() => context.onRevokeSession(activeSessionId)}
                    className="h-9 rounded-[12px] bg-[rgba(255,90,111,.12)] px-3 text-[11px] font-black text-[var(--c-danger)]"
                  >
                    撤销会话
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-[var(--c-ink-muted)]">无活跃</span>
                )}
              </div>
            );
            }) : (
              <div className="px-5 py-6 text-[12px] font-bold text-[var(--c-ink-muted)]">账号数据加载中</div>
            )}
          </div>
        </Card>

        <Card pad={0} radius={18} className="overflow-hidden">
          <div className="border-b border-[var(--c-line)] px-5 py-4">
            <h3 className="aibd-display text-lg">角色权限矩阵</h3>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">按角色配置后台模块访问范围，保存后立即生效并写入审计日志</div>
          </div>
          <div className="grid gap-0 lg:grid-cols-[190px_1fr]">
            <div className="border-b border-[var(--c-line)] p-3 lg:border-b-0 lg:border-r">
              <div className="grid gap-2">
                {roles.map((role) => (
                  <button
                    key={role.role}
                    type="button"
                    aria-label={`编辑 ${role.role} 权限`}
                    onClick={() => context.onSelectRole(role.role)}
                    className={cx(
                      "rounded-[13px] px-3 py-3 text-left text-[12px] font-black transition",
                      role.role === selectedRole ? "bg-[var(--c-primary)] text-white" : "bg-[var(--c-surface-soft)] text-[var(--c-ink-soft)] hover:bg-[var(--c-primary-soft)]"
                    )}
                  >
                    <span className="block">{role.label}</span>
                    <span className="mt-1 block text-[10px] opacity-70">{role.moduleIds.length} 个模块</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => (
                  <label key={module.id} className="flex min-h-[48px] items-center gap-3 rounded-[13px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] px-3 py-2 text-[12px] font-black text-[var(--c-ink)]">
                    <input
                      type="checkbox"
                      aria-label={`允许 ${module.label}`}
                      checked={selectedModules.includes(module.id)}
                      onChange={() => context.onToggleRoleModule(selectedRole, module.id)}
                      className="h-4 w-4 accent-[var(--c-primary)]"
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{module.label}</span>
                      <span className="mt-0.5 block text-[10px] text-[var(--c-ink-muted)]">{module.category}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">当前选择 {selectedModules.length} 个模块</div>
                <button
                  type="button"
                  disabled={context.roleSaving}
                  onClick={() => context.onSaveRolePermissions(selectedRole)}
                  className="h-11 rounded-[13px] bg-[var(--c-primary)] px-4 text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)] disabled:opacity-60"
                >
                  {context.roleSaving ? "保存中..." : `保存 ${selectedRole} 权限`}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function renderModuleBody(activeModule: AdminModule, context: ModuleRenderContext) {
  switch (activeModule.id) {
    case "dashboard":
      return (
        <OverviewModule
          activeModule={activeModule}
          dashboardManagement={context.dashboardManagement}
          dashboardRefreshing={context.dashboardRefreshing}
          kpis={context.kpis}
          modules={context.modules}
          traffic={context.traffic}
          onAction={context.onAction}
          onRefreshDashboard={context.onRefreshDashboard}
        />
      );
    case "users":
      return <UsersModule activeModule={activeModule} context={context} />;
    case "wordbooks":
      return <WordbooksModule activeModule={activeModule} context={context} />;
    case "vocabulary":
      return <VocabularyModule activeModule={activeModule} context={context} />;
    case "mistakes":
      return <MistakesModule activeModule={activeModule} context={context} />;
    case "ai-usage":
      return <AiUsageModule activeModule={activeModule} context={context} />;
    case "prompts":
      return <PromptModule activeModule={activeModule} context={context} />;
    case "audit":
      return <AuditModule activeModule={activeModule} context={context} />;
    case "roles":
      return <RolesModule activeModule={activeModule} context={context} />;
    case "approvals":
      return <ApprovalsModule activeModule={activeModule} context={context} />;
    case "import-quality":
      return <ImportQualityModule activeModule={activeModule} context={context} />;
    case "curriculum":
      return <CurriculumModule activeModule={activeModule} context={context} />;
    case "operations":
      return <OperationsModule activeModule={activeModule} context={context} />;
    case "billing":
      return <BillingModule activeModule={activeModule} context={context} />;
    case "safety":
      return <SafetyModule activeModule={activeModule} context={context} />;
    case "system":
      return <SystemModule activeModule={activeModule} context={context} />;
    default:
      return null;
  }
}

function AdminLoginPanel({
  email,
  error,
  loading,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: {
  email: string;
  error: string | null;
  loading: boolean;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-4 py-8 text-[var(--c-ink)]">
      <Card className="w-full max-w-[430px] overflow-hidden p-0 shadow-pop">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c-primary),var(--c-primary-deep))] px-6 pb-8 pt-10 text-white">
          <div className="absolute -right-10 -top-8 opacity-25">
            <Wordy form="rocket" glow={false} mood="cheer" pose="celebrate" size={168} />
          </div>
          <Tag bg="rgba(255,255,255,.2)" color="#fff">ADMIN OPS</Tag>
          <h1 className="aibd-display mt-4 text-[34px] leading-none">管理员登录</h1>
          <p className="mt-2 max-w-[270px] text-sm font-semibold leading-6 text-white/78">使用受控后台账号进入数据、内容、AI 和审计管理台。</p>
        </section>

        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-[var(--c-ink-soft)]">管理员邮箱</span>
            <input
              aria-label="管理员邮箱"
              className="h-12 w-full rounded-[16px] border border-[var(--c-line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--c-primary)] focus:ring-4 focus:ring-[rgba(108,92,231,.14)]"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-[var(--c-ink-soft)]">密码</span>
            <input
              aria-label="管理员密码"
              className="h-12 w-full rounded-[16px] border border-[var(--c-line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--c-primary)] focus:ring-4 focus:ring-[rgba(108,92,231,.14)]"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </label>
          {error ? <div className="rounded-[14px] bg-[#FFE1E6] px-3 py-2 text-sm font-bold text-[var(--c-danger)]">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-[16px] bg-[var(--c-primary)] text-sm font-black text-white shadow-pop transition active:translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "登录中..." : "演示管理员登录"}
          </button>
          <p className="text-center text-[11px] font-semibold leading-5 text-[var(--c-ink-muted)]">当前为本地演示账号；生产环境需替换为企业身份源、MFA 和审批流。</p>
        </form>
      </Card>
    </main>
  );
}

export function AdminScreen() {
  const [activeId, setActiveId] = useState<AdminModuleId>("dashboard");
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<AdminModule[]>(ADMIN_MODULES);
  const [kpis, setKpis] = useState<typeof ADMIN_KPIS>(ADMIN_KPIS);
  const [traffic, setTraffic] = useState<typeof ADMIN_TRAFFIC_SERIES>(ADMIN_TRAFFIC_SERIES);
  const [dashboardManagement, setDashboardManagement] = useState<AdminDashboardPayload | null>(null);
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<typeof ADMIN_AUDIT_LOGS>(ADMIN_AUDIT_LOGS);
  const [moduleDetail, setModuleDetail] = useState<AdminModulePayload | null>(null);
  const [adminSource, setAdminSource] = useState<"mock" | "api">("mock");
  const [authState, setAuthState] = useState<"ready" | "login">("ready");
  const [adminEmail, setAdminEmail] = useState("owner@aishang.local");
  const [adminPassword, setAdminPassword] = useState("admin-demo");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState<AdminAiUsagePayload | null>(null);
  const [aiUsageMitigating, setAiUsageMitigating] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAdminAction | null>(null);
  const [auditRiskFilter, setAuditRiskFilter] = useState<AuditRiskFilter>("all");
  const [auditExporting, setAuditExporting] = useState(false);
  const [auditPolicy, setAuditPolicy] = useState<AdminAuditPayload["policy"] | null>(null);
  const [auditReviewing, setAuditReviewing] = useState(false);
  const [auditRetentionUpdating, setAuditRetentionUpdating] = useState(false);
  const [accountManagement, setAccountManagement] = useState<AdminAccountsPayload | null>(null);
  const [userManagement, setUserManagement] = useState<AdminUsersPayload | null>(null);
  const [userFreezing, setUserFreezing] = useState(false);
  const [mistakeManagement, setMistakeManagement] = useState<AdminMistakesPayload | null>(null);
  const [mistakeIntervening, setMistakeIntervening] = useState(false);
  const [safetyManagement, setSafetyManagement] = useState<AdminSafetyPayload | null>(null);
  const [safetyBlocking, setSafetyBlocking] = useState(false);
  const [systemHealth, setSystemHealth] = useState<AdminSystemPayload | null>(null);
  const [systemChecking, setSystemChecking] = useState(false);
  const [billingManagement, setBillingManagement] = useState<AdminBillingPayload | null>(null);
  const [billingProcessing, setBillingProcessing] = useState(false);
  const [curriculumManagement, setCurriculumManagement] = useState<AdminCurriculumPayload | null>(null);
  const [curriculumStarting, setCurriculumStarting] = useState(false);
  const [operationsManagement, setOperationsManagement] = useState<AdminOperationsPayload | null>(null);
  const [operationsPublishing, setOperationsPublishing] = useState(false);
  const [appConfigManagement, setAppConfigManagement] = useState<AdminAppConfigsPayload | null>(null);
  const [appConfigSaving, setAppConfigSaving] = useState(false);
  const [approvalsManagement, setApprovalsManagement] = useState<AdminApprovalsPayload | null>(null);
  const [approvalResolving, setApprovalResolving] = useState(false);
  const [roleManagement, setRoleManagement] = useState<AdminRolesPayload | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<AdminRoleDrafts>({});
  const [roleSaving, setRoleSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>("owner");
  const [promptManagement, setPromptManagement] = useState<AdminPromptsPayload | null>(null);
  const [promptCreating, setPromptCreating] = useState(false);
  const [wordbookManagement, setWordbookManagement] = useState<AdminWordbookReleasesPayload | null>(null);
  const [wordbookPublishing, setWordbookPublishing] = useState(false);
  const [vocabularyManagement, setVocabularyManagement] = useState<AdminVocabularyPayload | null>(null);
  const [vocabularyScanning, setVocabularyScanning] = useState(false);
  const [importQuality, setImportQuality] = useState<AdminImportQualityPayload | null>(null);
  const [importStarting, setImportStarting] = useState(false);
  const activeModule = modules.find((module) => module.id === activeId) ?? modules[0] ?? ADMIN_MODULES[0];

  const loadOverview = useCallback(async (isCancelled: () => boolean = () => false) => {
    try {
      const response = await fetch("/api/v1/admin/overview");
      if (response.status === 401) {
        if (!isCancelled()) {
          setAuthState("login");
          setAdminSource("mock");
        }
        return false;
      }
      if (!response.ok) return false;
      const payload = (await response.json()) as AdminOverviewPayload;
      if (isCancelled()) return false;
      setModules(payload.modules);
      setKpis(payload.kpis);
      setTraffic(payload.traffic);
      setAuditLogs(payload.auditLogs);
      setAuthState("ready");
      setAdminSource("api");
      return true;
    } catch {
      if (!isCancelled()) setAdminSource("mock");
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadOverview(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [loadOverview]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardManagement() {
      if (authState === "login" || activeId !== "dashboard") return;
      try {
        const response = await fetch("/api/v1/admin/dashboard");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminDashboardPayload;
        if (!cancelled && payload.snapshot && Array.isArray(payload.snapshot.kpis) && Array.isArray(payload.snapshot.traffic)) {
          setDashboardManagement(payload);
          setKpis(payload.snapshot.kpis);
          setTraffic(payload.snapshot.traffic);
        }
      } catch {
        if (!cancelled) setDashboardManagement(null);
      }
    }

    loadDashboardManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadModuleDetail() {
      if (authState === "login") return;
      try {
        const response = await fetch(`/api/v1/admin/modules/${activeId}?page=1&pageSize=20`);
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminModulePayload;
        if (!cancelled && payload.module?.id === activeId) {
          setModuleDetail(payload);
        }
      } catch {
        if (!cancelled) setModuleDetail(null);
      }
    }

    setModuleDetail(null);
    loadModuleDetail();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserManagement() {
      if (authState === "login" || activeId !== "users") return;
      try {
        const response = await fetch("/api/v1/admin/users");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminUsersPayload;
        if (!cancelled && Array.isArray(payload.users)) {
          setUserManagement(payload);
        }
      } catch {
        if (!cancelled) setUserManagement(null);
      }
    }

    loadUserManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadMistakeManagement() {
      if (authState === "login" || activeId !== "mistakes") return;
      try {
        const response = await fetch("/api/v1/admin/mistakes");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminMistakesPayload;
        if (!cancelled && Array.isArray(payload.insights)) {
          setMistakeManagement(payload);
        }
      } catch {
        if (!cancelled) setMistakeManagement(null);
      }
    }

    loadMistakeManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadSafetyManagement() {
      if (authState === "login" || activeId !== "safety") return;
      try {
        const response = await fetch("/api/v1/admin/safety");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminSafetyPayload;
        if (!cancelled && Array.isArray(payload.reviews)) {
          setSafetyManagement(payload);
        }
      } catch {
        if (!cancelled) setSafetyManagement(null);
      }
    }

    loadSafetyManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadSystemHealth() {
      if (authState === "login" || activeId !== "system") return;
      try {
        const response = await fetch("/api/v1/admin/system");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminSystemPayload;
        if (!cancelled && Array.isArray(payload.checks)) {
          setSystemHealth(payload);
        }
      } catch {
        if (!cancelled) setSystemHealth(null);
      }
    }

    loadSystemHealth();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingManagement() {
      if (authState === "login" || activeId !== "billing") return;
      try {
        const response = await fetch("/api/v1/admin/billing");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminBillingPayload;
        if (!cancelled && Array.isArray(payload.orders)) {
          setBillingManagement(payload);
        }
      } catch {
        if (!cancelled) setBillingManagement(null);
      }
    }

    loadBillingManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurriculumManagement() {
      if (authState === "login" || activeId !== "curriculum") return;
      try {
        const response = await fetch("/api/v1/admin/curriculum");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminCurriculumPayload;
        if (!cancelled && Array.isArray(payload.policies)) {
          setCurriculumManagement(payload);
        }
      } catch {
        if (!cancelled) setCurriculumManagement(null);
      }
    }

    loadCurriculumManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadOperationsManagement() {
      if (authState === "login" || activeId !== "operations") return;
      try {
        const response = await fetch("/api/v1/admin/operations");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminOperationsPayload;
        if (!cancelled && Array.isArray(payload.configs)) {
          setOperationsManagement(payload);
        }
      } catch {
        if (!cancelled) setOperationsManagement(null);
      }
    }

    loadOperationsManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadAppConfigManagement() {
      if (authState === "login" || activeId !== "operations") return;
      try {
        const response = await fetch("/api/v1/admin/app-configs");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminAppConfigsPayload;
        if (!cancelled && Array.isArray(payload.configs)) {
          setAppConfigManagement(payload);
        }
      } catch {
        if (!cancelled) setAppConfigManagement(null);
      }
    }

    loadAppConfigManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadApprovalsManagement() {
      if (authState === "login" || activeId !== "approvals") return;
      try {
        const response = await fetch("/api/v1/admin/approvals");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminApprovalsPayload;
        if (!cancelled && Array.isArray(payload.requests)) {
          setApprovalsManagement(payload);
        }
      } catch {
        if (!cancelled) setApprovalsManagement(null);
      }
    }

    loadApprovalsManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoleManagement() {
      if (authState === "login" || activeId !== "roles") return;
      try {
        const [accountsResponse, rolesResponse] = await Promise.all([
          fetch("/api/v1/admin/accounts"),
          fetch("/api/v1/admin/roles")
        ]);
        if (accountsResponse.status === 401 || rolesResponse.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!accountsResponse.ok || !rolesResponse.ok) return;
        const [accountsPayload, rolesPayload] = await Promise.all([
          accountsResponse.json() as Promise<AdminAccountsPayload>,
          rolesResponse.json() as Promise<AdminRolesPayload>
        ]);
        if (cancelled) return;
        setAccountManagement(accountsPayload);
        setRoleManagement(rolesPayload);
        setRoleDrafts(Object.fromEntries(rolesPayload.roles.map((role) => [role.role, role.moduleIds])) as AdminRoleDrafts);
        setSelectedRole((current) => rolesPayload.roles.some((role) => role.role === current) ? current : rolesPayload.roles[0]?.role ?? "owner");
      } catch {
        if (!cancelled) {
          setAccountManagement(null);
          setRoleManagement(null);
        }
      }
    }

    loadRoleManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadAiUsage() {
      if (authState === "login" || activeId !== "ai-usage") return;
      try {
        const response = await fetch("/api/v1/admin/ai-usage");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminAiUsagePayload;
        if (!cancelled) setAiUsage(payload);
      } catch {
        if (!cancelled) setAiUsage(null);
      }
    }

    loadAiUsage();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadPromptManagement() {
      if (authState === "login" || activeId !== "prompts") return;
      try {
        const response = await fetch("/api/v1/admin/prompts");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminPromptsPayload;
        if (!cancelled && Array.isArray(payload.prompts)) {
          setPromptManagement(payload);
        }
      } catch {
        if (!cancelled) setPromptManagement(null);
      }
    }

    loadPromptManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadWordbookManagement() {
      if (authState === "login" || activeId !== "wordbooks") return;
      try {
        const response = await fetch("/api/v1/admin/wordbooks");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminWordbookReleasesPayload;
        if (!cancelled && Array.isArray(payload.releases)) {
          setWordbookManagement(payload);
        }
      } catch {
        if (!cancelled) setWordbookManagement(null);
      }
    }

    loadWordbookManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadVocabularyManagement() {
      if (authState === "login" || activeId !== "vocabulary") return;
      try {
        const response = await fetch("/api/v1/admin/vocabulary");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminVocabularyPayload;
        if (!cancelled && Array.isArray(payload.issues)) {
          setVocabularyManagement(payload);
        }
      } catch {
        if (!cancelled) setVocabularyManagement(null);
      }
    }

    loadVocabularyManagement();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  useEffect(() => {
    let cancelled = false;

    async function loadImportQuality() {
      if (authState === "login" || activeId !== "import-quality") return;
      try {
        const response = await fetch("/api/v1/admin/import-quality");
        if (response.status === 401) {
          if (!cancelled) setAuthState("login");
          return;
        }
        if (!response.ok) return;
        const payload = (await response.json()) as AdminImportQualityPayload;
        if (!cancelled && Array.isArray(payload.jobs)) {
          setImportQuality(payload);
        }
      } catch {
        if (!cancelled) setImportQuality(null);
      }
    }

    loadImportQuality();

    return () => {
      cancelled = true;
    };
  }, [activeId, authState]);

  const buildAuditUrl = useCallback((risk: AuditRiskFilter, format?: "csv") => {
    const params = new URLSearchParams();
    if (risk !== "all") params.set("risk", risk);
    if (format) params.set("format", format);
    const query = params.toString();

    return `/api/v1/admin/audit${query ? `?${query}` : ""}`;
  }, []);

  const loadAuditLogs = useCallback(async (risk: AuditRiskFilter) => {
    try {
      const response = await fetch(buildAuditUrl(risk));
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("审计日志加载失败");
        return;
      }
      const payload = (await response.json()) as AdminAuditPayload;
      setAuditRiskFilter(risk);
      setAuditLogs(payload.auditLogs);
      setAuditPolicy(payload.policy);
    } catch {
      setNotice("审计日志加载失败");
    }
  }, [buildAuditUrl]);

  const changeAuditRisk = (risk: AuditRiskFilter) => {
    void loadAuditLogs(risk);
  };

  useEffect(() => {
    if (authState === "login" || activeId !== "audit") return;
    void loadAuditLogs("all");
  }, [activeId, authState, loadAuditLogs]);

  const exportAuditLogs = async () => {
    setAuditExporting(true);
    try {
      const response = await fetch(buildAuditUrl(auditRiskFilter, "csv"));
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("审计日志导出失败");
        return;
      }
      await response.text();
      setNotice("审计日志导出已生成");
    } catch {
      setNotice("审计日志导出失败");
    } finally {
      setAuditExporting(false);
    }
  };

  const reviewHighRiskAudit = async () => {
    setAuditReviewing(true);
    try {
      const response = await fetch("/api/v1/admin/audit", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action: "review-high-risk" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("高危审计复核失败");
        return;
      }

      const payload = (await response.json()) as AdminAuditPolicyActionPayload;
      setAuditPolicy(payload.policy);
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("高危审计日志已复核");
    } catch {
      setNotice("高危审计复核失败");
    } finally {
      setAuditReviewing(false);
    }
  };

  const extendAuditRetention = async () => {
    setAuditRetentionUpdating(true);
    try {
      const response = await fetch("/api/v1/admin/audit", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action: "extend-retention" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("审计保留期更新失败");
        return;
      }

      const payload = (await response.json()) as AdminAuditPolicyActionPayload;
      setAuditPolicy(payload.policy);
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("审计保留期已更新");
    } catch {
      setNotice("审计保留期更新失败");
    } finally {
      setAuditRetentionUpdating(false);
    }
  };

  const mitigateAiUsageAlert = async () => {
    setAiUsageMitigating(true);
    try {
      const response = await fetch("/api/v1/admin/ai-usage", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ alertId: "ai-budget-deepseek-daily", action: "enable-fallback" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("AI 降级策略启用失败");
        return;
      }

      const payload = (await response.json()) as AdminAiUsageActionPayload;
      setAiUsage((current) => current ? {
        ...current,
        alerts: [payload.alert, ...current.alerts.filter((alert) => alert.id !== payload.alert.id)]
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        summary: {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostCny: 0,
          averageLatencyMs: 0,
          failureRate: 0,
          budgetCny: 0,
          budgetUsedPercent: 0
        },
        events: [],
        alerts: [payload.alert],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("AI 降级策略已启用");
    } catch {
      setNotice("AI 降级策略启用失败");
    } finally {
      setAiUsageMitigating(false);
    }
  };

  const createPromptVersion = async () => {
    setPromptCreating(true);
    try {
      const response = await fetch("/api/v1/admin/prompts", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          key: "example",
          title: "K12 例句生成",
          body: "生成 8-15 个英文词的安全例句，必须自然包含目标词，准确中文解释，并遵守未成年人安全限制。",
          safetyRules: ["未成年人安全", "禁止成人、暴力、隐私内容", "禁止品牌广告和网络热梗"],
          outputSchema: "{\"en\":string,\"cn\":string,\"tag\":\"AI · DeepSeek\"}",
          notes: "强化低年级安全语境"
        })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("Prompt 版本创建失败");
        return;
      }

      const payload = (await response.json()) as AdminPromptCreatePayload;
      setPromptManagement((current) => current ? {
        ...current,
        prompts: [payload.prompt, ...current.prompts.filter((prompt) => prompt.id !== payload.prompt.id)]
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        prompts: [payload.prompt],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("Prompt 版本已创建");
    } catch {
      setNotice("Prompt 版本创建失败");
    } finally {
      setPromptCreating(false);
    }
  };

  const publishWordbookRelease = async () => {
    setWordbookPublishing(true);
    try {
      const response = await fetch("/api/v1/admin/wordbooks", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ bookId: "zhongkao-1600" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("词书版本发布失败");
        return;
      }

      const payload = (await response.json()) as AdminWordbookReleasePayload;
      setWordbookManagement((current) => current ? {
        ...current,
        releases: [payload.release, ...current.releases.filter((release) => release.id !== payload.release.id)]
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        releases: [payload.release],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("词书版本已发布");
    } catch {
      setNotice("词书版本发布失败");
    } finally {
      setWordbookPublishing(false);
    }
  };

  const startVocabularyScan = async () => {
    setVocabularyScanning(true);
    try {
      const response = await fetch("/api/v1/admin/vocabulary", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ kind: "image", word: "abandon", bookId: "zhongkao-1600" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("词库质检启动失败");
        return;
      }

      const payload = (await response.json()) as AdminVocabularyIssuePayload;
      setVocabularyManagement((current) => current ? {
        ...current,
        issues: [payload.issue, ...current.issues.filter((issue) => issue.id !== payload.issue.id)]
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        issues: [payload.issue],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("词库质检已启动");
    } catch {
      setNotice("词库质检启动失败");
    } finally {
      setVocabularyScanning(false);
    }
  };

  const rerunImportJob = async () => {
    setImportStarting(true);
    try {
      const response = await fetch("/api/v1/admin/import-quality", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ source: "ECDICT 释义同步", bookId: "zhongkao-1600" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("导入任务启动失败");
        return;
      }

      const payload = (await response.json()) as AdminImportJobPayload;
      setImportQuality((current) => current ? {
        ...current,
        jobs: [payload.job, ...current.jobs.filter((job) => job.id !== payload.job.id)]
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        jobs: [payload.job],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("导入任务已启动");
    } catch {
      setNotice("导入任务启动失败");
    } finally {
      setImportStarting(false);
    }
  };

  const freezeUserAccount = async () => {
    setUserFreezing(true);
    try {
      const response = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ userId: "user-ryan", action: "freeze" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("账号冻结失败");
        return;
      }

      const payload = (await response.json()) as AdminUserActionPayload;
      setUserManagement((current) => current ? {
        ...current,
        users: current.users.map((user) => user.id === payload.user.id ? payload.user : user)
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "support" },
        users: [payload.user],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("账号已冻结");
    } catch {
      setNotice("账号冻结失败");
    } finally {
      setUserFreezing(false);
    }
  };

  const createMistakeIntervention = async () => {
    setMistakeIntervening(true);
    try {
      const response = await fetch("/api/v1/admin/mistakes", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ insightId: "mistake-confusion-achieve", action: "intervene" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("错题干预创建失败");
        return;
      }

      const payload = (await response.json()) as AdminMistakeActionPayload;
      setMistakeManagement((current) => current ? {
        ...current,
        insights: current.insights.map((insight) => insight.id === payload.insight.id ? payload.insight : insight)
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "support" },
        insights: [payload.insight],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("错题干预已创建");
    } catch {
      setNotice("错题干预创建失败");
    } finally {
      setMistakeIntervening(false);
    }
  };

  const blockSafetyReview = async () => {
    setSafetyBlocking(true);
    try {
      const response = await fetch("/api/v1/admin/safety", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ reviewId: "safety-story-night", action: "block" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("内容安全处理失败");
        return;
      }

      const payload = (await response.json()) as AdminSafetyActionPayload;
      setSafetyManagement((current) => current ? {
        ...current,
        reviews: current.reviews.map((review) => review.id === payload.review.id ? payload.review : review)
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "research" },
        reviews: [payload.review],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("内容已拦截");
    } catch {
      setNotice("内容安全处理失败");
    } finally {
      setSafetyBlocking(false);
    }
  };

  const runSystemHealthCheck = async () => {
    setSystemChecking(true);
    try {
      const response = await fetch("/api/v1/admin/system", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ checkId: "system-deepseek-gateway", action: "run-check" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("健康检查运行失败");
        return;
      }

      const payload = (await response.json()) as AdminSystemActionPayload;
      setSystemHealth((current) => current ? {
        ...current,
        checks: current.checks.map((check) => check.id === payload.check.id ? payload.check : check),
        summary: {
          ...current.summary,
          healthyCount: current.checks.filter((check) => (check.id === payload.check.id ? payload.check.status : check.status) === "healthy").length,
          watchCount: current.checks.filter((check) => (check.id === payload.check.id ? payload.check.status : check.status) === "watch").length,
          riskCount: current.checks.filter((check) => {
            const status = check.id === payload.check.id ? payload.check.status : check.status;
            return status === "risk" || status === "down";
          }).length
        }
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "owner" },
        summary: { total: 1, healthyCount: 1, watchCount: 0, riskCount: 0, averageLatencyMs: payload.check.latencyMs },
        checks: [payload.check],
        generatedAt: new Date().toISOString()
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("健康检查已完成");
    } catch {
      setNotice("健康检查运行失败");
    } finally {
      setSystemChecking(false);
    }
  };

  const processBillingRefund = async () => {
    setBillingProcessing(true);
    try {
      const response = await fetch("/api/v1/admin/billing", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ orderId: "billing-refund-ryan", action: "approve-refund" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("退款申请处理失败");
        return;
      }

      const payload = (await response.json()) as AdminBillingActionPayload;
      setBillingManagement((current) => {
        const orders = current ? current.orders.map((order) => order.id === payload.order.id ? payload.order : order) : [payload.order];
        const summary = {
          mrrCny: orders.filter((order) => order.status === "paid" && order.entitlementStatus === "active").reduce((sum, order) => sum + order.amountCny, 0),
          activeSubscriptionCount: orders.filter((order) => order.entitlementStatus === "active").length,
          refundRequestCount: orders.filter((order) => order.status === "refund_requested").length,
          refundAmountCny: orders.filter((order) => order.status === "refund_requested").reduce((sum, order) => sum + order.amountCny, 0),
          couponActiveCount: orders.filter((order) => order.channel === "coupon" && order.entitlementStatus === "active").length
        };

        return current ? { ...current, orders, summary } : {
          actor: { id: "admin-local", name: "本地管理员", role: "finance" },
          orders,
          summary,
          generatedAt: new Date().toISOString()
        };
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("退款申请已处理");
    } catch {
      setNotice("退款申请处理失败");
    } finally {
      setBillingProcessing(false);
    }
  };

  const startCurriculumGray = async () => {
    setCurriculumStarting(true);
    try {
      const response = await fetch("/api/v1/admin/curriculum", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ policyId: "curriculum-zhongkao-sprint", action: "start-gray" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("课程策略灰度启动失败");
        return;
      }

      const payload = (await response.json()) as AdminCurriculumActionPayload;
      setCurriculumManagement((current) => {
        const policies = current ? current.policies.map((policy) => policy.id === payload.policy.id ? payload.policy : policy) : [payload.policy];
        const summary = {
          total: policies.length,
          activeCount: policies.filter((policy) => policy.status === "active").length,
          grayCount: policies.filter((policy) => policy.status === "gray").length,
          draftCount: policies.filter((policy) => policy.status === "draft").length,
          averageDailyNewWords: policies.length ? Math.round(policies.reduce((sum, policy) => sum + policy.dailyNewWords, 0) / policies.length) : 0
        };

        return current ? { ...current, policies, summary } : {
          actor: { id: "admin-local", name: "本地管理员", role: "research" },
          policies,
          summary,
          generatedAt: new Date().toISOString()
        };
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("课程策略灰度已启动");
    } catch {
      setNotice("课程策略灰度启动失败");
    } finally {
      setCurriculumStarting(false);
    }
  };

  const publishOperationAnnouncement = async () => {
    setOperationsPublishing(true);
    try {
      const response = await fetch("/api/v1/admin/operations", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ configId: "operation-home-announcement", action: "publish-announcement" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("运营公告发布失败");
        return;
      }

      const payload = (await response.json()) as AdminOperationActionPayload;
      setOperationsManagement((current) => {
        const configs = current ? current.configs.map((config) => config.id === payload.config.id ? payload.config : config) : [payload.config];
        const summary = {
          total: configs.length,
          activeCount: configs.filter((config) => config.status === "active").length,
          draftCount: configs.filter((config) => config.status === "draft").length,
          scheduledCount: configs.filter((config) => config.status === "scheduled").length,
          averageRolloutPercent: configs.length ? Math.round(configs.reduce((sum, config) => sum + config.rolloutPercent, 0) / configs.length) : 0
        };

        return current ? { ...current, configs, summary } : {
          actor: { id: "admin-local", name: "本地管理员", role: "ops" },
          configs,
          summary,
          generatedAt: new Date().toISOString()
        };
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("运营公告已发布");
    } catch {
      setNotice("运营公告发布失败");
    } finally {
      setOperationsPublishing(false);
    }
  };

  const saveAppConfig = async (key: string, payloadJson: string) => {
    let payload: unknown;
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      setNotice("JSON 格式不正确，保存失败");
      return;
    }

    setAppConfigSaving(true);
    try {
      const response = await fetch("/api/v1/admin/app-configs", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ key, payload, status: "active" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("应用配置发布失败");
        return;
      }

      const result = (await response.json()) as AdminAppConfigUpdatePayload;
      setAppConfigManagement((current) => {
        const configs = current ? current.configs.map((config) => config.key === result.config.key ? result.config : config) : [result.config];
        const summary = {
          total: configs.length,
          activeCount: configs.filter((config) => config.status === "active").length,
          draftCount: configs.filter((config) => config.status === "draft").length,
          updatedAt: result.config.updatedAt
        };

        return current ? { ...current, configs, summary } : {
          actor: { id: "admin-local", name: "本地管理员", role: "ops" },
          configs,
          summary,
          generatedAt: new Date().toISOString()
        };
      });
      setAuditLogs((logs) => [result.audit, ...logs]);
      setNotice("应用配置已发布");
    } catch {
      setNotice("应用配置发布失败");
    } finally {
      setAppConfigSaving(false);
    }
  };

  const refreshDashboard = async () => {
    setDashboardRefreshing(true);
    try {
      const response = await fetch("/api/v1/admin/dashboard", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action: "refresh" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("数据看板刷新失败");
        return;
      }

      const payload = (await response.json()) as AdminDashboardActionPayload;
      const nextDashboard: AdminDashboardPayload = dashboardManagement ? {
        ...dashboardManagement,
        snapshot: payload.snapshot,
        generatedAt: new Date().toISOString()
      } : {
        actor: { id: "admin-local", name: "本地管理员", role: "ops" },
        snapshot: payload.snapshot,
        generatedAt: new Date().toISOString()
      };
      setDashboardManagement(nextDashboard);
      setKpis(payload.snapshot.kpis);
      setTraffic(payload.snapshot.traffic);
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("数据看板已刷新");
    } catch {
      setNotice("数据看板刷新失败");
    } finally {
      setDashboardRefreshing(false);
    }
  };

  const resolveApprovalRequest = async () => {
    const request = approvalsManagement?.requests.find((item) => item.status === "pending" && item.risk === "高") ?? approvalsManagement?.requests.find((item) => item.status === "pending");
    if (!request) {
      setNotice("暂无待审批请求");
      return;
    }

    setApprovalResolving(true);
    try {
      const response = await fetch("/api/v1/admin/approvals", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ requestId: request.id, action: "approve" })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("审批请求处理失败");
        return;
      }

      const payload = (await response.json()) as AdminApprovalActionPayload;
      setApprovalsManagement((current) => {
        const requests = current ? current.requests.map((item) => item.id === payload.request.id ? payload.request : item) : [payload.request];
        const summary = {
          total: requests.length,
          pendingCount: requests.filter((item) => item.status === "pending").length,
          approvedCount: requests.filter((item) => item.status === "approved").length,
          rejectedCount: requests.filter((item) => item.status === "rejected").length,
          highRiskCount: requests.filter((item) => item.risk === "高" && item.status === "pending").length
        };

        return current ? { ...current, requests, summary } : {
          actor: { id: "admin-local", name: "本地管理员", role: "owner" },
          requests,
          summary,
          generatedAt: new Date().toISOString()
        };
      });
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("审批请求已通过");
    } catch {
      setNotice("审批请求处理失败");
    } finally {
      setApprovalResolving(false);
    }
  };

  const quickResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return modules.filter((module) => `${module.label} ${module.description} ${module.owner}`.toLowerCase().includes(query)).slice(0, 5);
  }, [modules, search]);

  const submitAdminAction = async (module: AdminModule, action: string, confirmation?: "confirmed") => {
    try {
      const response = await fetch("/api/v1/admin/actions", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ moduleId: module.id, action, target: module.label, ...(confirmation ? { confirmation } : {}) })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice(`${action}权限不足或提交失败`);
        return;
      }
      const payload = (await response.json()) as AdminActionPayload;
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice(`${action}已记录审计`);
    } catch {
      setNotice(`${action}提交失败`);
    }
  };

  const runAdminAction: AdminActionHandler = (module, action) => {
    if (isSensitiveAdminAction(action)) {
      setPendingAction({ module, action });
      return;
    }

    void submitAdminAction(module, action);
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;

    const { module, action } = pendingAction;
    setPendingAction(null);
    void submitAdminAction(module, action, "confirmed");
  };

  const toggleRoleModule = (role: AdminRole, moduleId: AdminModuleId) => {
    setRoleDrafts((drafts) => {
      const base = drafts[role] ?? roleManagement?.roles.find((item) => item.role === role)?.moduleIds ?? [];
      const next = base.includes(moduleId) ? base.filter((id) => id !== moduleId) : [...base, moduleId];

      return {
        ...drafts,
        [role]: next
      };
    });
  };

  const saveRolePermissions = async (role: AdminRole) => {
    const moduleIds = roleDrafts[role] ?? roleManagement?.roles.find((item) => item.role === role)?.moduleIds ?? [];
    setRoleSaving(true);
    try {
      const response = await fetch("/api/v1/admin/roles", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ role, moduleIds })
      });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice(`${role} 权限保存失败`);
        return;
      }
      const payload = (await response.json()) as AdminRoleUpdatePayload;
      setRoleDrafts((drafts) => ({ ...drafts, [payload.role]: payload.moduleIds }));
      setRoleManagement((current) => current ? {
        ...current,
        roles: current.roles.map((item) => item.role === payload.role ? { ...item, moduleIds: payload.moduleIds } : item)
      } : current);
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice(`${payload.role} 权限已保存`);
    } catch {
      setNotice(`${role} 权限保存失败`);
    } finally {
      setRoleSaving(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/sessions/${sessionId}`, { method: "DELETE" });
      if (response.status === 401) {
        setAuthState("login");
        return;
      }
      if (!response.ok) {
        setNotice("会话撤销失败");
        return;
      }
      const payload = (await response.json()) as AdminSessionRevokePayload;
      setAccountManagement((current) => current ? {
        ...current,
        accounts: current.accounts.map((account) => {
          const activeSessions = (account.activeSessions ?? []).filter((session) => session.id !== payload.session.id);

          return {
            ...account,
            activeSessions,
            activeSessionCount: activeSessions.length
          };
        })
      } : current);
      setAuditLogs((logs) => [payload.audit, ...logs]);
      setNotice("管理员会话已撤销");
    } catch {
      setNotice("会话撤销失败");
    }
  };

  const submitAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await fetch("/api/v1/admin/session", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      if (!response.ok) {
        setLoginError("管理员账号或密码不正确");
        return;
      }
      await response.json();
      await loadOverview();
    } catch {
      setLoginError("管理员登录失败，请稍后重试");
    } finally {
      setLoginLoading(false);
    }
  };

  if (authState === "login") {
    return (
      <AdminLoginPanel
        email={adminEmail}
        error={loginError}
        loading={loginLoading}
        password={adminPassword}
        onEmailChange={setAdminEmail}
        onPasswordChange={setAdminPassword}
        onSubmit={submitAdminLogin}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-[var(--c-bg)] text-[var(--c-ink)]" data-admin-source={adminSource} data-testid="admin-ready">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] bg-[var(--c-bg)]">
        <AdminSidebar activeId={activeId} modules={modules} onSelect={setActiveId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader activeModule={activeModule} search={search} onSearchChange={setSearch} />
          <MobileModuleStrip activeId={activeId} modules={modules} onSelect={setActiveId} />
          <div className="aibd-scroll flex-1 overflow-auto p-4 lg:p-7">
            {quickResults.length ? (
              <div className="mb-4 rounded-[18px] border border-[var(--c-line)] bg-white p-4 shadow-card">
                <div className="mb-3 text-[11px] font-black text-[var(--c-ink-muted)]">搜索结果</div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {quickResults.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => setActiveId(module.id)}
                      className="flex items-center justify-between gap-3 rounded-[12px] bg-[var(--c-surface-soft)] px-3 py-2 text-left text-[12px] font-black text-[var(--c-ink)]"
                    >
                      {module.label}
                      <ChevronRightIcon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {renderModuleBody(activeModule, {
              kpis,
              modules,
              traffic,
              dashboardManagement,
              dashboardRefreshing,
              auditLogs,
              auditPolicy,
              aiUsage,
              aiUsageMitigating,
              auditExporting,
              auditReviewing,
              auditRetentionUpdating,
              auditRiskFilter,
              accountManagement,
              userManagement,
              userFreezing,
              mistakeManagement,
              mistakeIntervening,
              safetyManagement,
              safetyBlocking,
              systemHealth,
              systemChecking,
              billingManagement,
              billingProcessing,
              curriculumManagement,
              curriculumStarting,
              operationsManagement,
              operationsPublishing,
              appConfigManagement,
              appConfigSaving,
              approvalsManagement,
              approvalResolving,
              detail: moduleDetail,
              promptCreating,
              promptManagement,
              wordbookManagement,
              wordbookPublishing,
              vocabularyManagement,
              vocabularyScanning,
              importQuality,
              importStarting,
              onAuditRiskChange: changeAuditRisk,
              onAction: runAdminAction,
              onRefreshDashboard: refreshDashboard,
              onReviewHighRiskAudit: reviewHighRiskAudit,
              onExtendAuditRetention: extendAuditRetention,
              onMitigateAiUsageAlert: mitigateAiUsageAlert,
              onCreatePromptVersion: createPromptVersion,
              onStartVocabularyScan: startVocabularyScan,
              onExportAuditLogs: exportAuditLogs,
              onPublishWordbookRelease: publishWordbookRelease,
              onRerunImportJob: rerunImportJob,
              onFreezeUserAccount: freezeUserAccount,
              onCreateMistakeIntervention: createMistakeIntervention,
              onBlockSafetyReview: blockSafetyReview,
              onRunSystemHealthCheck: runSystemHealthCheck,
              onProcessBillingRefund: processBillingRefund,
              onStartCurriculumGray: startCurriculumGray,
              onPublishOperationAnnouncement: publishOperationAnnouncement,
              onSaveAppConfig: saveAppConfig,
              onResolveApprovalRequest: resolveApprovalRequest,
              onRevokeSession: revokeSession,
              onSaveRolePermissions: saveRolePermissions,
              onSelectRole: setSelectedRole,
              onToggleRoleModule: toggleRoleModule,
              roleDrafts,
              roleManagement,
              roleSaving,
              selectedRole
            })}
          </div>
        </div>
      </div>
      {pendingAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4">
          <section role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="w-full max-w-[420px] rounded-[20px] bg-white p-5 shadow-pop">
            <Tag color="var(--c-danger)" bg="rgba(255,90,111,.12)" size="xs">敏感操作</Tag>
            <h2 id="admin-confirm-title" className="aibd-display mt-3 text-[24px] leading-tight">确认敏感操作</h2>
            <p className="mt-2 text-[12px] font-semibold leading-6 text-[var(--c-ink-soft)]">
              即将执行 {pendingAction.module.label} 的 {pendingAction.action}，系统会写入审计日志并记录操作者。
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="h-11 rounded-[13px] border border-[var(--c-line)] bg-white text-[12px] font-black text-[var(--c-ink-soft)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmPendingAction}
                className="h-11 rounded-[13px] bg-[var(--c-danger)] text-[12px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.14)]"
              >
                确认执行
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {notice ? <div className="fixed right-4 top-4 z-50 rounded-[14px] bg-[var(--c-ink)] px-4 py-3 text-[12px] font-black text-white shadow-pop">{notice}</div> : null}
    </main>
  );
}
