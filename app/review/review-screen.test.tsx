import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REVIEW_QUEUE } from "@/lib/review-data";
import { ReviewScreen } from "./review-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("ReviewScreen", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("loads the SRS review queue from the API client", async () => {
    let resolveQueue!: (value: typeof REVIEW_QUEUE) => void;
    const getReviewQueue = vi.fn(
      () =>
        new Promise<typeof REVIEW_QUEUE>((resolve) => {
          resolveQueue = resolve;
        })
    );

    render(<ReviewScreen apiClient={{ getReviewQueue }} />);

    expect(screen.getByRole("status", { name: "正在加载复习队列" })).toBeInTheDocument();
    expect(getReviewQueue).toHaveBeenCalledTimes(1);

    resolveQueue(REVIEW_QUEUE);

    expect(await screen.findByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
  });

  it("renders SRS stats and filters the review queue", async () => {
    const user = userEvent.setup();
    render(<ReviewScreen apiClient={{ getReviewQueue: async () => REVIEW_QUEUE }} />);

    expect(screen.getByText("智能复习")).toBeInTheDocument();
    expect(screen.getByText("基于艾宾浩斯遗忘曲线 · 14 个词等待复习")).toBeInTheDocument();
    expect(screen.getByText("待复习")).toBeInTheDocument();
    expect(screen.getByText("本周完成")).toBeInTheDocument();
    expect(screen.getByText("队列")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始复习 14 词" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "生疏" }));

    expect(screen.getByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /achieve 实现/ })).not.toBeInTheDocument();
  });

  it("opens word detail and starts a review session", async () => {
    const user = userEvent.setup();
    render(<ReviewScreen apiClient={{ getReviewQueue: async () => REVIEW_QUEUE }} />);

    expect(await screen.findByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /persist 坚持/ }));
    expect(push).toHaveBeenCalledWith("/word/w1");

    await user.click(screen.getByRole("button", { name: "开始复习 14 词" }));
    expect(push).toHaveBeenCalledWith("/study/mc?source=review&ids=w1,w5,w2,w6,w3,w4");
  });

  it("shows an API failure state and retries loading the queue", async () => {
    const user = userEvent.setup();
    const getReviewQueue = vi.fn().mockRejectedValueOnce(new Error("queue offline")).mockResolvedValueOnce(REVIEW_QUEUE);

    render(<ReviewScreen apiClient={{ getReviewQueue }} />);

    expect(await screen.findByRole("heading", { name: "复习队列暂时加载失败" })).toBeInTheDocument();
    expect(screen.getByText("queue offline")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载复习队列" }));

    expect(await screen.findByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
    expect(getReviewQueue).toHaveBeenCalledTimes(2);
  });
});
