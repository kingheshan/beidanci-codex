import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { ProScreen } from "./pro-screen";

const push = vi.fn();
const startedAt = "2026-05-22T12:00:00.000Z";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("ProScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    useAppStore.getState().resetSubscription();
  });

  it("renders the PRO feature comparison and three plans with yearly selected", async () => {
    const user = userEvent.setup();
    render(<ProScreen />);

    expect(screen.getByRole("heading", { name: "升级 PRO" })).toBeInTheDocument();
    expect(screen.getByText("解锁全部 AI 能力 · 加速 3 倍背单词")).toBeInTheDocument();
    expect(screen.getAllByTestId("pro-feature")).toHaveLength(8);
    expect(screen.getByRole("button", { name: /月会员/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /年会员/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /终身会员/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "立即升级 PRO · ¥168" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /终身会员/ }));

    expect(screen.getByRole("button", { name: /终身会员/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "立即升级 PRO · ¥488" })).toBeInTheDocument();
  });

  it("activates the selected plan and returns to profile after a success toast", async () => {
    const user = userEvent.setup();
    const apiClient = {
      createProCheckout: vi.fn(async ({ planId }: { planId: "monthly" | "yearly" | "lifetime" }) => ({
        order: {
          id: "bill_test_monthly",
          userId: "u_xiaomin",
          customerName: "小敏",
          planId,
          planName: "月会员",
          amountCny: 18,
          channel: "wechat" as const,
          status: "paid" as const,
          createdAt: startedAt,
          paidAt: startedAt
        },
        subscription: {
          isPro: true,
          planId,
          startedAt,
          expiresAt: "2026-06-21T12:00:00.000Z",
          sourceOrderId: "bill_test_monthly"
        },
        payment: {
          provider: "demo" as const,
          status: "paid" as const,
          message: "演示环境已自动完成支付"
        }
      }))
    };
    render(<ProScreen apiClient={apiClient} />);

    await user.click(screen.getByRole("button", { name: /月会员/ }));
    await user.click(screen.getByRole("button", { name: "立即升级 PRO · ¥18" }));

    expect(apiClient.createProCheckout).toHaveBeenCalledWith({ planId: "monthly", channel: "wechat" });
    expect(screen.getByText("升级成功，已解锁月会员")).toBeInTheDocument();
    expect(useAppStore.getState().subscription).toMatchObject({
      isPro: true,
      planId: "monthly",
      sourceOrderId: "bill_test_monthly"
    });

    await waitFor(() => expect(push).toHaveBeenCalledWith("/me"), { timeout: 1500 });
  });

  it("renders the desktop PRO workspace and routes the web topbar action", async () => {
    const user = userEvent.setup();
    render(<ProScreen />);

    expect(screen.getByRole("heading", { name: "PRO 升级工作台" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PRO 能力对比" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "选择订阅方案" })).toBeInTheDocument();
    expect(screen.getByText("3 倍 AI 学习加速")).toBeInTheDocument();
    expect(screen.getByText("家长安心")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));

    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
