"use client";
import HiveDashboard from "../components/HiveDashboard";
import CrossPollinationModal from "../components/CrossPollinationModal";
import { useState } from "react";
import { useHiveTelemetry } from "@hive/telemetry";

export default function AnonymizerEngine() {
  useHiveTelemetry('ud-anonymizer');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const res = await fetch('/api/redact', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data.redactedText);
    } catch (e) {
      console.error(e);
      setResult("Error processing document.");
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>UD <span style={{ color: '#10b981' }}>Anonymizer</span></div>
        <button style={{ background: 'transparent', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>HIPAA Compliance Portal</button>
      </header>

      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Military-Grade PII Redaction.</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Strip names, SSNs, financial data, and protected health information (PHI) from thousands of documents instantly with 99.9% accuracy via Queen Bee governance.</p>
        </div>

        <div 
          style={{ border: '2px dashed rgba(16,185,129,0.3)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', background: 'rgba(16,185,129,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
        >
          <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          {analyzing ? (
            <div style={{ color: '#10b981', fontWeight: 600 }}>Applying military-grade redactions...</div>
          ) : result ? (
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#f8fafc', fontFamily: 'inherit' }}>{result}</pre>
              <button style={{ marginTop: '2rem', background: '#10b981', color: '#020617', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Download Safe Copy</button>
            </div>
          ) : file ? (
            <div style={{ color: '#10b981', fontWeight: 600 }}>{file.name} ready for redaction.</div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Secure Dropzone</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Zero-retention policy. Documents are parsed in memory and instantly destroyed.</p>
            </>
          )}
        </div>
      
        <HiveDashboard engineName="ANONYMIZER" creditsUsed={2} maxCredits={5} />
        <CrossPollinationModal 
          sourceEngine="ud-anonymizer" 
          targetEngine="Hive Plainscan" 
          targetUrl="https://plainscan.hive.baby" 
          description="Need a detailed medical explanation? Try Hive Plainscan." 
        />
      </main>
    </div>
  );
}