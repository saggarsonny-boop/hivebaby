"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

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
        <div className="glass-card">
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hive-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Authorization Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            The Legal AI Analysis Engine is restricted to Enterprise subscribers. Activate your license to unlock sovereign legal inference.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--hive-gold)' }}>$1,500 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
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
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Legal Analysis HUD</h1>
          <div style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--danger)', boxShadow: \`0 0 10px \${isOnline ? 'var(--success)' : 'var(--danger)'}\` }}></div>
            {isOnline ? "System Online & Synced" : "System Offline (Local Mode)"}
          </div>
        </div>
      </div>

      <div 
        className="dropzone"
        style={{ borderColor: isDragging ? 'var(--hive-gold)' : 'rgba(212, 175, 55, 0.3)', background: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.02)' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); alert("File received. Initiating parse sequence..."); }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--hive-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.5rem auto', opacity: 0.8 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Secure Document Dropzone</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Drag and drop PDF or DOCX files here.<br/>Files are processed entirely in memory.</p>
      </div>
    </div>
  );
}