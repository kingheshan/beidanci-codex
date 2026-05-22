import { describe, expect, it } from "vitest";
import { LEARNING_SCHEMA_VERSION, renderLearningSqlMigration } from "./learning-schema";

describe("learning schema", () => {
  it("renders the production learning tables for summaries, mistakes and answer events", () => {
    const sql = renderLearningSqlMigration();

    expect(LEARNING_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS learning_user_summaries");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS learning_mistakes");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS learning_answer_events");
    expect(sql).toContain("PRIMARY KEY (user_id, word_id)");
    expect(sql).toContain("idx_learning_answer_events_user_time");
  });
});
