const HEADER_STYLE = `
.hive-header-logo { height: 32px; width: auto; display: block; }
@media (min-width: 768px) { .hive-header-logo { height: 40px; } }
`;

export function HiveHeader() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "max(env(safe-area-inset-top), 8px)",
        paddingBottom: 8,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: HEADER_STYLE }} />
      <a
        href="https://hive.baby"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hive ecosystem"
        style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", lineHeight: 0 }}
      >
        <picture>
          <source srcSet="/hive-logo-full.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hive-logo-full.png" alt="Hive ecosystem" className="hive-header-logo" />
        </picture>
      </a>
    </div>
  );
}
