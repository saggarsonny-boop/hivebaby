import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Find my parking spot — ParkBack",
  description: "Someone shared their parking spot with you. Open in ParkBack to walk back.",
  openGraph: {
    title: "Find my parking spot",
    description: "Someone shared their parking spot with you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find my parking spot",
    description: "Someone shared their parking spot with you.",
  },
};

export default function FindLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
