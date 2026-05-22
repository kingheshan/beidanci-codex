import { expect, test, type Page } from "./fixtures";

test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

async function signInAdmin(page: Page) {
  const response = await page.request.post("/api/v1/admin/session", {
    data: { email: "owner@aishang.local", password: "admin-demo" }
  });
  expect(response.ok()).toBe(true);

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("admin-ready")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("admin-ready")).toHaveAttribute("data-admin-source", "api", { timeout: 15_000 });
}

test("admin console renders core modules and switches operational panels", async ({ page }) => {
  test.setTimeout(120_000);

  await signInAdmin(page);

  await expect(page.getByTestId("admin-ready")).toBeVisible();
  await expect(page.getByTestId("admin-ready")).toHaveAttribute("data-admin-source", "api");
  await expect(page.getByRole("heading", { name: "管理员后台" })).toBeVisible();
  await expect(page.getByText("今日活跃")).toBeVisible();
  await expect(page.getByText("DeepSeek 成本")).toBeVisible();
  await expect(page.getByRole("button", { name: "刷新看板" })).toBeVisible();
  await page.getByRole("button", { name: "刷新看板" }).click();
  await expect(page.getByText("数据看板已刷新")).toBeVisible();
  await expect(page.getByText("13,204")).toBeVisible();

  for (const label of ["数据看板", "用户管理", "词书管理", "词库管理", "错题分析", "AI 用量", "Prompt 管理", "审计日志", "权限角色", "审批中心", "内容安全", "系统健康"]) {
    await expect(page.getByRole("button", { name: new RegExp(label) }).first()).toBeVisible();
  }

  await page.getByRole("button", { name: /用户管理/ }).first().click();
  await expect(page.getByRole("heading", { name: "用户管理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "用户账号中心" })).toBeVisible();
  await expect(page.getByText("Ryan · 初三")).toBeVisible();
  await page.getByRole("button", { name: "冻结风险账号" }).click();
  await expect(page.getByText("账号已冻结")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("已冻结").first()).toBeVisible();

  await page.getByRole("button", { name: /词书管理/ }).first().click();
  await expect(page.getByRole("heading", { name: "词书管理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "词书发布中心" })).toBeVisible();
  await expect(page.getByText(/中考 1600 · v\d{4}\.\d{2}\.\d{2}/).first()).toBeVisible();
  await page.getByRole("button", { name: "发布今日版本" }).click();
  await expect(page.getByText("词书版本已发布")).toBeVisible();
  await expect(page.getByText(/中考 1600 · v\d{4}\.\d{2}\.\d{2}/).first()).toBeVisible();

  await page.getByRole("button", { name: /词库管理/ }).first().click();
  await expect(page.getByRole("heading", { name: "词库管理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "词库质检队列" })).toBeVisible();
  await expect(page.getByText("abandon · 图像联想缺口").or(page.getByText("图像联想缺口 image mode")).first()).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "启动质量扫描" }).click();
  await expect(page.getByText("词库质检已启动")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("abandon · 新增图像联想质检").first()).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: /导入质量/ }).first().click();
  await expect(page.getByRole("heading", { name: "导入质量" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "导入任务队列" })).toBeVisible();
  await expect(page.getByText(/ECDICT 释义同步 · (done|running|failed)/).first()).toBeVisible();
  await page.getByRole("button", { name: "重跑 ECDICT 导入" }).click();
  await expect(page.getByText("导入任务已启动")).toBeVisible();
  await expect(page.getByText("ECDICT 释义同步 · running").first()).toBeVisible();

  await page.getByRole("button", { name: /课程配置/ }).first().click();
  await expect(page.getByRole("heading", { name: "课程配置" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "课程策略中心" })).toBeVisible();
  await expect(page.getByText("中考冲刺计划").first()).toBeVisible();
  await page.getByRole("button", { name: "启动策略灰度" }).click();
  await expect(page.getByText("课程策略灰度已启动")).toBeVisible();
  await expect(page.getByText("灰度中").first()).toBeVisible();

  await page.getByRole("button", { name: /运营配置/ }).first().click();
  await expect(page.getByRole("heading", { name: "运营配置", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "运营发布中心" })).toBeVisible();
  await expect(page.getByText("首页学习挑战公告").first()).toBeVisible();
  await page.getByRole("button", { name: "发布首页公告" }).click();
  await expect(page.getByText("运营公告已发布")).toBeVisible();
  await expect(page.getByText("已发布").first()).toBeVisible();

  await page.getByRole("button", { name: /错题分析/ }).first().click();
  await expect(page.getByRole("heading", { name: "错题分析" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "错题归因中心" })).toBeVisible();
  await expect(page.getByText("词义混淆 · achieve / acquire / accomplish").first()).toBeVisible();
  await page.getByRole("button", { name: "创建干预任务" }).click();
  await expect(page.getByText("错题干预已创建")).toBeVisible();
  await expect(page.getByText("干预中").first()).toBeVisible();

  await page.getByRole("button", { name: /Prompt 管理/ }).first().click();
  await expect(page.getByRole("heading", { name: "Prompt 管理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prompt 版本库" })).toBeVisible();
  await expect(page.getByText(/K12 例句生成 · v\d+/).first()).toBeVisible();
  await expect(page.getByText("当前线上版本").first()).toBeVisible();
  await page.getByRole("button", { name: "创建专业版本" }).click();
  await expect(page.getByText("Prompt 版本已创建")).toBeVisible();
  await expect(page.getByText(/K12 例句生成 · v\d+/).first()).toBeVisible();
  await expect(page.getByText("K12 例句生成", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("第 1 / 1 页 · 共 4 行")).toBeVisible();
  await expect(page.getByText("版本回滚").first()).toBeVisible();
  await page.getByRole("button", { name: "版本回滚" }).click();
  await expect(page.getByRole("heading", { name: "确认敏感操作" })).toBeVisible();
  await page.getByRole("button", { name: "确认执行" }).click();
  await expect(page.getByText("版本回滚已记录审计")).toBeVisible();

  await page.getByRole("button", { name: /审计日志/ }).first().click();
  await expect(page.getByRole("heading", { name: "最近审计日志" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "审计策略" })).toBeVisible();
  await page.getByRole("button", { name: "复核高危日志" }).click();
  await expect(page.getByText("高危审计日志已复核")).toBeVisible();
  await expect(page.getByText("已复核").first()).toBeVisible();
  await page.getByRole("button", { name: "延长保留期" }).click();
  await expect(page.getByText("审计保留期已更新")).toBeVisible();
  await expect(page.getByText("730 天").first()).toBeVisible();

  await page.getByRole("button", { name: /内容安全/ }).first().click();
  await expect(page.getByRole("heading", { name: "内容安全" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "安全审核队列" })).toBeVisible();
  await expect(page.getByText("AI 每日故事年龄分级复核").first()).toBeVisible();
  await page.getByRole("button", { name: "处理高危内容" }).click();
  await expect(page.getByText("内容已拦截")).toBeVisible();
  await expect(page.getByText("已拦截").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "未成年人保护" })).toBeVisible();

  await page.getByRole("button", { name: /AI 用量/ }).first().click();
  await expect(page.getByRole("heading", { name: "AI 用量" })).toBeVisible();
  await expect(page.getByText("实时 tokens")).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI 预算告警" })).toBeVisible();
  await expect(page.getByText("DeepSeek 日预算接近阈值").first()).toBeVisible();
  await page.getByRole("button", { name: "启用降级策略" }).click();
  await expect(page.getByText("AI 降级策略已启用")).toBeVisible();
  await expect(page.getByText("已处理").first()).toBeVisible();

  await page.getByRole("button", { name: /订阅订单/ }).first().click();
  await expect(page.getByRole("heading", { name: "订阅订单" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "订阅与订单治理" })).toBeVisible();
  await expect(page.getByText("Ryan 家长").first()).toBeVisible();
  await page.getByRole("button", { name: "处理退款申请" }).click();
  await expect(page.getByText("退款申请已处理")).toBeVisible();
  await expect(page.getByText("已退款").first()).toBeVisible();

  await page.getByRole("button", { name: /权限角色/ }).first().click();
  await expect(page.getByRole("heading", { name: "管理员账号" })).toBeVisible();
  await expect(page.getByRole("button", { name: "编辑 support 权限" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("owner@aishang.local")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("checkbox", { name: "允许 Prompt 管理" })).toBeVisible();

  await page.getByRole("button", { name: /审批中心/ }).first().click();
  await expect(page.getByRole("heading", { name: "审批中心", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "审批流中心" })).toBeVisible();
  await expect(page.getByText("导出 PRO 到期用户").first()).toBeVisible();
  const approveRiskButton = page.getByRole("button", { name: "通过最高风险审批" });
  await expect(approveRiskButton).toBeVisible();
  if (await approveRiskButton.isEnabled()) {
    await approveRiskButton.click();
    await expect(page.getByText("审批请求已通过")).toBeVisible();
  }
  await expect(page.getByText("已通过").first()).toBeVisible();

  await page.getByRole("button", { name: /系统健康/ }).first().click();
  await expect(page.getByRole("heading", { name: "系统健康", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "系统健康检查" })).toBeVisible();
  await expect(page.getByText("DeepSeek 网关").first()).toBeVisible();
  await page.getByRole("button", { name: "运行健康检查" }).click();
  await expect(page.getByText("健康检查已完成")).toBeVisible();
  await expect(page.getByText("正常").first()).toBeVisible();
});

test("admin console keeps module access usable on mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAdmin(page);

  await expect(page.getByTestId("admin-ready")).toBeVisible();
  await page.getByRole("button", { name: /词库管理/ }).click();
  await expect(page.getByRole("heading", { name: "词库管理" })).toBeVisible();
  await expect(page.getByText("全量词库覆盖").first()).toBeVisible();
  await expect(page.getByText("第 1 / 1 页 · 共 4 行")).toBeVisible();
});
