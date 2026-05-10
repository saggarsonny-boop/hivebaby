// @ts-nocheck
// Canonical Hive footer signature: "Made with   in the Hive" with the  
// in Hive gold (#D4AF37). The word "Hive" links to https://hive.baby in a
// new tab. Sits below the engine-local disclaimers in app/layout.tsx.

export default function HiveFooter() {
  return (
    <div className="hive-footer-signature" aria-label="Hive ecosystem">
      <p>
        Made with{" "}
        <span style={{ color: "#D4AF37" }} aria-hidden="true">
          {"\u2665"}
        </span>{" "}
        in the{" "}
        <a
          href="https://hive.baby"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Hive
        </a>
      </p>
      <p className="hive-footer-link-row">
        <a
          href="https://hive.baby"
          target="_blank"
          rel="noopener noreferrer"
        >
          hive.baby
        </a>
        {" \u00B7 "}
        social experiment
        {" \u00B7 "}
        <a
          href="https://hive.baby/contribute.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          contribute
        </a>
        {" \u00B7 "}
        <a
          href="https://hive.baby/patrons.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          patronage
        </a>
        {" \u00B7 "}
        <a
          href="https://hive.baby/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy
        </a>
        {" \u00B7 "}
        <a href="https://converter.hive.baby" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#D4AF37", opacity: 0.85, textDecoration: "none", verticalAlign: "middle" }}>
          <img src="/ud-logo-micro.png" width="14" height="14" alt="UD" style={{ borderRadius: "3px" }} />
          Try UD Converter {"\u2014"} Free {"\u2192"}
        </a>
      </p>
    </div>
  );
}
