import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LEARNING_STATE, useAppStore } from "@/store/app-store";
import { useStudySession } from "./use-study-session";
import type { Word } from "./words";

const sampleWords: Word[] = [
  {
    id: "w1",
    word: "persist",
    ipa: "/pərˈsɪst/",
    pos: "v.",
    cn: "坚持",
    cnLong: "坚持做某事，不轻易放弃",
    etym: "per 一直 + sist 站立",
    examples: [{ en: "I persist in training.", cn: "我坚持训练。", tag: "校园" }],
    tags: ["中考核心"]
  },
  {
    id: "w2",
    word: "ambition",
    ipa: "/æmˈbɪʃn/",
    pos: "n.",
    cn: "抱负",
    cnLong: "强烈想达成目标的愿望",
    etym: "ambit 四处走动，主动争取",
    examples: [{ en: "Her ambition is clear.", cn: "她的目标很清晰。", tag: "AI" }],
    tags: ["高频"]
  }
];

describe("useStudySession", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().resetLearning();
  });

  it("moves asking to revealing to done while awarding XP and hearts", async () => {
    const { result } = renderHook(() => useStudySession({ mode: "mc", words: sampleWords }));

    expect(result.current.phase).toBe("asking");
    expect(result.current.current?.word).toBe("persist");

    act(() => result.current.submit(true));
    expect(result.current.phase).toBe("revealing");
    expect(result.current.results).toHaveLength(1);
    expect(useAppStore.getState().learning.xp).toBe(DEFAULT_LEARNING_STATE.xp + 12);

    await act(async () => {
      await result.current.next();
    });
    expect(result.current.phase).toBe("asking");
    expect(result.current.current?.word).toBe("ambition");

    act(() => result.current.submit(false));
    expect(useAppStore.getState().learning.hearts).toBe(DEFAULT_LEARNING_STATE.hearts - 1);

    await act(async () => {
      await result.current.next();
    });
    expect(result.current.phase).toBe("done");
    expect(useAppStore.getState().lastStudyResult).toMatchObject({
      mode: "mc",
      total: 2,
      correct: 1,
      xpEarned: 12,
      heartsLost: 1
    });
  });

  it("ignores duplicate submissions after a question is revealing", () => {
    const { result } = renderHook(() => useStudySession({ mode: "spell", words: sampleWords }));

    act(() => {
      result.current.submit(true);
      result.current.submit(true);
    });

    expect(result.current.results).toHaveLength(1);
    expect(useAppStore.getState().learning.xp).toBe(DEFAULT_LEARNING_STATE.xp + 12);
  });

  it("attaches mistake coach feedback from answer fallback and AI refresh", async () => {
    const { result } = renderHook(() =>
      useStudySession({
        mode: "mc",
        words: sampleWords,
        submitAnswer: async () => ({
          ok: true,
          xpAwarded: 0,
          heartsLost: 1,
          newMastery: 0.42,
          coach: {
            title: "释义选择错因教练",
            cause: "fallback cause",
            explanation: "fallback explanation",
            memoryTip: "fallback tip",
            microDrill: { prompt: "fallback prompt", answer: "fallback answer" },
            nextAction: "fallback action",
            tags: ["fallback"],
            source: "fallback"
          }
        }),
        getMistakeCoach: async () => ({
          title: "AI 错因教练",
          cause: "ai cause",
          explanation: "ai explanation",
          memoryTip: "ai tip",
          microDrill: { prompt: "ai prompt", answer: "ai answer" },
          nextAction: "ai action",
          tags: ["ai"],
          source: "ai"
        })
      })
    );

    act(() => result.current.submit(false));

    await waitFor(() => {
      expect(result.current.currentCoach).toMatchObject({ title: "AI 错因教练", source: "ai" });
    });
  });
});
