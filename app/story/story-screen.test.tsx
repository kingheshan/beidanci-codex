import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DAILY_STORY, type DailyStory } from "@/lib/story-data";
import { useAppStore } from "@/store/app-store";
import { StoryScreen } from "./story-screen";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back })
}));

const storyClient = {
  getDailyStory: async () => DAILY_STORY
};

const apiStory: DailyStory = {
  ...DAILY_STORY,
  episode: 208,
  title: "The Sustainable Science Fair",
  cn: "可持续科学展",
  theme: "科学校园",
  question: "What did the class build?",
  options: [
    { id: "a", label: "A sustainable garden for the school", correct: true },
    { id: "b", label: "A noisy robot with no purpose", correct: false }
  ],
  paragraphs: [
    {
      tokens: [
        { text: "Leo designed a ", plain: true },
        { text: "sustainable", wordId: "w5" },
        { text: " garden for the science fair.", plain: true }
      ]
    }
  ]
};

describe("StoryScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    back.mockClear();
    useAppStore.getState().resetOnboarding();
  });

  it("loads the daily story from the API client", async () => {
    render(<StoryScreen apiClient={{ getDailyStory: async () => apiStory }} />);

    expect(await screen.findByRole("heading", { name: "The Sustainable Science Fair" })).toBeInTheDocument();
    expect(screen.getByText("可持续科学展 · 用今天复习的 12 个词写就")).toBeInTheDocument();
    expect(screen.getByText("EPISODE 208 · 科学校园")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sustainable" })).toBeInTheDocument();
    expect(screen.getByText("What did the class build?")).toBeInTheDocument();
  });

  it("requests the daily story with active wordbook and learner preferences", async () => {
    const getDailyStory = vi.fn(async () => apiStory);
    useAppStore.getState().completeOnboarding({
      goal: "ielts_toefl",
      grade: "高一",
      interests: ["tech"],
      dailyWords: 35,
      wordbookId: "toefl"
    });

    render(<StoryScreen apiClient={{ getDailyStory }} initialStory={apiStory} />);

    await waitFor(() => {
      expect(getDailyStory).toHaveBeenCalledWith({
        wordbookId: "toefl",
        grade: "高一",
        interests: ["tech"],
        limit: 6
      });
    });
  });

  it("resolves story words from imported wordbooks", async () => {
    const user = userEvent.setup();
    const toeflStory: DailyStory = {
      ...apiStory,
      paragraphs: [
        {
          tokens: [
            { text: "Her ", plain: true },
            { text: "hypothesis", wordId: "wb-hypothesis" },
            { text: " changed the lab discussion.", plain: true }
          ]
        }
      ]
    };

    render(
      <StoryScreen
        initialStory={toeflStory}
        apiClient={{
          getDailyStory: () => new Promise<DailyStory>(() => undefined)
        }}
      />
    );

    expect(screen.getByRole("button", { name: "hypothesis" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "hypothesis" }));

    expect(screen.getByRole("dialog", { name: "hypothesis 单词卡" })).toBeInTheDocument();
    expect(screen.getByText("假设")).toBeInTheDocument();
  });

  it("renders the daily AI story, review words and comprehension check", () => {
    render(<StoryScreen apiClient={storyClient} initialStory={DAILY_STORY} />);

    expect(screen.getByRole("heading", { name: "The Persistent Bookworm" })).toBeInTheDocument();
    expect(screen.getByText("坚持不懈的书虫 · 用今天复习的 12 个词写就")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ambitious" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "determine" })).toBeInTheDocument();
    expect(screen.getByText("出现的复习词 · 5 / 12")).toBeInTheDocument();
    expect(screen.getByText("What kind of student was Mia?")).toBeInTheDocument();
  });

  it("opens a word popover from story tokens and links to word detail", async () => {
    const user = userEvent.setup();
    render(<StoryScreen apiClient={storyClient} initialStory={DAILY_STORY} />);

    await user.click(screen.getByRole("button", { name: "ambitious" }));

    expect(screen.getByRole("dialog", { name: "ambition 单词卡" })).toBeInTheDocument();
    expect(screen.getByText("/æmˈbɪʃn/")).toBeInTheDocument();
    expect(screen.getByText("抱负")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看详情" }));
    expect(push).toHaveBeenCalledWith("/word/w2");
  });

  it("plays the read-along and marks the comprehension answer", async () => {
    const user = userEvent.setup();
    render(<StoryScreen apiClient={storyClient} initialStory={DAILY_STORY} />);

    expect(screen.getByRole("progressbar", { name: "故事播放进度" })).toHaveAttribute("aria-valuenow", "0");
    await user.click(screen.getByRole("button", { name: "播放故事" }));
    expect(screen.getByRole("button", { name: "暂停故事" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "故事播放进度" })).toHaveAttribute("aria-valuenow", "25");

    await user.click(screen.getByRole("button", { name: /An ambitious and persistent ninth grader/ }));
    expect(screen.getByText("理解正确")).toBeInTheDocument();
    expect(screen.getByText("+8 XP")).toBeInTheDocument();
  });

  it("renders the desktop reading workspace and routes web actions", async () => {
    const user = userEvent.setup();
    render(<StoryScreen apiClient={storyClient} initialStory={DAILY_STORY} />);

    expect(screen.getByText("AI 每日故事")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "阅读助手" })).toBeInTheDocument();
    expect(screen.getByText("今日复习词")).toBeInTheDocument();
    expect(screen.getByText("跟读进度")).toBeInTheDocument();
    expect(screen.getByText("阅读策略")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "播放故事 Web" }));
    expect(screen.getByRole("button", { name: "暂停故事 Web" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "桌面故事播放进度" })).toHaveAttribute("aria-valuenow", "25");
  });

  it("renders initial story data while the API refresh is still pending", () => {
    render(
      <StoryScreen
        initialStory={apiStory}
        apiClient={{
          getDailyStory: () => new Promise<DailyStory>(() => undefined)
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "The Sustainable Science Fair" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sustainable" })).toBeInTheDocument();
  });

  it("shows an API failure state and retries loading the story", async () => {
    const user = userEvent.setup();
    const getDailyStory = vi.fn<() => Promise<DailyStory>>();
    getDailyStory.mockRejectedValueOnce(new Error("Story service offline"));
    getDailyStory.mockResolvedValueOnce(DAILY_STORY);

    render(<StoryScreen apiClient={{ getDailyStory }} />);

    expect(await screen.findByText("Story service offline")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重新加载每日故事" }));

    expect(await screen.findByRole("heading", { name: "The Persistent Bookworm" })).toBeInTheDocument();
    expect(getDailyStory).toHaveBeenCalledTimes(2);
  });
});
