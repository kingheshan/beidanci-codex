// data.jsx — sample word data, sentences, AI generated content
// Centralized so all interactive screens share state.

const WORDS = [
  {
    id: 'w1', word: 'persistent', ipa: '/pərˈsɪstənt/', pos: 'adj.',
    cn: '坚持不懈的', cnLong: '有毅力的；持续的；顽固的',
    etym: '词根 per- 贯穿 + sist 站立 → 始终站立 = 坚持',
    examples: [
      { en: 'She is a persistent student who never gives up.', cn: '她是一个永不放弃的坚持不懈的学生。', tag: '中考真题' },
      { en: 'His persistent training paid off at the game.', cn: '他坚持不懈的训练在比赛中得到了回报。', tag: 'AI · 运动' },
    ],
    related: [
      { w: 'persistence', t: 'n. 坚持', kind: 'derive' },
      { w: 'persevere', t: 'v. 坚持', kind: 'syn' },
      { w: 'stubborn', t: 'adj. 顽固的', kind: 'syn' },
      { w: 'lazy', t: 'adj. 懒惰', kind: 'ant' },
    ],
    tags: ['中考核心', 'CET-4'],
  },
  {
    id: 'w2', word: 'ambitious', ipa: '/æmˈbɪʃəs/', pos: 'adj.',
    cn: '雄心勃勃的', cnLong: '有抱负的；野心勃勃的',
    etym: 'ambit 走动 + -ious → 到处奔走 = 有抱负',
    examples: [
      { en: 'She is an ambitious student aiming for Tsinghua.', cn: '她是一个目标清华的雄心勃勃的学生。', tag: '中考核心' },
      { en: 'The football team has ambitious goals this year.', cn: '足球队今年有雄心勃勃的目标。', tag: 'AI · 运动' },
    ],
    related: [
      { w: 'ambition', t: 'n. 抱负', kind: 'derive' },
      { w: 'aspiring', t: 'adj. 上进的', kind: 'syn' },
      { w: 'content', t: 'adj. 满足的', kind: 'ant' },
    ],
    tags: ['中考核心'],
  },
  {
    id: 'w3', word: 'achieve', ipa: '/əˈtʃiːv/', pos: 'vt.',
    cn: '完成，实现', cnLong: '完成；达到（目标）；实现',
    etym: 'a- 加强 + chief 头 → 用力到达顶端 = 实现',
    examples: [
      { en: 'Hard work helps her achieve her dream.', cn: '努力工作帮她实现了梦想。', tag: '2024 中考' },
      { en: 'We achieved a lot in the football tournament.', cn: '我们在足球联赛取得了很多成就。', tag: 'AI · 运动' },
    ],
    related: [
      { w: 'achievement', t: 'n. 成就', kind: 'derive' },
      { w: 'accomplish', t: 'v. 完成', kind: 'syn' },
      { w: 'reach', t: 'v. 达到', kind: 'syn' },
      { w: 'fail', t: 'v. 失败', kind: 'ant' },
    ],
    tags: ['中考核心', '高频 #284'],
  },
  {
    id: 'w4', word: 'environment', ipa: '/ɪnˈvaɪrənmənt/', pos: 'n.',
    cn: '环境', cnLong: '环境；外界状况；周围状况',
    etym: 'environ 围绕 + -ment 名词后缀',
    examples: [
      { en: 'We must protect our environment.', cn: '我们必须保护我们的环境。', tag: '中考核心' },
      { en: 'The school provides a great study environment.', cn: '学校提供了良好的学习环境。', tag: 'AI · 校园' },
    ],
    related: [
      { w: 'environmental', t: 'adj. 环境的', kind: 'derive' },
      { w: 'surroundings', t: 'n. 周围环境', kind: 'syn' },
    ],
    tags: ['中考核心'],
  },
  {
    id: 'w5', word: 'sustainable', ipa: '/səˈsteɪnəbl/', pos: 'adj.',
    cn: '可持续的', cnLong: '可持续的；可维持的；能保持的',
    etym: 'sus- 在下 + tain 拿 + -able 可以 → 可以撑住',
    examples: [
      { en: 'Sustainable development helps our planet.', cn: '可持续发展有助于我们的地球。', tag: '高考真题' },
      { en: 'We need a sustainable training plan.', cn: '我们需要一个可持续的训练计划。', tag: 'AI · 运动' },
    ],
    related: [
      { w: 'sustain', t: 'v. 维持', kind: 'derive' },
      { w: 'lasting', t: 'adj. 持久的', kind: 'syn' },
    ],
    tags: ['高考', 'CET-6'],
  },
  {
    id: 'w6', word: 'determine', ipa: '/dɪˈtɜːrmɪn/', pos: 'vt.',
    cn: '决定，确定', cnLong: '决定；下决心；查明；测定',
    etym: 'de- 完全 + termin 边界 → 划定界限 = 决定',
    examples: [
      { en: 'I am determined to pass the exam.', cn: '我下定决心要通过考试。', tag: '中考核心' },
      { en: 'The coach determined the starting lineup.', cn: '教练决定了首发阵容。', tag: 'AI · 运动' },
    ],
    related: [
      { w: 'determination', t: 'n. 决心', kind: 'derive' },
      { w: 'decide', t: 'v. 决定', kind: 'syn' },
      { w: 'hesitate', t: 'v. 犹豫', kind: 'ant' },
    ],
    tags: ['中考核心'],
  },
];

// SRS-style queue (mastery level 0-1)
const QUEUE = [
  { wordId: 'w1', mastery: 0.15, due: 'today', state: 'weak' },
  { wordId: 'w5', mastery: 0.35, due: 'today', state: 'fuzzy' },
  { wordId: 'w6', mastery: 0.55, due: 'tomorrow', state: 'familiar' },
  { wordId: 'w3', mastery: 0.82, due: 'in 3 days', state: 'mastered' },
  { wordId: 'w4', mastery: 0.92, due: 'in 7 days', state: 'mastered' },
  { wordId: 'w2', mastery: 0.45, due: 'today', state: 'fuzzy' },
];

// Daily AI story
const STORY = {
  title: 'The Persistent Bookworm',
  ep: 124,
  cn: '坚持不懈的书虫',
  paragraphs: [
    { tokens: [
      { t: 'Mia was an ', plain: true },
      { t: 'ambitious', wid: 'w2' },
      { t: ' ninth grader.', plain: true },
    ]},
    { tokens: [
      { t: 'Every morning she would ', plain: true },
      { t: 'determine', wid: 'w6' },
      { t: ' to finish her vocabulary list before breakfast.', plain: true },
    ]},
    { tokens: [
      { t: 'Her classmates thought she was too ', plain: true },
      { t: 'persistent', wid: 'w1' },
      { t: ', but Mia knew that small daily effort would help her ', plain: true },
      { t: 'achieve', wid: 'w3' },
      { t: ' her goal.', plain: true },
    ]},
    { tokens: [
      { t: 'She believed in a ', plain: true },
      { t: 'sustainable', wid: 'w5' },
      { t: ' pace, not in cramming all night.', plain: true },
    ]},
  ],
};

// Lessons (path)
const LESSONS = [
  { id: 'L1', title: '入门', words: 20, state: 'done', type: 'intro' },
  { id: 'L2', title: '进阶', words: 20, state: 'done', type: 'level' },
  { id: 'L3', title: '情景闯关', words: 20, state: 'current', type: 'context' },
  { id: 'L4', title: '听力', words: 15, state: 'locked', type: 'listen' },
  { id: 'L5', title: 'BOSS 战', words: 30, state: 'locked', type: 'boss' },
];

// Leaderboard
const LEADERBOARD = [
  { rank: 1, name: '赵雪', xp: 2100, avatar: '🦊' },
  { rank: 2, name: '林浩', xp: 1240, avatar: '🐯' },
  { rank: 3, name: '王宇', xp: 980, avatar: '🐻' },
  { rank: 4, name: '陈思雨', xp: 870, avatar: '🐱' },
  { rank: 5, name: '吴小敏 (你)', xp: 820, me: true, avatar: '⭐' },
  { rank: 6, name: '刘梓涵', xp: 760, avatar: '🐰' },
  { rank: 7, name: '黄博文', xp: 720, avatar: '🐼' },
  { rank: 8, name: '周一一', xp: 650, avatar: '🦄' },
  { rank: 9, name: '李俊熙', xp: 590, avatar: '🐧' },
  { rank: 10, name: '杨子萱', xp: 540, avatar: '🦁' },
  { rank: 11, name: '徐玥', xp: 480, danger: true, avatar: '🐢' },
];

// Helper lookup
function findWord(id) { return WORDS.find(w => w.id === id); }

Object.assign(window, { WORDS, QUEUE, STORY, LESSONS, LEADERBOARD, findWord });
