import './globals.css';
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          Made with ❤️ by <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>
        </footer>
      </body></html>);
}
