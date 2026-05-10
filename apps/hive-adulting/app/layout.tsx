import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "Hive Adulting | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">Hive Adulting</a>
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