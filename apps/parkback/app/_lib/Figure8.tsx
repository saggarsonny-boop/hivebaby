"use client";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";

// SVG figure-8 hint shown while the compass is calibrating. A small dot
// travels along the path on a 2.4s loop.
export function Figure8() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <path
        id="figure8-path"
        d="M 50 50 C 30 30, 10 30, 10 50 S 30 70, 50 50 S 70 30, 90 50 S 70 70, 50 50"
        fill="none"
        stroke={GOLD_DIM}
        strokeWidth="2"
        strokeDasharray="4 5"
        opacity="0.6"
      />
      <circle r="4" fill={GOLD}>
        <animateMotion
          dur="2.4s"
          repeatCount="indefinite"
          rotate="auto"
          path="M 50 50 C 30 30, 10 30, 10 50 S 30 70, 50 50 S 70 30, 90 50 S 70 70, 50 50"
        />
      </circle>
    </svg>
  );
}
