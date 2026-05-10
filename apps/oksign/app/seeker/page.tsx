"use client";

import { useState } from "react";

export default function SeekerDashboard() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [signerEmail, setSignerEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSend = () => {
    if (!title || !file || !signerEmail) return;
    setStatus("sending");
    
    // Simulate API call to create Document and send email
    setTimeout(() => {
      setStatus("sent");
      setTitle("");
      setFile(null);
      setSignerEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Seeker Dashboard</h2>
      
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Send a Document for Signature</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Document Title</label>
          <input 
            className="input" 
            placeholder="e.g. Patient Consent Form" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload PDF</label>
          <input 
            type="file" 
            accept=".pdf,image/*" 
            className="input" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Signer Email</label>
          <input 
            type="email" 
            className="input" 
            placeholder="signer@clinic.com" 
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
          />
        </div>

        <button 
          className="btn" 
          style={{ width: '100%' }}
          onClick={handleSend}
          disabled={status !== "idle" || !title || !file || !signerEmail}
        >
          {status === "idle" && "Send for signature"}
          {status === "sending" && "Sending..."}
          {status === "sent" && "✓ Sent Successfully"}
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Documents</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mock list of sent documents */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Intake Form - John Doe</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Sent to: dr.smith@clinic.com</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#fef3c7', color: '#b45309', fontSize: '0.875rem', fontWeight: 500 }}>Pending</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>HIPAA Release - Jane Doe</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Sent to: nurse@clinic.com</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '0.875rem', fontWeight: 500 }}>Signed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
