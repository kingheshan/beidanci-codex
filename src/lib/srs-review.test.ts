import { afterEach, describe, expect, it } from "vitest";
import { resetLearningRecordStoreForTests, submitLearningAnswer } from "./learning-records";
import { getUserReviewQueue } from "./srs-review";

describe("SRS review queue", () => {
  afterEach(async () => {
    await resetLearningRecordStoreForTests();
  });

  it("promotes repeated mistakes into the due-today review queue", async () => {
    await submitLearningAnswer(
      { wordId: "w3", mode: "spell", correct: false, ms: 1800 },
      { userId: "u_srs", now: new Date("2026-05-22T09:00:00.000Z") }
    );
    await submitLearningAnswer(
      { wordId: "w3", mode: "spell", correct: false, ms: 1600 },
      { userId: "u_srs", now: new Date("2026-05-22T09:01:00.000Z") }
    );
    await submitLearningAnswer(
      { wordId: "w5", mode: "image", correct: false, ms: 1500 },
      { userId: "u_srs", now: new Date("2026-05-22T09:02:00.000Z") }
    );

    await expect(getUserReviewQueue("u_srs")).resolves.toEqual([
      expect.objectContaining({ wordId: "w3", mastery: 0.32, due: "今天", state: "weak" }),
      expect.objectContaining({ wordId: "w5", mastery: 0.42, due: "今天", state: "fuzzy" })
    ]);
  });

  it("returns an empty dynamic queue when a user has no learning records", async () => {
    await expect(getUserReviewQueue("u_empty")).resolves.toEqual([]);
  });
});
