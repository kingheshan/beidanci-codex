import { getWordbook, listWordbooks, type WordbookId } from "./wordbook-catalog";

export type AdminWordbookStatus = "published" | "gray" | "draft";
export type AdminVocabularyIssueKind = "definition" | "phonetic" | "example" | "image" | "duplicate";
export type AdminVocabularyIssueSeverity = "low" | "medium" | "high";
export type AdminVocabularyIssueStatus = "open" | "reviewing" | "fixed";
export type AdminImportJobStatus = "done" | "running" | "needs-review" | "failed";

export type AdminWordbookReleaseRecord = {
  id: string;
  bookId: WordbookId;
  title: string;
  total: number;
  version: string;
  status: AdminWordbookStatus;
  source: string;
  cefr: string;
  qualityScore: number;
  issueCount: number;
  updatedAt: string;
  updatedBy: string;
};

export type AdminWordbookReleaseInput = {
  bookId: WordbookId;
  version?: string;
  status?: AdminWordbookStatus;
};

export type AdminVocabularyIssueRecord = {
  id: string;
  kind: AdminVocabularyIssueKind;
  title: string;
  word: string;
  bookId: WordbookId;
  severity: AdminVocabularyIssueSeverity;
  status: AdminVocabularyIssueStatus;
  owner: string;
  updatedAt: string;
  updatedBy: string;
};

export type AdminVocabularyIssueInput = {
  kind: AdminVocabularyIssueKind;
  word: string;
  bookId: WordbookId;
};

export type AdminImportJobRecord = {
  id: string;
  source: string;
  bookId: WordbookId;
  status: AdminImportJobStatus;
  progress: number;
  totalRows: number;
  errorCount: number;
  updatedAt: string;
  updatedBy: string;
};

export type AdminImportJobInput = {
  source: string;
  bookId: WordbookId;
};

const DEFAULT_VERSION = "v2026.05.20";
const ISSUE_COUNTS: Record<WordbookId, number> = {
  primary: 8,
  "zhongkao-1600": 18,
  "gaokao-3500": 31,
  ielts: 82,
  toefl: 96,
  "new-concept": 45
};

const QUALITY_SCORES: Record<WordbookId, number> = {
  primary: 0.99,
  "zhongkao-1600": 0.98,
  "gaokao-3500": 0.975,
  ielts: 0.962,
  toefl: 0.958,
  "new-concept": 0.971
};

const GRAY_BOOKS = new Set<WordbookId>(["ielts", "toefl"]);
const BOOK_ORDER = listWordbooks().map((book) => book.id);

export const DEFAULT_ADMIN_WORDBOOK_RELEASES: AdminWordbookReleaseRecord[] = listWordbooks().map((book) => ({
  id: buildWordbookReleaseId(book.id, DEFAULT_VERSION),
  bookId: book.id,
  title: book.title,
  total: book.total,
  version: DEFAULT_VERSION,
  status: GRAY_BOOKS.has(book.id) ? "gray" : "published",
  source: book.source,
  cefr: book.cefr,
  qualityScore: QUALITY_SCORES[book.id],
  issueCount: ISSUE_COUNTS[book.id],
  updatedAt: "2026-05-20T10:00:00.000Z",
  updatedBy: "教研"
}));

export const DEFAULT_ADMIN_VOCABULARY_ISSUES: AdminVocabularyIssueRecord[] = [
  {
    id: "vocab-issue-image-abandon",
    kind: "image",
    title: "图像联想缺口",
    word: "abandon",
    bookId: "zhongkao-1600",
    severity: "medium",
    status: "open",
    owner: "AI 教研",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "AI 教研"
  },
  {
    id: "vocab-issue-definition-acquire",
    kind: "definition",
    title: "长释义待精简",
    word: "acquire",
    bookId: "gaokao-3500",
    severity: "low",
    status: "reviewing",
    owner: "内容质检",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "内容质检"
  },
  {
    id: "vocab-issue-duplicate-colour",
    kind: "duplicate",
    title: "英美拼写归并",
    word: "colour",
    bookId: "new-concept",
    severity: "high",
    status: "open",
    owner: "教研",
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "教研"
  }
];

export const DEFAULT_ADMIN_IMPORT_JOBS: AdminImportJobRecord[] = [
  {
    id: "import-ecdict-zhongkao-1600",
    source: "ECDICT 释义同步",
    bookId: "zhongkao-1600",
    status: "done",
    progress: 1,
    totalRows: 1600,
    errorCount: 0,
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "数据工程"
  },
  {
    id: "import-mahavivo-gaokao-3500",
    source: "mahavivo 词表导入",
    bookId: "gaokao-3500",
    status: "done",
    progress: 1,
    totalRows: 3500,
    errorCount: 0,
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "数据工程"
  },
  {
    id: "import-nce-new-concept",
    source: "新概念公开索引",
    bookId: "new-concept",
    status: "needs-review",
    progress: 0.92,
    totalRows: 2400,
    errorCount: 45,
    updatedAt: "2026-05-20T10:00:00.000Z",
    updatedBy: "教研"
  }
];

export function isAdminWordbookStatus(value: string): value is AdminWordbookStatus {
  return ["published", "gray", "draft"].includes(value);
}

export function isAdminVocabularyIssueKind(value: string): value is AdminVocabularyIssueKind {
  return ["definition", "phonetic", "example", "image", "duplicate"].includes(value);
}

export function isAdminVocabularyIssueSeverity(value: string): value is AdminVocabularyIssueSeverity {
  return ["low", "medium", "high"].includes(value);
}

export function isAdminVocabularyIssueStatus(value: string): value is AdminVocabularyIssueStatus {
  return ["open", "reviewing", "fixed"].includes(value);
}

export function isAdminImportJobStatus(value: string): value is AdminImportJobStatus {
  return ["done", "running", "needs-review", "failed"].includes(value);
}

export function isWordbookId(value: string): value is WordbookId {
  return Boolean(getWordbook(value));
}

export function isAdminWordbookReleaseRecord(value: unknown): value is AdminWordbookReleaseRecord {
  if (!value || typeof value !== "object") return false;
  const release = value as Partial<AdminWordbookReleaseRecord>;

  return (
    typeof release.id === "string" &&
    typeof release.bookId === "string" &&
    isWordbookId(release.bookId) &&
    typeof release.title === "string" &&
    typeof release.total === "number" &&
    typeof release.version === "string" &&
    typeof release.status === "string" &&
    isAdminWordbookStatus(release.status) &&
    typeof release.source === "string" &&
    typeof release.cefr === "string" &&
    typeof release.qualityScore === "number" &&
    typeof release.issueCount === "number" &&
    typeof release.updatedAt === "string" &&
    typeof release.updatedBy === "string"
  );
}

export function isAdminVocabularyIssueRecord(value: unknown): value is AdminVocabularyIssueRecord {
  if (!value || typeof value !== "object") return false;
  const issue = value as Partial<AdminVocabularyIssueRecord>;

  return (
    typeof issue.id === "string" &&
    typeof issue.kind === "string" &&
    isAdminVocabularyIssueKind(issue.kind) &&
    typeof issue.title === "string" &&
    typeof issue.word === "string" &&
    typeof issue.bookId === "string" &&
    isWordbookId(issue.bookId) &&
    typeof issue.severity === "string" &&
    isAdminVocabularyIssueSeverity(issue.severity) &&
    typeof issue.status === "string" &&
    isAdminVocabularyIssueStatus(issue.status) &&
    typeof issue.owner === "string" &&
    typeof issue.updatedAt === "string" &&
    typeof issue.updatedBy === "string"
  );
}

export function isAdminImportJobRecord(value: unknown): value is AdminImportJobRecord {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<AdminImportJobRecord>;

  return (
    typeof job.id === "string" &&
    typeof job.source === "string" &&
    typeof job.bookId === "string" &&
    isWordbookId(job.bookId) &&
    typeof job.status === "string" &&
    isAdminImportJobStatus(job.status) &&
    typeof job.progress === "number" &&
    typeof job.totalRows === "number" &&
    typeof job.errorCount === "number" &&
    typeof job.updatedAt === "string" &&
    typeof job.updatedBy === "string"
  );
}

export function sortAdminWordbookReleases(releases: AdminWordbookReleaseRecord[]) {
  return [...releases].sort((a, b) => {
    const bookDiff = BOOK_ORDER.indexOf(a.bookId) - BOOK_ORDER.indexOf(b.bookId);
    if (bookDiff !== 0) return bookDiff;

    return b.version.localeCompare(a.version);
  });
}

export function sortAdminVocabularyIssues(issues: AdminVocabularyIssueRecord[]) {
  const severityOrder: Record<AdminVocabularyIssueSeverity, number> = { high: 0, medium: 1, low: 2 };

  return [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.word.localeCompare(b.word));
}

export function sortAdminImportJobs(jobs: AdminImportJobRecord[]) {
  const statusOrder: Record<AdminImportJobStatus, number> = { running: 0, "needs-review": 1, failed: 2, done: 3 };

  return [...jobs].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.source.localeCompare(b.source));
}

export function buildAdminWordbookRelease(input: AdminWordbookReleaseInput, actor: string, now = new Date()): AdminWordbookReleaseRecord {
  const book = getWordbook(input.bookId);
  if (!book) {
    throw new Error(`Unsupported wordbook: ${input.bookId}`);
  }

  const version = input.version?.trim() || formatWordbookVersion(now);

  return {
    id: buildWordbookReleaseId(book.id, version),
    bookId: book.id,
    title: book.title,
    total: book.total,
    version,
    status: input.status ?? "published",
    source: book.source,
    cefr: book.cefr,
    qualityScore: QUALITY_SCORES[book.id],
    issueCount: ISSUE_COUNTS[book.id],
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}

export function buildAdminVocabularyIssue(input: AdminVocabularyIssueInput, actor: string, now = new Date()): AdminVocabularyIssueRecord {
  return {
    id: `vocab-issue-${input.kind}-${input.word.trim().toLowerCase()}-${now.getTime()}`,
    kind: input.kind,
    title: formatVocabularyIssueTitle(input.kind),
    word: input.word.trim().toLowerCase(),
    bookId: input.bookId,
    severity: input.kind === "duplicate" ? "high" : "medium",
    status: "open",
    owner: input.kind === "image" ? "AI 教研" : "内容质检",
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}

export function buildAdminImportJob(input: AdminImportJobInput, actor: string, now = new Date()): AdminImportJobRecord {
  const book = getWordbook(input.bookId);
  if (!book) {
    throw new Error(`Unsupported wordbook: ${input.bookId}`);
  }

  return {
    id: `import-${slugify(input.source)}-${book.id}-${now.getTime()}`,
    source: input.source.trim(),
    bookId: book.id,
    status: "running",
    progress: 0,
    totalRows: book.total,
    errorCount: 0,
    updatedAt: now.toISOString(),
    updatedBy: actor
  };
}

function formatWordbookVersion(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `v${year}.${month}.${day}`;
}

function buildWordbookReleaseId(bookId: WordbookId, version: string) {
  return `wordbook-${bookId}-${version.replaceAll(".", "-")}`;
}

function formatVocabularyIssueTitle(kind: AdminVocabularyIssueKind) {
  const titles: Record<AdminVocabularyIssueKind, string> = {
    definition: "新增释义质检",
    phonetic: "新增音标质检",
    example: "新增例句质检",
    image: "新增图像联想质检",
    duplicate: "新增重复词质检"
  };

  return titles[kind];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "job";
}
