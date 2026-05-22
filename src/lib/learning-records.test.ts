import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createFileLearningRecordRepository,
  getLearningSummary,
  getUserMistakes,
  resetLearningRecordStoreForTests,
  submitLearningAnswer
} from "./learning-records";

describe("learning records", () => {
  afterEach(async () => {
    await resetLearningRecordStoreForTests();
  });

  it("tracks XP, hearts and repeated mistakes per user", async () => {
    const firstWrong = await submitLearningAnswer(
      { wordId: "w3", mode: "spell", correct: false, ms: 1800 },
      { userId: "u_test", now: new Date("2026-05-22T09:30:00.000Z") }
    );
    const secondWrong = await submitLearningAnswer(
      { wordId: "w3", mode: "spell", correct: false, ms: 1500 },
      { userId: "u_test", now: new Date("2026-05-22T09:31:00.000Z") }
    );
    const correct = await submitLearningAnswer(
      { wordId: "w3", mode: "spell", correct: true, ms: 900 },
      { userId: "u_test", now: new Date("2026-05-22T09:32:00.000Z") }
    );

    expect(firstWrong).toMatchObject({ xpAwarded: 0, heartsLost: 1, newMastery: 0.42 });
    expect(firstWrong.coach).toMatchObject({
      title: "拼写召回错因教练",
      source: "fallback"
    });
    expect(secondWrong).toMatchObject({ xpAwarded: 0, heartsLost: 1 });
    expect(correct).toMatchObject({ xpAwarded: 12, heartsLost: 0 });
    expect(correct.newMastery).toBeGreaterThan(secondWrong.newMastery);
    await expect(getLearningSummary("u_test")).resolves.toEqual({ xpEarned: 12, heartsLost: 2, answeredCount: 3 });
    await expect(getUserMistakes("u_test", { filter: "frequent" })).resolves.toEqual([
      expect.objectContaining({
        wordId: "w3",
        wrongTimes: 2,
        lastWrong: "2026-05-22",
        mode: "spell"
      })
    ]);
  });

  it("keeps users isolated and supports mode filters", async () => {
    await submitLearningAnswer(
      { wordId: "w1", mode: "mc", correct: false, ms: 1000 },
      { userId: "u_one", now: new Date("2026-05-22T09:30:00.000Z") }
    );
    await submitLearningAnswer(
      { wordId: "w1", mode: "listen", correct: false, ms: 1000 },
      { userId: "u_two", now: new Date("2026-05-22T09:30:00.000Z") }
    );

    await expect(getUserMistakes("u_one", { filter: "mc" })).resolves.toHaveLength(1);
    await expect(getUserMistakes("u_one", { filter: "listen" })).resolves.toEqual([]);
    await expect(getUserMistakes("u_two", { filter: "listen" })).resolves.toHaveLength(1);
  });

  it("persists records through a fresh file-backed repository instance", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aishang-learning-"));
    const filePath = join(dir, "learning-records.json");
    const repository = createFileLearningRecordRepository(filePath);

    try {
      await submitLearningAnswer(
        { wordId: "w5", mode: "spell", correct: false, ms: 2100 },
        { userId: "u_file", now: new Date("2026-05-22T10:00:00.000Z"), repository }
      );
      await submitLearningAnswer(
        { wordId: "w5", mode: "spell", correct: true, ms: 900 },
        { userId: "u_file", now: new Date("2026-05-22T10:01:00.000Z"), repository }
      );

      const freshRepository = createFileLearningRecordRepository(filePath);
      await expect(getLearningSummary("u_file", { repository: freshRepository })).resolves.toEqual({
        xpEarned: 12,
        heartsLost: 1,
        answeredCount: 2
      });
      await expect(getUserMistakes("u_file", { sort: "mastery" }, { repository: freshRepository })).resolves.toEqual([
        expect.objectContaining({ wordId: "w5", wrongTimes: 1, mode: "spell" })
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
