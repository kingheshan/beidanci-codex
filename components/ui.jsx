// ui.jsx — shared UI primitives for 爱上背单词
// Button, Card, ProgressBar, ProgressRing, Streak chip, Badge, GemPill, Tag,
// Tab dots, GhostKey (keyboard look), Icon set, Confetti, ChoiceButton.

// ────────── Icons (line + filled) ──────────
const Icon = {
  home: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z"/></svg>,
  book: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4V4z"/><path d="M20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8V4z"/></svg>,
  flame: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill={p.fill||'currentColor'} stroke="none"><path d="M12 2c0 4-5 5-5 10a5 5 0 0010 0c0-2-1-3-2-4 0 1-1 2-2 2 1-2 0-5-1-8z"/></svg>,
  star: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill={p.fill||'currentColor'}><path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>,
  gem: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill={p.fill||'currentColor'}><path d="M6 2h12l4 6-10 14L2 8z" opacity="0.9"/><path d="M6 2l4 6h4l4-6M2 8h20M10 8l2 14L14 8" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none"/></svg>,
  trophy: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill={p.fill||'currentColor'}><path d="M6 4h12v6a6 6 0 01-12 0V4z"/><path d="M4 4h2v4a2 2 0 01-2-2zM18 4h2v2a2 2 0 01-2 2zM9 14h6l-1 4h-4z"/><rect x="7" y="18" width="10" height="2.5" rx="1"/></svg>,
  user: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>,
  chart: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 17v-6M11 17V7M16 17v-9M21 17v-4"/></svg>,
  speaker: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8c1.5 1.5 1.5 6.5 0 8M19 5c3 3 3 11 0 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>,
  mic: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>,
  heart: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill={p.fill||'currentColor'}><path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/></svg>,
  check: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  x: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>,
  sparkle: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill={p.fill||'currentColor'}><path d="M12 2l1.8 5.8L20 9.5l-5.6 2.1L12 18l-2.4-6.4L4 9.5l6.2-1.7z"/><circle cx="19" cy="4" r="1.5"/><circle cx="5" cy="19" r="1.2"/></svg>,
  chevronR: (p={}) => <svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  chevronL: (p={}) => <svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  plus: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  camera: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h4l2-2h6l2 2h4v12H3z"/><circle cx="12" cy="14" r="4"/></svg>,
  swords: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5l5-2-2 5-9 9-3-3 9-9z"/><path d="M10 5L5 3l2 5 9 9 3-3z"/></svg>,
  brain: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 00-3 3 3 3 0 00-3 3v2a3 3 0 003 3 3 3 0 003 3V4zM15 4a3 3 0 013 3 3 3 0 013 3v2a3 3 0 01-3 3 3 3 0 01-3 3V4z"/></svg>,
  zap: (p={}) => <svg viewBox="0 0 24 24" width={p.s||22} height={p.s||22} fill={p.fill||'currentColor'}><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>,
  filter: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  pause: (p={}) => <svg viewBox="0 0 24 24" width={p.s||20} height={p.s||20} fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>,
};

// ────────── Big rounded "Duo-style" CTA button ──────────
function CTA({ children, color = 'var(--c-primary)', textColor = '#fff', size = 'md', icon, onClick, disabled, full = true, style = {} }) {
  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: 14, md: 16, lg: 18 };
  const h = heights[size];
  const shadow = `0 4px 0 0 rgba(0,0,0,0.18)`;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: h, width: full ? '100%' : 'auto', padding: full ? 0 : '0 22px',
      borderRadius: 14, border: 'none',
      background: disabled ? 'var(--c-ink-faint)' : color,
      color: textColor,
      fontFamily: 'var(--font-display-cn)', fontWeight: 700, fontSize: fontSizes[size],
      letterSpacing: '0.04em', textTransform: 'uppercase',
      boxShadow: disabled ? 'none' : shadow,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', transition: 'transform .1s var(--ease), box-shadow .1s var(--ease)',
      ...style,
    }}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

// ────────── Card ──────────
function Card({ children, pad = 16, radius = 22, style = {}, soft = false, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: soft ? 'var(--c-surface-soft)' : 'var(--c-surface)',
      borderRadius: radius, padding: pad,
      boxShadow: 'var(--sh-card)',
      ...style,
    }}>{children}</div>
  );
}

// ────────── Linear progress bar with overshoot end-cap ──────────
function ProgressBar({ value = 0.5, height = 12, color = 'var(--c-primary)', bg = 'rgba(0,0,0,0.06)', shine = true }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div style={{ width: '100%', height, background: bg, borderRadius: height, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: height,
        background: color, position: 'relative',
        transition: 'width .4s var(--ease)',
      }}>
        {shine && pct > 8 && (
          <div style={{
            position: 'absolute', top: 2, left: 6, right: 6, height: Math.max(2, height * 0.25),
            background: 'rgba(255,255,255,0.5)', borderRadius: height,
          }}/>
        )}
      </div>
    </div>
  );
}

// ────────── Progress ring ──────────
function ProgressRing({ value = 0.7, size = 72, stroke = 8, color = 'var(--c-primary)', track = 'rgba(0,0,0,0.07)', children }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - value)}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ────────── Streak chip / Gem pill / Tag ──────────
function StreakChip({ days = 7, size = 'md' }) {
  const small = size === 'sm';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '4px 10px' : '6px 12px',
      borderRadius: 999, background: '#FFE9D9', color: 'var(--c-streak)',
      fontWeight: 800, fontSize: small ? 13 : 15,
      fontFamily: 'var(--font-display-en)',
    }}>
      <Icon.flame s={small ? 14 : 17}/>
      <span>{days}</span>
    </div>
  );
}
function GemPill({ count = 280, size = 'md' }) {
  const small = size === 'sm';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '4px 10px' : '6px 12px',
      borderRadius: 999, background: 'rgba(108, 92, 231, 0.12)', color: 'var(--c-primary-deep)',
      fontWeight: 800, fontSize: small ? 13 : 15,
      fontFamily: 'var(--font-display-en)',
    }}>
      <Icon.gem s={small ? 14 : 17}/>
      <span>{count}</span>
    </div>
  );
}
function HeartPill({ count = 4 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '6px 12px',
      borderRadius: 999, background: 'rgba(255,90,111,0.12)', color: 'var(--c-danger)',
      fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display-en)',
    }}>
      <Icon.heart s={16}/>
      <span>{count}</span>
    </div>
  );
}

function Tag({ children, color = 'var(--c-primary)', bg = 'var(--c-primary-soft)', size = 'sm' }) {
  const sm = size === 'xs';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: sm ? '2px 7px' : '4px 10px',
      borderRadius: 999, background: bg, color,
      fontSize: sm ? 10 : 12, fontWeight: 700, letterSpacing: '0.04em',
    }}>{children}</span>
  );
}

// ────────── Choice button (multi-choice quiz) ──────────
function ChoiceButton({ label, en, state = 'idle', shortcut, onClick }) {
  const stateStyles = {
    idle:    { bg: 'var(--c-surface)', color: 'var(--c-ink)', border: 'var(--c-line)', shadow: '0 2px 0 var(--c-line)' },
    hover:   { bg: 'var(--c-primary-soft)', color: 'var(--c-primary-ink)', border: 'var(--c-primary)', shadow: '0 2px 0 var(--c-primary)' },
    correct: { bg: '#DCFCE7', color: '#0E4D24', border: 'var(--c-success)', shadow: '0 2px 0 var(--c-success)' },
    wrong:   { bg: '#FFE2E5', color: '#7A1620', border: 'var(--c-danger)', shadow: '0 2px 0 var(--c-danger)' },
    disabled:{ bg: 'var(--c-surface)', color: 'var(--c-ink-muted)', border: 'var(--c-line)', shadow: '0 2px 0 var(--c-line)' },
  }[state] || {};
  return (
    <button onClick={onClick} style={{
      width: '100%', minHeight: 56, padding: '12px 14px',
      borderRadius: 14,
      background: stateStyles.bg, color: stateStyles.color,
      border: `2px solid ${stateStyles.border}`,
      boxShadow: stateStyles.shadow,
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', textAlign: 'left',
      fontFamily: 'var(--font-body-cn)',
    }}>
      {shortcut && <span style={{
        width: 24, height: 24, borderRadius: 6, border: `1.5px solid currentColor`,
        display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
        opacity: 0.6, flexShrink: 0,
      }}>{shortcut}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {en && <div style={{ fontFamily: 'var(--font-display-en)', fontSize: 11, opacity: 0.55, marginBottom: 2 }}>{en}</div>}
        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
      </div>
      {state === 'correct' && <Icon.check s={20}/>}
      {state === 'wrong' && <Icon.x s={20}/>}
    </button>
  );
}

// ────────── Bottom Tab Bar ──────────
function TabBar({ active = 'home' }) {
  const items = [
    { id: 'home', label: '学习', icon: Icon.home },
    { id: 'review', label: '复习', icon: Icon.brain },
    { id: 'rank', label: '排行', icon: Icon.trophy },
    { id: 'me', label: '我的', icon: Icon.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 78,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--c-line)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, zIndex: 30,
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--c-primary)' : 'var(--c-ink-muted)',
          }}>
            <it.icon s={24}/>
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ────────── Hero stat block (number + label) ──────────
function StatBlock({ value, label, color = 'var(--c-primary)', icon }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {icon && <div style={{ color, marginBottom: 2 }}>{icon}</div>}
      <div style={{ fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 22, color: 'var(--c-ink)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--c-ink-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ────────── Lesson node (path-style) ──────────
function LessonNode({ state = 'locked', icon, label, big = false }) {
  const sz = big ? 78 : 64;
  const colors = {
    done:    { bg: 'var(--c-success)', shadow: '0 4px 0 #0E8B5C', ring: 'rgba(0,212,170,0.2)' },
    current: { bg: 'var(--c-primary)', shadow: '0 4px 0 var(--c-primary-deep)', ring: 'rgba(108,92,231,0.2)' },
    locked:  { bg: 'var(--c-ink-faint)', shadow: '0 4px 0 var(--c-ink-muted)', ring: 'transparent' },
    boss:    { bg: 'var(--c-pink)', shadow: '0 4px 0 #B33D6F', ring: 'rgba(255,107,157,0.2)' },
  }[state] || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        background: colors.bg, boxShadow: colors.shadow,
        display: 'grid', placeItems: 'center',
        color: '#fff', position: 'relative',
      }}>
        {state === 'current' && (
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '3px dashed var(--c-primary)', opacity: 0.4 }}/>
        )}
        {icon}
      </div>
      {label && <div style={{ fontSize: 10, color: 'var(--c-ink-soft)', fontWeight: 600 }}>{label}</div>}
    </div>
  );
}

// ────────── Wave shape (decorative bg) ──────────
function WaveBg({ color = 'var(--c-primary)', height = 220 }) {
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <path d="M0 0 H400 V160 Q300 200 200 170 T0 180 Z" fill={color}/>
    </svg>
  );
}

Object.assign(window, {
  Icon, CTA, Card, ProgressBar, ProgressRing,
  StreakChip, GemPill, HeartPill, Tag,
  ChoiceButton, TabBar, StatBlock, LessonNode, WaveBg,
});
