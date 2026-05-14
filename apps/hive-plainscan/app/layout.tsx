import HiveOpsWidget from '@/components/HiveOpsWidget';
import './globals.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hive PlainScan | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
        <body>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="/" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Hive PlainScan</a>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="?auth=true" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>Authenticate</a>
              </div>
            </header>
            <main>{children}</main>
          </div>
        
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          Made with ❤️ by <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>
        </footer>
        <HiveOpsWidget />
      </body>
      </html>
  );
}