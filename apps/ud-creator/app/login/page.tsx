"use client";
import { useState } from "react";

export default function SpaceStationLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch('/api/auth', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        window.location.href = '/';
      } else {
        setError("Invalid Space Station Password");
      }
    } catch (e) {
      setError("Connection error");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: 'rgba(255,255,255,0.03)', padding: '4rem', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: '1rem' }}>Space Station</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Enter the master override password to access the Hive.</p>
        
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: '100%', padding: '1rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '1.1rem' }}
        />
        
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
        
        <button 
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#D4AF37', color: '#020617', padding: '1rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          {loading ? 'Authenticating...' : 'Enter Command Center'}
        </button>
      </form>
    </div>
  );
}
