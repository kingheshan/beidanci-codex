// api.jsx — Mock API layer
// Centralizes all "backend" calls. Each function returns a Promise that
// resolves after a small delay (200-600ms) and includes a 5% failure rate
// option for retry UX. Swap with real fetch() in production.

const API_BASE = '/api/v1';
const __MOCK = true; // toggle off in production

// helper: simulated network delay + optional failure
function delay(ms = 300, failRate = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) reject(new Error('Network error'));
      else resolve();
    }, ms);
  });
}

const api = {
  // ── User & plan ───────────────────────────────────────────
  async getMe() {
    if (!__MOCK) return fetch(`${API_BASE}/me`).then(r => r.json());
    await delay(280);
    return {
      id: 'u_xiaomin',
      name: '小敏',
      grade: '初三',
      avatar: '⭐',
      level: 23,
      xp: 820,
      gems: 1280,
      hearts: 4,
      streak: 28,
      masteredCount: 1284,
      bookName: '中考核心 1600',
      bookTotal: 1600,
      isPro: false,
      parentBound: true,
    };
  },

  async getTodayPlan() {
    if (!__MOCK) return fetch(`${API_BASE}/plan/today`).then(r => r.json());
    await delay(320);
    return {
      newWords: 8,
      reviewWords: 14,
      done: 12,
      total: 20,
      estimatedMinutes: 6,
      unit: 'UNIT 3 · 校园生活',
      lessons: LESSONS,
    };
  },

  async getWord(id) {
    if (!__MOCK) return fetch(`${API_BASE}/words/${id}`).then(r => r.json());
    await delay(220);
    return findWord(id);
  },

  async getReviewQueue() {
    if (!__MOCK) return fetch(`${API_BASE}/review/queue`).then(r => r.json());
    await delay(400);
    return QUEUE;
  },

  // ── Mistakes (错题本) ─────────────────────────────────────
  async getMistakes({ filter = 'all', sort = 'recent' } = {}) {
    if (!__MOCK) return fetch(`${API_BASE}/mistakes?filter=${filter}&sort=${sort}`).then(r => r.json());
    await delay(320);
    const rows = [
      { wordId: 'w1', wrongTimes: 3, lastWrong: '2026-05-18', mode: 'mc', reason: '与 ambitious 混淆', mastery: 0.15 },
      { wordId: 'w5', wrongTimes: 2, lastWrong: '2026-05-18', mode: 'spell', reason: '拼写错误：sustanable', mastery: 0.35 },
      { wordId: 'w6', wrongTimes: 2, lastWrong: '2026-05-17', mode: 'listen', reason: '听音辨义错误', mastery: 0.45 },
      { wordId: 'w2', wrongTimes: 1, lastWrong: '2026-05-17', mode: 'image', reason: '图像联想错选', mastery: 0.5 },
      { wordId: 'w4', wrongTimes: 1, lastWrong: '2026-05-15', mode: 'context', reason: '情景填空错误', mastery: 0.62 },
    ];
    if (filter === 'all') return rows;
    return rows.filter(r => filter === 'frequent' ? r.wrongTimes >= 2 : r.mode === filter);
  },

  // ── OCR (拍照查词) ───────────────────────────────────────
  async ocrPhoto(/* file */) {
    if (!__MOCK) return fetch(`${API_BASE}/ocr/photo`, { method: 'POST' }).then(r => r.json());
    await delay(1200); // intentionally slow to show loading
    return {
      detected: 142,
      words: [
        { id: 'w3', word: 'achieve', x: 22, y: 31, conf: 0.94, known: true },
        { id: 'w1', word: 'persistent', x: 58, y: 28, conf: 0.91, known: false },
        { id: 'w5', word: 'sustainable', x: 41, y: 52, conf: 0.88, known: false },
        { id: 'w6', word: 'determine', x: 72, y: 47, conf: 0.92, known: true },
        { id: 'unk1', word: 'perseverance', x: 30, y: 71, conf: 0.86, known: false, isNew: true },
        { id: 'unk2', word: 'aspiration', x: 64, y: 76, conf: 0.83, known: false, isNew: true },
      ],
    };
  },

  // ── Parent dashboard ─────────────────────────────────────
  async getParentReport() {
    if (!__MOCK) return fetch(`${API_BASE}/parent/report`).then(r => r.json());
    await delay(380);
    return {
      childName: '小敏',
      grade: '初三',
      weekDays: ['一','二','三','四','五','六','日'],
      weekMinutes: [18, 22, 0, 26, 28, 32, 12], // today is day 5
      weekWords: [22, 28, 0, 30, 36, 40, 14],
      weekXP: 1240,
      weekAvg: 21,
      streak: 28,
      mastered: 1284,
      target: 1600,
      progressVsLastWeek: 0.12,
      timeRank: { pct: 18, group: '同年级' }, // top 18%
      strengths: ['听力辨义 (92%)', '拼写填空 (88%)', '情景例句 (84%)'],
      weakness: [
        { type: '形似词混淆', desc: 'persistent / present / permanent', count: 6 },
        { type: '词根派生错位', desc: '-ment / -tion / -ity 后缀', count: 4 },
      ],
      recentBadges: ['🔥 月度学霸', '⚔️ 翡翠王者'],
      teacher: {
        name: '王老师',
        avatar: '👨‍🏫',
        lastMessage: '小敏本周表现稳定，建议加强形似词练习。',
        time: '2 小时前',
      },
    };
  },

  // ── Submit answer (used by study modes in production) ────
  async submitAnswer({ wordId, mode, correct, ms }) {
    if (!__MOCK) return fetch(`${API_BASE}/answers`, { method: 'POST', body: JSON.stringify({ wordId, mode, correct, ms }) }).then(r => r.json());
    await delay(120);
    return { ok: true, xpAwarded: correct ? 12 : 0, newMastery: correct ? 0.7 : 0.4 };
  },

  // ── Pro / paywall ─────────────────────────────────────────
  async getPlans() {
    if (!__MOCK) return fetch(`${API_BASE}/billing/plans`).then(r => r.json());
    await delay(220);
    return [
      { id: 'monthly', name: '月会员', price: 18, perMonth: 18, save: 0, tag: null },
      { id: 'yearly', name: '年会员', price: 168, perMonth: 14, save: 22, tag: '最划算', popular: true },
      { id: 'lifetime', name: '终身会员', price: 488, perMonth: 0, save: 0, tag: '🚀 一次买断' },
    ];
  },
};

// ── React data hook ─────────────────────────────────────────
function useApi(fn, deps = []) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const reload = React.useCallback(() => {
    setLoading(true); setError(null);
    fn().then(d => { setData(d); setLoading(false); })
        .catch(e => { setError(e); setLoading(false); });
  }, deps);
  React.useEffect(() => { reload(); }, deps);
  return { data, loading, error, reload };
}

// Skeleton block — used for loading states
function Skeleton({ w = '100%', h = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, background: 'var(--c-bg-deep)',
      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.4s ease-in-out infinite',
      ...style,
    }}/>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('aibd-skeleton-kf')) {
  const s = document.createElement('style');
  s.id = 'aibd-skeleton-kf';
  s.textContent = `@keyframes skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
  document.head.appendChild(s);
}

Object.assign(window, { api, useApi, Skeleton });
