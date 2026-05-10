"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentSignView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "signed" | "declined" | "blurry">("pending");
  const [signatureHash, setSignatureHash] = useState<string | null>(null);

  const preferredSignature = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTAwIj48cGF0aCBkPSJNIDEwIDUwIFEgNTAgMTAgMTAwIDUwIFQgMTkwIDUwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJ0cmFuc3BhcmVudCIgc3Ryb2tlLXdpZHRoPSI1Ii8+PC9zdmc+"; // Mock preferred squiggle

  const handleSign = () => {
    setStatus("signed");
    setSignatureHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    // Simulated API call would update DB here
  };

  const handleDecline = () => {
    setStatus("declined");
    setTimeout(() => router.push("/signer"), 1500);
  };

  const handleBlurry = () => {
    setStatus("blurry");
    setTimeout(() => router.push("/signer"), 1500);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-outline" onClick={() => router.push("/signer")}>
          ← Back to Dashboard
        </button>
        <div style={{ 
          padding: '0.25rem 1rem', 
          borderRadius: '999px', 
          background: status === 'pending' ? '#fef3c7' : status === 'signed' ? '#dcfce7' : '#fee2e2',
          color: status === 'pending' ? '#b45309' : status === 'signed' ? '#166534' : '#991b1b',
          fontWeight: 600
        }}>
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '3rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '1rem' }}>
            [PDF Document Viewer Placeholder]
          </div>
          <a href="#" style={{ color: 'rgb(var(--primary-rgb))', fontWeight: 500, textDecoration: 'none' }}>
            Open original document
          </a>
        </div>

        {status === "pending" && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Your Signature</h3>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', flex: '1', minWidth: '300px' }}>
                <img src={preferredSignature} alt="Preferred Signature" style={{ height: '80px', display: 'block', margin: '0 auto' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minWidth: '300px' }}>
                <button className="btn" onClick={handleSign} style={{ padding: '1rem' }}>
                  Sign with this signature
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleDecline}>Not signing</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleBlurry}>Blurry, request re-upload</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "signed" && signatureHash && (
          <div className="timestamp-block">
            Signed via OKSign<br/>
            Timestamp: {new Date().toISOString()}<br/>
            Signer ID: user_2abcdefg<br/>
            Document Hash: {signatureHash}
          </div>
        )}

        {(status === "declined" || status === "blurry") && (
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '1rem' }}>
            Document status updated. Returning to dashboard...
          </div>
        )}
      </div>
    </div>
  );
}
