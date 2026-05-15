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
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
          Hive <span style={{ color: '#D4AF37' }}>Enterprise</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#api" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem' }}>API Docs</a>
          <a href="#security" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem' }}>RBAC Security</a>
          <a href="#pricing" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
          <a href="/sign-up" style={{ backgroundColor: '#ffffff', color: '#000000', padding: '0.5rem 1.25rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}>
            Request Access
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', color: '#D4AF37', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          The Adaptive AI Activity Companion
        </div>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
          A Universal Companion Layer <br/>
          <span style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>For Your Enterprise.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          Deploy the world's first multimodal, identity-bonding companion across your entire workforce. Engineered with military-grade Role-Based Access Control (RBAC).
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-up" style={{ backgroundColor: '#D4AF37', color: '#000', padding: '1rem 2.5rem', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s ease', boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.39)' }}>
            Initialize AAC Portal
          </a>
          <a href="#demo" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '500', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            Read the Specs
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#D4AF37' }}>Active Directory RBAC</h3>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '0.95rem' }}>
              The companion's vector search boundary is strictly sandboxed by the employee's security clearance. Janitors access schedules; CFOs access financials. Same companion, isolated memory.
            </p>
          </div>
          {/* Card 2 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#D4AF37' }}>The Tone Engine OS</h3>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Powered by the Hive Tone Engine. The AAC dynamically adjusts warmth, directness, and pacing based on the user's emotional state and context.
            </p>
          </div>
          {/* Card 3 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#D4AF37' }}>Queen Bee Governance</h3>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Every output is sanitized via the QueenBee.MasterGrappler schema, guaranteeing zero hallucinations and strict pattern-bound safety in enterprise environments.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ backgroundColor: '#0a0a0a', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Enterprise Licensing</h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '4rem' }}>Predictable pricing for global workforce deployments.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Base Platform</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D4AF37', marginBottom: '2rem' }}>$150k <span style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: 'normal' }}>/year</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>✓ Dedicated SaaS Infrastructure</li>
                <li>✓ Okta / Active Directory Integration</li>
                <li>✓ MasterGrappler Substrate</li>
                <li>✓ 24/7 HiveOps Support</li>
              </ul>
            </div>
            <div style={{ border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', padding: '3rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D4AF37', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Plus</div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Seat License</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D4AF37', marginBottom: '2rem' }}>$5 <span style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: 'normal' }}>/user/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>✓ Unlimited AAC API calls</li>
                <li>✓ Custom Vector Sandbox per Role</li>
                <li>✓ Mobile & Desktop Webhooks</li>
                <li>✓ Anticipation Engine Access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: '#52525b', fontSize: '0.875rem' }}>
        <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
        <div style={{ marginTop: '0.5rem' }}>Adaptive AI Activity Companion API (v1.0)</div>
      </footer>
    </div>
  );
}