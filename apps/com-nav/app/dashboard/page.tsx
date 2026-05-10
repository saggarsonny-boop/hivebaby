"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function HiveArriveDashboard() {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState("SYNCED");
  
  // Simulated streams
  const [transcript, setTranscript] = useState<string[]>([
    "Local Recorder Initialized. Awaiting audio stream...",
  ]);
  
  const [analysis, setAnalysis] = useState<any[]>([
    { type: "info", text: "HiveArrive engine ready. Standing by for strategic analysis." }
  ]);

  // Mock subscription check & network listeners
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("SYNCING...");
      setTimeout(() => setSyncStatus("SYNCED"), 1500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("OFFLINE - CACHING LOCALLY");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkSub = async () => {
      setTimeout(() => setIsSubscribed(false), 500); 
    };
    checkSub();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript(prev => [...prev, "[Stream started...]"]);
      setTimeout(() => setTranscript(prev => [...prev, "Opponent: 'We can't budge on the valuation, it's firmly locked at $15M.'"]), 2000);
      
      if (isSubscribed) {
        setTimeout(() => setAnalysis(prev => [...prev, { type: "danger", text: "HARD COMMITMENT DETECTED: Valuation locked at $15M." }]), 2500);
      }
      
      setTimeout(() => setTranscript(prev => [...prev, "Opponent: 'However, there might be some flexibility in the equity vest schedule if we close today.'"]), 4000);
      
      if (isSubscribed) {
        setTimeout(() => setAnalysis(prev => [...prev, { type: "success", text: "CONCESSION OPENING: Flexible equity vest schedule identified. Pivot to this." }]), 4500);
      }
    } else {
      setIsListening(false);
      setTranscript(prev => [...prev, "[Stream stopped.]"]);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tactical HUD</h1>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
            <span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isListening ? 'var(--danger)' : 'var(--hive-gold)', marginRight: '0.5rem' }}></span>
              Status: {isListening ? "ACTIVE RECORDING" : "STANDBY"}
            </span>
            <span style={{ borderLeft: '1px solid var(--accent)', paddingLeft: '1rem', color: isOnline ? 'var(--success)' : 'var(--danger)' }}>
              Network: {syncStatus}
            </span>
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
        <div className="analysis-panel" style={{ position: 'relative' }}>
          <div className="hud-title">Real-Time AI Analysis</div>
          
          {!isSubscribed ? (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
               <h3 style={{ color: 'var(--hive-gold)', marginBottom: '1rem', fontSize: '1.25rem' }}>Enterprise Analysis Locked</h3>
               <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                 Upgrade to the $699/mo Enterprise tier to unlock real-time tactical flagging, logic audits, and counter-measures.
               </p>
               <button 
                className="btn btn-solid"
                onClick={() => {
                  alert("Routing to Stripe Checkout... (Simulated payment success)");
                  setIsSubscribed(true);
                }}
               >
                 Unlock Analysis
               </button>
            </div>
          ) : (
            <>
              {analysis.map((item, i) => (
                <div key={i} className={`indicator ${item.type}`}>
                  {item.text}
                </div>
              ))}
            </>
          )}
        </div>
        
        <div className="transcript-panel">
          <div className="hud-title" style={{ position: 'sticky', top: '-1.5rem', background: 'var(--accent)', paddingBottom: '1rem', zIndex: 10 }}>Raw Transcript Stream (Free Local Recording)</div>
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
