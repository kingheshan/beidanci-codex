import { expect, test as base, type Page } from "@playwright/test";

const PHONE = "13800138000";
const CODE = "123456";
const STORE_KEY = "aishang-vocab-store";

function shouldSeedStudentSession(testFile: string, title: string) {
  const file = testFile.replaceAll("\\", "/");
  if (file.endsWith("/admin.spec.ts") || file.endsWith("/design-system.spec.ts") || file.endsWith("/launch-metadata.spec.ts")) return false;
  if (title.includes("Gate 2 onboarding flow")) return false;
  return true;
}

function shouldCompleteOnboarding(title: string) {
  return !title.includes("Gate 5 full P0 chain");
}

async function seedStudentSession(page: Page, completed: boolean) {
  const phone = createPhoneForTest(page);
  await page.request.post("/api/v1/auth/phone/code", {
    data: { phone }
  });
  const response = await page.request.post("/api/v1/auth/phone", {
    data: { phone, code: CODE }
  });
  const session = await response.json();
  await seedLearningRecords(page);

  await page.addInitScript(
    ({ completed: onboardingCompleted, session: authSession, storeKey }) => {
      const state = {
        auth: authSession,
        onboarding: {
          completed: onboardingCompleted,
          goal: onboardingCompleted ? "zhongkao" : "gaokao",
          grade: onboardingCompleted ? "高一" : "初三",
          interests: onboardingCompleted ? ["sports", "anime"] : ["sports"],
          dailyWords: 20,
          wordbookId: "zhongkao-1600"
        },
        learning: {
          hearts: 5,
          xp: 1280,
          gems: 1280,
          streak: 28
        },
        planSettings: {
          reminderTime: "20:30",
          reviewReminderOn: true,
          streakProtectionOn: true,
          aiExamplesOn: true,
          darkModeOn: false,
          accent: "us"
        },
        subscription: {
          isPro: false,
          planId: null,
          startedAt: null
        },
        lastStudyResult: null
      };

      localStorage.setItem(storeKey, JSON.stringify({ state, version: 0 }));
    },
    { completed, session, storeKey: STORE_KEY }
  );
}

async function seedLearningRecords(page: Page) {
  const seedAnswers = [
    { wordId: "w1", mode: "mc", correct: false, ms: 1200 },
    { wordId: "w1", mode: "mc", correct: false, ms: 1200 },
    { wordId: "w6", mode: "mc", correct: false, ms: 1200 },
    { wordId: "w6", mode: "mc", correct: false, ms: 1200 },
    { wordId: "w2", mode: "mc", correct: false, ms: 1200 }
  ];

  for (const answer of seedAnswers) {
    await page.request.post("/api/v1/answers", { data: answer });
  }
}

function createPhoneForTest(page: Page) {
  const title = page.context().browser()?.browserType().name() ?? "chromium";
  const seed = `${title}-${Date.now()}-${Math.random()}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100_000_000;
  }
  return `138${String(hash).padStart(8, "0")}`;
}

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    if (shouldSeedStudentSession(testInfo.file, testInfo.title)) {
      await seedStudentSession(page, shouldCompleteOnboarding(testInfo.title));
    }

    await use(page);
  }
});

export { expect };
export type { Page };
