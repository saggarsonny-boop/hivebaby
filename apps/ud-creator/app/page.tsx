"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Hive Command: <br/>
          <span style={{ color: 'var(--hive-gold)' }}>Space Station</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
          The centralized Founder Dashboard and telemetry hub for the Universal Document ecosystem. Restricted access.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-in" className="btn btn-solid" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Enter Station
          </a>
        </div>
      </div>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--hive-gold)', textAlign: 'center' }}>System Diagnostics</h2>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          Hive Core Online • Preston Standby • Telemetry Synced
        </div>
      </div>
    </div>
  );
}