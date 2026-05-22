import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  fillColor?: string;
};

function baseProps({ size = 22, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    "aria-hidden": props["aria-label"] ? undefined : true,
    focusable: false,
    ...props
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4V4z" />
      <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8V4z" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M12 2c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-2-4 0 1-1 2-2 2 1-2 0-5-1-8z" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z" />
    </svg>
  );
}

export function GemIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M6 2h12l4 6-10 14L2 8z" opacity="0.9" />
      <path d="M6 2l4 6h4l4-6M2 8h20M10 8l2 14 2-14" stroke="rgba(0,0,0,.18)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
      <path d="M4 4h2v4a2 2 0 0 1-2-2zM18 4h2v2a2 2 0 0 1-2 2zM9 14h6l-1 4h-4z" />
      <rect x="7" y="18" width="10" height="2.5" rx="1" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...baseProps(props)}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M12 2l1.8 5.8L20 9.5l-5.6 2.1L12 18l-2.4-6.4L4 9.5l6.2-1.7z" />
      <circle cx="19" cy="4" r="1.5" />
      <circle cx="5" cy="19" r="1.2" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  const { fillColor = "currentColor", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill={fillColor} {...baseProps(rest)}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

export function BrainIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...baseProps(props)}>
      <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-3 3v2a3 3 0 0 0 3 3 3 3 0 0 0 3 3V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 3 3v2a3 3 0 0 1-3 3 3 3 0 0 1-3 3V4z" />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...baseProps(props)}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 8c1.5 1.5 1.5 6.5 0 8M19 5c3 3 3 11 0 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
