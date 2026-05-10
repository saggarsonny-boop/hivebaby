"use client";

import { useRouter } from "next/navigation";

export default function SignerDashboard() {
  const router = useRouter();

  // Mock data for pending documents
  const pendingDocs = [
    { id: "doc_1", title: "Patient Consent Form - Smith", seeker: "admin@clinic.com", date: "Today" },
    { id: "doc_2", title: "Monthly Audit Signoff", seeker: "compliance@hospital.org", date: "Yesterday" }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Documents to Sign</h2>
        <a href="/onboarding" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Update Signature</a>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {pendingDocs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No documents pending your signature. You're all caught up!
          </div>
        ) : (
          <div>
            {pendingDocs.map((doc, idx) => (
              <div 
                key={doc.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem',
                  borderBottom: idx === pendingDocs.length - 1 ? 'none' : '1px solid #e2e8f0',
                  background: 'white',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{doc.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    From: {doc.seeker} • {doc.date}
                  </div>
                </div>
                <div>
                  <button 
                    className="btn"
                    onClick={() => router.push(`/document/${doc.id}`)}
                  >
                    Review & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
