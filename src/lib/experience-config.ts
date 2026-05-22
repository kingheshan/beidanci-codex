export type ConfiguredStep = {
  step: string;
  title: string;
  desc: string;
};

export type ExperienceConfig = {
  version: number;
  dictionary: {
    topbarTitle: string;
    heroTag: string;
    heroTitle: string;
    activeBookAliases: Record<string, string>;
    heroSubtitleTemplate: string;
    progressLabel: string;
    primaryCta: string;
    secondaryCta: string;
    rhythmTitle: string;
    dueTodayLabel: string;
    difficultLabel: string;
    xpLabel: string;
    reviewCta: string;
    libraryTitle: string;
    librarySubtitle: string;
    addBookLabel: string;
    wordsTitle: string;
    wordsSummaryTemplate: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    sidebarReviewTitle: string;
    sidebarReviewBody: string;
    sidebarReviewCta: string;
  };
  profile: {
    sidebarSubtitle: string;
    weeklyGoalTitle: string;
    weeklyGoalBody: string;
    weeklyGoalProgressLabel: string;
    headerEyebrow: string;
    headerTitle: string;
    dashboardAction: string;
    rankAction: string;
    mobileJoinedTemplate: string;
    desktopHeroTitle: string;
    desktopHeroBody: string;
    proActiveTitle: string;
    proInactiveTitle: string;
    proActiveBody: string;
    proInactiveBody: string;
    proAriaLabel: string;
    learningOverviewTitle: string;
    realtimeTag: string;
    heatmapMobileTitle: string;
    heatmapDesktopTitle: string;
    heatmapRangeLabel: string;
    heatmapLowLabel: string;
    heatmapHighLabel: string;
    badgesTitle: string;
    badgeCountLabel: string;
    bookProgressTitle: string;
    currentBookTag: string;
    logoutLabel: string;
    logoutError: string;
  };
  pro: {
    comparisonEyebrow: string;
    comparisonTitle: string;
    freeLabel: string;
    proLabel: string;
    socialRating: string;
    socialProof: string;
    discountTag: string;
    planTitle: string;
    planBody: string;
    heroRefundTag: string;
    heroTitle: string;
    heroSubtitle: string;
    proofMetrics: Array<{ title: string; subtitle: string }>;
    purchaseCtaTemplate: string;
    paymentNote: string;
    trustLabels: string[];
    successToastTemplate: string;
    dashboardBackLabel: string;
  };
  rank: {
    pageTitle: string;
    leagueTag: string;
    heroTitleTemplate: string;
    heroSubtitleTemplate: string;
    myPositionLabel: string;
    currentRankTemplate: string;
    safeZoneLabel: string;
    promotionProgressLabel: string;
    previousGapTemplate: string;
    weeklyListTitle: string;
    rulesToggle: string;
    rulesTitle: string;
    rulesBodyTemplate: string;
    demotionLineTemplate: string;
    reviewCta: string;
    practiceCta: string;
    overviewTitle: string;
    adviceTag: string;
    adviceTitleTemplate: string;
    adviceBody: string;
    adviceSteps: ConfiguredStep[];
  };
  parent: {
    tabs: Array<{ id: "today" | "analysis" | "teacher" | "me"; label: string }>;
    loadingChildLabel: string;
    reportDateLabel: string;
    homeTitleTemplate: string;
    homeBodyTemplate: string;
    weekChartTitle: string;
    weekChartSubtitle: string;
    weeklyXpLabel: string;
    targetProgressLabel: string;
    recentBadgesTitle: string;
    aiReportTag: string;
    analysisTitle: string;
    analysisBody: string;
    strengthsTitle: string;
    weaknessTitle: string;
    addPlanCta: string;
    planToast: string;
    teacherStatus: string;
    teacherReplyPlaceholderTemplate: string;
    accountTitle: string;
    accountName: string;
    settingsTitle: string;
    suggestionTitle: string;
    suggestionBody: string;
    loadingLabel: string;
    errorTitle: string;
    retryLabel: string;
  };
  story: {
    loadingTitle: string;
    loadingMessage: string;
    errorTitle: string;
    retryLabel: string;
    emptyTitle: string;
    emptyMessage: string;
    emptyAction: string;
    pageTitle: string;
    mobileTag: string;
    heroTag: string;
    heroSubtitleTemplate: string;
    readEyebrow: string;
    readTitle: string;
    reviewWordsTag: string;
    assistantTitle: string;
    assistantSubtitle: string;
    assistantProgressLabel: string;
    statLabels: {
      paragraph: string;
      vocabulary: string;
      reward: string;
    };
    storyWordsMobileLabel: string;
    storyWordsDesktopLabel: string;
    comprehensionTag: string;
    correctFeedback: string;
    strategyTitle: string;
    strategySteps: ConfiguredStep[];
    followReadCta: string;
  };
  camera: {
    pageTitle: string;
    sidebarFooterTitle: string;
    sidebarFooterBody: string;
    uploadTag: string;
    uploadTitle: string;
    uploadBody: string;
    uploadDropTitle: string;
    uploadDropBody: string;
    uploadCta: string;
    featureCards: Array<{ icon: string; title: string; desc: string }>;
    workflowTitle: string;
    workflowTag: string;
    workflowSteps: ConfiguredStep[];
    sampleTitle: string;
    mobileAimHint: string;
    scanningTitle: string;
    scanningBody: string;
    resultTitle: string;
    resultSubtitleTemplate: string;
    reuploadCta: string;
    previewTitle: string;
    selectionTitleTemplate: string;
    addToReviewTemplate: string;
    addSuccessTemplate: string;
  };
  pk: {
    pageTitle: string;
    sidebarFooterTitle: string;
    sidebarFooterBodyTemplate: string;
    rules: Array<{ title: string; sub: string; color: string }>;
    battleAnalysisTitle: string;
    leadLabel: string;
    winRewardTitle: string;
    lockedFeedback: string;
    waitingFeedback: string;
    matchTag: string;
    matchingTitle: string;
    matchingSubtitle: string;
    matchingMetaTemplate: string;
    rulesTitle: string;
    rulesBody: string;
    poolLabel: string;
    poolBody: string;
    resultWinTitle: string;
    resultLoseTitle: string;
    resultWinRewardTemplate: string;
    resultLoseBody: string;
    returnHomeCta: string;
    continueCta: string;
    retryCta: string;
  };
  wordDetail: {
    tabs: Array<{ id: "def" | "map" | "related"; label: string }>;
    loadingTitle: string;
    loadingMessage: string;
    loadingLabel: string;
    errorTitle: string;
    retryLabel: string;
    emptyTitle: string;
    emptyMessage: string;
    emptyAction: string;
    sidebarSections: {
      learning: string;
      ai: string;
      personal: string;
    };
    pageTitle: string;
    backAria: string;
    favoriteAria: string;
    unfavoriteAria: string;
    favoriteLabel: string;
    favoritedLabel: string;
    reviewQueueCta: string;
    memoryMapAria: string;
    playWordAriaTemplate: string;
    startReviewLabel: string;
    startReviewAriaTemplate: string;
    tablistAria: string;
    definitionSection: string;
    mobileHintPrefix: string;
    examplesSection: string;
    playExampleAriaTemplate: string;
    webPlayExampleAriaTemplate: string;
    mapTag: string;
    mapFullCta: string;
    mapDescription: string;
    relatedSection: string;
    webDefinitionSection: string;
    memoryHintPrefix: string;
    webExamplesSection: string;
    webRelatedSection: string;
    webMapTag: string;
    expandMapCta: string;
    expandMapAria: string;
    masteryLabel: string;
    mapStudyAdvice: string;
    studyStatusTitle: string;
    statusCards: Array<{ label: string; valueTemplate: string; color: string; icon: "brain" | "check" | "gem" }>;
    addToReviewCta: string;
    unavailableTemplate: string;
  };
  memoryMap: {
    modes: Array<{ id: "map" | "roots" | "tips"; label: string }>;
    loadingTitle: string;
    loadingMessage: string;
    loadingLabel: string;
    errorTitle: string;
    retryLabel: string;
    emptyTitle: string;
    emptyMessage: string;
    emptyAction: string;
    railEyebrow: string;
    railTitle: string;
    railStats: Array<{ label: string; valueTemplate: string; icon: "sparkle" | "brain" | "zap"; color: string }>;
    dashboardCta: string;
    dashboardAria: string;
    wordCta: string;
    wordAria: string;
    studyCta: string;
    studyAria: string;
    backAria: string;
    tag: string;
    subtitle: string;
    headingSuffix: string;
    nodePanelTitle: string;
    emptyNodeHint: string;
    mobileBackWordCta: string;
    mobileReviewCta: string;
    loopTitle: string;
    loopBody: string;
    desktopBackWordAria: string;
    desktopStudyAria: string;
  };
};

export const DEFAULT_EXPERIENCE_CONFIG: ExperienceConfig = {
  version: 1,
  dictionary: {
    topbarTitle: "词书工作台",
    heroTag: "ACTIVE BOOK",
    heroTitle: "我的词书",
    activeBookAliases: {
      "zhongkao-1600": "中考核心 1600",
      "new-concept": "新概念二册"
    },
    heroSubtitleTemplate: "{bookTitle} · {mastered} 已掌握",
    progressLabel: "词书进度",
    primaryCta: "刷词模式",
    secondaryCta: "添加词书",
    rhythmTitle: "本周词汇节奏",
    dueTodayLabel: "今日复习",
    difficultLabel: "易错词",
    xpLabel: "累计 XP",
    reviewCta: "去复习中心",
    libraryTitle: "词书库",
    librarySubtitle: "按课程和目标切换学习范围。",
    addBookLabel: "添加词书",
    wordsTitle: "所有单词",
    wordsSummaryTemplate: "当前显示 {visible} / {total} 个，搜索可覆盖全量词书。",
    searchPlaceholder: "搜索单词 / 中文释义",
    emptyTitle: "没有匹配的单词",
    emptyBody: "换个英文、中文释义或标签再试。",
    sidebarReviewTitle: "今日复盘",
    sidebarReviewBody: "42 个待复习词，先从易错词开始。",
    sidebarReviewCta: "开始复习"
  },
  profile: {
    sidebarSubtitle: "个人成长档案",
    weeklyGoalTitle: "本周目标",
    weeklyGoalBody: "保持每天 20 词，周末集中复盘错题。",
    weeklyGoalProgressLabel: "本周目标进度",
    headerEyebrow: "Profile",
    headerTitle: "个人主页工作台",
    dashboardAction: "今日学习",
    rankAction: "排行榜",
    mobileJoinedTemplate: "{grade} · 加入第 {days} 天",
    desktopHeroTitle: "小敏的学习档案",
    desktopHeroBody: "汇总词汇掌握、复盘节奏、徽章成长和当前词书进展，用一个页面完成今日学习决策。",
    proActiveTitle: "PRO 会员已开通",
    proInactiveTitle: "升级 PRO 会员",
    proActiveBody: "全部 AI 能力已解锁 · 查看订阅方案",
    proInactiveBody: "解锁全部 AI 能力 · 限时 ¥14/月",
    proAriaLabel: "升级 PRO 会员 解锁全部 AI 能力",
    learningOverviewTitle: "学习数据总览",
    realtimeTag: "实时同步",
    heatmapMobileTitle: "学习地图",
    heatmapDesktopTitle: "最近 13 周学习热力图",
    heatmapRangeLabel: "最近 13 周",
    heatmapLowLabel: "少",
    heatmapHighLabel: "多",
    badgesTitle: "徽章墙",
    badgeCountLabel: "12 枚 ›",
    bookProgressTitle: "词书进度",
    currentBookTag: "在学",
    logoutLabel: "退出登录",
    logoutError: "退出登录失败，请稍后重试"
  },
  pro: {
    comparisonEyebrow: "PRO 独享",
    comparisonTitle: "PRO 能力对比",
    freeLabel: "免费版",
    proLabel: "PRO",
    socialRating: "4.9 · 12 万+ Pro 用户",
    socialProof: "“升级 Pro 三个月，词汇量从 800 涨到 2500。AI 故事真的很会写。” — 北京 初三 子萱",
    discountTag: "当前优惠",
    planTitle: "选择订阅方案",
    planBody: "P0 使用 mock 支付，后续可接真实支付和家长确认。",
    heroRefundTag: "7 天无理由退款",
    heroTitle: "升级 PRO",
    heroSubtitle: "解锁全部 AI 能力 · 加速 3 倍背单词",
    proofMetrics: [
      { title: "3 倍 AI 学习加速", subtitle: "故事、OCR、PK 和记忆图谱全部解锁" },
      { title: "12 万+ Pro 用户", subtitle: "K12 学生家庭正在使用的学习订阅" },
      { title: "7 天无理由退款", subtitle: "先试用完整能力，再决定是否长期使用" }
    ],
    purchaseCtaTemplate: "立即升级 PRO · ¥{price}",
    paymentNote: "支持微信 / 支付宝 · 可随时取消 · 隐私协议",
    trustLabels: ["7 天退款", "家长安心", "学习数据"],
    successToastTemplate: "升级成功，已解锁{planName}",
    dashboardBackLabel: "返回今日学习"
  },
  rank: {
    pageTitle: "联赛排行榜",
    leagueTag: "本周联赛",
    heroTitleTemplate: "{leagueName}排行",
    heroSubtitleTemplate: "本周前 {promotionRank} 名晋级{nextLeague} · 还剩 {daysLeft} 天",
    myPositionLabel: "我的位置",
    currentRankTemplate: "当前第 {rank}",
    safeZoneLabel: "晋级安全区",
    promotionProgressLabel: "冲榜进度",
    previousGapTemplate: "距上一名还差 {gap} XP",
    weeklyListTitle: "本周榜单",
    rulesToggle: "查看规则",
    rulesTitle: "晋级规则",
    rulesBodyTemplate: "每周结算一次，前 {promotionRank} 名晋级，最后 1 名进入保级区。",
    demotionLineTemplate: "降级线（保级及格 {demotionXp} XP）",
    reviewCta: "去复习",
    practiceCta: "开始冲榜练习",
    overviewTitle: "联赛总览",
    adviceTag: "冲榜建议",
    adviceTitleTemplate: "距第 {rank} 名还差 {gap} XP",
    adviceBody: "先做 5 轮选择题拉高速度，再用 1 轮拼写巩固错词。",
    adviceSteps: [
      { step: "1", title: "选择闯关", desc: "+36 XP 预计 4 分钟" },
      { step: "2", title: "拼写加固", desc: "+24 XP 预计 5 分钟" },
      { step: "3", title: "复习错题", desc: "降低扣心风险" }
    ]
  },
  parent: {
    tabs: [
      { id: "today", label: "今日" },
      { id: "analysis", label: "分析" },
      { id: "teacher", label: "老师" },
      { id: "me", label: "我的" }
    ],
    loadingChildLabel: "周报同步中",
    reportDateLabel: "5月20日",
    homeTitleTemplate: "{childName}今天表现不错",
    homeBodyTemplate: "连续学习 {streak} 天，本周学习时长超过同年级前 {pct}%。",
    weekChartTitle: "本周学习节奏",
    weekChartSubtitle: "分钟 / 新词双指标",
    weeklyXpLabel: "本周累计",
    targetProgressLabel: "目标进度",
    recentBadgesTitle: "本周新徽章",
    aiReportTag: "AI 周报",
    analysisTitle: "能力分析",
    analysisBody: "小敏的听力和拼写稳定领先，下一步重点处理形似词和词根派生。",
    strengthsTitle: "优势能力",
    weaknessTitle: "需要关注",
    addPlanCta: "一键添加到孩子计划",
    planToast: "已加入小敏本周专项计划",
    teacherStatus: "在线 · 英语老师",
    teacherReplyPlaceholderTemplate: "回复{teacherName}...",
    accountTitle: "家长账号",
    accountName: "吴妈妈",
    settingsTitle: "家庭学习设置",
    suggestionTitle: "本周陪伴建议",
    suggestionBody: "睡前 8 分钟听读复盘，优先处理 AI 标记的形似词。",
    loadingLabel: "正在加载家长周报",
    errorTitle: "周报暂时加载失败",
    retryLabel: "重新加载"
  },
  story: {
    loadingTitle: "加载每日故事",
    loadingMessage: "正在同步今日复习词、故事段落和理解检测。",
    errorTitle: "每日故事暂时加载失败",
    retryLabel: "重新加载每日故事",
    emptyTitle: "暂无每日故事",
    emptyMessage: "请稍后回到今日学习重新生成故事。",
    emptyAction: "返回今日学习",
    pageTitle: "AI 每日故事",
    mobileTag: "AI 故事",
    heroTag: "AI · 今日故事",
    heroSubtitleTemplate: "{cn} · 用今天复习的 {count} 个词写就",
    readEyebrow: "READ ALONG",
    readTitle: "双语精读",
    reviewWordsTag: "12 个复习词",
    assistantTitle: "阅读助手",
    assistantSubtitle: "跟读进度",
    assistantProgressLabel: "桌面故事播放进度",
    statLabels: {
      paragraph: "段落",
      vocabulary: "词汇",
      reward: "奖励"
    },
    storyWordsMobileLabel: "出现的复习词 · 5 / 12",
    storyWordsDesktopLabel: "今日复习词",
    comprehensionTag: "AI 理解检测",
    correctFeedback: "理解正确",
    strategyTitle: "阅读策略",
    strategySteps: [
      { step: "1", title: "先听一遍", desc: "让段落高亮带着读" },
      { step: "2", title: "点生词", desc: "查看词义和词根线索" },
      { step: "3", title: "做理解题", desc: "用故事语境巩固记忆" }
    ],
    followReadCta: "跟读"
  },
  camera: {
    pageTitle: "拍照查词工作台",
    sidebarFooterTitle: "OCR 可替换接口",
    sidebarFooterBody: "P0 使用 mock 识别结果，后续可接真实图片上传。",
    uploadTag: "📷 AI OCR",
    uploadTitle: "拍照 / 上传查词",
    uploadBody: "拍下课本、试卷、单词表，AI 自动识别全部英文词，一键加入复习计划。",
    uploadDropTitle: "点击上传或拖入图片",
    uploadDropBody: "支持 JPG / PNG / HEIC · 单张最多 4MB",
    uploadCta: "上传并识别",
    featureCards: [
      { icon: "🎯", title: "自动识别", desc: "课本、试卷、单词表都能扫描" },
      { icon: "🧠", title: "AI 圈生词", desc: "区分已学、待复习和新词" },
      { icon: "⚡", title: "一键加入", desc: "勾选后直接进入 SRS 队列" }
    ],
    workflowTitle: "OCR 工作流",
    workflowTag: "Mock API",
    workflowSteps: [
      { step: "1", title: "上传图片", desc: "模拟真实拍照或拖入图片" },
      { step: "2", title: "逐行 OCR", desc: "识别词形、位置和置信度" },
      { step: "3", title: "生成复习", desc: "默认选中新词与待复习词" }
    ],
    sampleTitle: "示例课本页",
    mobileAimHint: "对准课本，自动识别页面所有英文单词",
    scanningTitle: "AI 识别中...",
    scanningBody: "Wordy 正在帮你圈出生词",
    resultTitle: "桌面识别结果",
    resultSubtitleTemplate: "检出 {detected} 个英文词，建议优先复习 {selected} 个。",
    reuploadCta: "重新上传",
    previewTitle: "Web OCR 文档预览",
    selectionTitleTemplate: "识别词汇 · 已选 {selected}",
    addToReviewTemplate: "加入复习计划（{selected} 个）",
    addSuccessTemplate: "已添加 {selected} 个词到复习计划"
  },
  pk: {
    pageTitle: "PK 对战工作台",
    sidebarFooterTitle: "翡翠组段位赛",
    sidebarFooterBodyTemplate: "赢一局可获得 {xp} XP 和 {gems} 宝石。",
    rules: [
      { title: "实时对战", sub: "每题 10 秒倒计时", color: "var(--c-accent)" },
      { title: "6 题分胜负", sub: "错一题扣 18% 生命", color: "var(--c-pink)" },
      { title: "赢家奖励", sub: "{xp} XP + {gems} 宝石", color: "var(--c-primary)" }
    ],
    battleAnalysisTitle: "战况分析",
    leadLabel: "当前态势",
    winRewardTitle: "连胜奖励",
    lockedFeedback: "已锁定本题反馈，系统会自动进入下一回合。",
    waitingFeedback: "快速答对会让对手掉血，本轮倒计时结束则视为失误。",
    matchTag: "⚔️ 段位赛",
    matchingTitle: "正在匹配对手...",
    matchingSubtitle: "翡翠组 · Lv. 21-25",
    matchingMetaTemplate: "{seconds} 秒答题 · {rounds} 题分胜负",
    rulesTitle: "对战规则",
    rulesBody: "系统会匹配同段位玩家，答题越稳，生命值优势越大。",
    poolLabel: "当前对手池",
    poolBody: "匹配完成后直接进入第一题，桌面和移动端共享同一套 FSM。",
    resultWinTitle: "VICTORY!",
    resultLoseTitle: "DEFEAT",
    resultWinRewardTemplate: "+ {xp} XP · + {gems} 宝石",
    resultLoseBody: "再来一局，抢回节奏",
    returnHomeCta: "返回首页",
    continueCta: "继续",
    retryCta: "再来一局"
  },
  wordDetail: {
    tabs: [
      { id: "def", label: "释义/例句" },
      { id: "map", label: "联想图谱" },
      { id: "related", label: "派生词组" }
    ],
    loadingTitle: "加载单词详情",
    loadingMessage: "正在同步释义、例句和复习掌握度。",
    loadingLabel: "正在加载单词详情",
    errorTitle: "单词详情暂时加载失败",
    retryLabel: "重新加载单词详情",
    emptyTitle: "没有找到这个单词",
    emptyMessage: "请回到复习队列选择一个可学习的单词。",
    emptyAction: "返回复习队列",
    sidebarSections: {
      learning: "学习",
      ai: "AI 工具",
      personal: "个人"
    },
    pageTitle: "单词详情",
    backAria: "返回",
    favoriteAria: "收藏单词",
    unfavoriteAria: "取消收藏",
    favoriteLabel: "收藏",
    favoritedLabel: "已收藏",
    reviewQueueCta: "返回复习队列",
    memoryMapAria: "AI 记忆图谱",
    playWordAriaTemplate: "播放 {word}",
    startReviewLabel: "开始复习",
    startReviewAriaTemplate: "开始复习 {word}",
    tablistAria: "单词详情",
    definitionSection: "释义",
    mobileHintPrefix: "提示：",
    examplesSection: "例句",
    playExampleAriaTemplate: "播放例句 {sentence}",
    webPlayExampleAriaTemplate: "朗读例句 {sentence}",
    mapTag: "AI 联想图谱",
    mapFullCta: "查看完整",
    mapDescription: "根据词根、近义词、反义词和派生词形成可视化记忆线索，点击查看完整图谱。",
    relatedSection: "派生 · 词组",
    webDefinitionSection: "核心释义",
    memoryHintPrefix: "记忆提示：",
    webExamplesSection: "例句 · 含 AI 个性化",
    webRelatedSection: "派生 · 词组 · 关联",
    webMapTag: "AI 记忆线索",
    expandMapCta: "展开完整图谱",
    expandMapAria: "展开完整图谱",
    masteryLabel: "今日掌握度",
    mapStudyAdvice: "先用词根建立锚点，再通过派生词和反义词完成一次主动回忆。",
    studyStatusTitle: "学习状态",
    statusCards: [
      { label: "复习", valueTemplate: "14", color: "var(--c-warning)", icon: "brain" },
      { label: "掌握", valueTemplate: "{mastery}%", color: "var(--c-primary)", icon: "check" },
      { label: "奖励", valueTemplate: "+12", color: "var(--c-success)", icon: "gem" }
    ],
    addToReviewCta: "加入今日复习",
    unavailableTemplate: "{label}会在后续阶段接入"
  },
  memoryMap: {
    modes: [
      { id: "map", label: "图谱" },
      { id: "roots", label: "词根线索" },
      { id: "tips", label: "AI 提示" }
    ],
    loadingTitle: "加载记忆图谱",
    loadingMessage: "正在同步词根、词族关系和 AI 记忆提示。",
    loadingLabel: "正在加载记忆图谱",
    errorTitle: "记忆图谱暂时加载失败",
    retryLabel: "重新加载记忆图谱",
    emptyTitle: "没有找到这个图谱",
    emptyMessage: "请回到单词详情重新打开 AI 记忆图谱。",
    emptyAction: "返回单词",
    railEyebrow: "AI Memory",
    railTitle: "AI 记忆图谱工作台",
    railStats: [
      { label: "关系网络", valueTemplate: "{count} 个节点", icon: "sparkle", color: "var(--c-accent)" },
      { label: "节点详情", valueTemplate: "点击查看线索", icon: "brain", color: "var(--c-mint)" },
      { label: "学习闭环", valueTemplate: "回单词 · 再复习", icon: "zap", color: "var(--c-primary)" }
    ],
    dashboardCta: "返回今日学习",
    dashboardAria: "返回今日学习",
    wordCta: "返回单词",
    wordAria: "返回单词 Web",
    studyCta: "开始专项复习",
    studyAria: "开始专项复习 Web",
    backAria: "返回",
    tag: "AI 记忆图谱",
    subtitle: "完整词根 + 词族关联",
    headingSuffix: "记忆图谱",
    nodePanelTitle: "当前节点",
    emptyNodeHint: "点击外圈节点查看关联词",
    mobileBackWordCta: "返回单词",
    mobileReviewCta: "复习这个词",
    loopTitle: "复习闭环",
    loopBody: "看中心词，点关联节点，再回到例句做一次主动复述。",
    desktopBackWordAria: "返回单词详情 Web",
    desktopStudyAria: "开始节点复习 Web"
  }
};

export function getExperienceConfig() {
  return DEFAULT_EXPERIENCE_CONFIG;
}

export function formatExperienceTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
