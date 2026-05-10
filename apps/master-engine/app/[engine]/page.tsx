"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Home({ params }: { params: { engine: string } }) {
  const router = useRouter();

  // ud-maritime -> Maritime
  const domainKey = params.engine ? params.engine.replace("ud-", "") : "System";
  const domainKeyUpper = domainKey.charAt(0).toUpperCase() + domainKey.slice(1);

  // Temporarily bypass auth redirect for UI testing
  useEffect(() => {
    // if (isLoaded && isSignedIn) router.push(`/${params.engine}/dashboard`);
  }, [router, params.engine]);

  let heroSubtitle = "A Sovereign-Lite tactical engine specifically engineered to parse domain-specific UDS files, extract logic flaws, and flag immediate liabilities in seconds. Legacy PDF processing supported.";
  let cap1Title = "Native UDS Inference";
  let cap1Desc = "Built natively for the Universal Document Standard. Legacy formats like PDF or DOCX are seamlessly converted via the backwards-compatibility layer.";
  let cap2Title = "Zero-Retention Security";
  let cap2Desc = "Every document is parsed in-memory and destroyed immediately. No retention. No indexing. Total privilege protection.";

  if (params.engine === "ud-audit") {
    heroSubtitle = "The Cryptographic Chain of Custody Engine. Instantly cryptographically seal and verify documents to prove absolute provenance for SOC2, HIPAA, and legal compliance. Uncover any tampering down to the pixel.";
    cap1Title = "Immutable Provenance Ledger";
    cap1Desc = "Generates a mathematically verifiable cryptographic seal for every document, proving zero tampering since the exact millisecond of ingestion.";
    cap2Title = "Compliance-Ready Reporting";
    cap2Desc = "Automatically structures audit trails for rapid SOC2, ISO, and SEC compliance parsing.";
  } else if (params.engine === "ud-bulk") {
    heroSubtitle = "The Enterprise Mass Ingestion Data Lake. Connect an S3 bucket or upload massive archives of legacy PDFs to automatically index millions of files into a highly-scalable, searchable UDS vector database.";
    cap1Title = "Asynchronous Batch Pipelines";
    cap1Desc = "Process 10,000+ documents concurrently in the background using cost-optimized AI batch layers, discounting compute costs by over 50%.";
    cap2Title = "Enterprise UDS Vector Lake";
    cap2Desc = "Transforms static, unstructured enterprise archives into a globally searchable Universal Document Data Lake in hours, not months.";
  }

  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', position: 'relative' }}>
      
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--ud-green)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 }}></div>

      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <div style={{ margin: '0 auto 3rem auto', display: 'flex', justifyContent: 'center' }}>
          <Image src="/ud-logo-micro.png" alt="Universal Document Logo" width={128} height={128} priority />
        </div>
        <h1 className="hero-title">
          Universal Document <br/>
          <span style={{ color: 'var(--ud-green)', WebkitTextFillColor: 'initial' }}>{domainKeyUpper} Engine</span>
        </h1>
        <p className="hero-subtitle">
          {heroSubtitle}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-up" className="btn btn-solid" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Initialize Engine
          </a>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.2 }}>
            <Image src="/ud-logo-micro.png" alt="UD Watermark" width={100} height={100} style={{ filter: 'grayscale(100%)' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--ud-green)', textAlign: 'center', fontWeight: 600 }}>Enterprise Capabilities</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', position: 'relative', zIndex: 2 }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 600 }}>{cap1Title}</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>{cap1Desc}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 600 }}>{cap2Title}</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>{cap2Desc}</p>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>$699 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Uncapped inference. Cancel anytime.</div>
        </div>
      </div>
    </div>
  );
}
