"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function ComNavDashboard() {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Simulated streams
  const [transcript, setTranscript] = useState<string[]>([
    "System Initialized. Awaiting audio stream...",
  ]);
  
  const [analysis, setAnalysis] = useState<any[]>([
    { type: "info", text: "COM-NAV engine ready. Standing by for strategic analysis." }
  ]);

  // Mock subscription check
  useEffect(() => {
    // In production, this checks the `stripe_customer_id` and entitlement DB.
    // For MVP, we simulate a prompt to upgrade.
    const checkSub = async () => {
      // Simulate delay
      setTimeout(() => setIsSubscribed(false), 500); 
    };
    checkSub();
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript(prev => [...prev, "[Stream started...]"]);
      // Simulate incoming text
      setTimeout(() => setTranscript(prev => [...prev, "Opponent: 'We can't budge on the valuation, it's firmly locked at $15M.'"]), 2000);
      setTimeout(() => setAnalysis(prev => [...prev, { type: "danger", text: "HARD COMMITMENT DETECTED: Valuation locked at $15M." }]), 2500);
      setTimeout(() => setTranscript(prev => [...prev, "Opponent: 'However, there might be some flexibility in the equity vest schedule if we close today.'"]), 4000);
      setTimeout(() => setAnalysis(prev => [...prev, { type: "success", text: "CONCESSION OPENING: Flexible equity vest schedule identified. Pivot to this." }]), 4500);
    } else {
      setIsListening(false);
      setTranscript(prev => [...prev, "[Stream stopped.]"]);
    }
  };

  if (!isSubscribed) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--hive-gold)' }}>Authentication Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
            COM-NAV is a Sovereign-Lite tactical engine restricted to Enterprise subscribers. 
            To access the HUD and activate real-time inference, initiate your deployment sequence.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>$699 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ month</span></div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Billed monthly. Cancel anytime.</div>
          </div>
          <button 
            className="btn btn-solid" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={() => {
              // MVP Hook: We simulate successful Stripe Checkout returning to the dashboard
              alert("Routing to Stripe Checkout... (Simulated payment success)");
              setIsSubscribed(true);
            }}
          >
            Authorize Payment & Deploy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tactical HUD</h1>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isListening ? 'var(--danger)' : 'var(--hive-gold)', marginRight: '0.5rem' }}></span>
            Status: {isListening ? "ACTIVE INTERCEPT" : "STANDBY"}
          </div>
        </div>
        <button 
          className={`btn ${isListening ? '' : 'btn-solid'}`}
          onClick={toggleListening}
          style={{ borderColor: isListening ? 'var(--danger)' : 'var(--hive-gold)', color: isListening ? 'var(--danger)' : 'var(--background)' }}
        >
          {isListening ? "Cease Intercept" : "Initialize Intercept"}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="analysis-panel">
          <div className="hud-title">Real-Time Analysis</div>
          {analysis.map((item, i) => (
            <div key={i} className={`indicator ${item.type}`}>
              {item.text}
            </div>
          ))}
        </div>
        
        <div className="transcript-panel">
          <div className="hud-title" style={{ position: 'sticky', top: '-1.5rem', background: 'var(--accent)', paddingBottom: '1rem', zIndex: 10 }}>Raw Transcript Stream</div>
          {transcript.map((line, i) => (
            <div key={i} style={{ marginBottom: '1rem', color: line.startsWith('[') ? '#64748b' : 'var(--foreground)' }}>
              {line}
            </div>
          ))}
          {isListening && (
            <div style={{ color: '#64748b', animation: 'pulse 1.5s infinite' }}>_</div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
}
