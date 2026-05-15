export default function Home() {
  return (
    <>
      <section style={{ padding: "5rem 0 4rem 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.25rem", marginBottom: "1rem" }}>
          Universal Document<span style={{ color: "var(--ud-gold)" }}>™</span>
        </h1>
        <p
          className="muted"
          style={{
            fontSize: "1.2rem",
            maxWidth: "640px",
            margin: "0 auto 2rem auto",
            lineHeight: 1.5,
          }}
        >
          A document substrate for the post-PDF era — open, governed,
          machine-readable, and sealed when it needs to be. UD (Universal
          Document™) is the document layer of the Hive ecosystem.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a href="#tools" className="btn btn-solid">
            Browse the tools
          </a>
          <a
            href="https://hive.baby"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            About the Hive
          </a>
        </div>
      </section>

      <section id="what" style={{ padding: "3rem 0" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          What is Universal Document™?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="card">
            <h3 style={{ fontSize: "1.25rem" }}>UDR — revisable</h3>
            <p className="muted" style={{ margin: 0 }}>
              Universal Document™ Revisable. The working format. Open schema,
              machine-readable, version-controllable. Built to be edited,
              compared, and audited.
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "1.25rem" }}>UDS — sealed</h3>
            <p className="muted" style={{ margin: 0 }}>
              Universal Document™ Sealed. The final form. Cryptographically
              signed, tamper-evident, ready to be the canonical record. UDR
              becomes UDS when the document is done changing.
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "1.25rem" }}>Open by default</h3>
            <p className="muted" style={{ margin: 0 }}>
              No vendor lock-in. The schema is public. The tools below are
              free at the base tier, forever. Pro features cost{" "}
              <code>$29/mo</code>; Plus is <code>$0.97/mo</code>. No ads, no
              investors.
            </p>
          </div>
        </div>
      </section>

      <section id="tools" style={{ padding: "3rem 0" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Tools in the UD ecosystem
        </h2>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          The UD ecosystem currently scaffolds 128 document tools across format
          handling, security, analysis, and domain-specific processing. Most
          are still in build; the canonical inventory is in{" "}
          <a
            href="https://github.com/saggarsonny-boop/hivebaby/blob/main/registry/engines.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            registry/engines.md
          </a>
          . Anchors for the first wave:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <ToolCard
            name="UDConverter"
            note="Convert between document formats"
            slug="ud-converter"
          />
          <ToolCard
            name="UDReader"
            note="View UDR/UDS documents"
            slug="ud-reader"
          />
          <ToolCard
            name="UDValidator"
            note="Schema-check UDR/UDS files"
            slug="ud-validator"
          />
          <ToolCard
            name="UDSigner"
            note="Produce sealed UDS documents"
            slug="ud-signer"
          />
          <ToolCard
            name="UDCreator"
            note="Author UDR documents from scratch"
            slug="ud-creator"
          />
          <ToolCard
            name="UDUtilities"
            note="Misc tools for UD workflows"
            slug="ud-utilities"
          />
          <ToolCard
            name="UDMedical"
            note="Clinical document analysis"
            slug="ud-medical"
          />
          <ToolCard
            name="UDBulk"
            note="Enterprise dropzone for mass ingestion"
            slug="ud-bulk"
          />
        </div>
      </section>

      <section id="pricing" style={{ padding: "3rem 0" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Pricing</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="card">
            <h3>Free</h3>
            <p className="muted" style={{ margin: 0 }}>
              The base tier of every UD tool, forever. Limits depend on each
              tool's marginal cost — see the tool itself for its rules.
            </p>
          </div>
          <div className="card">
            <h3>
              Plus — <code>$0.97/mo</code>
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              Unlimited use across the canonical free-tier rules. One
              subscription covers the whole Hive, not just UD.
            </p>
          </div>
          <div className="card">
            <h3>
              Pro — <code>$29/mo</code>
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              Power features: bulk processing, API access where applicable, and
              the rest of the Hive's Pro surface.
            </p>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Patronage is voluntary. Safety-critical tools are never Pro-gated.
        </p>
      </section>
    </>
  );
}

function ToolCard({
  name,
  note,
  slug,
}: {
  name: string;
  note: string;
  slug: string;
}) {
  const sub = slug.replace("ud-", "");
  return (
    <a
      href={`https://${sub}.universaldocument.hive.baby`}
      style={{
        display: "block",
        padding: "1.25rem",
        borderRadius: "8px",
        border: "1px solid var(--ud-border)",
        background: "var(--ud-paper)",
        color: "var(--ud-ink)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{name}</div>
      <div className="muted" style={{ fontSize: "0.875rem" }}>
        {note}
      </div>
    </a>
  );
}
