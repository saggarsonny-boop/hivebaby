"use client";
import React, { useState } from 'react';

export default function HivePhotoPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="hive-watermark" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '4rem',
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 10
      }}>
        
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
          ✨ Enterprise-Grade Photo Vault • 3 Months Free
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          HivePhoto.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: 1.6 }}>
          Port thousands of photos instantly. Any input format. Zero compression loss. Absolute cryptographic privacy.
        </p>

        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); setUploaded(true); }}
          style={{
            border: `2px dashed ${dragActive ? '#D4AF37' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '16px',
            padding: '4rem 2rem',
            background: dragActive ? 'rgba(212,175,55,0.05)' : 'rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
        >
          {uploaded ? (
            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 600 }}>
              ✓ 1,402 Photos securely transferred to the Hive.
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drag & Drop your entire library</h3>
              <p style={{ color: '#64748b' }}>Supports JPG, PNG, HEIC, RAW, TIFF. Up to 500GB per upload.</p>
            </>
          )}
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{ background: '#D4AF37', color: '#020617', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}>
            Connect Apple Photos
          </button>
          <button style={{ background: 'transparent', color: '#f8fafc', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            Connect Google Drive
          </button>
        </div>

      </div>
    </div>
  );
}