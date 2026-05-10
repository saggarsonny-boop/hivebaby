"use client";
import { useState } from "react";
import { useHiveTelemetry } from "@hive/telemetry";

export default function MedicalEngine() {
  useHiveTelemetry('ud-medical');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data.structuredData);
    } catch (e) {
      console.error(e);
      setResult("Error processing document.");
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>UD <span style={{ color: '#3b82f6' }}>Medical</span></div>
        <button style={{ background: 'transparent', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.4)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>EHR Integration</button>
      </header>

      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EHR Mass Ingestion.</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Ingest and normalize HL7 feeds, Epic CCDAs, and massive Cerner database dumps into structured Universal Document format seamlessly.</p>
        </div>

        <div 
          style={{ border: '2px dashed rgba(59,130,246,0.3)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', background: 'rgba(59,130,246,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
        >
          <div style={{ width: '64px', height: '64px', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          {analyzing ? (
            <div style={{ color: '#3b82f6', fontWeight: 600 }}>Normalizing EHR data...</div>
          ) : result ? (
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#f8fafc', fontFamily: 'inherit' }}>{result}</pre>
              <button style={{ marginTop: '2rem', background: '#3b82f6', color: '#020617', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Export to Epic/Cerner</button>
            </div>
          ) : file ? (
            <div style={{ color: '#3b82f6', fontWeight: 600 }}>{file.name} queued for parsing.</div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Medical Dump</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Fully HIPAA compliant. Supports XML, JSON, HL7, and native PDF.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}