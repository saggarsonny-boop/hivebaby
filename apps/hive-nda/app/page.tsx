'use client';
import { useState } from 'react';
import './globals.css';

export default function HiveNDA() {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSign = () => {
    // Generate a mock SHA-256 hash
    const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setSignature(mockHash);
  };

  return (
    <div className="document">
      <div className="uds-watermark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        UNIVERSAL DOCUMENT SMART CONTRACT
      </div>

      <div className="doc-header">
        <h1>Mutual Non-Disclosure Agreement</h1>
        <p style={{color: '#6b7280', fontFamily: 'sans-serif', marginTop: '1rem'}}>Effective Date: May 12, 2026</p>
      </div>

      <div className="doc-body">
        <p>
          This Mutual Non-Disclosure Agreement (this "Agreement") is entered into by and between <strong>Hive Studios Inc.</strong> ("Disclosing Party") and the undersigned individual or entity ("Receiving Party").
        </p>
        <p>
          1. <strong>Confidential Information.</strong> For purposes of this Agreement, "Confidential Information" means any data or information that is proprietary to the Disclosing Party and not generally known to the public, whether in tangible or intangible form.
        </p>
        <p>
          2. <strong>Universal Document Cryptography.</strong> This document is generated as a Universal Document (UDS). By executing the cryptographic signature below, the Receiving Party agrees that the immutable hash generated herein carries the full legal weight of a wet-ink signature, entirely superseding legacy PDF platforms.
        </p>
      </div>

      <div className="signature-block">
        <div className="signee">
          <p style={{fontFamily: 'sans-serif', fontWeight: 600, margin: 0}}>Hive Studios Inc.</p>
          <div className="sign-line">
            0x8f2a6ca84abeca26365abe6dd24250...
          </div>
          <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>Signed: 05/10/2026</p>
        </div>

        <div className="signee">
          <p style={{fontFamily: 'sans-serif', fontWeight: 600, margin: 0}}>Receiving Party</p>
          
          {!signature ? (
            <div style={{marginTop: '1rem'}}>
              <button className="btn-sign" onClick={handleSign}>Execute Cryptographic Signature</button>
            </div>
          ) : (
            <>
              <div className="sign-line" style={{color: '#10b981'}}>
                {signature.substring(0, 32)}...
              </div>
              <p style={{margin: 0, color: '#10b981', fontSize: '0.9rem', fontFamily: 'sans-serif', fontWeight: 600}}>✓ Verified & Locked</p>
            </>
          )}
        </div>
      </div>

      {signature && (
        <div className="hash-stamp">
          <strong>DOCUMENT STATE LOCKED</strong><br/>
          UDS Protocol Hash:<br/>
          {signature}
        </div>
      )}
    </div>
  );
}