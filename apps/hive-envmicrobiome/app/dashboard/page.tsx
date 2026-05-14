"use client";
import { useState, useEffect } from "react";
const useUser = () => ({ isSignedIn: true, isLoaded: true, user: { id: "mock" } }); const ClerkProvider = ({children}: any) => <>{children}</>; const SignedIn = ({children}: any) => <>{children}</>; const SignedOut = () => null; const UserButton = () => null; const auth = () => ({ userId: "mock_user" });

export default function Dashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

  

  return (
    <div className="card">
      <h2 style={{ color: 'var(--hive-gold)', marginBottom: '1rem' }}>Hive Envmicrobiome HUD</h2>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '2rem' }}>
        Network Status: <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>{isOnline ? "ONLINE (SYNCED)" : "OFFLINE (CACHING LOCALLY)"}</span>
      </div>
      <div style={{ border: '2px dashed var(--accent)', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Drag and drop documentation here for strategic analysis.
      </div>
    </div>
  );
}