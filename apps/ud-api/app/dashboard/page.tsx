"use client";
import { useState, useEffect } from "react";

export default function ApiKeysDashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [apiKey, setApiKey] = useState("ud_live_*************************");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Simulated Stripe gate check
    setTimeout(() => setIsSubscribed(false), 500);
  }, []);

  if (!isSubscribed) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)', fontFamily: 'system-ui' }}>Activate Mass Ingestion</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.6, fontFamily: 'system-ui' }}>
            The Mass Ingestion API requires an active enterprise billing account.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--hive-gold)', fontFamily: 'system-ui' }}>$1,500 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
          </div>
          <button className="btn btn-solid" style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', fontFamily: 'system-ui' }} onClick={() => {
            alert("Routing to Stripe Checkout... (Simulated success)");
            setIsSubscribed(true);
          }}>
            Authorize Payment & Generate Keys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, marginBottom: '2rem' }}>API Keys</h1>
      
      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Production Secret Key</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Use this key to authenticate your requests to the ingestion endpoint.</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            readOnly 
            value={revealed ? "ud_live_5h8f9j2k1l0m3n4b5v6c7x8z" : apiKey}
            style={{ flex: 1, padding: '1rem', background: '#000', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--hive-gold)', fontFamily: 'monospace', fontSize: '1rem' }}
          />
          <button 
            onClick={() => setRevealed(!revealed)}
            style={{ padding: '1rem', background: 'var(--accent)', color: 'var(--foreground)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Webhook Configuration</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Set your default webhook URL to receive asynchronous UDS JSON payloads.</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="https://your-server.com/webhooks/ud"
            style={{ flex: 1, padding: '1rem', background: '#000', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '1rem' }}
          />
          <button 
            style={{ padding: '1rem 2rem', background: 'var(--hive-gold)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
