import './globals.css';
import "./globals.css";
import { HiveOpsWidget } from "@/components/HiveOpsWidget";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>
        <HiveOpsWidget />{children}
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>This is a Hive engine. We collect zero personal data. No login, no account, no tracking.</div>
        </footer>
      </body></html>);
}
