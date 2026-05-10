import { B2BTierLanding } from "@/components/B2BTierLanding";
import { tierById } from "@/lib/tiers";

export const metadata = {
  title: "HiveClinical Enterprise Enterprise â€” Coming Q2 2026 â€” Join Waitlist",
  description:
    "HiveClinical Enterprise Enterprise â€” custom deployments for health systems. Unlimited seats, dedicated infrastructure options, custom integrations, SLA. Join the waitlist.",
};

export default function EnterprisePage() {
  const tier = tierById("enterprise")!;
  return <B2BTierLanding tier={tier} />;
}
