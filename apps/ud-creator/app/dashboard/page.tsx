"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SpaceStationDashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [commandText, setCommandText] = useState("");
  const [metrics, setMetrics] = useState<any>(null);
  const [commandLog, setCommandLog] = useState([
    { time: "09:41", msg: "Hive Core synced. 228 engines online." },
    { time: "09:42", msg: "Preston module active. Waiting for command." }
  ]);

  useEffect(() => {
    // Fetch live telemetry metrics
    fetch('/api/telemetry')
      .then(res => res.json())
      .then(data => setMetrics(data.metrics))
      .catch(err => console.error("Telemetry fetch failed", err));
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLoaded, isSignedIn, router]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setCommandLog(prev => [{ time: timeStr, msg: `User: ${commandText}` }, ...prev]);
    
    setTimeout(() => {
      setCommandLog(prev => [{ time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), msg: `Preston: Acknowledged. Executing rule change for PPP tiers.` }, ...prev]);
    }, 800);
    
    setCommandText("");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Left: Honeycomb / Navigation */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)' }}>
        <h3 style={{ color: 'var(--hive-gold)', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
          Hive Topology
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {metrics ? metrics.clusters.map((c: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: i === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)', borderLeft: `3px solid ${i === 0 ? 'var(--success)' : '#64748b'}`, borderRadius: '4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.count} Engines</span>
            </div>
          )) : (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading clusters...</div>
          )}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {/* Simulated Honeycomb Map */}
            {[...Array(24)].map((_, i) => (
              <div key={i} style={{ width: '20px', height: '24px', backgroundColor: i % 7 === 0 ? 'var(--success)' : 'rgba(255,255,255,0.1)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', opacity: i % 7 === 0 ? 0.8 : 0.3 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Center: Macro Metrics */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Daily Active Users (DAU)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--foreground)' }}>{metrics ? metrics.dau.toLocaleString() : '---'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.5rem' }}>{metrics ? metrics.dauGrowth : '---'}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Real-Time Revenue (24h)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--hive-gold)' }}>${metrics ? metrics.revenue.toLocaleString() : '---'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.5rem' }}>{metrics ? metrics.revenueGrowth : '---'}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ color: 'var(--hive-gold)', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Revenue Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metrics ? metrics.revenueBreakdown.map((r: any, i: number) => {
              const colors = ['var(--hive-gold)', '#3b82f6', 'var(--success)'];
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <span>{r.name}</span>
                    <span style={{ fontWeight: 600 }}>${r.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${r.pct}%`, height: '100%', background: colors[i % colors.length], borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading breakdown...</div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Command Center */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ color: 'var(--hive-gold)', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
          Preston Command Center
        </h3>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          {commandLog.map((log, i) => (
            <div key={i} style={{ color: log.msg.startsWith('Preston') ? 'var(--hive-gold)' : '#94a3b8' }}>
              <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>[{log.time}]</span>
              {log.msg}
            </div>
          ))}
        </div>

        <form onSubmit={handleCommand} style={{ position: 'relative' }}>
          <input 
            type="text" 
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="e.g., Set Medical Quiz price to $2 in India..."
            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--hive-gold)', cursor: 'pointer', padding: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}