import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REVIEW_QUEUE } from "@/lib/review-data";
import { STUDY_WORDS } from "@/lib/words";
import { WordDetailScreen } from "./word-detail-screen";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back })
}));

describe("WordDetailScreen", () => {
  const wordClient = {
    getWord: async (wordId: string) => STUDY_WORDS.find((word) => word.id === wordId) ?? STUDY_WORDS[0],
    getReviewQueue: async () => REVIEW_QUEUE
  };

  beforeEach(() => {
    push.mockClear();
    back.mockClear();
  });

  it("loads definition and examples from the API client", async () => {
    render(<WordDetailScreen wordId="w3" apiClient={wordClient} />);

    expect(await screen.findByRole("heading", { name: "achieve" })).toBeInTheDocument();
    expect(screen.getByText("/əˈtʃiːv/")).toBeInTheDocument();
    expect(screen.getAllByText("实现").length).toBeGreaterThan(0);
    expect(screen.getByText("释义/例句")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("播放例句 We can achieve the goal together.")).toBeInTheDocument();
  });

  it("renders initial word data while the API refresh is still pending", () => {
    render(
      <WordDetailScreen
        wordId="w3"
        initialWord={STUDY_WORDS[2]}
        initialReviewQueue={REVIEW_QUEUE}
        apiClient={{
          getWord: async () => new Promise<never>(() => {}),
          getReviewQueue: async () => REVIEW_QUEUE
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "achieve" })).toBeInTheDocument();
    expect(screen.getByText("/əˈtʃiːv/")).toBeInTheDocument();
  });

  it("renders the web detail layout and routes desktop actions", async () => {
    const user = userEvent.setup();
    render(<WordDetailScreen wordId="w1" apiClient={wordClient} />);

    expect(await screen.findByText("单词详情")).toBeInTheDocument();
    expect(screen.getByText("今日掌握度")).toBeInTheDocument();
    expect(screen.getByText("AI 记忆线索")).toBeInTheDocument();
    expect(screen.getByText("例句 · 含 AI 个性化")).toBeInTheDocument();
    expect(screen.getByText("派生 · 词组 · 关联")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "返回复习队列" }));
    expect(push).toHaveBeenCalledWith("/review");

    await user.click(screen.getByRole("button", { name: "展开完整图谱" }));
    expect(push).toHaveBeenCalledWith("/map/w1");

    await user.click(screen.getByRole("button", { name: "开始复习 persist" }));
    expect(push).toHaveBeenCalledWith("/study/mc");
  });

  it("switches to map and related tabs without dead navigation", async () => {
    const user = userEvent.setup();
    render(<WordDetailScreen wordId="w1" apiClient={wordClient} />);

    await screen.findByRole("heading", { name: "persist" });

    await user.click(screen.getByRole("tab", { name: "联想图谱" }));
    expect(screen.getByText("AI 联想图谱")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "查看完整" }));
    expect(push).toHaveBeenCalledWith("/map/w1");

    await user.click(screen.getByRole("tab", { name: "派生词组" }));
    expect(screen.getAllByText("persistent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("persistence").length).toBeGreaterThan(0);
  });

  it("opens the full AI memory map from the header shortcut", async () => {
    const user = userEvent.setup();
    render(<WordDetailScreen wordId="w1" apiClient={wordClient} />);

    await screen.findByRole("heading", { name: "persist" });

    await user.click(screen.getByRole("button", { name: "AI 记忆图谱" }));
    expect(push).toHaveBeenCalledWith("/map/w1");
  });

  it("shows an API failure state and retries loading the word", async () => {
    const user = userEvent.setup();
    const getWord = vi.fn<(wordId: string) => Promise<(typeof STUDY_WORDS)[number]>>();
    getWord.mockRejectedValueOnce(new Error("Word service offline"));
    getWord.mockResolvedValueOnce(STUDY_WORDS[0]);

    render(
      <WordDetailScreen
        wordId="w1"
        apiClient={{
          getWord,
          getReviewQueue: async () => REVIEW_QUEUE
        }}
      />
    );

    expect(await screen.findByText("单词详情暂时加载失败")).toBeInTheDocument();
    expect(screen.getByText("Word service offline")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载单词详情" }));

    expect(await screen.findByRole("heading", { name: "persist" })).toBeInTheDocument();
    expect(getWord).toHaveBeenCalledTimes(2);
  });
});
