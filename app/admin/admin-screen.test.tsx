import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ADMIN_KPIS, ADMIN_MODULES, ADMIN_TRAFFIC_SERIES } from "@/lib/admin-data";
import { AdminScreen } from "./admin-screen";

describe("AdminScreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a complete operations console with required and supplemental modules", () => {
    render(<AdminScreen />);

    expect(screen.getByTestId("admin-ready")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "管理员后台" })).toBeInTheDocument();

    const required = ["数据看板", "用户管理", "词书管理", "词库管理", "错题分析", "AI 用量", "Prompt 管理", "审计日志"];
    const supplemental = ["权限角色", "审批中心", "导入质量", "课程配置", "运营配置", "订阅订单", "内容安全", "系统健康"];

    for (const label of [...required, ...supplemental]) {
      expect(screen.getAllByRole("button", { name: new RegExp(label) }).length).toBeGreaterThan(0);
    }

    expect(ADMIN_MODULES).toHaveLength(required.length + supplemental.length);
    expect(screen.getByText("今日活跃")).toBeInTheDocument();
    expect(screen.getByText("DeepSeek 成本")).toBeInTheDocument();
    expect(screen.getByText("待处理审计")).toBeInTheDocument();
  });

  it("switches modules and exposes module-specific actions", async () => {
    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /词库管理/ })[0]);
    expect(screen.getByRole("heading", { name: "词库管理" })).toBeInTheDocument();
    expect(screen.getAllByText("全量词库覆盖").length).toBeGreaterThan(0);
    expect(screen.getByText("词条质检队列")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Prompt 管理/ })[0]);
    expect(screen.getByRole("heading", { name: "Prompt 管理" })).toBeInTheDocument();
    expect(screen.getByText("K12 例句生成")).toBeInTheDocument();
    expect(screen.getAllByText("版本回滚").length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /内容安全/ })[0]);
    expect(screen.getByRole("heading", { name: "内容安全" })).toBeInTheDocument();
    expect(screen.getByText("AI 输出抽检")).toBeInTheDocument();
    expect(screen.getByText("未成年人保护")).toBeInTheDocument();
  });

  it("hydrates the overview from the admin API when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS.map((kpi) => (kpi.id === "dau" ? { ...kpi, value: "13,001" } : kpi)),
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-20T11:00:00.000Z"
        })
      }))
    );

    render(<AdminScreen />);

    expect(await screen.findByText("13,001")).toBeInTheDocument();
    expect(screen.getByTestId("admin-ready")).toHaveAttribute("data-admin-source", "api");
  });

  it("loads dashboard snapshots and refreshes metrics", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/dashboard") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            snapshot: {
              id: "dashboard-daily-ops",
              kpis: ADMIN_KPIS.map((kpi) => (kpi.id === "dau" ? { ...kpi, value: "14,032", trend: "+10.2%" } : kpi)),
              traffic: ADMIN_TRAFFIC_SERIES,
              riskRows: [{ id: "users", primary: "用户管理", secondary: "异常账号回访", value: "42", status: "观察", owner: "用户运营" }],
              updatedAt: "2026-05-21T11:20:00.000Z",
              updatedBy: "ops"
            },
            audit: { id: "log-dashboard", time: "20:10", actor: "ops", action: "刷新数据看板", target: "数据看板今日快照", risk: "低" }
          })
        };
      }

      if (url.includes("/api/v1/admin/dashboard")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-ops", name: "运营管理员", role: "ops" },
            snapshot: {
              id: "dashboard-daily-ops",
              kpis: ADMIN_KPIS.map((kpi) => (kpi.id === "dau" ? { ...kpi, value: "13,778", trend: "+9.1%" } : kpi)),
              traffic: ADMIN_TRAFFIC_SERIES,
              riskRows: [{ id: "users", primary: "用户管理", secondary: "异常账号回访", value: "42", status: "观察", owner: "用户运营" }],
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "ops"
            },
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/dashboard");
    expect(await screen.findByText("13,778")).toBeInTheDocument();
    expect(screen.getByText("数据快照 · 更新 ops")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "刷新看板" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/dashboard",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "refresh" })
      })
    );
    expect(await screen.findByText("14,032")).toBeInTheDocument();
    expect(screen.getByText("数据看板已刷新")).toBeInTheDocument();
  });

  it("loads approval requests and approves a pending request", async () => {
    const approvalRequest = {
      id: "approval-export-users",
      title: "导出 PRO 到期用户",
      requesterRole: "ops",
      requesterName: "运营管理员",
      moduleId: "users",
      action: "导出用户",
      target: "PRO 到期用户 1,203 条",
      risk: "高",
      status: "pending",
      reason: "续费召回前需要导出手机号尾号脱敏列表。",
      requestedAt: "2026-05-21T10:00:00.000Z",
      expiresAt: "2026-05-22T10:00:00.000Z",
      resolvedAt: null,
      resolvedBy: null
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/approvals") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            request: {
              ...approvalRequest,
              status: "approved",
              resolvedAt: "2026-05-21T11:20:00.000Z",
              resolvedBy: "owner"
            },
            audit: { id: "log-approval", time: "20:10", actor: "owner", action: "通过审批请求", target: "导出 PRO 到期用户", risk: "中" }
          })
        };
      }

      if (url.includes("/api/v1/admin/approvals")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            summary: { total: 1, pendingCount: 1, approvedCount: 0, rejectedCount: 0, highRiskCount: 1 },
            requests: [approvalRequest],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click((await screen.findAllByRole("button", { name: /审批中心/ }))[0]);
    expect(await screen.findByRole("heading", { name: "审批中心" })).toBeInTheDocument();
    expect((await screen.findAllByText("导出 PRO 到期用户")).length).toBeGreaterThan(0);
    expect(screen.getByText("续费召回前需要导出手机号尾号脱敏列表。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "通过最高风险审批" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/approvals",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ requestId: "approval-export-users", action: "approve" })
      })
    );
    expect(await screen.findByText("审批请求已通过")).toBeInTheDocument();
    expect(screen.getAllByText("已通过").length).toBeGreaterThan(0);
  });

  it("prompts for admin sign-in when the API rejects an unauthenticated session", async () => {
    let signedIn = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/session")) {
        signedIn = true;
        return {
          ok: true,
          json: async () => ({ actor: { id: "admin-owner", name: "超级管理员", role: "owner" } })
        };
      }

      if (url.includes("/api/v1/admin/overview") && !signedIn) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ code: "ADMIN_UNAUTHORIZED" })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-20T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    expect(await screen.findByRole("heading", { name: "管理员登录" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "演示管理员登录" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "owner@aishang.local", password: "admin-demo" })
      })
    );
    expect(await screen.findByText("12,846")).toBeInTheDocument();
    expect(screen.getByTestId("admin-ready")).toHaveAttribute("data-admin-source", "api");
  });

  it("submits privileged module actions and surfaces an audit confirmation", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/actions")) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            audit: { id: "log-test", time: "19:10", actor: "owner", action: "版本回滚", target: "prompts", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/audit")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            auditLogs: [{ id: "log-test", time: "19:10", actor: "owner", action: "版本回滚", target: "prompts", risk: "中" }],
            policy: {
              id: "audit-policy-default",
              sensitiveExportPolicy: "双人审批",
              promptReleasePolicy: "自动留存 diff",
              retentionDays: 365,
              highRiskAlertChannel: "lark-email",
              highRiskReviewStatus: "pending",
              highRiskReviewedAt: null,
              highRiskReviewedBy: null,
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "auditor"
            },
            query: {},
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-20T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /Prompt 管理/ })[0]);
    await user.click(screen.getByRole("button", { name: "版本回滚" }));
    expect(await screen.findByRole("heading", { name: "确认敏感操作" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "确认执行" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/actions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ moduleId: "prompts", action: "版本回滚", target: "Prompt 管理", confirmation: "confirmed" })
      })
    );
    expect(await screen.findByText("版本回滚已记录审计")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /审计日志/ })[0]);
    expect(screen.getByText("owner · 版本回滚")).toBeInTheDocument();
  });

  it("filters and exports audit logs from the audit API", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const decodedUrl = decodeURIComponent(url);
      if (decodedUrl.includes("/api/v1/admin/audit") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            policy: {
              id: "audit-policy-default",
              sensitiveExportPolicy: "双人审批",
              promptReleasePolicy: "自动留存 diff",
              retentionDays: 730,
              highRiskAlertChannel: "lark-email",
              highRiskReviewStatus: "reviewed",
              highRiskReviewedAt: "2026-05-21T12:00:00.000Z",
              highRiskReviewedBy: "auditor",
              updatedAt: "2026-05-21T12:00:00.000Z",
              updatedBy: "auditor"
            },
            audit: { id: "log-policy", time: "20:12", actor: "auditor", action: "复核高危审计日志", target: "高危审计日志队列", risk: "中" }
          })
        };
      }
      if (decodedUrl.includes("/api/v1/admin/audit?risk=高&format=csv")) {
        return {
          ok: true,
          text: async () => "time,actor,action,target,risk\n20:10,owner,导出日志,审计日志,高\n"
        };
      }
      if (decodedUrl.includes("/api/v1/admin/audit?risk=高")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            auditLogs: [{ id: "log-high", time: "20:10", actor: "owner", action: "导出日志", target: "审计日志", risk: "高" }],
            policy: {
              id: "audit-policy-default",
              sensitiveExportPolicy: "双人审批",
              promptReleasePolicy: "自动留存 diff",
              retentionDays: 365,
              highRiskAlertChannel: "lark-email",
              highRiskReviewStatus: "pending",
              highRiskReviewedAt: null,
              highRiskReviewedBy: null,
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "auditor"
            },
            query: { risk: "高" },
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }
      if (decodedUrl.includes("/api/v1/admin/audit")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            auditLogs: [],
            policy: {
              id: "audit-policy-default",
              sensitiveExportPolicy: "双人审批",
              promptReleasePolicy: "自动留存 diff",
              retentionDays: 365,
              highRiskAlertChannel: "lark-email",
              highRiskReviewStatus: "pending",
              highRiskReviewedAt: null,
              highRiskReviewedBy: null,
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "auditor"
            },
            query: {},
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /审计日志/ })[0]);
    await user.click(screen.getByRole("button", { name: "高风险" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/audit?risk=%E9%AB%98");
    expect(await screen.findByText("owner · 导出日志")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "导出当前审计日志" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/audit?risk=%E9%AB%98&format=csv");
    expect(await screen.findByText("审计日志导出已生成")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "复核高危日志" }));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/audit",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "review-high-risk" })
      })
    );
    expect(await screen.findByText("高危审计日志已复核")).toBeInTheDocument();
    expect(await screen.findByText("已复核")).toBeInTheDocument();
  });

  it("loads live DeepSeek telemetry and mitigates AI usage alerts", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/ai-usage") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            alert: {
              id: "ai-budget-deepseek-daily",
              kind: "budget",
              title: "DeepSeek 日预算接近阈值",
              feature: "all",
              severity: "high",
              status: "mitigated",
              threshold: 0.85,
              currentValue: 0.92,
              unit: "budget",
              recommendation: "已启用故事和记忆图谱降级策略。",
              owner: "AI 平台",
              updatedAt: "2026-05-21T11:05:00.000Z",
              updatedBy: "owner"
            },
            audit: { id: "log-ai-usage", time: "20:10", actor: "owner", action: "启用 AI 降级策略", target: "DeepSeek 日预算接近阈值", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/ai-usage")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            summary: {
              totalCalls: 4,
              failedCalls: 1,
              totalTokens: 123456,
              promptTokens: 90000,
              completionTokens: 33456,
              estimatedCostCny: 12.34,
              averageLatencyMs: 980,
              failureRate: 25,
              budgetCny: 100,
              budgetUsedPercent: 12.34
            },
            events: [
              { id: "ai-evt-1", feature: "story", model: "deepseek-chat", status: "success", promptTokens: 1000, completionTokens: 300, totalTokens: 1300, latencyMs: 880, costCny: 0.01, createdAt: "2026-05-21T10:00:00.000Z" }
            ],
            alerts: [
              {
                id: "ai-budget-deepseek-daily",
                kind: "budget",
                title: "DeepSeek 日预算接近阈值",
                feature: "all",
                severity: "high",
                status: "open",
                threshold: 0.85,
                currentValue: 0.92,
                unit: "budget",
                recommendation: "对故事和记忆图谱启用缓存与降级策略。",
                owner: "AI 平台",
                updatedAt: "2026-05-21T10:00:00.000Z",
                updatedBy: "system"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /AI 用量/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/ai-usage");
    expect(await screen.findByText("123,456 tokens")).toBeInTheDocument();
    expect(screen.getByText("¥12.34")).toBeInTheDocument();
    expect(screen.getByText("25.0%")).toBeInTheDocument();
    expect(screen.getByText("story · success")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI 预算告警" })).toBeInTheDocument();
    expect(screen.getByText("DeepSeek 日预算接近阈值")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "启用降级策略" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/ai-usage",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ alertId: "ai-budget-deepseek-daily", action: "enable-fallback" })
      })
    );
    expect(await screen.findByText("AI 降级策略已启用")).toBeInTheDocument();
    expect(screen.getByText("已处理")).toBeInTheDocument();
  });

  it("loads system health checks and runs a manual health check", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/system") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            check: {
              id: "system-deepseek-gateway",
              service: "deepseek",
              label: "DeepSeek 网关",
              status: "healthy",
              latencyMs: 940,
              uptimePercent: 99.92,
              detail: "最近一次手动检查通过。",
              owner: "AI 平台",
              checkedAt: "2026-05-21T11:10:00.000Z",
              updatedBy: "owner"
            },
            audit: { id: "log-system", time: "20:10", actor: "owner", action: "运行系统健康检查", target: "DeepSeek 网关", risk: "低" }
          })
        };
      }
      if (url.includes("/api/v1/admin/system")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            summary: { total: 6, healthyCount: 4, watchCount: 1, riskCount: 1, averageLatencyMs: 486 },
            checks: [
              {
                id: "system-deepseek-gateway",
                service: "deepseek",
                label: "DeepSeek 网关",
                status: "watch",
                latencyMs: 1820,
                uptimePercent: 99.82,
                detail: "故事、例句、记忆图谱调用延迟观察。",
                owner: "AI 平台",
                checkedAt: "2026-05-21T10:00:00.000Z",
                updatedBy: "system"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /系统健康/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/system");
    expect(await screen.findByRole("heading", { name: "系统健康检查" })).toBeInTheDocument();
    expect(screen.getAllByText("DeepSeek 网关").length).toBeGreaterThan(0);
    expect(screen.getAllByText("观察").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "运行健康检查" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/system",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ checkId: "system-deepseek-gateway", action: "run-check" })
      })
    );
    expect(await screen.findByText("健康检查已完成")).toBeInTheDocument();
    expect(screen.getAllByText("正常").length).toBeGreaterThan(0);
  });

  it("loads billing orders and approves a refund request", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/billing") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            order: {
              id: "billing-refund-ryan",
              userId: "user-ryan",
              customerName: "Ryan 家长",
              plan: "pro-monthly",
              amountCny: 29,
              channel: "wechat",
              status: "refunded",
              entitlementStatus: "revoked",
              refundReason: "家长误购后 24 小时内申请退款。",
              couponCode: null,
              updatedAt: "2026-05-21T11:10:00.000Z",
              updatedBy: "finance"
            },
            audit: { id: "log-billing", time: "20:10", actor: "finance", action: "处理退款申请", target: "Ryan 家长 · PRO 月卡", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/billing")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-finance", name: "财务管理员", role: "finance" },
            summary: { mrrCny: 38420, activeSubscriptionCount: 2, refundRequestCount: 1, refundAmountCny: 29, couponActiveCount: 420 },
            orders: [
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
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /订阅订单/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/billing");
    expect(await screen.findByRole("heading", { name: "订阅与订单治理" })).toBeInTheDocument();
    expect(screen.getAllByText("Ryan 家长").length).toBeGreaterThan(0);
    expect(screen.getAllByText("退款申请").length).toBeGreaterThan(0);
    expect(screen.getByText("¥38,420")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "处理退款申请" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/billing",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ orderId: "billing-refund-ryan", action: "approve-refund" })
      })
    );
    expect(await screen.findByText("退款申请已处理")).toBeInTheDocument();
    expect(screen.getAllByText("已退款").length).toBeGreaterThan(0);
    expect(screen.getAllByText("权益已撤销").length).toBeGreaterThan(0);
  });

  it("loads curriculum policies and starts a gray rollout", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/curriculum") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            policy: {
              id: "curriculum-zhongkao-sprint",
              title: "中考冲刺计划",
              wordbookId: "zhongkao-1600",
              gradeBand: "初中",
              dailyNewWords: 20,
              dailyReviewWords: 25,
              srsProfile: "exam",
              modeWeights: { mc: 24, flip: 12, spell: 18, listen: 14, context: 22, image: 10 },
              status: "gray",
              rolloutPercent: 20,
              owner: "教研团队",
              updatedAt: "2026-05-21T11:20:00.000Z",
              updatedBy: "research"
            },
            audit: { id: "log-curriculum", time: "20:10", actor: "research", action: "灰度课程策略", target: "中考冲刺计划 · 中考 1600", risk: "低" }
          })
        };
      }
      if (url.includes("/api/v1/admin/curriculum")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-research", name: "教研管理员", role: "research" },
            summary: { total: 4, activeCount: 2, grayCount: 0, draftCount: 2, averageDailyNewWords: 16 },
            policies: [
              {
                id: "curriculum-zhongkao-sprint",
                title: "中考冲刺计划",
                wordbookId: "zhongkao-1600",
                gradeBand: "初中",
                dailyNewWords: 20,
                dailyReviewWords: 25,
                srsProfile: "exam",
                modeWeights: { mc: 24, flip: 12, spell: 18, listen: 14, context: 22, image: 10 },
                status: "draft",
                rolloutPercent: 0,
                owner: "教研团队",
                updatedAt: "2026-05-21T10:00:00.000Z",
                updatedBy: "research"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /课程配置/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/curriculum");
    expect(await screen.findByRole("heading", { name: "课程策略中心" })).toBeInTheDocument();
    expect(screen.getAllByText("中考冲刺计划").length).toBeGreaterThan(0);
    expect(screen.getAllByText("待灰度").length).toBeGreaterThan(0);
    expect(screen.getByText("20 新词")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "启动策略灰度" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/curriculum",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ policyId: "curriculum-zhongkao-sprint", action: "start-gray" })
      })
    );
    expect(await screen.findByText("课程策略灰度已启动")).toBeInTheDocument();
    expect(screen.getAllByText("灰度中").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20%").length).toBeGreaterThan(0);
  });

  it("loads operation configs and publishes a home announcement", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/operations") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            config: {
              id: "operation-home-announcement",
              kind: "announcement",
              title: "首页学习挑战公告",
              surface: "home",
              status: "active",
              audience: "all",
              rolloutPercent: 100,
              payload: "连续 7 天完成学习送 80 gems。",
              owner: "增长运营",
              updatedAt: "2026-05-21T11:20:00.000Z",
              updatedBy: "ops"
            },
            audit: { id: "log-operations", time: "20:10", actor: "ops", action: "发布运营公告", target: "首页学习挑战公告 · 首页", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/operations")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-ops", name: "运营管理员", role: "ops" },
            summary: { total: 4, activeCount: 2, draftCount: 1, scheduledCount: 1, averageRolloutPercent: 38 },
            configs: [
              {
                id: "operation-home-announcement",
                kind: "announcement",
                title: "首页学习挑战公告",
                surface: "home",
                status: "draft",
                audience: "all",
                rolloutPercent: 0,
                payload: "连续 7 天完成学习送 80 gems。",
                owner: "增长运营",
                updatedAt: "2026-05-21T10:00:00.000Z",
                updatedBy: "ops"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /运营配置/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/operations");
    expect(await screen.findByRole("heading", { name: "运营发布中心" })).toBeInTheDocument();
    expect(screen.getAllByText("首页学习挑战公告").length).toBeGreaterThan(0);
    expect(screen.getAllByText("草稿").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "发布首页公告" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/operations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ configId: "operation-home-announcement", action: "publish-announcement" })
      })
    );
    expect(await screen.findByText("运营公告已发布")).toBeInTheDocument();
    expect(screen.getAllByText("已发布").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
  });

  it("loads managed app configs and publishes product config JSON", async () => {
    const productConfig = {
      key: "product",
      title: "产品导航与功能开关",
      description: "学习侧栏、移动 Tab、入口角标、功能可用状态。",
      endpoint: "/api/v1/config",
      status: "active",
      version: 1,
      payload: {
        version: 1,
        brand: {
          name: "爱上背单词",
          subtitle: "AI · K12"
        },
        features: {}
      },
      updatedAt: "2026-05-21T10:00:00.000Z",
      updatedBy: "system"
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/app-configs") && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { key: string; payload: Record<string, unknown>; status: string };
        return {
          ok: true,
          json: async () => ({
            config: {
              ...productConfig,
              version: 2,
              payload: body.payload,
              updatedAt: "2026-05-21T11:30:00.000Z",
              updatedBy: "ops"
            },
            audit: { id: "log-app-config", time: "20:30", actor: "ops", action: "发布应用配置", target: "产品导航与功能开关 · /api/v1/config", risk: "低" }
          })
        };
      }

      if (url.includes("/api/v1/admin/app-configs")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-ops", name: "运营管理员", role: "ops" },
            summary: { total: 1, activeCount: 1, draftCount: 0, updatedAt: "2026-05-21T10:00:00.000Z" },
            configs: [productConfig],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      if (url.includes("/api/v1/admin/operations")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-ops", name: "运营管理员", role: "ops" },
            summary: { total: 0, activeCount: 0, draftCount: 0, scheduledCount: 0, averageRolloutPercent: 0 },
            configs: [],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /运营配置/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/app-configs");
    expect(await screen.findByRole("heading", { name: "应用配置中心" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑 产品导航与功能开关" })).toBeInTheDocument();

    const textarea = await screen.findByLabelText("产品导航与功能开关 JSON 配置");
    const nextPayload = {
      version: 1,
      brand: {
        name: "爱上背单词",
        subtitle: "AI · K12 · Admin"
      },
      features: {}
    };
    fireEvent.change(textarea, { target: { value: JSON.stringify(nextPayload, null, 2) } });
    await user.click(screen.getByRole("button", { name: "发布 产品导航与功能开关" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/app-configs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ key: "product", payload: nextPayload, status: "active" })
      })
    );
    expect(await screen.findByText("应用配置已发布")).toBeInTheDocument();
    expect(screen.getByText(/更新 ops/)).toBeInTheDocument();
  });

  it("loads managed Prompt versions and creates a draft version", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/prompts") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            prompt: {
              id: "prompt-example-v9",
              key: "example",
              title: "K12 例句生成",
              version: 9,
              status: "draft",
              body: "生成适合中国 K12 学生的安全例句。",
              safetyRules: ["未成年人安全"],
              outputSchema: '{"en":string,"cn":string}',
              notes: "强化低年级安全语境",
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "owner"
            },
            audit: { id: "log-prompt", time: "20:10", actor: "owner", action: "新建 Prompt 版本", target: "K12 例句生成 v9", risk: "低" }
          })
        };
      }
      if (url.includes("/api/v1/admin/prompts")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            prompts: [
              {
                id: "prompt-example-v8",
                key: "example",
                title: "K12 例句生成",
                version: 8,
                status: "online",
                body: "未成年人安全：生成安全例句。",
                safetyRules: ["未成年人安全"],
                outputSchema: '{"en":string,"cn":string}',
                notes: "当前线上版本",
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "AI 教研"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /Prompt 管理/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/prompts");
    expect(await screen.findByText("Prompt 版本库")).toBeInTheDocument();
    expect(screen.getByText("K12 例句生成 · v8")).toBeInTheDocument();
    expect(screen.getByText("当前线上版本")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "创建专业版本" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/prompts",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"key":"example"')
      })
    );
    expect(await screen.findByText("K12 例句生成 · v9")).toBeInTheDocument();
    expect(screen.getByText("Prompt 版本已创建")).toBeInTheDocument();
  });

  it("loads managed wordbook releases and publishes a new version", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/wordbooks") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            release: {
              id: "wordbook-zhongkao-1600-v2026-05-21",
              bookId: "zhongkao-1600",
              title: "中考 1600",
              total: 1600,
              version: "v2026.05.21",
              status: "published",
              source: "ECDICT zk 标签 + 中考核心词",
              cefr: "A2-B1",
              qualityScore: 0.98,
              issueCount: 18,
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "research"
            },
            audit: { id: "log-wordbook", time: "20:10", actor: "research", action: "发布词书版本", target: "中考 1600 v2026.05.21", risk: "低" }
          })
        };
      }
      if (url.includes("/api/v1/admin/wordbooks")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-research", name: "教研管理员", role: "research" },
            releases: [
              {
                id: "wordbook-zhongkao-1600-v2026-05-20",
                bookId: "zhongkao-1600",
                title: "中考 1600",
                total: 1600,
                version: "v2026.05.20",
                status: "published",
                source: "ECDICT zk 标签 + 中考核心词",
                cefr: "A2-B1",
                qualityScore: 0.98,
                issueCount: 18,
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "教研"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /词书管理/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/wordbooks");
    expect(await screen.findByText("词书发布中心")).toBeInTheDocument();
    expect(screen.getByText("中考 1600 · v2026.05.20")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "发布今日版本" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/wordbooks",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"bookId":"zhongkao-1600"')
      })
    );
    expect(await screen.findByText("中考 1600 · v2026.05.21")).toBeInTheDocument();
    expect(screen.getByText("词书版本已发布")).toBeInTheDocument();
  });

  it("loads managed vocabulary quality issues and starts a scan", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/vocabulary") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            issue: {
              id: "vocab-issue-image-abandon-new",
              kind: "image",
              title: "新增图像联想质检",
              word: "abandon",
              bookId: "zhongkao-1600",
              severity: "medium",
              status: "open",
              owner: "AI 教研",
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "research"
            },
            audit: { id: "log-vocab", time: "20:10", actor: "research", action: "启动词库质检", target: "abandon · 新增图像联想质检", risk: "低" }
          })
        };
      }
      if (url.includes("/api/v1/admin/vocabulary")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-research", name: "教研管理员", role: "research" },
            issues: [
              {
                id: "vocab-issue-image-abandon",
                kind: "image",
                title: "图像联想缺口",
                word: "abandon",
                bookId: "zhongkao-1600",
                severity: "medium",
                status: "open",
                owner: "AI 教研",
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "AI 教研"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /词库管理/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/vocabulary");
    expect(await screen.findByText("词库质检队列")).toBeInTheDocument();
    expect(screen.getByText("abandon · 图像联想缺口")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "启动质量扫描" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/vocabulary",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"word":"abandon"')
      })
    );
    expect(await screen.findByText("abandon · 新增图像联想质检")).toBeInTheDocument();
    expect(screen.getByText("词库质检已启动")).toBeInTheDocument();
  });

  it("loads managed import jobs and reruns the ECDICT import", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/import-quality") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            job: {
              id: "import-ecdict-zhongkao-1600-rerun",
              source: "ECDICT 释义同步",
              bookId: "zhongkao-1600",
              status: "running",
              progress: 0,
              totalRows: 1600,
              errorCount: 0,
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "research"
            },
            audit: { id: "log-import", time: "20:10", actor: "research", action: "重跑词书导入", target: "ECDICT 释义同步 · 中考 1600", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/import-quality")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-research", name: "教研管理员", role: "research" },
            jobs: [
              {
                id: "import-ecdict-zhongkao-1600",
                source: "ECDICT 释义同步",
                bookId: "zhongkao-1600",
                status: "done",
                progress: 1,
                totalRows: 1600,
                errorCount: 0,
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "数据工程"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /导入质量/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/import-quality");
    expect(await screen.findByText("导入任务队列")).toBeInTheDocument();
    expect(screen.getByText("ECDICT 释义同步 · done")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重跑 ECDICT 导入" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/import-quality",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"source":"ECDICT 释义同步"')
      })
    );
    expect(await screen.findByText("ECDICT 释义同步 · running")).toBeInTheDocument();
    expect(screen.getByText("导入任务已启动")).toBeInTheDocument();
  });

  it("loads managed user accounts and freezes a risk account", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/users") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            user: {
              id: "user-ryan",
              displayName: "Ryan",
              grade: "初三",
              phone: "13900139000",
              wechatOpenId: "mock-openid-ryan",
              authMethods: ["phone", "wechat"],
              activeWordbook: "zhongkao-1600",
              status: "frozen",
              streak: 7,
              parentBound: true,
              lastSeenAt: "2026-05-21T09:30:00.000Z",
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "support"
            },
            audit: { id: "log-user", time: "20:10", actor: "support", action: "冻结用户账号", target: "Ryan · 初三", risk: "高" }
          })
        };
      }
      if (url.includes("/api/v1/admin/users")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-support", name: "客服管理员", role: "support" },
            users: [
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
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /用户管理/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/users");
    expect(await screen.findByText("用户账号中心")).toBeInTheDocument();
    expect(screen.getByText("Ryan · 初三")).toBeInTheDocument();
    expect(screen.getByText("手机号 + 微信")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "冻结风险账号" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "user-ryan", action: "freeze" })
      })
    );
    expect(await screen.findByText("账号已冻结")).toBeInTheDocument();
    expect(screen.getByText("已冻结")).toBeInTheDocument();
  });

  it("loads managed mistake insights and creates an intervention", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/mistakes") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            insight: {
              id: "mistake-confusion-achieve",
              category: "词义混淆",
              title: "achieve / acquire / accomplish",
              examples: ["achieve", "acquire", "accomplish"],
              mode: "mc",
              wrongCount: 384,
              affectedUsers: 126,
              masteryAvg: 0.31,
              severity: "high",
              status: "watching",
              recommendation: "补充词义辨析卡，并降低首轮干扰项相似度。",
              owner: "学习算法",
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "support"
            },
            audit: { id: "log-mistake", time: "20:10", actor: "support", action: "创建错题干预", target: "词义混淆 · achieve / acquire / accomplish", risk: "中" }
          })
        };
      }
      if (url.includes("/api/v1/admin/mistakes")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-support", name: "客服管理员", role: "support" },
            insights: [
              {
                id: "mistake-confusion-achieve",
                category: "词义混淆",
                title: "achieve / acquire / accomplish",
                examples: ["achieve", "acquire", "accomplish"],
                mode: "mc",
                wrongCount: 384,
                affectedUsers: 126,
                masteryAvg: 0.31,
                severity: "high",
                status: "open",
                recommendation: "补充词义辨析卡，并降低首轮干扰项相似度。",
                owner: "学习算法",
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "学习算法"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /错题分析/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/mistakes");
    expect(await screen.findByText("错题归因中心")).toBeInTheDocument();
    expect(screen.getByText("词义混淆 · achieve / acquire / accomplish")).toBeInTheDocument();
    expect(screen.getByText("选择题")).toBeInTheDocument();
    expect(screen.getByText("126 人受影响")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "创建干预任务" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/mistakes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ insightId: "mistake-confusion-achieve", action: "intervene" })
      })
    );
    expect(await screen.findByText("错题干预已创建")).toBeInTheDocument();
    expect(screen.getByText("干预中")).toBeInTheDocument();
  });

  it("loads managed safety reviews and blocks high-risk content", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/safety") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            review: {
              id: "safety-story-night",
              surface: "story",
              title: "AI 每日故事年龄分级复核",
              sample: "The story contains a tense night chase that needs age-appropriate rewriting.",
              riskType: "minor-safety",
              severity: "high",
              status: "blocked",
              aiDecision: "flagged",
              owner: "安全合规",
              updatedAt: "2026-05-21T10:00:00.000Z",
              updatedBy: "research"
            },
            audit: { id: "log-safety", time: "20:10", actor: "research", action: "拦截安全审核项", target: "AI 每日故事年龄分级复核", risk: "高" }
          })
        };
      }
      if (url.includes("/api/v1/admin/safety")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-research", name: "教研管理员", role: "research" },
            reviews: [
              {
                id: "safety-story-night",
                surface: "story",
                title: "AI 每日故事年龄分级复核",
                sample: "The story contains a tense night chase that needs age-appropriate rewriting.",
                riskType: "minor-safety",
                severity: "high",
                status: "pending",
                aiDecision: "flagged",
                owner: "安全合规",
                updatedAt: "2026-05-20T10:00:00.000Z",
                updatedBy: "安全合规"
              }
            ],
            generatedAt: "2026-05-21T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /内容安全/ })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/safety");
    expect(await screen.findByText("安全审核队列")).toBeInTheDocument();
    expect(screen.getByText("AI 每日故事年龄分级复核")).toBeInTheDocument();
    expect(screen.getByText("未成年人安全")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "处理高危内容" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/safety",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reviewId: "safety-story-night", action: "block" })
      })
    );
    expect(await screen.findByText("内容已拦截")).toBeInTheDocument();
    expect(screen.getByText("已拦截")).toBeInTheDocument();
  });

  it("loads active module table rows from the module detail API", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/modules/vocabulary")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            module: ADMIN_MODULES.find((module) => module.id === "vocabulary"),
            title: "接口返回的词库质量队列",
            rows: [{ id: "api-vocab-row", primary: "API 词条质检", secondary: "来自模块详情接口", value: "9", status: "待处理", owner: "接口" }],
            query: "",
            pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
            generatedAt: "2026-05-20T11:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-20T11:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /词库管理/ })[0]);

    expect(await screen.findByText("接口返回的词库质量队列")).toBeInTheDocument();
    expect(screen.getByText("API 词条质检")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/modules/vocabulary?page=1&pageSize=20");
  });

  it("loads admin account and RBAC management data and saves role permissions", async () => {
    const roleModules = ADMIN_MODULES.map((module) => ({ id: module.id, label: module.label, category: module.category }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/admin/accounts")) {
        return {
          ok: true,
          json: async () => ({
            accounts: [
              { id: "admin-owner", email: "owner@aishang.local", displayName: "超级管理员", role: "owner", mfaEnabled: false, activeSessionCount: 1, activeSessions: [{ id: "sess-owner", expiresAt: "2026-05-21T12:00:00.000Z" }] },
              { id: "admin-support", email: "support@aishang.local", displayName: "客服管理员", role: "support", mfaEnabled: false, activeSessionCount: 0, activeSessions: [] }
            ],
            generatedAt: "2026-05-21T10:00:00.000Z"
          })
        };
      }

      if (url.includes("/api/v1/admin/roles") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            role: "support",
            moduleIds: ["dashboard", "users", "prompts"],
            audit: { id: "log-rbac", time: "20:10", actor: "owner", action: "更新角色权限", target: "support", risk: "中" }
          })
        };
      }

      if (url.includes("/api/v1/admin/roles")) {
        return {
          ok: true,
          json: async () => ({
            roles: [
              { role: "owner", label: "超级管理员", moduleIds: ADMIN_MODULES.map((module) => module.id) },
              { role: "support", label: "客服管理员", moduleIds: ["dashboard", "users"] }
            ],
            modules: roleModules,
            generatedAt: "2026-05-21T10:00:00.000Z"
          })
        };
      }

      if (url.includes("/api/v1/admin/modules/roles")) {
        return {
          ok: true,
          json: async () => ({
            actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
            module: ADMIN_MODULES.find((module) => module.id === "roles"),
            title: "角色与权限矩阵",
            rows: [],
            query: "",
            pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
            generatedAt: "2026-05-21T10:00:00.000Z"
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          actor: { id: "admin-owner", name: "超级管理员", role: "owner" },
          modules: ADMIN_MODULES,
          kpis: ADMIN_KPIS,
          traffic: ADMIN_TRAFFIC_SERIES,
          auditLogs: [],
          generatedAt: "2026-05-21T10:00:00.000Z"
        })
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminScreen />);

    await user.click(screen.getAllByRole("button", { name: /权限角色/ })[0]);
    expect(await screen.findByText("owner@aishang.local")).toBeInTheDocument();
    expect(screen.getByText("support@aishang.local")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "编辑 support 权限" }));
    await user.click(screen.getByRole("checkbox", { name: "允许 Prompt 管理" }));
    await user.click(screen.getByRole("button", { name: "保存 support 权限" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/roles",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ role: "support", moduleIds: ["dashboard", "users", "prompts"] })
      })
    );
    expect(await screen.findByText("support 权限已保存")).toBeInTheDocument();
  });
});
