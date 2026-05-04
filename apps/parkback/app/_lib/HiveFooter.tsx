// Standard Hive footer used on every screen of every engine.
// Pattern matches hive-aestheticbestie's tagline + the canonical hive.baby
// link set (about / contribute / patrons / privacy / homepage).
//
// Below the canonical link set sits the Hive signature row: the simplified
// Hive mark inline-svg + "Made with ♥ in the Hive" text. This is the
// HIVE_FOOTER_SIGNATURE rule from docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md
// (HIVE INTEGRATION). Strings are sourced from app/_lib/strings.ts so the
// i18n catch-up step can extend per-locale without touching this file.

import { strings } from "./strings";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const MUTED = "#9a9588";

const linkBase: React.CSSProperties = {
  color: MUTED,
  textDecoration: "none",
  borderBottom: `1px dotted ${MUTED}`,
  paddingBottom: 1,
};

const dotStyle: React.CSSProperties = {
  color: GOLD_DIM,
  margin: "0 6px",
};

// ─── Hive signature row — canonical "Made with ♥ in the Hive" ───────────────
// Smaller font than the canonical link row above it. Centered, muted, with
// vertical breathing room separating it from the four standard links. The
// "Hive" word is the only link; ♥ is rendered in canonical Hive gold.

const sigLinkStyle: React.CSSProperties = {
  color: MUTED,
  textDecoration: "none",
  borderBottom: `1px dotted ${MUTED}`,
};

const sigHeartStyle: React.CSSProperties = {
  color: GOLD,
  margin: "0 2px",
};

const HiveMark = ({ size = 20 }: { size?: number }) => (
  <svg
    viewBox="0 0 100 86.6"
    width={size}
    height={Math.round(size * 86.6 / 100)}
    role="img"
    aria-label="Hive"
    style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}
  >
    <defs>
      <linearGradient id="hf-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE6A1" />
        <stop offset="40%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#5e4a0d" />
      </linearGradient>
      <radialGradient id="hf-face" cx="32%" cy="28%" r="85%">
        <stop offset="0%" stopColor="#FFD96E" />
        <stop offset="55%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#a07f15" />
      </radialGradient>
      <linearGradient id="hf-catch" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
        <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <polygon
      points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
      fill="url(#hf-rim)" stroke="#8a6f1f" strokeWidth="0.6"
      strokeLinejoin="round" vectorEffect="non-scaling-stroke"
    />
    <polygon
      points="28.50,6.06 71.50,6.06 96.50,43.30 71.50,80.54 28.50,80.54 3.50,43.30"
      fill="url(#hf-face)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4"
      strokeLinejoin="round" vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 3.50,43.30 L 28.50,6.06 L 71.50,6.06 L 96.50,43.30"
      fill="none" stroke="url(#hf-catch)" strokeWidth="1"
      strokeLinejoin="round" strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export function HiveFooter() {
  const sig = strings.footer.signature;
  return (
    <footer style={footerStyle}>
      <div>No ads. No investors. No agenda.</div>
      <div>Free at the base tier, forever.</div>
      <nav style={linkRowStyle} aria-label="Hive links">
        <a href="https://hive.baby" target="_blank" rel="noopener noreferrer" style={linkBase}>
          hive.baby
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/about.html" target="_blank" rel="noopener noreferrer" style={linkBase}>
          social experiment
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/contribute.html" target="_blank" rel="noopener noreferrer" style={linkBase}>
          contribute
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/patrons.html" target="_blank" rel="noopener noreferrer" style={linkBase}>
          patronage
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/privacy.html" target="_blank" rel="noopener noreferrer" style={linkBase}>
          privacy
        </a>
      </nav>

      <div style={signatureRowStyle} aria-label="Made with love in the Hive">
        <HiveMark size={20} />
        <span style={signatureTextStyle}>
          {sig.madeWith}{" "}
          <span style={sigHeartStyle} aria-hidden="true">♥</span>{" "}
          {sig.inThe}{" "}
          <a
            href="https://hive.baby"
            target="_blank"
            rel="noopener noreferrer"
            style={sigLinkStyle}
          >
            {sig.brand}
          </a>
        </span>
      </div>
    </footer>
  );
}

const footerStyle: React.CSSProperties = {
  marginTop: 18,
  color: MUTED,
  fontSize: 11,
  letterSpacing: "0.05em",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  lineHeight: 1.6,
  // Bottom padding clears iOS Safari's bottom URL bar overlay (~70–90px),
  // so the signature row is fully visible when the user scrolls to the
  // bottom of the page. Without this, the signature renders at the bottom
  // of the document but is physically covered by the floating URL bar on
  // iPhone Safari (default since iOS 15) — caught when Sonny verified PR
  // #74 on his iPhone. The main element's existing
  // max(env(safe-area-inset-bottom), 24px) bottom padding handles the
  // home indicator separately; this is the additional clearance the URL
  // bar overlay needs.
  padding: "0 16px 80px",
  textAlign: "center",
};

const linkRowStyle: React.CSSProperties = {
  marginTop: 6,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: 0,
  fontSize: 11,
};

const signatureRowStyle: React.CSSProperties = {
  // Vertical breathing room separating the signature from the four canonical
  // links above it. The signature is intentionally a level smaller than the
  // links — present, never shouting.
  marginTop: 18,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const signatureTextStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.03em",
  color: MUTED,
  lineHeight: 1.4,
};
