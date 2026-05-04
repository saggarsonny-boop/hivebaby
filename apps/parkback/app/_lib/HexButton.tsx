"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useState } from "react";

const GOLD = "#D4AF37";
const GOLD_DARK = "#a07f15";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";

// Regular flat-top hexagon. Side length s, width = 2s, height = s·√3.
// Using viewBox 0..100 wide and 0..86.6 tall. This polygon is geometrically
// regular as long as the rendered aspect ratio matches 100:86.6.
const HEX_POINTS = "25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3";
// Hex aspect ratio (height / width) for a regular flat-top hexagon.
const HEX_RATIO = 86.6 / 100;

type Size = "lg" | "md";
type Variant = "primary" | "ghost";

const SIZES: Record<Size, { width: number; fontSize: number; weight: number; padX: number }> = {
  lg: { width: 220, fontSize: 26, weight: 700, padX: 24 },
  md: { width: 110, fontSize: 14, weight: 600, padX: 8 },
};

type Props = {
  variant: Variant;
  size: Size;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  busy?: boolean;
  ariaLabel: string;
  children: ReactNode;
};

export function HexButton({ variant, size, onClick, disabled, busy, ariaLabel, children }: Props) {
  const dims = SIZES[size];
  const w = dims.width;
  const h = Math.round(w * HEX_RATIO);
  const isPrimary = variant === "primary";
  const inactive = disabled || busy;
  const [pressed, setPressed] = useState(false);

  // Unique gradient id per size+variant so SVGs don't collide when multiple
  // are on the page.
  const gradientId = `hex-grad-${size}-${variant}`;
  const glowId = `hex-glow-${size}-${variant}`;

  const buttonStyle: CSSProperties = {
    position: "relative",
    width: w,
    height: h,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: busy ? "wait" : disabled ? "not-allowed" : "pointer",
    WebkitTapHighlightColor: "transparent",
    opacity: disabled && !busy ? 0.5 : 1,
    transform: pressed && !inactive ? "scale(0.96)" : "scale(1)",
    transition: "transform 100ms ease, filter 200ms ease",
    filter: isPrimary && !inactive ? "drop-shadow(0 0 18px rgba(212, 175, 55, 0.35))" : "none",
  };

  const labelStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    color: isPrimary ? INK : PAPER,
    fontSize: dims.fontSize,
    fontWeight: dims.weight,
    letterSpacing: "0.03em",
    textAlign: "center",
    padding: `0 ${dims.padX}px`,
    boxSizing: "border-box",
    pointerEvents: "none",
    lineHeight: 1.1,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      aria-label={ariaLabel}
      style={buttonStyle}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
    >
      <svg
        viewBox="0 0 100 86.6"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={gradientId} cx="32%" cy="30%" r="85%">
            <stop offset="0%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </radialGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.10)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0.0)" />
          </radialGradient>
        </defs>
        <polygon
          points={HEX_POINTS}
          fill={
            isPrimary
              ? busy
                ? "transparent"
                : `url(#${gradientId})`
              : `url(#${glowId})`
          }
          stroke={isPrimary ? GOLD_DIM : GOLD}
          strokeWidth={isPrimary ? 1 : 1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span style={labelStyle}>{children}</span>
    </button>
  );
}
