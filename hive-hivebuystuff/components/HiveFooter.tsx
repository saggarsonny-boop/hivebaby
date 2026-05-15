const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const MUTED = "#9a9588";

const dot = <span style={{ color: GOLD_DIM, margin: "0 6px" }}>·</span>;
const lnk = (href: string, label: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: MUTED, textDecoration: "none", borderBottom: `1px dotted ${MUTED}`, paddingBottom: 1 }}
  >
    {label}
  </a>
);

const HiveMark = () => (
  <svg viewBox="0 0 100 86.6" width={20} height={18} role="img" aria-label="Hive" style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}>
    <defs>
      <linearGradient id="hbs-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE6A1" />
        <stop offset="40%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#5e4a0d" />
      </linearGradient>
      <radialGradient id="hbs-face" cx="32%" cy="28%" r="85%">
        <stop offset="0%" stopColor="#FFD96E" />
        <stop offset="55%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#a07f15" />
      </radialGradient>
    </defs>
    <polygon points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" fill="url(#hbs-rim)" stroke="#8a6f1f" strokeWidth="0.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    <polygon points="28.50,6.06 71.50,6.06 96.50,43.30 71.50,80.54 28.50,80.54 3.50,43.30" fill="url(#hbs-face)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>
);

export function HiveFooter() {
  return (
    <footer style={{ marginTop: 48, color: MUTED, fontSize: 11, letterSpacing: "0.05em", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, lineHeight: 1.6, padding: "0 16px 80px", textAlign: "center" }}>
      <div>No ads. No investors. No agenda.</div>
      <div>Free at the base tier, forever.</div>
      <nav style={{ marginTop: 12, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", fontSize: 11 }} aria-label="Hive links">
        {lnk("https://hive.baby", "hive.baby")}
        {dot}
        {lnk("https://hive.baby/about.html", "social experiment")}
        {dot}
        {lnk("https://hive.baby/contribute.html", "contribute")}
        {dot}
        {lnk("https://hive.baby/patrons.html", "patronage")}
        {dot}
        {lnk("https://hive.baby/privacy.html", "privacy")}
      </nav>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
        <HiveMark />
        <span style={{ fontSize: 12, letterSpacing: "0.03em", color: MUTED }}>
          Made with <span style={{ color: GOLD }} aria-hidden="true">♥</span> in the{" "}
          <a href="https://hive.baby" target="_blank" rel="noopener noreferrer" style={{ color: MUTED, textDecoration: "none", borderBottom: `1px dotted ${MUTED}` }}>
            Hive
          </a>
        </span>
      </div>
    </footer>
  );
}
