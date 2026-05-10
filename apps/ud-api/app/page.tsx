"use client";
import { useState } from "react";
import { useHiveTelemetry } from "@hive/telemetry";

export default function Home() {
  useHiveTelemetry('ud-api');
  
  const [copied, setCopied] = useState(false);
  const curlCode = `curl -X POST https://ud-api.universaldocument.org/api/v1/ingest \\
  -H "Authorization: Bearer ud_live_YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/contract.pdf" \\
  -F "webhook_url=https://your-server.com/webhooks/ud"`;

  const copyCode = () => {
    navigator.clipboard.writeText(curlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '4rem auto', position: 'relative', fontFamily: 'monospace' }}>
      
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--hive-gold)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 }}></div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--hive-gold)', color: 'black', padding: '0.25rem 0.5rem', fontWeight: 'bold', fontSize: '0.8rem', borderRadius: '4px' }}>v1.0</div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'system-ui' }}>
            UD Mass Ingestion API
          </h1>
        </div>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '700px', fontFamily: 'system-ui' }}>
          The programmatic gateway to the Sovereign Engine. Push thousands of PDFs, MSAs, and medical records securely. Receive structured JSON payloads asynchronously.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a href="/dashboard" style={{ background: 'var(--foreground)', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontFamily: 'system-ui' }}>Get API Keys</a>
          <a href="#docs" style={{ border: '1px solid var(--accent)', color: 'var(--foreground)', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontFamily: 'system-ui' }}>View Documentation</a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--hive-gold)', marginBottom: '1rem', fontFamily: 'system-ui' }}>Quickstart: Ingest a Document</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: 'system-ui' }}>
            Upload a PDF document. The Sovereign Engine will process it and send the resulting UDS JSON to your webhook.
          </p>
          
          <div style={{ position: 'relative', background: '#000', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--accent)' }}>
            <button 
              onClick={copyCode}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'system-ui', fontSize: '0.8rem' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre style={{ margin: 0, color: '#e2e8f0', overflowX: 'auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
              <code>{curlCode}</code>
            </pre>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--foreground)', marginBottom: '0.5rem', fontFamily: 'system-ui' }}>Zero-Retention Guarantee</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'system-ui' }}>
              We do not store your documents. Once parsed, the source PDF and resulting JSON are purged from our memory. We act as a stateless pipeline.
            </p>
          </div>
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--foreground)', marginBottom: '0.5rem', fontFamily: 'system-ui' }}>Metered Billing</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'system-ui' }}>
              Pay exactly for what you ingest. Pricing starts at $15.00 per 1,000 pages parsed. Volume discounts applied automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
