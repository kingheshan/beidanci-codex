export type AdminModuleCategory = "overview" | "users" | "content" | "ai" | "governance" | "growth" | "platform";

export type AdminModuleId =
  | "dashboard"
  | "users"
  | "wordbooks"
  | "vocabulary"
  | "mistakes"
  | "ai-usage"
  | "prompts"
  | "audit"
  | "roles"
  | "approvals"
  | "import-quality"
  | "curriculum"
  | "operations"
  | "billing"
  | "safety"
  | "system";

export type AdminModule = {
  id: AdminModuleId;
  label: string;
  category: AdminModuleCategory;
  description: string;
  owner: string;
  health: "healthy" | "watch" | "risk";
  metric: string;
  accent: string;
  actions: string[];
};

export type AdminKpi = {
  id: string;
  label: string;
  value: string;
  sub: string;
  trend: string;
  accent: string;
};

export type AdminTableRow = {
  id: string;
  primary: string;
  secondary: string;
  value: string;
  status: string;
  owner: string;
};

export type AdminTimelineItem = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  risk: "低" | "中" | "高";
};

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: "dashboard",
    label: "数据看板",
    category: "overview",
    description: "核心业务、学习、AI 成本和风险概览。",
    owner: "运营负责人",
    health: "healthy",
    metric: "DAU 12,846",
    accent: "var(--c-primary)",
    actions: ["导出日报", "查看漏斗", "配置告警"]
  },
  {
    id: "users",
    label: "用户管理",
    category: "users",
    description: "学生、家长、手机号、微信登录和账号状态管理。",
    owner: "用户运营",
    health: "watch",
    metric: "42 个异常",
    accent: "var(--c-sky)",
    actions: ["冻结账号", "重置登录", "同步微信"]
  },
  {
    id: "wordbooks",
    label: "词书管理",
    category: "content",
    description: "小学、中考、高考、雅思、托福、新概念的目录、版本和发布。",
    owner: "教研团队",
    health: "healthy",
    metric: "6 套在线",
    accent: "var(--c-mint)",
    actions: ["发布版本", "灰度词书", "导出目录"]
  },
  {
    id: "vocabulary",
    label: "词库管理",
    category: "content",
    description: "词条释义、音标、例句、图像联想、标签和质检。",
    owner: "内容质检",
    health: "watch",
    metric: "17,100 词",
    accent: "var(--c-coral)",
    actions: ["批量修订", "启动质检", "合并重复词"]
  },
  {
    id: "mistakes",
    label: "错题分析",
    category: "content",
    description: "高频错词、错误类型、年级差异和复习策略建议。",
    owner: "学习算法",
    health: "healthy",
    metric: "5,821 条",
    accent: "var(--c-danger)",
    actions: ["生成复习包", "调整权重", "导出错因"]
  },
  {
    id: "ai-usage",
    label: "AI 用量",
    category: "ai",
    description: "DeepSeek token、成本、延迟、失败率和限流策略。",
    owner: "AI 平台",
    health: "watch",
    metric: "¥482 今日",
    accent: "var(--c-primary-deep)",
    actions: ["设置预算", "查看调用", "降级策略"]
  },
  {
    id: "prompts",
    label: "Prompt 管理",
    category: "ai",
    description: "K12 例句、故事、记忆图谱、OCR 解析的 prompt 版本与评测。",
    owner: "AI 教研",
    health: "healthy",
    metric: "12 个版本",
    accent: "var(--c-pink)",
    actions: ["新建版本", "A/B 测试", "版本回滚"]
  },
  {
    id: "audit",
    label: "审计日志",
    category: "governance",
    description: "后台操作、敏感配置、登录行为和数据导出留痕。",
    owner: "安全合规",
    health: "risk",
    metric: "7 待复核",
    accent: "var(--c-warning)",
    actions: ["复核高危", "导出日志", "设置保留期"]
  },
  {
    id: "roles",
    label: "权限角色",
    category: "governance",
    description: "管理员、运营、教研、客服、财务和只读审计的 RBAC。",
    owner: "安全合规",
    health: "healthy",
    metric: "6 个角色",
    accent: "var(--c-primary)",
    actions: ["分配角色", "最小权限检查", "审批提权"]
  },
  {
    id: "approvals",
    label: "审批中心",
    category: "governance",
    description: "敏感导出、Prompt 上线、退款、词书发布等高危操作审批。",
    owner: "安全合规",
    health: "watch",
    metric: "3 待审批",
    accent: "var(--c-danger)",
    actions: ["通过审批", "驳回审批", "查看链路"]
  },
  {
    id: "import-quality",
    label: "导入质量",
    category: "content",
    description: "词书导入任务、数据源授权、去重、释义缺失和失败重试。",
    owner: "数据工程",
    health: "watch",
    metric: "3 个任务",
    accent: "var(--c-mint)",
    actions: ["重跑导入", "查看差异", "质检抽样"]
  },
  {
    id: "curriculum",
    label: "课程配置",
    category: "content",
    description: "学习路径、每日新词量、SRS 权重和不同年级策略。",
    owner: "教研团队",
    health: "healthy",
    metric: "9 套策略",
    accent: "var(--c-sky)",
    actions: ["编辑路径", "灰度策略", "恢复默认"]
  },
  {
    id: "operations",
    label: "运营配置",
    category: "growth",
    description: "公告、活动、功能开关、实验分组和首页资源位。",
    owner: "增长运营",
    health: "healthy",
    metric: "18 个开关",
    accent: "var(--c-coral)",
    actions: ["发布公告", "切换实验", "下线活动"]
  },
  {
    id: "billing",
    label: "订阅订单",
    category: "growth",
    description: "PRO 权益、订单、退款、兑换码和家长付费状态。",
    owner: "商业化",
    health: "watch",
    metric: "¥38,420 MRR",
    accent: "var(--c-accent)",
    actions: ["处理退款", "发放权益", "导出订单"]
  },
  {
    id: "safety",
    label: "内容安全",
    category: "governance",
    description: "AI 输出抽检、敏感词、未成年人保护和申诉处理。",
    owner: "安全合规",
    health: "risk",
    metric: "24 待审核",
    accent: "var(--c-danger)",
    actions: ["抽检样本", "更新词表", "处理申诉"]
  },
  {
    id: "system",
    label: "系统健康",
    category: "platform",
    description: "API、队列、DeepSeek、短信、微信登录、OCR 任务和缓存。",
    owner: "工程平台",
    health: "healthy",
    metric: "99.96% 可用",
    accent: "var(--c-success)",
    actions: ["查看队列", "熔断服务", "刷新缓存"]
  }
];

export const ADMIN_CATEGORY_LABELS: Record<AdminModuleCategory, string> = {
  overview: "总览",
  users: "账号",
  content: "内容与学习",
  ai: "AI",
  governance: "治理",
  growth: "商业与运营",
  platform: "平台"
};

export const ADMIN_KPIS: AdminKpi[] = [
  { id: "dau", label: "今日活跃", value: "12,846", sub: "学生 10,924 / 家长 1,922", trend: "+8.4%", accent: "var(--c-primary)" },
  { id: "completion", label: "学习完成率", value: "71.8%", sub: "P0 链路完成 8,312 次", trend: "+3.1%", accent: "var(--c-success)" },
  { id: "ai-cost", label: "DeepSeek 成本", value: "¥482", sub: "均摊 ¥0.038 / 学习会话", trend: "-6.7%", accent: "var(--c-primary-deep)" },
  { id: "quality", label: "词条质检", value: "96.4%", sub: "释义 / 音标 / 例句完整度", trend: "+1.2%", accent: "var(--c-mint)" },
  { id: "audit", label: "待处理审计", value: "7", sub: "高危 2 / 中危 5", trend: "需复核", accent: "var(--c-warning)" }
];

export const ADMIN_TRAFFIC_SERIES = [
  { day: "周一", value: 62 },
  { day: "周二", value: 68 },
  { day: "周三", value: 74 },
  { day: "周四", value: 71 },
  { day: "周五", value: 83 },
  { day: "周六", value: 91 },
  { day: "周日", value: 78 }
];

export const ADMIN_USER_ROWS: AdminTableRow[] = [
  { id: "u-1001", primary: "小敏 · 六年级", secondary: "手机号登录 + 绑定微信", value: "连续 18 天", status: "正常", owner: "家长已绑定" },
  { id: "u-1042", primary: "Ryan · 初三", secondary: "微信一键登录", value: "中考 1600", status: "需回访", owner: "客服 A" },
  { id: "u-1208", primary: "Emma · 高二", secondary: "手机号待验证", value: "高考 3500", status: "风控观察", owner: "安全策略" },
  { id: "u-1345", primary: "Leo · 雅思", secondary: "PRO 年费", value: "雅思 4200", status: "高价值", owner: "增长运营" }
];

export const ADMIN_WORDBOOK_ROWS: AdminTableRow[] = [
  { id: "wb-primary", primary: "小学词库", secondary: "800 词 · 6 个年级分层", value: "v2026.05.20", status: "已发布", owner: "教研" },
  { id: "wb-zk", primary: "中考 1600", secondary: "1600 词 · 高频考点标签", value: "v2026.05.20", status: "已发布", owner: "教研" },
  { id: "wb-gk", primary: "高考 3500", secondary: "3500 词 · 完形/阅读标签", value: "v2026.05.20", status: "已发布", owner: "教研" },
  { id: "wb-ielts", primary: "雅思", secondary: "4200 词 · 听说读写场景", value: "v2026.05.20", status: "灰度中", owner: "留学线" },
  { id: "wb-toefl", primary: "托福", secondary: "4600 词 · 学术词族", value: "v2026.05.20", status: "灰度中", owner: "留学线" },
  { id: "wb-nce", primary: "新概念", secondary: "2400 词 · 课文索引", value: "v2026.05.20", status: "已发布", owner: "教研" }
];

export const ADMIN_VOCABULARY_ROWS: AdminTableRow[] = [
  { id: "vq-01", primary: "全量词库覆盖", secondary: "6 套词书已完成可切换链路", value: "17,100", status: "在线", owner: "数据工程" },
  { id: "vq-02", primary: "词条质检队列", secondary: "长释义、低频词、变形词待人工抽样", value: "286", status: "待处理", owner: "内容质检" },
  { id: "vq-03", primary: "图像联想缺口", secondary: "image mode 需要补齐视觉提示词", value: "1,420", status: "排队", owner: "AI 教研" },
  { id: "vq-04", primary: "重复词合并", secondary: "美式/英式拼写和词形归并", value: "73", status: "需确认", owner: "教研" }
];

export const ADMIN_MISTAKE_ROWS: AdminTableRow[] = [
  { id: "m-01", primary: "词义混淆", secondary: "achieve / acquire / accomplish", value: "31.4%", status: "高频", owner: "学习算法" },
  { id: "m-02", primary: "拼写漏字", secondary: "environment / government", value: "22.7%", status: "中频", owner: "拼写模式" },
  { id: "m-03", primary: "听音误判", secondary: "ship / sheep / sheet", value: "18.9%", status: "中频", owner: "听力模式" },
  { id: "m-04", primary: "语境选择", secondary: "context mode 干扰项过近", value: "12.8%", status: "观察", owner: "教研" }
];

export const ADMIN_AI_USAGE_ROWS: AdminTableRow[] = [
  { id: "ai-01", primary: "AI 每日故事", secondary: "DeepSeek Chat · JSON 输出", value: "1.28M tokens", status: "稳定", owner: "story/today" },
  { id: "ai-02", primary: "AI 例句", secondary: "低年级安全表达 + 双语解释", value: "820K tokens", status: "成本上升", owner: "example/[wordId]" },
  { id: "ai-03", primary: "记忆星云", secondary: "联想节点 + 例句 + 复习提示", value: "410K tokens", status: "稳定", owner: "memory-map/[wordId]" },
  { id: "ai-04", primary: "OCR 圈词", secondary: "图片识别后词汇讲解", value: "312K tokens", status: "降级可用", owner: "ocr/photo" }
];

export const ADMIN_PROMPT_ROWS: AdminTableRow[] = [
  { id: "p-01", primary: "K12 例句生成", secondary: "禁止成人、暴力、隐私场景；输出 JSON", value: "v8", status: "线上", owner: "AI 教研" },
  { id: "p-02", primary: "每日故事生成", secondary: "12 个目标词自然出现，CEFR 难度可控", value: "v5", status: "A/B 测试", owner: "AI 教研" },
  { id: "p-03", primary: "记忆图谱生成", secondary: "词根、场景、近反义、错因四类节点", value: "v4", status: "线上", owner: "学习算法" },
  { id: "p-04", primary: "OCR 解析纠错", secondary: "识别置信度低时要求保守输出", value: "v3", status: "待评测", owner: "AI 平台" }
];

export const ADMIN_IMPORT_ROWS: AdminTableRow[] = [
  { id: "im-01", primary: "ECDICT 释义同步", secondary: "授权源缓存 + 词频字段解析", value: "100%", status: "完成", owner: "数据工程" },
  { id: "im-02", primary: "mahavivo 词表导入", secondary: "小学 / 中考 / 高中 / TOEFL", value: "100%", status: "完成", owner: "数据工程" },
  { id: "im-03", primary: "新概念公开索引", secondary: "课文词形提取 + ECDICT 回填", value: "92%", status: "需抽检", owner: "教研" }
];

export const ADMIN_SYSTEM_ROWS: AdminTableRow[] = [
  { id: "sys-01", primary: "API v1", secondary: "核心 mock adapter 与真实 adapter 边界", value: "42 ms", status: "正常", owner: "工程平台" },
  { id: "sys-02", primary: "DeepSeek 网关", secondary: "故事、例句、记忆图谱", value: "1.8 s", status: "观察", owner: "AI 平台" },
  { id: "sys-03", primary: "短信登录", secondary: "手机号验证码服务", value: "配置检测", status: "需生产网关", owner: "账号系统" },
  { id: "sys-04", primary: "微信一键登录", secondary: "code2Session openid 绑定", value: "配置检测", status: "需应用参数", owner: "账号系统" }
];

export const ADMIN_AUDIT_LOGS: AdminTimelineItem[] = [
  { id: "log-01", time: "18:32", actor: "教研-王敏", action: "发布词书版本", target: "中考 1600 v2026.05.20", risk: "低" },
  { id: "log-02", time: "18:11", actor: "AI-赵宁", action: "版本回滚", target: "K12 例句生成 v8 -> v7", risk: "中" },
  { id: "log-03", time: "17:48", actor: "运营-李想", action: "导出用户列表", target: "PRO 到期用户 1,203 条", risk: "高" },
  { id: "log-04", time: "17:22", actor: "系统", action: "触发预算告警", target: "DeepSeek 日预算 72%", risk: "中" }
];

export const ADMIN_ROLE_ROWS: AdminTableRow[] = [
  { id: "r-01", primary: "超级管理员", secondary: "全模块审批 + 安全配置", value: "2 人", status: "双人复核", owner: "安全合规" },
  { id: "r-02", primary: "运营管理员", secondary: "用户、活动、公告、订单只读", value: "8 人", status: "正常", owner: "增长运营" },
  { id: "r-03", primary: "教研管理员", secondary: "词书、词库、课程策略", value: "6 人", status: "正常", owner: "教研团队" },
  { id: "r-04", primary: "客服只读", secondary: "用户状态、订单状态、反馈处理", value: "12 人", status: "最小权限", owner: "客服主管" }
];

export const ADMIN_OPERATIONS_ROWS: AdminTableRow[] = [
  { id: "op-01", primary: "首页学习入口实验", secondary: "路径卡片 vs 六模式入口", value: "50/50", status: "运行中", owner: "增长运营" },
  { id: "op-02", primary: "暑期冲刺活动", secondary: "连续 7 天完成送 gem", value: "6 月上线", status: "排期", owner: "运营" },
  { id: "op-03", primary: "AI 故事开关", secondary: "免费用户每日 1 次", value: "开启", status: "正常", owner: "商业化" },
  { id: "op-04", primary: "OCR 限流", secondary: "非 PRO 每日 3 次", value: "开启", status: "正常", owner: "AI 平台" }
];
