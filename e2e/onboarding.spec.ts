import { expect, test } from "./fixtures";

test("Gate 2 onboarding flow persists preferences and lands on home", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/login$/, { timeout: 15_000 });
  await page.getByLabel("手机号").fill("13800138000");
  await page.getByRole("button", { name: "获取验证码" }).click();
  await expect(page.getByText("验证码已发送，演示环境已自动填入")).toBeVisible();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "手机号登录" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.goto("/onboarding");

  await expect(page.getByText("你的目标是？")).toBeVisible();
  await page.getByRole("button", { name: /冲刺中考/ }).click();
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(page.getByText("你在读几年级？")).toBeVisible();
  await page.getByRole("button", { name: "高一" }).click();
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(page.getByText("你的兴趣有？")).toBeVisible();
  await page.getByRole("button", { name: /动漫/ }).click();
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(page.getByText("每天打算学多少词？")).toBeVisible();
  await page.getByRole("button", { name: "开始学习" }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText("下午好，小敏")).toBeVisible();
  await expect(page.getByText("中考 1600 · 今日计划")).toBeVisible();

  const onboarding = await page.evaluate(() => {
    const raw = localStorage.getItem("aishang-vocab-store");
    return raw ? JSON.parse(raw).state.onboarding : null;
  });

  expect(onboarding).toMatchObject({
    completed: true,
    goal: "zhongkao",
    grade: "高一",
    interests: ["sports", "anime"],
    dailyWords: 20
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/home$/);
});

test("Gate 3 home opens study mode hub and memory nebula", async ({ page }) => {
  await page.goto("/home");

  await expect(page.getByText("下午好，小敏")).toBeVisible();
  await expect(page.getByText("中考 1600 · 今日计划")).toBeVisible();

  await page.getByRole("button", { name: /错词记忆星云/ }).click();
  await expect(page).toHaveURL(/\/map$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "错词记忆星云" })).toBeVisible();
  await expect(page.getByRole("button", { name: /打开 persist 图谱/ }).first()).toBeVisible();

  await page.goto("/home");

  await page.getByRole("button", { name: /开始 情景闯关 · 20词/ }).click({ force: true });
  await expect(page).toHaveURL(/\/study$/);
  await expect(page.getByText("选择刷词方式")).toBeVisible();
  await expect(page.getByRole("button", { name: /选择闯关/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /图像联想/ })).toBeVisible();

  await page.getByRole("button", { name: /① 选择闯关/ }).click({ force: true });
  await expect(page).toHaveURL(/\/study\/mc$/);
  await expect(page.getByText("下面哪个词意为", { exact: false })).toBeVisible();
});

test("Gate 4 renders six playable study modes and shows answer feedback", async ({ page }) => {
  const modeChecks = [
    ["/study/mc", "下面哪个词意为"],
    ["/study/flip", "翻面查看释义"],
    ["/study/spell", "拼写"],
    ["/study/listen", "听一听，选出正确的释义"],
    ["/study/context", "AI 情景"],
    ["/study/image", "让 Wordy 给我编个谐音故事"]
  ] as const;

  for (const [route, text] of modeChecks) {
    await page.goto(route);
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  await page.goto("/study/mc");
  await page.getByRole("button", { name: /persist 坚持/ }).click();
  await expect(page.getByText("太棒了！")).toBeVisible();
  await expect(page.getByText("+12 XP")).toBeVisible();
  await page.getByRole("button", { name: "继续" }).click();
  await expect(page.getByRole("button", { name: /ambition 抱负/ })).toBeVisible();
});

test("Gate 5 full P0 chain completes onboarding to study result", async ({ page }) => {
  await page.goto("/onboarding");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: /冲刺中考/ }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "高一" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: /动漫/ }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "开始学习" }).click();

  await expect(page).toHaveURL(/\/home$/);
  await page.getByRole("button", { name: /开始 情景闯关 · 20词/ }).click();
  await page.getByRole("button", { name: /选择闯关/ }).click();

  const answers = [
    /persist 坚持/,
    /ambition 抱负/,
    /achieve 实现/,
    /environment 环境/,
    /sustainable 可持续的/,
    /determine 决定/
  ];

  for (const answer of answers) {
    await page.getByRole("button", { name: answer }).click();
    await expect(page.getByText("太棒了！")).toBeVisible();
    await page.getByRole("button", { name: "继续" }).click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText("UNIT 3 · 完成")).toBeVisible();
  await expect(page.getByText("+72")).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
});

test("Gate 6 review queue opens word detail and tab content", async ({ page }) => {
  await page.goto("/review");

  await expect(page.getByText("智能复习")).toBeVisible();
  await page.getByRole("button", { name: "生疏", exact: true }).click();
  await expect(page.getByRole("button", { name: /persist 坚持/ })).toBeVisible();

  await page.getByRole("button", { name: /persist 坚持/ }).click();
  await expect(page).toHaveURL(/\/word\/w1$/);
  await expect(page.getByRole("heading", { name: "persist" })).toBeVisible();
  await expect(page.getByText("释义/例句")).toBeVisible();

  await page.getByRole("tab", { name: "联想图谱" }).click();
  await expect(page.getByText("AI 联想图谱")).toBeVisible();

  await page.getByRole("tab", { name: "派生词组" }).click();
  await expect(page.getByText("persistence").first()).toBeVisible();
});

test("Gate 7 profile opens learning settings and saves the daily plan", async ({ page }) => {
  await page.goto("/me");
  await expect(page.getByText("小敏 同学")).toBeVisible();
  await expect(page.getByText("学习地图")).toBeVisible();

  await page.getByRole("button", { name: /学习计划设置/ }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByText("学习计划")).toBeVisible();
  await expect(page.getByText("每日新词量")).toBeVisible();

  const slider = page.getByLabel("每日新词量");
  await slider.fill("35");
  await expect(slider).toHaveValue("35");
  await expect(page.getByText("35")).toBeVisible();
});

test("Gate 8 mistake notebook filters frequent mistakes and starts retry", async ({ page }) => {
  await page.goto("/me");

  await page.getByRole("button", { name: /错题本/ }).click({ force: true });
  await expect(page).toHaveURL(/\/mistakes$/, { timeout: 10_000 });
  await expect(page.getByText("错题本")).toBeVisible();
  await expect(page.getByText("本月错词")).toBeVisible();

  await page.getByRole("button", { name: "高频错（≥2 次）" }).click();
  await expect(page.getByRole("button", { name: /persist 坚持/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /determine 决定/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /ambition 抱负/ })).toHaveCount(0);

  await page.getByRole("button", { name: /再练这 2 个错词/ }).click();
  await expect(page).toHaveURL(/\/study\/mc(?:\?.*)?$/);
});

test("Gate 9 word detail opens the full AI memory map", async ({ page }) => {
  await page.goto("/word/w1");

  await page.getByRole("button", { name: "AI 记忆图谱" }).click();
  await expect(page).toHaveURL(/\/map\/w1$/);
  await expect(page.getByRole("heading", { name: "persist 记忆图谱" })).toBeVisible();
  await expect(page.getByRole("button", { name: /persistent/ })).toBeVisible();
  await expect(page.getByText("S · 同义")).toBeVisible();

  await page.getByRole("button", { name: /persistent/ }).click();
  await expect(page.getByText("派生关系")).toBeVisible();

  await page.getByRole("button", { name: "词根线索" }).click();
  await expect(page.getByText("per 一直 + sist 站立，像一直站在目标旁边")).toBeVisible();

  await page.getByRole("button", { name: "复习这个词" }).click();
  await expect(page).toHaveURL(/\/study\/mc$/);
});

test("Gate 10 leaderboard opens from bottom nav and starts rank practice", async ({ page }) => {
  await page.goto("/home");

  await page.getByRole("button", { name: "排行" }).click();
  await expect(page).toHaveURL(/\/rank$/);
  await expect(page.getByRole("heading", { name: "翡翠组排行" })).toBeVisible();
  await expect(page.getByText("本周前 10 名晋级铂金组 · 还剩 2 天")).toBeVisible();
  await expect(page.getByRole("button", { name: /5 吴小敏 \(你\) 820 XP/ })).toBeVisible();

  await page.getByRole("button", { name: "查看规则" }).click();
  await expect(page.getByText("晋级规则")).toBeVisible();

  await page.getByRole("button", { name: "开始冲榜练习" }).click();
  await expect(page).toHaveURL(/\/study\/mc$/);
});

test("Gate 11 daily story opens from home and supports word popover and quiz feedback", async ({ page }) => {
  await page.goto("/home");

  await page.getByRole("link", { name: /AI 每日故事/ }).click();
  await expect(page).toHaveURL(/\/story$/);
  await expect(page.getByRole("heading", { name: "The Persistent Bookworm" })).toBeVisible();
  await expect(page.getByText("出现的复习词 · 5 / 12")).toBeVisible();

  await page.getByRole("button", { name: "ambitious", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "ambition 单词卡" })).toBeVisible();
  await expect(page.getByText("抱负")).toBeVisible();
  await page.getByRole("button", { name: "知道了" }).click({ force: true });

  await page.getByRole("button", { name: "播放故事" }).click();
  await expect(page.getByRole("button", { name: "暂停故事" })).toBeVisible();

  await page.getByRole("button", { name: /An ambitious and persistent ninth grader/ }).click();
  await expect(page.getByText("理解正确")).toBeVisible();
  await expect(page.getByText("+8 XP")).toBeVisible();
});

test("Gate 12 word PK opens from home and completes a victory match", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });

  await page.getByRole("link", { name: /单词 PK/ }).click({ force: true });
  await expect(page).toHaveURL(/\/pk$/);
  await expect(page.getByText("正在唤醒 AI 对手...")).toBeVisible();
  await expect(page.getByText("Wordy AI · 自适应难度")).toBeVisible();

  await expect(page.getByText("第 1 题 / 6")).toBeVisible({ timeout: 3000 });

  for (const answer of ["persist", "ambition", "achieve", "environment", "sustainable", "determine"]) {
    await page.getByRole("button", { name: new RegExp(answer) }).click();
    await page.waitForTimeout(950);
  }

  await expect(page.getByRole("heading", { name: "VICTORY!" })).toBeVisible();
  await expect(page.getByText("+ 80 XP · + 30 宝石")).toBeVisible();
});

test("Gate 13 camera OCR scans a page and adds selected words to review", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });

  await page.getByRole("link", { name: /拍照查词/ }).click({ force: true });
  await expect(page).toHaveURL(/\/camera$/, { timeout: 10_000 });
  await expect(page.getByText("AI · OCR 圈词")).toBeVisible();
  await expect(page.getByText("对准课本，自动识别页面所有英文单词")).toBeVisible();

  await page.getByRole("button", { name: "拍照识别" }).click();
  await expect(page.getByText("AI 识别中...")).toBeVisible();
  await expect(page.getByRole("heading", { name: "识别结果" })).toBeVisible({ timeout: 2000 });
  await expect(page.getByText("建议加入复习计划 · 已选 4")).toBeVisible();

  await page.getByRole("button", { name: /perseverance/ }).click();
  await expect(page.getByText("建议加入复习计划 · 已选 3")).toBeVisible();
  await page.getByRole("button", { name: "加入复习计划（3 个）" }).click();

  await expect(page.getByText("已添加 3 个词到复习计划")).toBeVisible();
  await expect(page).toHaveURL(/\/review$/);
});

test("Gate 14 PRO paywall opens from profile and activates a subscription", async ({ page }) => {
  await page.goto("/me", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: /升级 PRO 会员/ }).click();
  await expect(page).toHaveURL(/\/pro$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "升级 PRO" })).toBeVisible();
  await expect(page.getByText("AI 每日故事")).toBeVisible();
  await expect(page.getByRole("button", { name: /年会员/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /终身会员/ }).click();
  await expect(page.getByRole("button", { name: "立即升级 PRO · ¥488" })).toBeVisible();
  const checkoutResponse = page.waitForResponse((response) => response.url().includes("/api/v1/billing/checkout") && response.request().method() === "POST" && response.status() === 200, {
    timeout: 15_000
  });
  await page.getByRole("button", { name: "立即升级 PRO · ¥488" }).click();
  await checkoutResponse;

  await expect(page.getByText("升级成功，已解锁终身会员")).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/me$/, { timeout: 10_000 });

  const subscription = await page.evaluate(() => {
    const raw = localStorage.getItem("aishang-vocab-store");
    return raw ? JSON.parse(raw).state.subscription : null;
  });
  expect(subscription).toMatchObject({
    isPro: true,
    planId: "lifetime"
  });
});
