import './globals.css';
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "UD-Audit | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <html lang="en">
        <body>
          <div className="grid-bg"></div>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">UD<span>Audit</span></a>
              <div>
                
                <a href="/sign-in" className="btn">Authenticate</a>
              </div>
            </header>
            <main>{children}</main>
          </div>
        
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          Made with ❤️ by <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>
        </footer>
      </body>
      </html>
    
  );
}

