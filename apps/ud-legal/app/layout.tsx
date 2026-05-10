import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "UD-Legal | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <html lang="en">
        <body>
          <div className="grid-bg"></div>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">UD<span>Legal</span></a>
              <div>
                
                <a href="/sign-in" className="btn">Authenticate</a>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </body>
      </html>
    
  );
}
