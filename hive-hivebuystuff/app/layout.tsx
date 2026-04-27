import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HiveBuyStuff - Your Procurement Internist",
  description:
    "Build shopping templates once. Run them anywhere. HiveBuyStuff routes your cart to Walmart, Target, Amazon, or Instacart automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="hbs-footer">
          <span>No ads. No investors. No agenda.</span>
          <span>Free at the base tier, forever.</span>
        </footer>
      </body>
    </html>
  );
}
