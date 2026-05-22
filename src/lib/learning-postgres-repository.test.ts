import { describe, expect, it } from "vitest";
import type { MistakeItem } from "./mistakes-data";
import { PostgresLearningRecordRepository, type LearningSqlClient } from "./learning-postgres-repository";

class RecordingLearningSqlClient implements LearningSqlClient {
  queries: Array<{ sql: string; params: readonly unknown[] }> = [];
  summaryRows: Array<Record<string, unknown>> = [];
  mistakeRows: Array<Record<string, unknown>> = [];

  async query<T>(sql: string, params: readonly unknown[] = []) {
    this.queries.push({ sql, params });

    if (sql.includes("INSERT INTO learning_user_summaries")) {
      this.summaryRows = [
        {
          user_id: params[0],
          xp_earned: params[1],
          hearts_lost: params[2],
          answered_count: params[3]
        }
      ];
      return { rows: [] as T[] };
    }

    if (sql.includes("DELETE FROM learning_mistakes")) {
      this.mistakeRows = [];
      return { rows: [] as T[] };
    }

    if (sql.includes("INSERT INTO learning_mistakes")) {
      this.mistakeRows.push({
        user_id: params[0],
        word_id: params[1],
        wrong_times: params[2],
        last_wrong: params[3],
        mode: params[4],
        reason: params[5],
        mastery: params[6]
      });
      return { rows: [] as T[] };
    }

    if (sql.includes("FROM learning_user_summaries")) {
      return { rows: this.summaryRows as T[] };
    }

    if (sql.includes("FROM learning_mistakes")) {
      return { rows: this.mistakeRows as T[] };
    }

    return { rows: [] as T[] };
  }
}

describe("PostgresLearningRecordRepository", () => {
  it("writes and reads a user learning state using normalized learning tables", async () => {
    const client = new RecordingLearningSqlClient();
    const repository = new PostgresLearningRecordRepository(client);
    const mistake: MistakeItem = {
      wordId: "w3",
      wrongTimes: 2,
      lastWrong: "2026-05-22",
      mode: "spell",
      reason: "拼写召回错误",
      mastery: 0.32
    };

    await repository.writeUserState("u_pg", {
      xpEarned: 12,
      heartsLost: 2,
      answeredCount: 3,
      mistakes: new Map([[mistake.wordId, mistake]])
    });

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO learning_user_summaries"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("DELETE FROM learning_mistakes"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("INSERT INTO learning_mistakes"))).toBe(true);
    await expect(repository.readUserState("u_pg")).resolves.toEqual({
      xpEarned: 12,
      heartsLost: 2,
      answeredCount: 3,
      mistakes: new Map([[mistake.wordId, mistake]])
    });
  });
});
