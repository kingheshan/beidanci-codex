import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ApiError, type GetMistakesInput, type SubmitAnswerInput, type SubmitAnswerResult } from "./api-client";
import type { MistakeItem } from "./mistakes-data";
import type { StudyModeId } from "./study-data";
import { findAnyWord } from "./word-search";
import { createNodePostgresLearningRecordRepository } from "./learning-postgres-repository";

export type LearningSummary = {
  xpEarned: number;
  heartsLost: number;
  answeredCount: number;
};

export type UserLearningState = LearningSummary & {
  mistakes: Map<string, MistakeItem>;
};

export type LearningRecordRepository = {
  readUserState: (userId: string) => Promise<UserLearningState | null>;
  writeUserState: (userId: string, state: UserLearningState) => Promise<void>;
  reset: () => Promise<void>;
};

type LearningRecordOptions = {
  userId: string;
  now?: Date;
  repository?: LearningRecordRepository;
};

type LearningRecordReadOptions = {
  repository?: LearningRecordRepository;
};

type SerializedUserLearningState = LearningSummary & {
  userId: string;
  mistakes: MistakeItem[];
};

type LearningRecordSnapshot = {
  version: 1;
  users: SerializedUserLearningState[];
};

const DEFAULT_LEARNING_STORE_PATH = join(process.cwd(), ".cache", "learning-records.json");
const globalLearningStore = globalThis as typeof globalThis & {
  __aishangLearningRecordRepository?: LearningRecordRepository;
  __aishangLearningRecordMemory?: Map<string, UserLearningState>;
};

const MISTAKE_REASONS: Record<StudyModeId, string> = {
  mc: "释义选项混淆，需要回到例句辨义",
  flip: "自评不熟，需要追加复习",
  spell: "拼写召回错误，注意字母顺序",
  listen: "听音辨义错误，需要慢速跟读",
  context: "例句语境判断错误，需要补充搭配",
  image: "图像联想错选，需要建立更具体画面"
};

export function createMemoryLearningRecordRepository(initial = new Map<string, UserLearningState>()): LearningRecordRepository {
  const store = initial;

  return {
    async readUserState(userId) {
      const state = store.get(userId);
      return state ? cloneUserLearningState(state) : null;
    },
    async writeUserState(userId, state) {
      store.set(userId, cloneUserLearningState(state));
    },
    async reset() {
      store.clear();
    }
  };
}

export function createFileLearningRecordRepository(filePath = DEFAULT_LEARNING_STORE_PATH): LearningRecordRepository {
  return {
    async readUserState(userId) {
      const snapshot = await readLearningRecordSnapshot(filePath);
      const user = snapshot.users.find((item) => item.userId === userId);
      return user ? deserializeUserLearningState(user) : null;
    },
    async writeUserState(userId, state) {
      const snapshot = await readLearningRecordSnapshot(filePath);
      const serialized = serializeUserLearningState(userId, state);
      const users = [serialized, ...snapshot.users.filter((item) => item.userId !== userId)];

      await writeLearningRecordSnapshot(filePath, { version: 1, users });
    },
    async reset() {
      await rm(filePath, { force: true });
    }
  };
}

function getDefaultLearningRecordRepository() {
  if (globalLearningStore.__aishangLearningRecordRepository) return globalLearningStore.__aishangLearningRecordRepository;

  const databaseUrl = process.env.LEARNING_DATABASE_URL;
  if (databaseUrl) {
    globalLearningStore.__aishangLearningRecordRepository = createNodePostgresLearningRecordRepository(databaseUrl);
    return globalLearningStore.__aishangLearningRecordRepository;
  }

  if (process.env.NODE_ENV === "test") {
    const memory = globalLearningStore.__aishangLearningRecordMemory ?? new Map<string, UserLearningState>();
    globalLearningStore.__aishangLearningRecordMemory = memory;
    globalLearningStore.__aishangLearningRecordRepository = createMemoryLearningRecordRepository(memory);
    return globalLearningStore.__aishangLearningRecordRepository;
  }

  globalLearningStore.__aishangLearningRecordRepository = createFileLearningRecordRepository(process.env.LEARNING_STORE_PATH ?? DEFAULT_LEARNING_STORE_PATH);
  return globalLearningStore.__aishangLearningRecordRepository;
}

function createUserLearningState(): UserLearningState {
  return {
    xpEarned: 0,
    heartsLost: 0,
    answeredCount: 0,
    mistakes: new Map()
  };
}

function cloneUserLearningState(state: UserLearningState): UserLearningState {
  return {
    xpEarned: state.xpEarned,
    heartsLost: state.heartsLost,
    answeredCount: state.answeredCount,
    mistakes: new Map([...state.mistakes.entries()].map(([wordId, item]) => [wordId, { ...item }]))
  };
}

function serializeUserLearningState(userId: string, state: UserLearningState): SerializedUserLearningState {
  return {
    userId,
    xpEarned: state.xpEarned,
    heartsLost: state.heartsLost,
    answeredCount: state.answeredCount,
    mistakes: [...state.mistakes.values()].map((item) => ({ ...item }))
  };
}

function deserializeUserLearningState(state: SerializedUserLearningState): UserLearningState {
  return {
    xpEarned: state.xpEarned,
    heartsLost: state.heartsLost,
    answeredCount: state.answeredCount,
    mistakes: new Map(state.mistakes.map((item) => [item.wordId, { ...item }]))
  };
}

async function readLearningRecordSnapshot(filePath: string): Promise<LearningRecordSnapshot> {
  try {
    const payload = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    if (!isLearningRecordSnapshot(payload)) return { version: 1, users: [] };

    return payload;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { version: 1, users: [] };
    }

    throw error;
  }
}

async function writeLearningRecordSnapshot(filePath: string, snapshot: LearningRecordSnapshot) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function isLearningRecordSnapshot(value: unknown): value is LearningRecordSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<LearningRecordSnapshot>;

  return snapshot.version === 1 && Array.isArray(snapshot.users) && snapshot.users.every(isSerializedUserLearningState);
}

function isSerializedUserLearningState(value: unknown): value is SerializedUserLearningState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<SerializedUserLearningState>;

  return (
    typeof state.userId === "string" &&
    typeof state.xpEarned === "number" &&
    typeof state.heartsLost === "number" &&
    typeof state.answeredCount === "number" &&
    Array.isArray(state.mistakes) &&
    state.mistakes.every(isMistakeItem)
  );
}

function isMistakeItem(value: unknown): value is MistakeItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MistakeItem>;

  return (
    typeof item.wordId === "string" &&
    typeof item.wrongTimes === "number" &&
    typeof item.lastWrong === "string" &&
    typeof item.mode === "string" &&
    typeof item.reason === "string" &&
    typeof item.mastery === "number"
  );
}

function roundMastery(value: number) {
  return Number(value.toFixed(2));
}

function formatLearningDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function filterMistakes(items: MistakeItem[], filter: GetMistakesInput["filter"]) {
  if (!filter || filter === "all") return items;
  if (filter === "frequent") return items.filter((item) => item.wrongTimes >= 2);

  return items.filter((item) => item.mode === filter);
}

function sortMistakes(items: MistakeItem[], sort: GetMistakesInput["sort"]) {
  return [...items].sort((a, b) => {
    if (sort === "frequent") return b.wrongTimes - a.wrongTimes;
    if (sort === "mastery") return a.mastery - b.mastery;

    return b.lastWrong.localeCompare(a.lastWrong);
  });
}

function assertKnownWord(wordId: string) {
  const word = findAnyWord(wordId);
  if (!word) {
    throw new ApiError(`Word ${wordId} was not found`, { status: 404, code: "WORD_NOT_FOUND" });
  }

  return word;
}

export async function submitLearningAnswer(input: SubmitAnswerInput, options: LearningRecordOptions): Promise<SubmitAnswerResult> {
  const word = assertKnownWord(input.wordId);
  const repository = options.repository ?? getDefaultLearningRecordRepository();
  const state = (await repository.readUserState(options.userId)) ?? createUserLearningState();
  state.answeredCount += 1;

  if (input.correct) {
    const previousMistake = state.mistakes.get(input.wordId);
    const newMastery = previousMistake ? roundMastery(Math.min(0.99, previousMistake.mastery + 0.18)) : 0.74;
    state.xpEarned += 12;

    if (previousMistake) {
      state.mistakes.set(input.wordId, {
        ...previousMistake,
        mastery: newMastery
      });
    }

    await repository.writeUserState(options.userId, state);
    return {
      ok: true,
      xpAwarded: 12,
      heartsLost: 0,
      newMastery
    };
  }

  const previousMistake = state.mistakes.get(input.wordId);
  const mastery = previousMistake ? roundMastery(Math.max(0.05, previousMistake.mastery - 0.1)) : 0.42;
  state.heartsLost += 1;
  state.mistakes.set(input.wordId, {
    wordId: input.wordId,
    wrongTimes: (previousMistake?.wrongTimes ?? 0) + 1,
    lastWrong: formatLearningDate(options.now ?? new Date()),
    mode: input.mode,
    reason: `${MISTAKE_REASONS[input.mode]}：${word.word}`,
    mastery
  });

  await repository.writeUserState(options.userId, state);
  return {
    ok: true,
    xpAwarded: 0,
    heartsLost: 1,
    newMastery: mastery
  };
}

export async function getUserMistakes(userId: string, input: GetMistakesInput = {}, options: LearningRecordReadOptions = {}) {
  const repository = options.repository ?? getDefaultLearningRecordRepository();
  const state = await repository.readUserState(userId);
  if (!state) return [];

  return sortMistakes(filterMistakes([...state.mistakes.values()], input.filter), input.sort ?? "recent");
}

export async function getLearningSummary(userId: string, options: LearningRecordReadOptions = {}): Promise<LearningSummary> {
  const repository = options.repository ?? getDefaultLearningRecordRepository();
  const state = await repository.readUserState(userId);
  if (!state) {
    return {
      xpEarned: 0,
      heartsLost: 0,
      answeredCount: 0
    };
  }

  return {
    xpEarned: state.xpEarned,
    heartsLost: state.heartsLost,
    answeredCount: state.answeredCount
  };
}

export async function resetLearningRecordStoreForTests() {
  await getDefaultLearningRecordRepository().reset();
  globalLearningStore.__aishangLearningRecordRepository = undefined;
  globalLearningStore.__aishangLearningRecordMemory?.clear();
}
