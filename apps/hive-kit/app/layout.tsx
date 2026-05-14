import HiveOpsWidget from '@/components/HiveOpsWidget';
import { ClerkProvider } from '@clerk/nextjs'
export const metadata = {
  title: 'HIVE-KIT - Universal Document Ecosystem',
  description: 'Powered by the Hive Queen Bee architecture. Built for MACHINE_OVER_HUMAN compliance.',
  openGraph: { title: 'HIVE-KIT' }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="machine-over-human"><ClerkProvider>{children}</ClerkProvider>  <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>This is a Hive engine. We collect zero personal data. No login, no account, no tracking.</div>
        </footer>
        <HiveOpsWidget />
      </body>
    </html>
  )
}