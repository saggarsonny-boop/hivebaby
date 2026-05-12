"use client";
import React, { useState } from 'react';

export default function HiveConfessionPage() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="relative z-10" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '4rem',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        position: 'relative',
        zIndex: 10
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 300, color: '#f8fafc', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            H I V E C O N F E S S I O N
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontStyle: 'italic' }}>
            Speak your absolute truth into the void. Cryptographically shredded. Zero retention.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕊️</div>
            <h2 style={{ color: '#f8fafc', fontWeight: 300 }}>Your confession has been absorbed by the Hive.</h2>
            <p style={{ color: '#64748b', marginTop: '1rem' }}>The record no longer exists.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I have never told anyone this, but..."
              style={{
                width: '100%',
                minHeight: '250px',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.1)',
                color: '#f8fafc',
                fontSize: '1.25rem',
                lineHeight: 1.6,
                padding: '1rem 0',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>
                End-to-End Encrypted. No Logs.
              </span>
              <button 
                onClick={() => setSubmitted(true)}
                disabled={!text.trim()}
                style={{ 
                  background: text.trim() ? '#f8fafc' : 'rgba(255,255,255,0.1)', 
                  color: text.trim() ? '#020617' : '#475569', 
                  padding: '1rem 3rem', 
                  borderRadius: '9999px', 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              >
                Release
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}