"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useState } from "react";

// Canonical Hive gold + supporting palette. Matches the planet UI's gold-cell
// rendering (Three.js MeshStandardMaterial w/ metalness 0.6-0.88, roughness
// 0.12-0.35, emissive glow). In 2D we approximate the same depth via:
//   • top-down linear gradient on the outer rim (highlight on top, shadow at
//     the bottom)
//   • radial inner-shine on the inner face (specular catch from upper-left)
//   • drop-shadow filter for ambient lift
//   • a translucent white catchlight tracing the upper three edges
const GOLD_HI = "#FFE6A1";       // top-edge highlight
const GOLD = "#D4AF37";          // canonical Hive gold
const GOLD_DARK = "#a07f15";     // shaded gold
const GOLD_DEEP = "#5e4a0d";     // deep shadow on bottom edges
const GOLD_DIM = "#8a6f1f";      // mid gold-dim used elsewhere
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";

// Regular flat-top hex in a 100×86.6 viewBox, side length 50 each side.
const HEX_OUTER = "25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3";
// Inner hex inset ~7% toward centre (50, 43.3): scale factor 0.86, gives a
// chamfered rim of equal width on every side.
const HEX_INNER = "28.50,6.06 71.50,6.06 96.50,43.30 71.50,80.54 28.50,80.54 3.50,43.30";
// Upper-edge catchlight path: traces the inner top-left → top → top-right
// edges, leaves the lower three open. Conveys "polished metal lit from
// overhead". Same vertices as inner hex.
const HEX_TOP_LIT = "M 3.50,43.30 L 28.50,6.06 L 71.50,6.06 L 96.50,43.30";
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

let _gradId = 0;
const nextId = () => `hex-${++_gradId}`;

export function HexButton({ variant, size, onClick, disabled, busy, ariaLabel, children }: Props) {
  const dims = SIZES[size];
  const w = dims.width;
  const h = Math.round(w * HEX_RATIO);
  const isPrimary = variant === "primary";
  const inactive = disabled || busy;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Per-instance gradient ids so multiple HexButtons on the same page never
  // collide.
  const [ids] = useState(() => ({
    rim: nextId(),
    face: nextId(),
    catch_: nextId(),
    shadow: nextId(),
  }));

  // Press → smaller scale, lifted-down look (drop shadow shrinks)
  const liftPx = inactive ? 0 : pressed ? 1 : isPrimary ? 6 : 3;
  const liftAlpha = inactive ? 0 : pressed ? 0.25 : isPrimary ? 0.55 : 0.35;

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
    transform: pressed && !inactive ? "translateY(2px) scale(0.98)" : "translateY(0)",
    transition: "transform 90ms cubic-bezier(0.4, 0, 0.2, 1), filter 200ms ease",
    filter: `drop-shadow(0 ${liftPx}px ${liftPx * 1.6}px rgba(0,0,0,${liftAlpha}))${
      isPrimary && !inactive
        ? ` drop-shadow(0 0 ${pressed ? 12 : 22}px rgba(212, 175, 55, ${pressed ? 0.25 : 0.45}))`
        : ""
    }`,
    outline: "none",
  };

  const labelStyle: CSSProperties = {
    position: "relative",
    zIndex: 2,
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
    // Subtle text shadow on primary buttons gives the label a slight emboss
    // against the bright gold face — matches the depth elsewhere.
    textShadow: isPrimary ? "0 1px 0 rgba(255, 240, 200, 0.4)" : "0 1px 0 rgba(0,0,0,0.6)",
  };

  // Hover brightening (mirrors planet cell hover that boosts emissiveIntensity)
  const hoverBoost = hovered && !inactive ? 1 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      aria-label={ariaLabel}
      style={buttonStyle}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerCancel={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <svg
        viewBox="0 0 100 86.6"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          {/* Outer rim — top-down linear gradient: bright gold at top edges,
              deeper bronze at the bottom. This is the bevel highlight. */}
          <linearGradient id={ids.rim} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD_HI} />
            <stop offset="40%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>

          {/* Inner face — radial gradient with the bright spot upper-left, as
              if a single light source above is hitting the polished gold.
              Primary uses the gold radial; ghost uses a soft inner glow on
              top of the dark backdrop. */}
          {isPrimary ? (
            <radialGradient id={ids.face} cx="32%" cy="28%" r="85%">
              <stop offset="0%" stopColor="#FFD96E" />
              <stop offset="55%" stopColor={GOLD} />
              <stop offset="100%" stopColor={GOLD_DARK} />
            </radialGradient>
          ) : (
            <radialGradient id={ids.face} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(212, 175, 55, 0.14)" />
              <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
            </radialGradient>
          )}

          {/* Catchlight gradient — fades out left and right, keeps the
              brightest stroke at the very top vertex. */}
          <linearGradient id={ids.catch_} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Outer rim hex — fills the entire button area with the linear-gradient.
            Visible only as a thin ring outside the inner hex. */}
        <polygon
          points={HEX_OUTER}
          fill={`url(#${ids.rim})`}
          stroke={GOLD_DIM}
          strokeWidth="0.6"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Inner face hex — sits inside the rim, gives the cell its colour
            depth and a specular catch in the upper-left. */}
        <polygon
          points={HEX_INNER}
          fill={`url(#${ids.face})`}
          stroke={isPrimary ? "rgba(0,0,0,0.18)" : "rgba(212, 175, 55, 0.4)"}
          strokeWidth="0.4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover/focus brightening overlay — semi-transparent gold lifted on
            interaction. Mirrors the planet's hoverL boost. */}
        {hoverBoost ? (
          <polygon
            points={HEX_INNER}
            fill="rgba(255, 224, 102, 0.18)"
            stroke="none"
          />
        ) : null}

        {/* Upper-edge catchlight — traces the three top edges of the inner
            hex with a translucent white stroke. This single touch sells the
            polished-metal feel more than anything else. */}
        <path
          d={HEX_TOP_LIT}
          fill="none"
          stroke={`url(#${ids.catch_})`}
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span style={labelStyle}>{children}</span>
    </button>
  );
}
