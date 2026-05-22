import { describe, expect, it } from "vitest";
import { PK_AI_COUNTER_DAMAGE, PK_DAMAGE } from "./pk-data";
import { createPkAiDecision, estimatePkWordDifficulty, resolvePkRound } from "./pk-ai";
import { STUDY_WORDS } from "./words";

describe("pk ai opponent", () => {
  it("estimates harder words with a bounded difficulty score", () => {
    expect(estimatePkWordDifficulty(STUDY_WORDS[0])).toBeGreaterThanOrEqual(0.18);
    expect(estimatePkWordDifficulty(STUDY_WORDS[4])).toBeGreaterThan(estimatePkWordDifficulty(STUDY_WORDS[0]));
    expect(estimatePkWordDifficulty(STUDY_WORDS[4])).toBeLessThanOrEqual(0.92);
  });

  it("creates deterministic AI decisions from round context", () => {
    const input = { word: STUDY_WORDS[0], round: 1, myHp: 1, oppHp: 0.82, secondsLeft: 8 };

    expect(createPkAiDecision(input)).toEqual(createPkAiDecision(input));
    expect(createPkAiDecision(input)).toEqual(
      expect.objectContaining({
        confidence: expect.any(Number),
        correct: expect.any(Boolean),
        reaction: expect.stringMatching(/fast|slow|wrong/),
        replyMs: expect.any(Number),
        strategy: expect.any(String)
      })
    );
  });

  it("keeps a quick correct human answer as a clean hit", () => {
    const question = { word: STUDY_WORDS[0], options: STUDY_WORDS.slice(0, 4) };
    const result = resolvePkRound({ question, optionId: STUDY_WORDS[0].id, round: 0, myHp: 1, oppHp: 1, secondsLeft: 10 });

    expect(result.userCorrect).toBe(true);
    expect(result.aiCountered).toBe(false);
    expect(result.nextMyHp).toBe(1);
    expect(result.nextOppHp).toBeCloseTo(1 - PK_DAMAGE);
  });

  it("lets the AI counter slow correct answers when it wins the speed race", () => {
    const question = { word: STUDY_WORDS[2], options: STUDY_WORDS.slice(0, 4) };
    const result = resolvePkRound({ question, optionId: STUDY_WORDS[2].id, round: 2, myHp: 1, oppHp: 1, secondsLeft: 0 });

    if (result.aiDecision.correct && result.aiDecision.reaction === "fast") {
      expect(result.aiCountered).toBe(true);
      expect(result.nextMyHp).toBeCloseTo(1 - PK_AI_COUNTER_DAMAGE);
    } else {
      expect(result.aiCountered).toBe(false);
      expect(result.nextMyHp).toBe(1);
    }
    expect(result.nextOppHp).toBeCloseTo(1 - PK_DAMAGE);
  });
});
