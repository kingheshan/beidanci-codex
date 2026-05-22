// mascot.jsx — Wordy: a multi-form glowing study creature
// Wordy 是「爱上背单词」的吉祥物：一只圆滚滚、戴眼镜的发光小怪兽，
// 形态会随记忆等级进化。颜色完全跟随主题。

const W_BODY = 'var(--c-primary)';
const W_BODY_DEEP = 'var(--c-primary-deep)';
const W_BELLY = 'var(--c-primary-soft)';
const W_ACCENT = 'var(--c-accent)';
const W_PINK = 'var(--c-pink)';
const W_MINT = 'var(--c-mint)';
const W_INK = 'var(--c-ink)';

// shared face: glasses + cheek blush + smile
function WordyFace({ mood = 'happy', glasses = true, scale = 1 }) {
  const eyeY = 0;
  const eye = (cx) => {
    if (mood === 'sleepy' || mood === 'wink-l' && cx < 0)
      return <path d={`M${cx - 5} ${eyeY} q5 4 10 0`} stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round"/>;
    if (mood === 'wink-r' && cx > 0)
      return <path d={`M${cx - 5} ${eyeY} q5 4 10 0`} stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round"/>;
    if (mood === 'shocked')
      return <circle cx={cx} cy={eyeY} r="3.6" fill={W_INK}/>;
    return (
      <g>
        <ellipse cx={cx} cy={eyeY} rx="3.8" ry="4.6" fill={W_INK}/>
        <circle cx={cx + 1.2} cy={eyeY - 1.6} r="1.2" fill="#fff"/>
      </g>
    );
  };

  const smile = mood === 'shocked'
    ? <ellipse cx="0" cy="14" rx="4" ry="5" fill={W_INK}/>
    : mood === 'sad'
    ? <path d="M-7 16 q7 -5 14 0" stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round"/>
    : mood === 'cheer'
    ? <path d="M-9 11 q9 12 18 0 Z" fill={W_INK}/>
    : <path d="M-7 12 q7 7 14 0" stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round"/>;

  return (
    <g transform={`scale(${scale})`}>
      {/* cheek blush */}
      <circle cx="-16" cy="6" r="4.5" fill={W_PINK} opacity="0.55"/>
      <circle cx="16" cy="6" r="4.5" fill={W_PINK} opacity="0.55"/>
      {/* eyes */}
      {eye(-9)}
      {eye(9)}
      {/* glasses */}
      {glasses && (
        <g fill="none" stroke={W_INK} strokeWidth="2">
          <circle cx="-9" cy="0" r="8.5"/>
          <circle cx="9" cy="0" r="8.5"/>
          <path d="M-0.5 0 h1" strokeWidth="2.4"/>
          <path d="M-17.5 -2 q-3 1 -4 4" strokeLinecap="round"/>
          <path d="M17.5 -2 q3 1 4 4" strokeLinecap="round"/>
          {/* glass shine */}
          <circle cx="-12" cy="-3" r="2.2" fill="#fff" opacity="0.4" stroke="none"/>
          <circle cx="6" cy="-3" r="2.2" fill="#fff" opacity="0.4" stroke="none"/>
        </g>
      )}
      {smile}
    </g>
  );
}

// ─── Wordy: round bean form (Level 1) ────────────────────────
// Default friendly form used across most screens.
function Wordy({
  size = 120,
  mood = 'happy',
  pose = 'idle',        // idle | wave | celebrate | study | think | sleep
  glow = true,
  form = 'bean',        // bean | sprout | star | rocket
}) {
  if (form === 'sprout') return <WordySprout size={size} mood={mood} pose={pose} glow={glow}/>;
  if (form === 'star') return <WordyStar size={size} mood={mood} pose={pose} glow={glow}/>;
  if (form === 'rocket') return <WordyRocket size={size} mood={mood} pose={pose} glow={glow}/>;

  return (
    <svg viewBox="-70 -80 140 160" width={size} height={size * 1.14} style={{ overflow: 'visible' }}>
      {/* glow */}
      {glow && <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18"/>}
      {glow && (
        <radialGradient id="wordyGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={W_ACCENT} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={W_ACCENT} stopOpacity="0"/>
        </radialGradient>
      )}
      {glow && <circle cx="0" cy="0" r="70" fill="url(#wordyGlow)" opacity="0.5"/>}

      {/* antenna with sparkle */}
      <g>
        <path d="M-2 -50 q2 -12 10 -15" stroke={W_BODY_DEEP} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="10" cy="-65" r="5" fill={W_ACCENT} stroke={W_INK} strokeWidth="2"/>
        <path d="M10 -71 l0 -4 M10 -59 l0 4 M4 -65 l-3 0 M16 -65 l3 0" stroke={W_ACCENT} strokeWidth="1.8" strokeLinecap="round"/>
      </g>

      {/* body */}
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY}/>
      {/* belly */}
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6"/>
      {/* highlight */}
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25"/>

      {/* arms — pose-dependent */}
      {pose === 'wave' && (
        <g>
          <path d="M-38 0 q-15 -10 -18 -28" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <circle cx="-56" cy="-28" r="8" fill={W_BODY_DEEP}/>
          <path d="M38 8 q12 5 14 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <circle cx="52" cy="26" r="7" fill={W_BODY_DEEP}/>
        </g>
      )}
      {pose === 'celebrate' && (
        <g>
          <path d="M-32 -8 q-18 -20 -22 -40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <circle cx="-54" cy="-48" r="8" fill={W_BODY_DEEP}/>
          <path d="M32 -8 q18 -20 22 -40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <circle cx="54" cy="-48" r="8" fill={W_BODY_DEEP}/>
          {/* confetti */}
          <circle cx="-50" cy="-62" r="3" fill={W_ACCENT}/>
          <circle cx="50" cy="-62" r="3" fill={W_PINK}/>
          <rect x="-30" y="-72" width="4" height="4" fill={W_MINT} transform="rotate(15 -28 -70)"/>
          <rect x="28" y="-72" width="4" height="4" fill={W_ACCENT} transform="rotate(-20 30 -70)"/>
        </g>
      )}
      {pose === 'study' && (
        <g>
          {/* holding a book */}
          <path d="M-38 10 q-4 6 -2 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M38 10 q4 6 2 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <rect x="-26" y="22" width="52" height="32" rx="4" fill={W_ACCENT} stroke={W_INK} strokeWidth="2"/>
          <path d="M0 22 v32" stroke={W_INK} strokeWidth="2"/>
          <path d="M-20 32 h12 M-20 40 h12 M8 32 h12 M8 40 h12" stroke={W_INK} strokeWidth="1.5" opacity="0.5"/>
        </g>
      )}
      {pose === 'think' && (
        <g>
          <path d="M-38 -4 q-8 -10 -6 -22" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <circle cx="-46" cy="-26" r="8" fill={W_BODY_DEEP}/>
          <path d="M38 6 q8 4 8 14" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          {/* thought bubbles */}
          <circle cx="-50" cy="-42" r="4" fill="#fff" stroke={W_INK} strokeWidth="1.6"/>
          <circle cx="-60" cy="-55" r="6" fill="#fff" stroke={W_INK} strokeWidth="1.6"/>
        </g>
      )}
      {pose === 'idle' && (
        <g>
          <path d="M-38 6 q-6 8 -4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M38 6 q6 8 4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
        </g>
      )}
      {pose === 'sleep' && (
        <g>
          <path d="M-38 6 q-6 8 -4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M38 6 q6 8 4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
          <text x="30" y="-30" fontSize="18" fontWeight="700" fill={W_BODY_DEEP} fontFamily="var(--font-display-en)">Z</text>
          <text x="42" y="-44" fontSize="12" fontWeight="700" fill={W_BODY_DEEP} fontFamily="var(--font-display-en)">z</text>
        </g>
      )}

      {/* face */}
      <g transform="translate(0 -2)">
        <WordyFace mood={pose === 'sleep' ? 'sleepy' : mood}/>
      </g>

      {/* feet */}
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
    </svg>
  );
}

// ─── Sprout form (Level 2): little leaf on head ──────────────
function WordySprout({ size = 120, mood = 'happy', pose = 'idle', glow = true }) {
  return (
    <svg viewBox="-70 -90 140 170" width={size} height={size * 1.21} style={{ overflow: 'visible' }}>
      {glow && <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18"/>}
      {/* leaves */}
      <g>
        <path d="M-2 -45 q-22 -10 -28 -32 q24 4 28 30" fill={W_MINT} stroke={W_INK} strokeWidth="2"/>
        <path d="M2 -45 q22 -10 28 -32 q-24 4 -28 30" fill={W_MINT} stroke={W_INK} strokeWidth="2"/>
        <path d="M0 -50 v-25" stroke={W_BODY_DEEP} strokeWidth="3" strokeLinecap="round"/>
      </g>
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY}/>
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6"/>
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25"/>
      <path d="M-38 6 q-6 8 -4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M38 6 q6 8 4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <g transform="translate(0 -2)">
        <WordyFace mood={mood}/>
      </g>
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
    </svg>
  );
}

// ─── Star form (Level 3): with star halo ─────────────────────
function WordyStar({ size = 120, mood = 'cheer', glow = true }) {
  return (
    <svg viewBox="-80 -90 160 170" width={size} height={size * 1.06} style={{ overflow: 'visible' }}>
      {/* halo of stars */}
      <g fill={W_ACCENT} stroke={W_INK} strokeWidth="1.5">
        <path d="M-60 -50 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z"/>
        <path d="M60 -55 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z"/>
        <path d="M0 -78 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z"/>
      </g>
      {glow && <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18"/>}
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY}/>
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6"/>
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25"/>
      {/* arms up cheering */}
      <path d="M-32 -8 q-18 -20 -22 -40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="-54" cy="-48" r="8" fill={W_BODY_DEEP}/>
      <path d="M32 -8 q18 -20 22 -40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="54" cy="-48" r="8" fill={W_BODY_DEEP}/>
      <g transform="translate(0 -2)">
        <WordyFace mood={mood}/>
      </g>
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP}/>
    </svg>
  );
}

// ─── Rocket form (Level 4): with flame trail ─────────────────
function WordyRocket({ size = 120, mood = 'cheer', glow = true }) {
  return (
    <svg viewBox="-70 -90 140 200" width={size} height={size * 1.43} style={{ overflow: 'visible' }}>
      {/* flame */}
      <g>
        <path d="M-18 50 q18 40 36 0 q-8 30 -18 30 q-10 0 -18 -30 z" fill={W_ACCENT}/>
        <path d="M-10 60 q10 28 20 0 q-4 20 -10 20 q-6 0 -10 -20 z" fill={W_PINK}/>
      </g>
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY}/>
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6"/>
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25"/>
      {/* rocket fins */}
      <path d="M-42 30 l-12 16 l8 4 z" fill={W_BODY_DEEP}/>
      <path d="M42 30 l12 16 l-8 4 z" fill={W_BODY_DEEP}/>
      {/* helmet */}
      <ellipse cx="0" cy="-25" rx="38" ry="34" fill="#fff" opacity="0.25" stroke={W_INK} strokeWidth="2"/>
      <g transform="translate(0 -2)">
        <WordyFace mood={mood}/>
      </g>
    </svg>
  );
}

// ─── tiny inline Wordy (avatar/badge use) ────────────────────
function WordyMini({ size = 32, mood = 'happy' }) {
  return (
    <svg viewBox="-40 -42 80 80" width={size} height={size}>
      <ellipse cx="0" cy="0" rx="32" ry="34" fill={W_BODY}/>
      <ellipse cx="0" cy="10" rx="20" ry="16" fill={W_BELLY} opacity="0.6"/>
      <ellipse cx="-13" cy="-12" rx="6" ry="5" fill="#fff" opacity="0.3"/>
      <circle cx="-10" cy="-2" r="2.5" fill={W_INK}/>
      <circle cx="10" cy="-2" r="2.5" fill={W_INK}/>
      <path d="M-7 10 q7 6 14 0" stroke={W_INK} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <circle cx="-18" cy="6" r="3" fill={W_PINK} opacity="0.5"/>
      <circle cx="18" cy="6" r="3" fill={W_PINK} opacity="0.5"/>
    </svg>
  );
}

Object.assign(window, { Wordy, WordyMini, WordyFace, WordySprout, WordyStar, WordyRocket });
