# Handoff · 爱上背单词（AI 陪伴式 K12 背单词应用）

## 一、项目概述

「爱上背单词」是一款面向**中国 K12 学生**（中高考为主）的英语单词学习应用，主打：

- **AI 陪伴**：吉祥物 Wordy 形态进化、AI 个性化例句、每日故事、错词记忆图谱
- **多模态学习**：6 种刷词交互（选择/翻卡/拼写/听音/情景/图像）+ SRS 智能复习
- **游戏化激励**：连胜、徽章、段位排行、单词 PK 对战
- **双端覆盖**：iOS/Android 移动端 + Web 桌面端
- **家长协同**：独立家长 App，含周报、能力分析、师生消息

本 handoff 包提供完整的 **HTML 可交互原型** 和实现规范。

---

## 二、关于本设计包

> ⚠️ **重要**：本包中的 HTML / JSX 文件是**设计原型**，用于演示交互、视觉、状态机和数据流。**不要直接复制 HTML 上线**。
>
> 任务是：**根据现有 codebase 的技术栈（React Native、Flutter、Next.js、SwiftUI 等）和已有设计系统，重新实现这些界面**。原型展示的是**应当达成的最终效果**。
>
> 如果项目暂无 codebase，推荐技术栈：
> - **移动端**：React Native + Expo + NativeWind（共享与 Web 同一套 React 代码） 或 Flutter
> - **Web 端**：Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
> - **状态**：Zustand（轻量）或 Redux Toolkit
> - **API**：tRPC 或 REST（FastAPI / Node）
> - **AI**：DeepSeek API（每日故事、个性化例句、记忆图谱）

---

## 三、设计保真度

**Hi-fi（高保真）** — 含真实颜色、字体、间距、动画时序、状态机。建议按像素还原。

---

## 四、技术架构概览

```
┌─────────────────────────────────────────────────────┐
│  UI Layer (移动 + Web 共用 React 组件库)              │
├─────────────────────────────────────────────────────┤
│  Router  ·  Store (Zustand)  ·  Study Session FSM   │
├─────────────────────────────────────────────────────┤
│  API Client (Mock → 真实后端)                        │
├─────────────────────────────────────────────────────┤
│  Backend: 用户、词书、答题、SRS、AI 生成、计费、家长   │
└─────────────────────────────────────────────────────┘
```

### 4.1 关键模块

| 模块 | 描述 | 原型文件 |
|---|---|---|
| 设计 tokens | 3 套主题颜色、字体、阴影、圆角 | `styles/tokens.css` |
| 吉祥物 Wordy | 4 个形态进化 SVG（Bean / Sprout / Star / Rocket）| `components/mascot.jsx` |
| UI 基础组件 | CTA / Card / Progress / Streak / Tag / ChoiceButton 等 | `components/ui.jsx` |
| 数据 mock | 示例单词、SRS 队列、故事、排行榜 | `interactive/data.jsx` |
| 全局 Store | XP / Hearts / Streak / Gems / Toast | `interactive/store.jsx` |
| 路由 | 简易 hash router，可替换为 React Router | `interactive/store.jsx` |
| 学习会话状态机 | `useStudySession` hook | `interactive/session.jsx` |
| API mock 层 | 10 个端点 + loading skeleton | `interactive/api.jsx` |

---

## 五、设计系统（Design Tokens）

### 颜色（3 套主题，CSS 变量）

**默认 · 电光紫**
```css
--c-primary: #6C5CE7;
--c-primary-deep: #4A3BC7;
--c-primary-soft: #EDE8FF;
--c-accent: #FFD60A;     /* 阳光黄 */
--c-pink: #FF6B9D;
--c-mint: #00D4AA;
--c-coral: #FF8A65;
--c-sky: #54C7FF;
--c-bg: #F4F1FF;
--c-ink: #1A1340;
--c-ink-soft: #5B5582;
--c-streak: #FF7849;    /* 连胜火焰 */
```

**晨光橘**：`--c-primary: #FF7849`（其他相应调整）
**森林绿**：`--c-primary: #2ECC71`

完整定义见 `styles/tokens.css`。生产环境用 `data-theme="purple|orange|green"` 切换。

### 字体栈
- **中文 display**：得意黑（Smiley Sans）→ PingFang SC fallback
- **英文 display**：Bricolage Grotesque → Plus Jakarta Sans
- **正文**：Noto Sans SC + Plus Jakarta Sans
- **等宽**：JetBrains Mono（IPA、数字）

### 圆角 / 阴影 / 动效
```css
--r-sm: 10px; --r-md: 16px; --r-lg: 22px; --r-xl: 28px; --r-pill: 999px;
--sh-card: 0 2px 8px rgba(26,19,64,.04), 0 8px 24px rgba(26,19,64,.06);
--sh-cta: 0 4px 0 rgba(0,0,0,.10), 0 10px 24px rgba(108,92,231,.32);
--ease: cubic-bezier(.2,.8,.2,1);
```

### 关键动画 keyframes
- `pop` (0.35s) — 出现强调
- `slideUp` / `slideRight` — 切换页面
- `shake` (0.45s) — 答错抖动
- `confettiFall` — 庆祝彩屑
- `pulse` — 强调按钮
- `drift` — 装饰元素漂浮
- `skeleton` — 加载骨架

---

## 六、页面清单与实现优先级

### 📱 移动端（13 个独立屏幕）

| # | 路由 | 名称 | 优先级 | 说明 |
|---|---|---|---|---|
| 1 | `/onboarding` | Onboarding 引导 | P0 | 4 步：目标 / 年级 / 兴趣 / 每日量 |
| 2 | `/home` | 首页学习路径 | P0 | 路径式（Duolingo 风），AI 工具箱 |
| 3 | `/study/:mode` | 6 种刷词模式 | P0 | mc/flip/spell/listen/context/image |
| 4 | `/result` | 闯关结果页 | P0 | 庆祝动画 + 数据汇总 |
| 5 | `/review` | SRS 智能复习 | P0 | 队列 + 5 档掌握度过滤 |
| 6 | `/word/:id` | 单词详情 | P0 | 释义 / 联想 / 例句 / 派生 |
| 7 | `/map/:id` | AI 记忆图谱 | P1 | 力导图 + 关系节点 |
| 8 | `/me` | 个人主页 | P0 | 等级 / 热力图 / 徽章 / 词书 |
| 9 | `/rank` | 翡翠组排行 | P1 | 段位 + 晋级降级线 |
| 10 | `/story` | AI 每日故事 | P1 | 跟读 + 单词点击弹窗 |
| 11 | `/pk` | 单词 PK 对战 | P2 | 实时匹配 + 倒计时 + AI 对手 |
| 12 | `/mistakes` | 错题本 | P1 | 高频错词 + 重做入口 |
| 13 | `/camera` | 拍照查词 OCR | P2 | 相机 + AI 圈词 + 批量加入 |
| 14 | `/pro` | PRO 付费墙 | P1 | 8 项对比 + 3 档套餐 |
| 15 | `/settings` | 学习计划设置 | P0 | 每日量 / 词书 / 提醒 |

### 💻 Web 端（12 个页面）

| # | 路由 | 名称 |
|---|---|---|
| 1 | `/dashboard` | 今日学习总览 |
| 2 | `/study` | 刷词模式选择 Hub |
| 3 | `/review` | 智能复习（带筛选）|
| 4 | `/dictionary` | 我的词书 |
| 5 | `/word/:id` | 单词详情 |
| 6 | `/leaderboard` | 排行榜 |
| 7 | `/pk` | PK 对战大厅 |
| 8 | `/story` | AI 每日故事 |
| 9 | `/mistakes` | 错题本 |
| 10 | `/camera` | 拍照查词 |
| 11 | `/pro` | PRO 付费墙 |
| 12 | `/me` | 个人主页 |
| 13 | `/settings` | 设置 |

### 👨‍👩‍👧 家长端 App（独立产品 / 独立账号）

| # | Tab | 内容 |
|---|---|---|
| 1 | 今日 | 周学习柱图 / 4 项数据卡 / 徽章 / 老师消息预览 |
| 2 | 分析 | 六维能力雷达图 / 强弱项 / AI 学习建议（可一键加入孩子计划）|
| 3 | 老师 | 师生 IM 聊天 + 附件推荐 |
| 4 | 我的 | 家长账号 / 多孩子管理 / 订阅 |

---

## 七、核心交互：6 种刷词模式状态机

所有学习模式共用 `useStudySession` hook：

```ts
type Phase = 'asking' | 'revealing' | 'done';

function useStudySession({ words }: { words: Word[] }) {
  // state
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const [results, setResults] = useState<AnswerResult[]>([]);

  // actions
  submit(correct: boolean): void;  // mode 调用，转入 revealing，发奖励
  next(): void;                    // 用户点击「继续」，进入下一题或 done
}
```

### 状态转换图
```
[asking] --submit(correct)--> [revealing]
                                |
                                next()
                                |
                ↓ (idx + 1 < total)
              [asking]   ↓ (else)
                       [done] --→ onDone(results)
```

### 各模式实现要点

1. **选择闯关 (mc)** — 4 选 1，干扰项从词库随机抽 3 个；答错抖动；正确选项高亮
2. **卡片翻转 (flip)** — 3D 翻面动画 (rotateY 0.55s)；手势左/右滑评估；卡片堆叠效果
3. **拼写填空 (spell)** — 字母池（含 4 个干扰字母）；填满自动校验；颜色反馈每格
4. **听音辨义 (listen)** — 自动播放 + 倍速切换（0.75/1/1.25）；扩散波纹动画
5. **例句情景 (context)** — AI 生成含空格句子；4 选 1 填空；正确词替换显示
6. **图像联想 (image)** — 4 张大图（emoji + gradient）；含「让 Wordy 编谐音故事」彩蛋

每题答对：+12 XP；答错：-1 ❤️；存入 results 待结果页消费。

---

## 八、核心数据结构（TypeScript 接口）

```ts
interface Word {
  id: string;
  word: string;
  ipa: string;
  pos: string;            // 'adj.' | 'vt.' | 'n.' ...
  cn: string;             // 简短释义
  cnLong: string;         // 完整释义
  etym: string;           // 词根记忆术
  examples: Example[];
  related: RelatedWord[];
  tags: string[];         // ['中考核心', 'CET-4', '高频 #284']
}

interface Example {
  en: string; cn: string;
  tag: string;            // '2024 中考' | 'AI · 运动' | '校园'
}

interface RelatedWord {
  w: string; t: string;
  kind: 'syn' | 'ant' | 'derive';   // 用于记忆图谱着色
}

interface QueueItem {
  wordId: string;
  mastery: number;        // 0..1
  due: string;            // 'today' | 'tomorrow' | 'in 3 days' ...
  state: 'weak' | 'fuzzy' | 'familiar' | 'mastered';
}

interface User {
  id: string; name: string; grade: string; avatar: string;
  level: number; xp: number; gems: number; hearts: number;
  streak: number;
  masteredCount: number; bookName: string; bookTotal: number;
  isPro: boolean; parentBound: boolean;
}
```

---

## 九、API 端点清单

完整定义见 `interactive/api.jsx`。生产环境建议 RESTful 或 GraphQL：

| 端点 | 方法 | 用途 |
|---|---|---|
| `/me` | GET | 当前用户 |
| `/plan/today` | GET | 今日学习计划 |
| `/words/:id` | GET | 单词详情 |
| `/review/queue` | GET | SRS 复习队列 |
| `/mistakes` | GET | 错题本（支持 filter/sort）|
| `/ocr/photo` | POST | 上传图片 OCR |
| `/parent/report` | GET | 家长周报 |
| `/answers` | POST | 提交答题结果（含 wordId/mode/correct/ms）|
| `/billing/plans` | GET | 付费套餐列表 |
| `/auth/phone/code` | POST | 发送手机号验证码（demo 返回 `devCode`，production 走短信网关） |
| `/auth/phone` | POST | 手机号 + 验证码登录 |
| `/auth/wechat` | POST | 微信授权 code 登录（production 走 `code2Session`） |

### AI 端点（DeepSeek / 可降级）
- `/ai/story/today` — 用今日复习词生成 100 字故事
- `/ai/example/:wordId` — 根据用户兴趣生成例句
- `/ai/memory-map/:wordId` — 生成词的关联图

生产配置建议：
- `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL=deepseek-chat`
- `AUTH_PROVIDER_MODE=production`，或按渠道拆分 `AUTH_PHONE_PROVIDER_MODE` / `AUTH_WECHAT_PROVIDER_MODE`
- `AUTH_SESSION_SECRET`、`AUTH_CODE_SECRET`
- `AUTH_SMS_HTTP_ENDPOINT`、`AUTH_SMS_HTTP_TOKEN`、`AUTH_SMS_TEMPLATE_ID`
- `WECHAT_MINI_APP_ID`、`WECHAT_MINI_APP_SECRET`

微信可先单独切到真实登录：保持 `AUTH_PHONE_PROVIDER_MODE=demo`，设置 `AUTH_WECHAT_PROVIDER_MODE=production` 并配置小程序 appid/secret；前端会优先调用宿主环境的 `wx.login` 获取真实授权 code。桌面 review 环境如需演示微信登录，可显式设置 `NEXT_PUBLIC_WECHAT_LOGIN_DEMO_CODE`；否则会提示用户在微信内打开或改用手机号。

---

## 十、AI 集成要点

使用 DeepSeek Chat Completions，所有 AI 输出要求严格 JSON，并在服务端记录 token、成本、延迟和失败 telemetry。建议 prompt 模板：

**每日故事生成**
```
你是一位英语老师，要为初三学生小敏（兴趣：足球、动漫）写一篇 100 字
左右的英文故事。必须自然包含以下 12 个词，每个词出现一次：
[words list]
难度：中考核心词汇水平。返回 JSON: { title, paragraphs }
```

**个性化例句**
```
为词「{word}」({pos}, 意为「{cn}」) 写一个英文例句。
学生兴趣：{interests}。年级：{grade}。
例句必须自然、地道、长度 8-15 词。返回 JSON: { en, cn }
```

**记忆图谱**
```
为词「{word}」生成 4 个关联词：1 个派生词、1 个同义词、1 个反义词、
1 个相似词根词。返回 JSON: { related: [{w, t, kind}] }
```

---

## 十一、关键 UI 模式

### 11.1 「Duo 风」立体按钮
```css
button.cta {
  background: var(--c-primary); color: #fff;
  box-shadow: 0 4px 0 rgba(0,0,0,.18);   /* 关键：底部硬阴影 */
  border-radius: 14px; height: 52px;
  font-weight: 700;
}
button.cta:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(0,0,0,.18); }
```

### 11.2 学习节点（路径式）
- 圆形 64-78px，4 状态：`done / current / locked / boss`
- 当前节点带「开始」气泡 + dashed 描边圈
- 节点间用 dashed S 曲线连接（SVG path）

### 11.3 单词高亮（故事 / 例句）
```jsx
<span style={{ background: 'var(--c-accent)', padding: '0 4px', borderRadius: 4 }}>
  {word}
</span>
```
点击弹出底部 sheet（释义 + 发音）

### 11.4 进度环（掌握度）
SVG 圆环 stroke-dasharray + dashoffset。掌握度 < 30% 红、< 60% 黄、≥ 60% 绿。

---

## 十二、动画规范

| 场景 | 动画 | 时长 | 缓动 |
|---|---|---|---|
| 答对 | pop + 颜色变绿 + +12XP 飘字 | 0.35s | `cubic-bezier(.2,.8,.2,1)` |
| 答错 | shake (水平 ±6px) | 0.45s | ease |
| 进入下一题 | slideRight 整体替换 | 0.30s | ease-out |
| 卡片翻转 | rotateY 180° | 0.55s | ease |
| 卡片滑动 | translate + rotate(drag * 0.05) | 跟手势 | none → 0.35s 回弹 |
| PK 倒计时 | pulse（< 3s 时）| 1s loop | ease-in-out |
| 加载骨架 | 渐变扫光 | 1.4s loop | ease-in-out |
| 庆祝彩屑 | confettiFall (translateY + rotate) | 2-3s 错落 | ease-in |

---

## 十三、推荐开发顺序

### Sprint 1（2 周）— MVP
- [ ] 设计 token & 基础组件库（CTA / Card / Progress / Tag / Icon）
- [ ] Wordy 吉祥物 4 形态 SVG
- [ ] 路由 + Store（Zustand）+ Auth
- [ ] Onboarding 4 步
- [ ] 首页（路径式 + 数据 hero）
- [ ] 选择闯关模式（最基础的 mc）
- [ ] 结果页

### Sprint 2（2 周）— 学习核心
- [ ] 其余 5 种刷词模式
- [ ] 单词详情页
- [ ] SRS 复习队列（接艾宾浩斯算法）
- [ ] 错题本

### Sprint 3（2 周）— AI & 游戏化
- [x] 接入 DeepSeek API：每日故事 / 个性化例句 / 记忆图谱
- [ ] 记忆图谱页
- [ ] 排行榜 + 段位
- [ ] 个人主页 / 学习地图

### Sprint 4（2 周）— 增长 & 商业化
- [ ] PRO 付费墙 + 订阅
- [ ] 拍照查词 OCR（接入第三方 OCR）
- [ ] 单词 PK 对战（WebSocket）
- [ ] 家长端 MVP

---

## 十四、文件清单

```
design_handoff/
├── README.md                      ← 本文档
├── 爱上背单词.html                  ← 完整交互原型入口
├── styles/
│   └── tokens.css                 ← 设计 tokens（3 主题）
├── components/                    ← 静态展示组件
│   ├── mascot.jsx                 ← Wordy 吉祥物
│   ├── ui.jsx                     ← 基础 UI 组件
│   └── screens-system.jsx         ← 设计系统展示卡
└── interactive/                   ← 可交互原型源码
    ├── data.jsx                   ← 示例数据
    ├── store.jsx                  ← 全局 store + router
    ├── session.jsx                ← 学习会话状态机
    ├── shell.jsx                  ← Phone shell + tab bar
    ├── study-modes-1.jsx          ← MC + Flip
    ├── study-modes-2.jsx          ← Spell + Listen + Context + Image
    ├── ai-features.jsx            ← AI 故事 / PK / 记忆图谱
    ├── phone-screens.jsx          ← Home / Review / Profile / Leaderboard
    ├── phone-screens-2.jsx        ← Word detail / Onboarding / Settings
    ├── extra-screens.jsx          ← Mistakes / Camera / Paywall
    ├── parent-app.jsx             ← 家长端独立 App
    ├── phone-app.jsx              ← 移动端路由装配
    ├── api.jsx                    ← API mock 层（10 端点）
    ├── web-app.jsx                ← Web 端 shell + 部分页面
    ├── web-app-2.jsx              ← Web 端其余页面
    ├── web-extras.jsx             ← Web 错题本/OCR/付费墙
    └── main-app.jsx               ← 顶层装配 + Tweaks
```

---

## 十五、给 Claude Code 的开始指令模板

把整个文件夹拖入 Claude Code，然后告诉它：

> 我有一个完整的 HTML React 原型（在 `design_handoff/` 目录）。请：
>
> 1. 先读 `README.md` 理解整体规划
> 2. 浏览所有 `interactive/*.jsx` 文件理解状态机、组件结构和交互细节
> 3. 用 **Next.js 14 + TypeScript + Tailwind CSS + Zustand + Framer Motion** 在 `app/` 目录下重新实现这个项目
> 4. 第一阶段先实现 P0 优先级页面：tokens → 基础组件 → Wordy → Onboarding → 首页 → 选择闯关 → 结果页
> 5. 每个组件保留原型里的视觉细节（颜色、阴影、动画时序）
> 6. API 调用先继续使用 mock，预留 fetch 适配层方便切换真实后端
> 7. 实现完一组就让我 review，再继续下一组

---

## 十六、问题与注意点

1. **字体加载**：得意黑（Smiley Sans）是开源中文字体，生产用 CDN 或自托管 webfont
2. **OCR 接入**：建议百度智能云 / 腾讯云通用文字识别 API
3. **实时 PK**：用 WebSocket 或 Pusher / Ably 等 SaaS；MVP 阶段可以先用 polling + 异步对手
4. **儿童信息保护**：14 岁以下需家长授权（中国《未成年人保护法》），家长端绑定流程必做
5. **音频**：发音可走 TTS（Google Cloud / 微软 Azure / 火山引擎）或预录人声音库
6. **可访问性**：所有按钮 44×44 最小点击区域；颜色对比度 ≥ 4.5:1

---

需要补充什么细节告诉我。祝开发顺利 🚀
