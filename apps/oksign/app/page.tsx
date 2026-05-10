"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // In a real app, this role would be pulled from Clerk publicMetadata or our Prisma DB.
      // For MVP demo, we'll route based on a simple heuristic or prompt them.
      // Let's assume we redirect them to a role selector or onboarding.
      router.push("/onboarding");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="card text-center" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'rgb(var(--primary-rgb))' }}>
        OKSign it.
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '2rem' }}>
        The fastest way to get anything signed. One tap. Zero friction.
      </p>
      
      <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'inline-block' }}>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>✓ One-tap signatures</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Legally binding audit trail</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ $1 per signer per month</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ No learning curve</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Cancel anytime. No contracts.</li>
        </ul>
      </div>

      <div className="flex gap-4" style={{ justifyContent: 'center' }}>
        <a href="/sign-up" className="btn">Start with OKSign</a>
      </div>
    </div>
  );
}
