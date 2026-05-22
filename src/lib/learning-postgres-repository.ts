import { Pool, type QueryResult, type QueryResultRow } from "pg";
import type { MistakeItem } from "./mistakes-data";
import type { LearningRecordRepository, UserLearningState } from "./learning-records";

export type LearningSqlClient = {
  query: LearningSqlQuery;
};

export type LearningSqlQuery = <T extends QueryResultRow = QueryResultRow>(sql: string, params?: readonly unknown[]) => Promise<{ rows: T[] }>;

type LearningSummaryRow = {
  user_id: string;
  xp_earned: number;
  hearts_lost: number;
  answered_count: number;
};

type LearningMistakeRow = {
  user_id: string;
  word_id: string;
  wrong_times: number;
  last_wrong: string | Date;
  mode: MistakeItem["mode"];
  reason: string;
  mastery: number | string;
};

export class PostgresLearningRecordRepository implements LearningRecordRepository {
  constructor(private readonly client: LearningSqlClient) {}

  async readUserState(userId: string) {
    const [summary, mistakes] = await Promise.all([
      this.client.query<LearningSummaryRow>(
        `SELECT user_id, xp_earned, hearts_lost, answered_count
         FROM learning_user_summaries
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
      ),
      this.client.query<LearningMistakeRow>(
        `SELECT user_id, word_id, wrong_times, last_wrong, mode, reason, mastery
         FROM learning_mistakes
         WHERE user_id = $1
         ORDER BY last_wrong DESC, wrong_times DESC`,
        [userId]
      )
    ]);
    const summaryRow = summary.rows[0];
    if (!summaryRow) return null;

    return {
      xpEarned: summaryRow.xp_earned,
      heartsLost: summaryRow.hearts_lost,
      answeredCount: summaryRow.answered_count,
      mistakes: new Map(mistakes.rows.map((row) => [row.word_id, mapMistakeRow(row)]))
    };
  }

  async writeUserState(userId: string, state: UserLearningState) {
    await this.client.query("BEGIN");

    try {
      await this.client.query(
        `INSERT INTO learning_user_summaries (user_id, xp_earned, hearts_lost, answered_count, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (user_id) DO UPDATE
         SET xp_earned = EXCLUDED.xp_earned,
             hearts_lost = EXCLUDED.hearts_lost,
             answered_count = EXCLUDED.answered_count,
             updated_at = EXCLUDED.updated_at`,
        [userId, state.xpEarned, state.heartsLost, state.answeredCount]
      );
      await this.client.query("DELETE FROM learning_mistakes WHERE user_id = $1", [userId]);

      for (const mistake of state.mistakes.values()) {
        await this.client.query(
          `INSERT INTO learning_mistakes (user_id, word_id, wrong_times, last_wrong, mode, reason, mastery, updated_at)
           VALUES ($1, $2, $3, $4::date, $5, $6, $7, now())`,
          [userId, mistake.wordId, mistake.wrongTimes, mistake.lastWrong, mistake.mode, mistake.reason, mistake.mastery]
        );
      }

      await this.client.query("COMMIT");
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw error;
    }
  }

  async reset() {
    await this.client.query("DELETE FROM learning_answer_events");
    await this.client.query("DELETE FROM learning_mistakes");
    await this.client.query("DELETE FROM learning_user_summaries");
  }
}

export function createPostgresLearningRecordRepository(query: LearningSqlQuery) {
  return new PostgresLearningRecordRepository({ query });
}

export function createNodePostgresLearningRecordRepository(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.LEARNING_DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
  });

  return createPostgresLearningRecordRepository(async <T extends QueryResultRow = QueryResultRow>(sql: string, params: readonly unknown[] = []) => {
    const result: QueryResult<T> = await pool.query(sql, [...params]);

    return {
      rows: result.rows
    };
  });
}

function mapMistakeRow(row: LearningMistakeRow): MistakeItem {
  return {
    wordId: row.word_id,
    wrongTimes: row.wrong_times,
    lastWrong: formatDateOnly(row.last_wrong),
    mode: row.mode,
    reason: row.reason,
    mastery: Number(row.mastery)
  };
}

function formatDateOnly(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}
