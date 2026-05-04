// Standard Hive footer used on every screen of every engine.
// Pattern matches hive-aestheticbestie's tagline + the canonical hive.baby
// link set (about / contribute / patrons / privacy / homepage).

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
