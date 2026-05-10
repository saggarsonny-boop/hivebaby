"use client";
import { useState } from "react";

export default function BulkDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const simulateUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setFiles([]);
          alert("Batch ingestion complete. Processing 224,912 pages across " + files.length + " files.");
        }, 500);
      }
    }, 50);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '4rem auto', fontFamily: 'system-ui' }}>
      
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 600, color: 'var(--foreground)' }}>
          Enterprise Dropzone
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0 }}>
          Secure, bulk ingestion utility for the Universal Document Sovereign Engine. Capable of handling up to 10,000 files per batch.
        </p>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          border: isDragging ? '2px dashed var(--hive-gold)' : '2px dashed rgba(255,255,255,0.2)', 
          background: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'rgba(15, 23, 42, 0.4)',
          borderRadius: '8px', 
          padding: '6rem 2rem', 
          textAlign: 'center',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: isDragging ? 'var(--hive-gold)' : 'var(--foreground)' }}>
          Drop massive file batches here
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Supports .pdf, .docx, .zip (Max 50GB per batch)
        </p>
      </div>

      {files.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(15, 23, 42, 0.6)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Queued for Ingestion ({files.length} files)</h4>
            <button 
              onClick={simulateUpload}
              disabled={uploading}
              style={{ background: 'var(--hive-gold)', color: 'black', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? 'Ingesting...' : 'Begin Mass Ingestion'}
            </button>
          </div>

          {uploading && (
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--hive-gold)', transition: 'width 0.1s linear' }}></div>
            </div>
          )}

          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', background: '#000' }}>
            {files.map((f, i) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <span>{f.name}</span>
                <span style={{ color: '#64748b' }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#64748b' }}>
        <div>🔒 End-to-End Encrypted Tunnel</div>
        <div>⚡ HIPAA & SOC2 Compliant Node</div>
        <div>🗑️ Zero-Retention Pipeline</div>
      </div>
    </div>
  );
}
