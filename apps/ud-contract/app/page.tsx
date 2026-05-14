"use client";
import HiveDashboard from "../components/HiveDashboard";
import CrossPollinationModal from "../components/CrossPollinationModal";
import { useState } from "react";
import { useHiveTelemetry } from "@hive/telemetry";

export default function ContractEngine() {
  useHiveTelemetry('ud-contract');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleShare = () => {
    // Adoption Amplifier #4: The Viral Share Hook
    // In production, this saves the result to Neon and generates a unique ID.
    const mockId = crypto.randomUUID().substring(0, 8);
    const link = `${window.location.origin}/share/${mockId}`;
    setShareLink(link);
    navigator.clipboard.writeText(`I just analyzed an M&A contract using Universal Document. View my results: ${link}`);
  };

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    // Language can be added here
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data.analysis);
    } catch (e) {
      console.error(e);
      setResult("Error processing document.");
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>UD <span style={{ color: '#D4AF37' }}>Contract</span></div>
        <button style={{ background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Enterprise Sign In</button>
      </header>

      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligent M&A Analysis.</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Upload massive corporate merger agreements, NDAs, and Master Service Agreements. Our Queen Bee protocol extracts hidden clauses, liability shifts, and anomalies instantly.</p>
        </div>

        <div 
          style={{ border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', background: 'rgba(212,175,55,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
        >
          <div style={{ width: '64px', height: '64px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </div>
          {analyzing ? (
            <div style={{ color: '#D4AF37', fontWeight: 600 }}>Analyzing document via Queen Bee...</div>
          ) : result ? (
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#f8fafc', fontFamily: 'inherit', marginBottom: '1rem' }}>{result}</pre>
              
              <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px' }}>
                <p style={{ color: '#D4AF37', margin: 0, fontWeight: 'bold' }}>
                  ⚡ Adoption Amplifier Triggered
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Share this analysis with your legal team. They will view it in the UD Reader and be prompted to create their own Hive account.
                </p>
                <button 
                  onClick={handleShare}
                  style={{ background: '#D4AF37', color: '#020617', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {shareLink ? 'Link Copied to Clipboard!' : 'Share Analysis & Generate Link'}
                </button>
                {shareLink && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    {shareLink}
                  </div>
                )}
              </div>
            </div>
          ) : file ? (
            <div style={{ color: '#D4AF37', fontWeight: 600 }}>{file.name} ready for analysis.</div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drag & drop M&A documents</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Supports PDF, DOCX, TXT. Max 500MB per file for Enterprise users.</p>
            </>
          )}
        </div>
      
        <HiveDashboard engineName="CONTRACT" creditsUsed={2} maxCredits={5} />
        <CrossPollinationModal 
          sourceEngine="ud-contract" 
          targetEngine="UD Signature" 
          targetUrl="https://signer.hive.baby" 
          description="Need to cryptographically sign this document? Try UD Signature." 
        />
      </main>
    </div>
  );
}