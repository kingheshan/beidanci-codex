"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { BrainIcon, CheckIcon, FlameIcon, GemIcon, HeartIcon, XIcon } from "./icons";
import { clamp01 } from "@/lib/theme";

type Size = "xs" | "sm" | "md" | "lg";
type ChoiceState = "idle" | "hover" | "correct" | "wrong" | "disabled";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type CTAProps = Omit<HTMLMotionProps<"button">, "children" | "color"> & {
  children: ReactNode;
  color?: string;
  textColor?: string;
  size?: Exclude<Size, "xs">;
  icon?: ReactNode;
  full?: boolean;
};

export function CTA({
  children,
  color = "var(--c-primary)",
  textColor = "#fff",
  size = "md",
  icon,
  full = true,
  className,
  style,
  disabled,
  ...props
}: CTAProps) {
  const sizes = {
    sm: "h-10 text-sm",
    md: "h-[52px] text-base",
    lg: "h-[60px] text-lg"
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { y: 2 }}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[14px] border-0 px-5 font-display font-bold uppercase shadow-[0_4px_0_rgba(0,0,0,.18)] transition disabled:cursor-not-allowed disabled:bg-[var(--c-ink-faint)] disabled:shadow-none",
        full && "w-full",
        sizes[size],
        className
      )}
      style={{ background: disabled ? undefined : color, color: textColor, letterSpacing: 0, ...style }}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}

export type CardProps = {
  children: ReactNode;
  pad?: number;
  radius?: number;
  soft?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Card({ children, pad = 16, radius = 22, soft = false, className, style }: CardProps) {
  return (
    <div
      className={cx("shadow-card", className)}
      style={{
        background: soft ? "var(--c-surface-soft)" : "var(--c-surface)",
        borderRadius: radius,
        padding: pad,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export type ProgressBarProps = {
  value?: number;
  height?: number;
  color?: string;
  bg?: string;
  shine?: boolean;
  label?: string;
};

export function ProgressBar({
  value = 0.5,
  height = 12,
  color = "var(--c-primary)",
  bg = "rgba(0,0,0,.06)",
  shine = true,
  label = "进度"
}: ProgressBarProps) {
  const pct = Math.round(clamp01(value) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="w-full overflow-hidden"
      style={{ height, background: bg, borderRadius: height }}
    >
      <div className="relative h-full transition-[width] duration-300 ease-[var(--ease)]" style={{ width: `${pct}%`, background: color, borderRadius: height }}>
        {shine && pct > 8 ? (
          <div
            className="absolute left-1.5 right-1.5 top-0.5 rounded-pill bg-white/50"
            style={{ height: Math.max(2, height * 0.25) }}
          />
        ) : null}
      </div>
    </div>
  );
}

export type ProgressRingProps = {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
};

export function ProgressRing({
  value = 0.7,
  size = 72,
  stroke = 8,
  color = "var(--c-primary)",
  track = "rgba(0,0,0,.07)",
  children,
  label = "掌握度"
}: ProgressRingProps) {
  const normalized = clamp01(value);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(normalized * 100)}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - normalized)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function StreakChip({ days = 7, size = "md" }: { days?: number; size?: Extract<Size, "sm" | "md"> }) {
  const small = size === "sm";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-pill bg-[#FFE9D9] font-displayEn font-extrabold text-[var(--c-streak)]", small ? "px-2.5 py-1 text-[13px]" : "px-3 py-1.5 text-[15px]")}>
      <FlameIcon size={small ? 14 : 17} />
      {days}
    </span>
  );
}

export function GemPill({ count = 280, size = "md" }: { count?: number; size?: Extract<Size, "sm" | "md"> }) {
  const small = size === "sm";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-pill bg-[rgba(108,92,231,.12)] font-displayEn font-extrabold text-[var(--c-primary-deep)]", small ? "px-2.5 py-1 text-[13px]" : "px-3 py-1.5 text-[15px]")}>
      <GemIcon size={small ? 14 : 17} />
      {count}
    </span>
  );
}

export function HeartPill({ count = 4 }: { count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-[rgba(255,90,111,.12)] px-3 py-1.5 font-displayEn text-[15px] font-extrabold text-[var(--c-danger)]">
      <HeartIcon size={16} />
      {count}
    </span>
  );
}

export type TagProps = {
  children: ReactNode;
  color?: string;
  bg?: string;
  size?: Extract<Size, "xs" | "sm">;
};

export function Tag({ children, color = "var(--c-primary)", bg = "var(--c-primary-soft)", size = "sm" }: TagProps) {
  const isXs = size === "xs";
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded-pill font-bold", isXs ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs")}
      style={{ color, background: bg, letterSpacing: 0 }}
    >
      {children}
    </span>
  );
}

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

function cssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({ width = "100%", height = 16, radius = 8, label = "正在加载", className, style }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cx("animate-pulse bg-[linear-gradient(90deg,rgba(0,0,0,.05),rgba(0,0,0,.1),rgba(0,0,0,.05))]", className)}
      style={{
        width: cssSize(width),
        height: cssSize(height),
        borderRadius: cssSize(radius),
        ...style
      }}
    />
  );
}

export type ChoiceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  en?: string;
  state?: ChoiceState;
  shortcut?: string | number;
};

export function ChoiceButton({ label, en, state = "idle", shortcut, className, disabled, ...props }: ChoiceButtonProps) {
  const styles: Record<ChoiceState, { bg: string; color: string; border: string; shadow: string }> = {
    idle: { bg: "var(--c-surface)", color: "var(--c-ink)", border: "var(--c-line)", shadow: "0 2px 0 var(--c-line)" },
    hover: { bg: "var(--c-primary-soft)", color: "var(--c-primary-ink)", border: "var(--c-primary)", shadow: "0 2px 0 var(--c-primary)" },
    correct: { bg: "#DCFCE7", color: "#0E4D24", border: "var(--c-success)", shadow: "0 2px 0 var(--c-success)" },
    wrong: { bg: "#FFE2E5", color: "#7A1620", border: "var(--c-danger)", shadow: "0 2px 0 var(--c-danger)" },
    disabled: { bg: "var(--c-surface)", color: "var(--c-ink-muted)", border: "var(--c-line)", shadow: "0 2px 0 var(--c-line)" }
  };
  const visual = disabled ? styles.disabled : styles[state];
  const accessibleName = [shortcut, en, label].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={accessibleName}
      className={cx("flex min-h-14 w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-2 px-3.5 py-3 text-left font-body disabled:cursor-not-allowed", className)}
      style={{ background: visual.bg, color: visual.color, borderColor: visual.border, boxShadow: visual.shadow }}
      {...props}
    >
      {shortcut ? (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-current text-xs font-bold opacity-60">
          {shortcut}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        {en ? <span className="block font-displayEn text-[11px] opacity-55">{en}</span> : null}
        <span className="block text-[15px] font-semibold">{label}</span>
      </span>
      {state === "correct" ? (
        <span aria-label="回答正确" className="grid h-5 w-5 place-items-center">
          <CheckIcon size={20} />
        </span>
      ) : null}
      {state === "wrong" ? (
        <span aria-label="回答错误" className="grid h-5 w-5 place-items-center">
          <XIcon size={20} />
        </span>
      ) : null}
    </button>
  );
}

export type LessonNodeProps = {
  state?: "done" | "current" | "locked" | "boss";
  icon?: ReactNode;
  label?: string;
  big?: boolean;
};

export function LessonNode({ state = "locked", icon, label, big = false }: LessonNodeProps) {
  const size = big ? 78 : 64;
  const styles = {
    done: { bg: "var(--c-success)", shadow: "0 4px 0 #0E8B5C" },
    current: { bg: "var(--c-primary)", shadow: "0 4px 0 var(--c-primary-deep)" },
    locked: { bg: "var(--c-ink-faint)", shadow: "0 4px 0 var(--c-ink-muted)" },
    boss: { bg: "var(--c-pink)", shadow: "0 4px 0 #B33D6F" }
  }[state];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative grid place-items-center rounded-full text-white" style={{ width: size, height: size, background: styles.bg, boxShadow: styles.shadow }}>
        {state === "current" ? <div className="absolute -inset-2 rounded-full border-[3px] border-dashed border-[var(--c-primary)] opacity-40" /> : null}
        {icon ?? <BrainIcon size={big ? 30 : 24} />}
      </div>
      {label ? <div className="max-w-28 text-center text-[10px] font-semibold text-[var(--c-ink-soft)]">{label}</div> : null}
    </div>
  );
}

export function Confetti({ count = 24 }: { count?: number }) {
  const colors = ["var(--c-accent)", "var(--c-pink)", "var(--c-mint)", "#fff"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="absolute top-[-20px] animate-confetti"
          style={{
            left: `${(index * 37) % 100}%`,
            width: 6 + (index % 3) * 2,
            height: 6 + (index % 3) * 2,
            background: colors[index % colors.length],
            borderRadius: index % 2 ? "50%" : 1,
            animationDuration: `${2 + (index % 3) * 0.5}s`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}
