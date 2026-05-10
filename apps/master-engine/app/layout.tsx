import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "UD-Audit | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey="pk_test_Y2hvaWNlLWRhc3NpZS02NS5jbGVyay5hY2NvdW50cy5kZXYk">
      <html lang="en">
        <body>
          <div className="grid-bg"></div>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">UD<span>Audit</span></a>
              <div>
                <SignedIn><UserButton afterSignOutUrl="/"/></SignedIn>
                <SignedOut><a href="/sign-in" className="btn">Authenticate</a></SignedOut>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
