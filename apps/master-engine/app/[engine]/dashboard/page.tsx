"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Dashboard({ params }: { params: { engine: string } }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const domainKey = params.engine ? params.engine.replace("ud-", "") : "System";
  const domainKeyUpper = domainKey.charAt(0).toUpperCase() + domainKey.slice(1);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulated Stripe gate check
    setTimeout(() => setIsSubscribed(false), 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isSubscribed) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Glow */}
          <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: 'var(--ud-green)', filter: 'blur(100px)', opacity: 0.1, zIndex: -1 }}></div>

          <div style={{ margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'center' }}>
            <Image src="/ud-logo-micro.png" alt="UD Logo" width={128} height={128} style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Authorization Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            The {domainKeyUpper} AI Analysis Engine is restricted to Enterprise subscribers. Activate your license to unlock sovereign inference and native UDS compilation.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--ud-green)' }}>$699 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
          </div>
          <button className="btn btn-solid" style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem' }} onClick={() => {
            alert("Routing to Stripe Checkout... (Simulated success)");
            setIsSubscribed(true);
          }}>
            Authorize Payment & Deploy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Image src="/ud-logo-micro.png" alt="UD Logo" width={64} height={64} />
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>{domainKeyUpper} Analysis HUD</h1>
            <div style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${isOnline ? 'var(--success)' : 'var(--danger)'}` }}></div>
              {isOnline ? "System Online & Synced" : "System Offline (Local Mode)"}
            </div>
          </div>
        </div>
      </div>

      <div 
        className="dropzone"
        style={{ borderColor: isDragging ? 'var(--ud-green)' : 'rgba(16, 185, 129, 0.3)', background: isDragging ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); alert("File received. Initiating parse sequence..."); }}
      >
        <div style={{ margin: '0 auto 1.5rem auto', opacity: 0.9, background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {params.engine === "ud-bulk" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ud-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ud-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          )}
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          {params.engine === "ud-bulk" ? "Mass Ingestion Gateway" : "Secure Ingestion Dropzone"}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          {params.engine === "ud-bulk" ? (
            <>
              Connect an <strong style={{ color: 'var(--ud-green)', fontWeight: 600 }}>S3 Bucket</strong> or drop massive <strong style={{ color: 'var(--ud-green)', fontWeight: 600 }}>.ZIP Archives</strong> here.<br/>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Supports up to 100,000 documents per batch payload.)</span>
            </>
          ) : (
            <>
              Drag and drop <strong style={{ color: 'var(--ud-green)', fontWeight: 600 }}>UDS files</strong> here for immediate, native ingestion.<br/>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Legacy formats like PDF and DOCX are supported via backwards-compatibility parsing layer.)</span>
            </>
          )}
        </p>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600 }}>Inference Output</h3>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>Awaiting document payload for tactical analysis...</p>
        
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
            <button className="btn btn-solid" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export to UDS (Universal Document Standard)
            </button>
            <button className="btn" style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              Download legacy PDF
            </button>
        </div>
      </div>
    </div>
  );
}
