import type { StudyModeId } from "./study-data";

export type AdminMistakeSeverity = "high" | "medium" | "low";
export type AdminMistakeStatus = "open" | "watching" | "resolved";
export type AdminMistakeAction = "intervene" | "resolve";

export type AdminMistakeInsightRecord = {
  id: string;
  category: string;
  title: string;
  examples: string[];
  mode: StudyModeId;
  wrongCount: number;
  affectedUsers: number;
  masteryAvg: number;
  severity: AdminMistakeSeverity;
  status: AdminMistakeStatus;
  recommendation: string;
  owner: string;
  updatedAt: string;
  updatedBy: string;
};

const SEVERITY_ORDER: Record<AdminMistakeSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2
};

const STATUS_ORDER: Record<AdminMistakeStatus, number> = {
  open: 0,
  watching: 1,
  resolved: 2
};

export const DEFAULT_ADMIN_MISTAKE_INSIGHTS: AdminMistakeInsightRecord[] = [
  {
    id: "mistake-confusion-achieve",
    category: "词义混淆",
    title: "achieve / acquire / accomplish",
    examples: ["achieve", "acquire", "accomplish"],
    mode: "mc",
    wrongCount: 384,
    affectedUsers: 126,
    masteryAvg: 0.31,
    severity: "high",
    status: "open",
    recommendation: "补充词义辨析卡，并降低首轮干扰项相似度。",
    owner: "学习算法",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "学习算法"
  },
  {
    id: "mistake-spelling-environment",
    category: "拼写漏字",
    title: "environment / government",
    examples: ["environment", "government"],
    mode: "spell",
    wrongCount: 278,
    affectedUsers: 94,
    masteryAvg: 0.42,
    severity: "medium",
    status: "open",
    recommendation: "增加音节拆分和字母池顺序扰动。",
    owner: "拼写模式",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "拼写模式"
  },
  {
    id: "mistake-listen-sheep",
    category: "听音误判",
    title: "ship / sheep / sheet",
    examples: ["ship", "sheep", "sheet"],
    mode: "listen",
    wrongCount: 231,
    affectedUsers: 88,
    masteryAvg: 0.47,
    severity: "medium",
    status: "watching",
    recommendation: "补充最小音对跟读和慢速听辨。",
    owner: "听力模式",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "听力模式"
  },
  {
    id: "mistake-context-distractor",
    category: "语境选择",
    title: "context mode 干扰项过近",
    examples: ["context", "choice"],
    mode: "context",
    wrongCount: 156,
    affectedUsers: 51,
    masteryAvg: 0.58,
    severity: "low",
    status: "open",
    recommendation: "复核语境题干扰项距离，降低同义表达密度。",
    owner: "教研",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "教研"
  }
];

export function isAdminMistakeSeverity(value: string): value is AdminMistakeSeverity {
  return ["high", "medium", "low"].includes(value);
}

export function isAdminMistakeStatus(value: string): value is AdminMistakeStatus {
  return ["open", "watching", "resolved"].includes(value);
}

export function isAdminMistakeAction(value: string): value is AdminMistakeAction {
  return ["intervene", "resolve"].includes(value);
}

export function isStudyMode(value: string): value is StudyModeId {
  return ["mc", "flip", "spell", "listen", "context", "image"].includes(value);
}

export function isAdminMistakeInsightRecord(value: unknown): value is AdminMistakeInsightRecord {
  if (!value || typeof value !== "object") return false;
  const insight = value as Partial<AdminMistakeInsightRecord>;

  return (
    typeof insight.id === "string" &&
    typeof insight.category === "string" &&
    typeof insight.title === "string" &&
    Array.isArray(insight.examples) &&
    insight.examples.every((item) => typeof item === "string") &&
    typeof insight.mode === "string" &&
    isStudyMode(insight.mode) &&
    typeof insight.wrongCount === "number" &&
    typeof insight.affectedUsers === "number" &&
    typeof insight.masteryAvg === "number" &&
    typeof insight.severity === "string" &&
    isAdminMistakeSeverity(insight.severity) &&
    typeof insight.status === "string" &&
    isAdminMistakeStatus(insight.status) &&
    typeof insight.recommendation === "string" &&
    typeof insight.owner === "string" &&
    typeof insight.updatedAt === "string" &&
    typeof insight.updatedBy === "string"
  );
}

export function sortAdminMistakeInsights(insights: AdminMistakeInsightRecord[]) {
  return [...insights].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;

    return b.wrongCount - a.wrongCount;
  });
}

export function applyAdminMistakeAction(insight: AdminMistakeInsightRecord, action: AdminMistakeAction, actor: string, now = new Date()): AdminMistakeInsightRecord {
  return {
    ...insight,
    status: action === "resolve" ? "resolved" : "watching",
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}
