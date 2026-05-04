// Canonical Hive header — full Hive logo at the top of every screen of every
// engine, linking back to hive.baby. Sits above the engine's own brand block,
// so the visual hierarchy reads: Hive ecosystem → this engine → its content.
//
// Asset is served from /hive-logo-full.png (and .webp) at the engine's
// public/ root. The asset itself is owned by packages/hive-onboarding/assets/
// and copied into each engine's public/ directory at build time — see that
// package's README for the canonical reuse pattern.
//
// Sizing: 32px tall on mobile, 40px tall on desktop. Implemented with a
// scoped <style> tag rather than CSS-in-JS so the size kicks in on the
// server-rendered first paint, no client-side layout shift.

const wrapStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // The header is the topmost element in the body, so it owns the iOS
  // safe-area-top inset. Routes below it use a small fixed top padding
  // for breathing room (no second safe-area allowance, which would
  // otherwise stack and create ~100px of empty space on notched iPhones).
  paddingTop: "max(env(safe-area-inset-top), 8px)",
  paddingBottom: 8,
};

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: 0,
  margin: 0,
  lineHeight: 0,
};

const HEADER_STYLE = `
.hive-header-logo { height: 32px; width: auto; display: block; }
@media (min-width: 768px) { .hive-header-logo { height: 40px; } }
`;

export function HiveHeader() {
  return (
    <div style={wrapStyle}>
      <style dangerouslySetInnerHTML={{ __html: HEADER_STYLE }} />
      <a
        href="https://hive.baby"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hive ecosystem"
        style={linkStyle}
      >
        <picture>
          <source srcSet="/hive-logo-full.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hive-logo-full.png"
            alt="Hive ecosystem"
            className="hive-header-logo"
          />
        </picture>
      </a>
    </div>
  );
}
