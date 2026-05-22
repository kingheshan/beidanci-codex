"use client";

import { useId } from "react";

export type WordyMood = "happy" | "sleepy" | "wink-l" | "wink-r" | "shocked" | "sad" | "cheer";
export type WordyPose = "idle" | "wave" | "celebrate" | "study" | "think" | "sleep";
export type WordyForm = "bean" | "sprout" | "star" | "rocket";

type WordyProps = {
  size?: number;
  mood?: WordyMood;
  pose?: WordyPose;
  glow?: boolean;
  form?: WordyForm;
};

const W_BODY = "var(--c-primary)";
const W_BODY_DEEP = "var(--c-primary-deep)";
const W_BELLY = "var(--c-primary-soft)";
const W_ACCENT = "var(--c-accent)";
const W_PINK = "var(--c-pink)";
const W_MINT = "var(--c-mint)";
const W_INK = "var(--c-ink)";

function WordyFace({ mood = "happy", scale = 1 }: { mood?: WordyMood; scale?: number }) {
  const eye = (cx: number) => {
    if (mood === "sleepy" || (mood === "wink-l" && cx < 0) || (mood === "wink-r" && cx > 0)) {
      return <path d={`M${cx - 5} 0 q5 4 10 0`} stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    }
    if (mood === "shocked") {
      return <circle cx={cx} cy="0" r="3.6" fill={W_INK} />;
    }
    return (
      <g>
        <ellipse cx={cx} cy="0" rx="3.8" ry="4.6" fill={W_INK} />
        <circle cx={cx + 1.2} cy="-1.6" r="1.2" fill="#fff" />
      </g>
    );
  };

  const smile = mood === "shocked"
    ? <ellipse cx="0" cy="14" rx="4" ry="5" fill={W_INK} />
    : mood === "sad"
      ? <path d="M-7 16 q7 -5 14 0" stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      : mood === "cheer"
        ? <path d="M-9 11 q9 12 18 0 Z" fill={W_INK} />
        : <path d="M-7 12 q7 7 14 0" stroke={W_INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;

  return (
    <g transform={`scale(${scale})`}>
      <circle cx="-16" cy="6" r="4.5" fill={W_PINK} opacity="0.55" />
      <circle cx="16" cy="6" r="4.5" fill={W_PINK} opacity="0.55" />
      {eye(-9)}
      {eye(9)}
      <g fill="none" stroke={W_INK} strokeWidth="2">
        <circle cx="-9" cy="0" r="8.5" />
        <circle cx="9" cy="0" r="8.5" />
        <path d="M-.5 0h1" strokeWidth="2.4" />
        <path d="M-17.5-2q-3 1-4 4" strokeLinecap="round" />
        <path d="M17.5-2q3 1 4 4" strokeLinecap="round" />
        <circle cx="-12" cy="-3" r="2.2" fill="#fff" opacity="0.4" stroke="none" />
        <circle cx="6" cy="-3" r="2.2" fill="#fff" opacity="0.4" stroke="none" />
      </g>
      {smile}
    </g>
  );
}

function BeanArms({ pose }: { pose: WordyPose }) {
  if (pose === "wave") {
    return (
      <g>
        <path d="M-38 0q-15-10-18-28" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="-56" cy="-28" r="8" fill={W_BODY_DEEP} />
        <path d="M38 8q12 5 14 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="52" cy="26" r="7" fill={W_BODY_DEEP} />
      </g>
    );
  }
  if (pose === "celebrate") {
    return (
      <g>
        <path d="M-32-8q-18-20-22-40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="-54" cy="-48" r="8" fill={W_BODY_DEEP} />
        <path d="M32-8q18-20 22-40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="-48" r="8" fill={W_BODY_DEEP} />
        <circle cx="-50" cy="-62" r="3" fill={W_ACCENT} />
        <circle cx="50" cy="-62" r="3" fill={W_PINK} />
        <rect x="-30" y="-72" width="4" height="4" fill={W_MINT} transform="rotate(15 -28 -70)" />
        <rect x="28" y="-72" width="4" height="4" fill={W_ACCENT} transform="rotate(-20 30 -70)" />
      </g>
    );
  }
  if (pose === "study") {
    return (
      <g>
        <path d="M-38 10q-4 6-2 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M38 10q4 6 2 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <rect x="-26" y="22" width="52" height="32" rx="4" fill={W_ACCENT} stroke={W_INK} strokeWidth="2" />
        <path d="M0 22v32M-20 32h12M-20 40h12M8 32h12M8 40h12" stroke={W_INK} strokeWidth="1.5" opacity="0.55" />
      </g>
    );
  }
  if (pose === "think") {
    return (
      <g>
        <path d="M-38-4q-8-10-6-22" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="-46" cy="-26" r="8" fill={W_BODY_DEEP} />
        <path d="M38 6q8 4 8 14" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="-50" cy="-42" r="4" fill="#fff" stroke={W_INK} strokeWidth="1.6" />
        <circle cx="-60" cy="-55" r="6" fill="#fff" stroke={W_INK} strokeWidth="1.6" />
      </g>
    );
  }
  return (
    <g>
      <path d="M-38 6q-6 8-4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M38 6q6 8 4 18" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
      {pose === "sleep" ? (
        <>
          <text x="30" y="-30" fontSize="18" fontWeight="700" fill={W_BODY_DEEP} fontFamily="var(--font-display-en)">Z</text>
          <text x="42" y="-44" fontSize="12" fontWeight="700" fill={W_BODY_DEEP} fontFamily="var(--font-display-en)">z</text>
        </>
      ) : null}
    </g>
  );
}

export function Wordy({ size = 120, mood = "happy", pose = "idle", glow = true, form = "bean" }: WordyProps) {
  const glowId = useId().replace(/:/g, "");
  if (form === "sprout") return <WordySprout size={size} mood={mood} pose={pose} glow={glow} />;
  if (form === "star") return <WordyStar size={size} mood={mood === "happy" ? "cheer" : mood} glow={glow} />;
  if (form === "rocket") return <WordyRocket size={size} mood={mood === "happy" ? "cheer" : mood} glow={glow} />;

  return (
    <svg role="img" aria-label={`Wordy ${form} ${pose} ${mood}`} viewBox="-70 -80 140 160" width={size} height={size * 1.14} className="overflow-visible">
      {glow ? <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18" /> : null}
      {glow ? (
        <>
          <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={W_ACCENT} stopOpacity="0.6" />
            <stop offset="100%" stopColor={W_ACCENT} stopOpacity="0" />
          </radialGradient>
          <circle cx="0" cy="0" r="70" fill={`url(#${glowId})`} opacity="0.5" />
        </>
      ) : null}
      <path d="M-2-50q2-12 10-15" stroke={W_BODY_DEEP} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="-65" r="5" fill={W_ACCENT} stroke={W_INK} strokeWidth="2" />
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY} />
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6" />
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25" />
      <BeanArms pose={pose} />
      <g transform="translate(0 -2)">
        <WordyFace mood={pose === "sleep" ? "sleepy" : mood} />
      </g>
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
    </svg>
  );
}

function WordySprout({ size, mood, pose, glow }: Required<Pick<WordyProps, "size" | "mood" | "pose" | "glow">>) {
  return (
    <svg role="img" aria-label={`Wordy sprout ${pose} ${mood}`} viewBox="-70 -90 140 170" width={size} height={size * 1.21} className="overflow-visible">
      {glow ? <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18" /> : null}
      <path d="M-2-45q-22-10-28-32q24 4 28 30" fill={W_MINT} stroke={W_INK} strokeWidth="2" />
      <path d="M2-45q22-10 28-32q-24 4-28 30" fill={W_MINT} stroke={W_INK} strokeWidth="2" />
      <path d="M0-50v-25" stroke={W_BODY_DEEP} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY} />
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6" />
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25" />
      <BeanArms pose={pose} />
      <g transform="translate(0 -2)"><WordyFace mood={mood} /></g>
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
    </svg>
  );
}

function WordyStar({ size, mood, glow }: Required<Pick<WordyProps, "size" | "mood" | "glow">>) {
  return (
    <svg role="img" aria-label={`Wordy star celebrate ${mood}`} viewBox="-80 -90 160 170" width={size} height={size * 1.06} className="overflow-visible">
      <g fill={W_ACCENT} stroke={W_INK} strokeWidth="1.5">
        <path d="M-60-50l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M60-55l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M0-78l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
      </g>
      {glow ? <ellipse cx="0" cy="55" rx="44" ry="8" fill={W_BODY} opacity="0.18" /> : null}
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY} />
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6" />
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25" />
      <path d="M-32-8q-18-20-22-40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="-54" cy="-48" r="8" fill={W_BODY_DEEP} />
      <path d="M32-8q18-20 22-40" stroke={W_BODY_DEEP} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="54" cy="-48" r="8" fill={W_BODY_DEEP} />
      <g transform="translate(0 -2)"><WordyFace mood={mood} /></g>
      <ellipse cx="-16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
      <ellipse cx="16" cy="48" rx="9" ry="5" fill={W_BODY_DEEP} />
    </svg>
  );
}

function WordyRocket({ size, mood, glow }: Required<Pick<WordyProps, "size" | "mood" | "glow">>) {
  return (
    <svg role="img" aria-label={`Wordy rocket celebrate ${mood}`} viewBox="-70 -90 140 200" width={size} height={size * 1.43} className="overflow-visible">
      {glow ? <ellipse cx="0" cy="85" rx="34" ry="10" fill={W_ACCENT} opacity=".18" /> : null}
      <path d="M-18 50q18 40 36 0q-8 30-18 30q-10 0-18-30z" fill={W_ACCENT} />
      <path d="M-10 60q10 28 20 0q-4 20-10 20q-6 0-10-20z" fill={W_PINK} />
      <ellipse cx="0" cy="5" rx="42" ry="44" fill={W_BODY} />
      <ellipse cx="0" cy="18" rx="28" ry="22" fill={W_BELLY} opacity="0.6" />
      <ellipse cx="-18" cy="-15" rx="10" ry="8" fill="#fff" opacity="0.25" />
      <path d="M-42 30l-12 16 8 4z" fill={W_BODY_DEEP} />
      <path d="M42 30l12 16-8 4z" fill={W_BODY_DEEP} />
      <ellipse cx="0" cy="-25" rx="38" ry="34" fill="#fff" opacity="0.25" stroke={W_INK} strokeWidth="2" />
      <g transform="translate(0 -2)"><WordyFace mood={mood} /></g>
    </svg>
  );
}

export function WordyMini({ size = 32, mood = "happy" }: { size?: number; mood?: WordyMood }) {
  return (
    <svg role="img" aria-label={`Wordy mini ${mood}`} viewBox="-40 -42 80 80" width={size} height={size}>
      <ellipse cx="0" cy="0" rx="32" ry="34" fill={W_BODY} />
      <ellipse cx="0" cy="10" rx="20" ry="16" fill={W_BELLY} opacity="0.6" />
      <ellipse cx="-13" cy="-12" rx="6" ry="5" fill="#fff" opacity="0.3" />
      <circle cx="-10" cy="-2" r="2.5" fill={W_INK} />
      <circle cx="10" cy="-2" r="2.5" fill={W_INK} />
      <path d="M-7 10q7 6 14 0" stroke={W_INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="-18" cy="6" r="3" fill={W_PINK} opacity="0.5" />
      <circle cx="18" cy="6" r="3" fill={W_PINK} opacity="0.5" />
    </svg>
  );
}
