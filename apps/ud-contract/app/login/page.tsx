"use client";
import { useState } from "react";

export default function QueenBeeLogin() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        // Redirect to the Stripe Checkout Session
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Failed to generate checkout session", e);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4rem', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: '1rem' }}>Enterprise Subscription Required</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Subscribe to the ud-contract Engine to unlock military-grade M&A analysis.</p>
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: '#D4AF37', color: '#020617', padding: '1rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          {loading ? 'Connecting to Stripe...' : 'Upgrade to Enterprise ($499/mo)'}
        </button>
      </div>
    </div>
  );
}
