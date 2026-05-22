export const LEARNING_SCHEMA_VERSION = 1;

type LearningSchemaColumn = {
  name: string;
  type: string;
  constraints?: string;
};

type LearningSchemaTable = {
  name: string;
  columns: LearningSchemaColumn[];
  tableConstraints?: string[];
  indexes?: string[];
};

export const LEARNING_DATABASE_SCHEMA: LearningSchemaTable[] = [
  {
    name: "learning_user_summaries",
    columns: [
      { name: "user_id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "xp_earned", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "hearts_lost", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "answered_count", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: ["CREATE INDEX IF NOT EXISTS idx_learning_user_summaries_updated ON learning_user_summaries(updated_at DESC);"]
  },
  {
    name: "learning_mistakes",
    columns: [
      { name: "user_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "word_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "wrong_times", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "last_wrong", type: "DATE", constraints: "NOT NULL" },
      { name: "mode", type: "TEXT", constraints: "NOT NULL" },
      { name: "reason", type: "TEXT", constraints: "NOT NULL" },
      { name: "mastery", type: "NUMERIC(5,4)", constraints: "NOT NULL DEFAULT 0" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    tableConstraints: ["PRIMARY KEY (user_id, word_id)"],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_learning_mistakes_user_recent ON learning_mistakes(user_id, last_wrong DESC);",
      "CREATE INDEX IF NOT EXISTS idx_learning_mistakes_user_frequent ON learning_mistakes(user_id, wrong_times DESC);",
      "CREATE INDEX IF NOT EXISTS idx_learning_mistakes_mode ON learning_mistakes(mode);"
    ]
  },
  {
    name: "learning_answer_events",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "user_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "word_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "mode", type: "TEXT", constraints: "NOT NULL" },
      { name: "correct", type: "BOOLEAN", constraints: "NOT NULL" },
      { name: "duration_ms", type: "INTEGER", constraints: "NOT NULL" },
      { name: "xp_awarded", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "hearts_lost", type: "INTEGER", constraints: "NOT NULL DEFAULT 0" },
      { name: "mastery", type: "NUMERIC(5,4)", constraints: "NOT NULL" },
      { name: "answered_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_learning_answer_events_user_time ON learning_answer_events(user_id, answered_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_learning_answer_events_word ON learning_answer_events(word_id);"
    ]
  }
];

export function renderLearningSqlMigration() {
  const tables = LEARNING_DATABASE_SCHEMA.map((table) => {
    const columns = table.columns.map((column) => `  ${column.name} ${column.type}${column.constraints ? ` ${column.constraints}` : ""}`);
    const constraints = table.tableConstraints?.map((constraint) => `  ${constraint}`) ?? [];
    const indexes = table.indexes?.length ? `\n\n${table.indexes.join("\n")}` : "";

    return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${[...columns, ...constraints].join(",\n")}\n);${indexes}`;
  }).join("\n\n");

  return `-- learning schema version: ${LEARNING_SCHEMA_VERSION}\n${tables}\n`;
}
