"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

  useEffect(() => {
    // if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [router]);

  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', position: 'relative' }}>
      
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--hive-gold)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 }}></div>

      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 className="hero-title">
          Universal Document <br/>
          <span style={{ color: 'var(--hive-gold)', WebkitTextFillColor: 'initial' }}>Audit Analysis</span>
        </h1>
        <p className="hero-subtitle">
          A Sovereign-Lite tactical engine specifically engineered to parse 500-page M&A contracts, extract logic flaws, and flag immediate legal liabilities in seconds.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-up" className="btn btn-solid" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Initialize Engine
          </a>
        </div>
      </div>

      <div className="glass-card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--hive-gold)', textAlign: 'center', fontWeight: 600 }}>Enterprise Capabilities</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 600 }}>Real-Time Inference</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Upload complex MSAs, NDAs, or litigation files. Our engine maps clauses against a sovereign legal index to flag contradictions instantly.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 600 }}>Zero-Retention Security</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Every document is parsed in-memory and destroyed immediately. No retention. No indexing. Total attorney-client privilege protection.</p>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>$1,500 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Uncapped inference. Cancel anytime.</div>
        </div>
      </div>
    </div>
  );
}

