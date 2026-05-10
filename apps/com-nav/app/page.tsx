"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Never lose the narrative.<br/>
          <span style={{ color: 'var(--hive-gold)' }}>Own the room.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
          COM-NAV is a tactical communication engine for high-stakes conversations. 
          Real-time transcription, immediate logical audits, and tactical counter-measures 
          delivered silently to your screen during negotiations, depositions, and sales calls.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-up" className="btn btn-solid" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Deploy COM-NAV
          </a>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--hive-gold)', textAlign: 'center' }}>
          Enterprise Capabilities
        </h2>
        
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Real-Time Inference</div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Local audio capture routed through sub-second LLM inference, identifying logical fallacies, commitments, and concessions as they are spoken.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Tactical HUD</div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              A distraction-free, dark-mode heads-up display engineered for peripheral reading. Silence the noise, see the strategy.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Zero-Retention Security</div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Transcripts are processed in memory and immediately discarded. No storage. No tracking. Sovereign-Lite architecture.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Enterprise Pricing</div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              $699/month. Uncapped inference. Cancel anytime. Because clarity is the ultimate leverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
