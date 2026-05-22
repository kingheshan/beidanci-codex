export const ADMIN_SCHEMA_VERSION = 16;

export type AdminSchemaColumn = {
  name: string;
  type: string;
  constraints?: string;
};

export type AdminSchemaTable = {
  name: string;
  columns: AdminSchemaColumn[];
  indexes?: string[];
};

export const ADMIN_DATABASE_SCHEMA: AdminSchemaTable[] = [
  {
    name: "admin_accounts",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "email", type: "TEXT", constraints: "NOT NULL UNIQUE" },
      { name: "display_name", type: "TEXT", constraints: "NOT NULL" },
      { name: "role", type: "TEXT", constraints: "NOT NULL" },
      { name: "password_hash", type: "TEXT", constraints: "NOT NULL" },
      { name: "mfa_enabled", type: "BOOLEAN", constraints: "NOT NULL DEFAULT false" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: ["CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts(role);"]
  },
  {
    name: "admin_sessions",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "actor_id", type: "TEXT", constraints: "NOT NULL REFERENCES admin_accounts(id)" },
      { name: "expires_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" },
      { name: "revoked_at", type: "TIMESTAMPTZ" }
    ],
    indexes: ["CREATE INDEX IF NOT EXISTS idx_admin_sessions_actor ON admin_sessions(actor_id);", "CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);"]
  },
  {
    name: "admin_role_permissions",
    columns: [
      { name: "role", type: "TEXT", constraints: "NOT NULL" },
      { name: "module_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_role_permissions_unique ON admin_role_permissions(role, module_id);",
      "CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role ON admin_role_permissions(role);"
    ]
  },
  {
    name: "admin_audit_events",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "actor_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "actor_role", type: "TEXT", constraints: "NOT NULL" },
      { name: "action", type: "TEXT", constraints: "NOT NULL" },
      { name: "target", type: "TEXT", constraints: "NOT NULL" },
      { name: "risk", type: "TEXT", constraints: "NOT NULL" },
      { name: "metadata", type: "JSONB", constraints: "NOT NULL DEFAULT '{}'::jsonb" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: ["CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor ON admin_audit_events(actor_id);", "CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created ON admin_audit_events(created_at DESC);"]
  },
  {
    name: "admin_module_snapshots",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "module_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "payload", type: "JSONB", constraints: "NOT NULL DEFAULT '{}'::jsonb" },
      { name: "created_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT now()" }
    ],
    indexes: ["CREATE INDEX IF NOT EXISTS idx_admin_module_snapshots_module ON admin_module_snapshots(module_id);"]
  },
  {
    name: "admin_prompt_versions",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "prompt_key", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "version", type: "INTEGER", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "body", type: "TEXT", constraints: "NOT NULL" },
      { name: "safety_rules", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "output_schema", type: "TEXT", constraints: "NOT NULL" },
      { name: "notes", type: "TEXT", constraints: "NOT NULL DEFAULT ''" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_prompt_versions_key_version ON admin_prompt_versions(prompt_key, version);",
      "CREATE INDEX IF NOT EXISTS idx_admin_prompt_versions_key ON admin_prompt_versions(prompt_key);"
    ]
  },
  {
    name: "admin_wordbook_releases",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "book_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "total", type: "INTEGER", constraints: "NOT NULL" },
      { name: "version", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "source", type: "TEXT", constraints: "NOT NULL" },
      { name: "cefr", type: "TEXT", constraints: "NOT NULL" },
      { name: "quality_score", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "issue_count", type: "INTEGER", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_wordbook_releases_book_version ON admin_wordbook_releases(book_id, version);",
      "CREATE INDEX IF NOT EXISTS idx_admin_wordbook_releases_book ON admin_wordbook_releases(book_id);"
    ]
  },
  {
    name: "admin_vocabulary_issues",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "kind", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "word", type: "TEXT", constraints: "NOT NULL" },
      { name: "book_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "severity", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_issues_status ON admin_vocabulary_issues(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_issues_book ON admin_vocabulary_issues(book_id);"
    ]
  },
  {
    name: "admin_import_jobs",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "source", type: "TEXT", constraints: "NOT NULL" },
      { name: "book_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "progress", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "total_rows", type: "INTEGER", constraints: "NOT NULL" },
      { name: "error_count", type: "INTEGER", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_import_jobs_status ON admin_import_jobs(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_import_jobs_book ON admin_import_jobs(book_id);"
    ]
  },
  {
    name: "admin_user_accounts",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "display_name", type: "TEXT", constraints: "NOT NULL" },
      { name: "grade", type: "TEXT", constraints: "NOT NULL" },
      { name: "phone", type: "TEXT", constraints: "NOT NULL" },
      { name: "wechat_open_id", type: "TEXT" },
      { name: "auth_methods", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "active_wordbook", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "streak", type: "INTEGER", constraints: "NOT NULL" },
      { name: "parent_bound", type: "BOOLEAN", constraints: "NOT NULL DEFAULT false" },
      { name: "last_seen_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_user_accounts_status ON admin_user_accounts(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_user_accounts_phone ON admin_user_accounts(phone);"
    ]
  },
  {
    name: "admin_mistake_insights",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "category", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "examples", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "mode", type: "TEXT", constraints: "NOT NULL" },
      { name: "wrong_count", type: "INTEGER", constraints: "NOT NULL" },
      { name: "affected_users", type: "INTEGER", constraints: "NOT NULL" },
      { name: "mastery_avg", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "severity", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "recommendation", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_mistake_insights_status ON admin_mistake_insights(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_mistake_insights_severity ON admin_mistake_insights(severity);"
    ]
  },
  {
    name: "admin_safety_reviews",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "surface", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "sample", type: "TEXT", constraints: "NOT NULL" },
      { name: "risk_type", type: "TEXT", constraints: "NOT NULL" },
      { name: "severity", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "ai_decision", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_safety_reviews_status ON admin_safety_reviews(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_safety_reviews_severity ON admin_safety_reviews(severity);"
    ]
  },
  {
    name: "admin_ai_usage_alerts",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "kind", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "feature", type: "TEXT", constraints: "NOT NULL" },
      { name: "severity", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "threshold", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "current_value", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "unit", type: "TEXT", constraints: "NOT NULL" },
      { name: "recommendation", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_alerts_status ON admin_ai_usage_alerts(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_alerts_kind ON admin_ai_usage_alerts(kind);"
    ]
  },
  {
    name: "admin_system_health_checks",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "service", type: "TEXT", constraints: "NOT NULL" },
      { name: "label", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "latency_ms", type: "INTEGER", constraints: "NOT NULL" },
      { name: "uptime_percent", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "detail", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "checked_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_system_health_checks_status ON admin_system_health_checks(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_system_health_checks_service ON admin_system_health_checks(service);"
    ]
  },
  {
    name: "admin_billing_orders",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "user_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "customer_name", type: "TEXT", constraints: "NOT NULL" },
      { name: "plan", type: "TEXT", constraints: "NOT NULL" },
      { name: "amount_cny", type: "DOUBLE PRECISION", constraints: "NOT NULL" },
      { name: "channel", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "entitlement_status", type: "TEXT", constraints: "NOT NULL" },
      { name: "refund_reason", type: "TEXT" },
      { name: "coupon_code", type: "TEXT" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_billing_orders_status ON admin_billing_orders(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_billing_orders_plan ON admin_billing_orders(plan);"
    ]
  },
  {
    name: "admin_curriculum_policies",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "wordbook_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "grade_band", type: "TEXT", constraints: "NOT NULL" },
      { name: "daily_new_words", type: "INTEGER", constraints: "NOT NULL" },
      { name: "daily_review_words", type: "INTEGER", constraints: "NOT NULL" },
      { name: "srs_profile", type: "TEXT", constraints: "NOT NULL" },
      { name: "mode_weights", type: "JSONB", constraints: "NOT NULL DEFAULT '{}'::jsonb" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "rollout_percent", type: "INTEGER", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_curriculum_policies_status ON admin_curriculum_policies(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_curriculum_policies_wordbook ON admin_curriculum_policies(wordbook_id);"
    ]
  },
  {
    name: "admin_operation_configs",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "kind", type: "TEXT", constraints: "NOT NULL" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "surface", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "audience", type: "TEXT", constraints: "NOT NULL" },
      { name: "rollout_percent", type: "INTEGER", constraints: "NOT NULL" },
      { name: "payload", type: "TEXT", constraints: "NOT NULL" },
      { name: "owner", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_operation_configs_status ON admin_operation_configs(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_operation_configs_kind ON admin_operation_configs(kind);"
    ]
  },
  {
    name: "admin_dashboard_snapshots",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "kpis", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "traffic", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "risk_rows", type: "JSONB", constraints: "NOT NULL DEFAULT '[]'::jsonb" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_dashboard_snapshots_updated ON admin_dashboard_snapshots(updated_at DESC);"
    ]
  },
  {
    name: "admin_approval_requests",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "title", type: "TEXT", constraints: "NOT NULL" },
      { name: "requester_role", type: "TEXT", constraints: "NOT NULL" },
      { name: "requester_name", type: "TEXT", constraints: "NOT NULL" },
      { name: "module_id", type: "TEXT", constraints: "NOT NULL" },
      { name: "action", type: "TEXT", constraints: "NOT NULL" },
      { name: "target", type: "TEXT", constraints: "NOT NULL" },
      { name: "risk", type: "TEXT", constraints: "NOT NULL" },
      { name: "status", type: "TEXT", constraints: "NOT NULL" },
      { name: "reason", type: "TEXT", constraints: "NOT NULL" },
      { name: "requested_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "expires_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "resolved_at", type: "TIMESTAMPTZ" },
      { name: "resolved_by", type: "TEXT" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_approval_requests_status ON admin_approval_requests(status);",
      "CREATE INDEX IF NOT EXISTS idx_admin_approval_requests_requested ON admin_approval_requests(requested_at DESC);"
    ]
  },
  {
    name: "admin_audit_policies",
    columns: [
      { name: "id", type: "TEXT", constraints: "PRIMARY KEY" },
      { name: "sensitive_export_policy", type: "TEXT", constraints: "NOT NULL" },
      { name: "prompt_release_policy", type: "TEXT", constraints: "NOT NULL" },
      { name: "retention_days", type: "INTEGER", constraints: "NOT NULL" },
      { name: "high_risk_alert_channel", type: "TEXT", constraints: "NOT NULL" },
      { name: "high_risk_review_status", type: "TEXT", constraints: "NOT NULL" },
      { name: "high_risk_reviewed_at", type: "TIMESTAMPTZ" },
      { name: "high_risk_reviewed_by", type: "TEXT" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL" },
      { name: "updated_by", type: "TEXT", constraints: "NOT NULL" }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_admin_audit_policies_updated ON admin_audit_policies(updated_at DESC);"
    ]
  }
];

export function renderAdminSqlMigration() {
  const tables = ADMIN_DATABASE_SCHEMA.map((table) => {
    const columns = table.columns.map((column) => `  ${column.name} ${column.type}${column.constraints ? ` ${column.constraints}` : ""}`).join(",\n");
    const indexes = table.indexes?.length ? `\n\n${table.indexes.join("\n")}` : "";

    return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${columns}\n);${indexes}`;
  }).join("\n\n");

  return `-- admin schema version: ${ADMIN_SCHEMA_VERSION}\n${tables}\n`;
}
