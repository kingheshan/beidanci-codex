import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/experience", () => {
  it("serves configurable growth, dictionary, profile, pro, rank and parent copy", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      dictionary: {
        heroTitle: "我的词书",
        wordsTitle: "所有单词"
      },
      profile: {
        headerTitle: "个人主页工作台",
        logoutLabel: "退出登录"
      },
      pro: {
        comparisonTitle: "PRO 能力对比",
        heroTitle: "升级 PRO"
      },
      rank: {
        pageTitle: "联赛排行榜",
        practiceCta: "开始冲榜练习"
      },
      parent: {
        analysisTitle: "能力分析",
        retryLabel: "重新加载"
      },
      story: {
        pageTitle: "AI 每日故事",
        comprehensionTag: "AI 理解检测"
      },
      camera: {
        pageTitle: "拍照查词工作台",
        workflowTitle: "OCR 工作流"
      },
      pk: {
        pageTitle: "PK 对战工作台",
        matchingTitle: "正在唤醒 AI 对手..."
      },
      wordDetail: {
        pageTitle: "单词详情",
        expandMapCta: "展开完整图谱"
      },
      memoryMap: {
        railTitle: "AI 记忆图谱工作台",
        nodePanelTitle: "当前节点"
      }
    });
  });
});
