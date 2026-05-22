import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingScreen } from "./onboarding-screen";
import { useAppStore } from "@/store/app-store";

describe("OnboardingScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().resetOnboarding();
  });

  it("collects four onboarding steps and saves preferences", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingScreen onComplete={onComplete} />);

    expect(screen.getByText("你的目标是？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /冲刺中考/ }));
    await user.click(screen.getByRole("button", { name: "下一步" }));

    expect(await screen.findByText("你在读几年级？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "高一" }));
    await user.click(screen.getByRole("button", { name: "下一步" }));

    expect(await screen.findByText("你的兴趣有？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /动漫/ }));
    await user.click(screen.getByRole("button", { name: "下一步" }));

    expect(await screen.findByText("每天打算学多少词？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "开始学习" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().onboarding).toMatchObject({
      completed: true,
      goal: "zhongkao",
      grade: "高一",
      interests: ["sports", "anime"],
      dailyWords: 20,
      wordbookId: "zhongkao-1600"
    });
  });
});
