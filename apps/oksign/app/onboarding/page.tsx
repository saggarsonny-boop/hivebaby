"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [signatures, setSignatures] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (signatures.length < 3) {
          setSignatures([...signatures, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    if (selected === null) return;
    
    // Here we would save to Prisma DB:
    // POST /api/user/signature { preferredSignature: signatures[selected] }

    // After saving, route to the Stripe $1/mo paywall or signer dashboard
    // For MVP, we'll assume they hit the Stripe checkout here
    alert("In production, this routes to Stripe Checkout for $1/mo subscription.");
    router.push("/signer");
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card text-center">
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to OKSign</h2>
        <p style={{ color: '#475569', marginBottom: '2rem' }}>
          Let's get your signature ready. Upload or draw three versions of your signature.<br/>
          Pick your favorite — from now on, signing takes one tap.
        </p>

        {signatures.length < 3 && (
          <div style={{ marginBottom: '2rem' }}>
            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
              Upload Signature ({signatures.length}/3)
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        )}

        {signatures.length > 0 && (
          <div className="signature-grid">
            {signatures.map((sig, index) => (
              <div 
                key={index} 
                className={`signature-box ${selected === index ? 'selected' : ''}`}
              >
                <img src={sig} alt={`Signature ${index + 1}`} className="signature-image" />
                <button 
                  className={`btn ${selected === index ? '' : 'btn-secondary'}`}
                  onClick={() => setSelected(index)}
                  style={{ marginTop: 'auto' }}
                >
                  {selected === index ? 'Selected' : 'Use this signature'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
          <button 
            className="btn" 
            onClick={handleFinish}
            disabled={selected === null}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
