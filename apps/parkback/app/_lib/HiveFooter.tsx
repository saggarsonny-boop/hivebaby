// Standard Hive footer used on every screen of every engine.
// Pattern matches hive-aestheticbestie's tagline + the canonical hive.baby
// link set (about / contribute / patrons / privacy / homepage).
//
// The "Made with ♥ in the Hive" signature uses the simplified Hive mark
// (apps/parkback/public/hive/hive-mark.svg, copied from
// packages/hive-onboarding/assets/). The canonical source is the package;
// engine repos hold a synced copy until packages/ is built into a real
// npm package and consumed via import.

const GOLD = "#D4AF37";
const GOLD_HI = "#FFE6A1";
const GOLD_DARK = "#a07f15";
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

// Simplified Hive mark, inline SVG (same gradient + drop shadow as the
// primary HexButton). Inlined rather than <img src> so the rim catchlight
// renders with the canonical theme without an extra HTTP request.
function HiveMark({ size = 20 }: { size?: number }) {
  const h = Math.round(size * 0.866);
  return (
    <svg
      viewBox="0 0 100 86.6"
      width={size}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Hive"
      style={{
        display: "inline-block",
        flex: "0 0 auto",
        verticalAlign: "middle",
        marginRight: 6,
      }}
    >
      <defs>
        <linearGradient id="hive-footer-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="50%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      <polygon
        points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
        fill="url(#hive-footer-rim)"
        stroke={GOLD_DIM}
        strokeWidth="0.8"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function HiveFooter() {
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

      <div style={signatureStyle}>
        <HiveMark size={20} />
        <span>
          Made with{" "}
          <span aria-label="love" style={heartStyle}>♥</span> in the{" "}
          <a
            href="https://hive.baby"
            target="_blank"
            rel="noopener noreferrer"
            style={hiveWordStyle}
          >
            Hive
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
  padding: "0 16px",
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

const signatureStyle: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 10,
  borderTop: `1px dotted ${GOLD_DIM}`,
  width: "min(280px, 80%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  color: MUTED,
  fontSize: 12,
  letterSpacing: "0.03em",
};

const heartStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 700,
  margin: "0 1px",
};

const hiveWordStyle: React.CSSProperties = {
  color: GOLD,
  textDecoration: "none",
  borderBottom: `1px dotted ${GOLD_DIM}`,
  paddingBottom: 1,
};
