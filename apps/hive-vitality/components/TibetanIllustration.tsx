// Placeholder SVG illustrations for ritual components. Real AI-generated
// imagery is planned for v0.2 (ai_tibetan_imagery_v0.2 in ENGINE_GRAMMAR).
// For v0.1 we ship a single abstract figure motif scaled per-step so the
// ritual flow has consistent visual rhythm without a binary asset commit.

import type { ComponentSlug } from "@/types/vitality";

interface Props {
  slug?: ComponentSlug;
}

const TINTS: Record<string, string> = {
  tibetan_1: "#D4AF37",
  tibetan_2: "#caa67b",
  tibetan_3: "#8a6f1f",
  tibetan_4: "#D4AF37",
  tibetan_5: "#caa67b",
  default: "#9a9588",
};

export default function TibetanIllustration({ slug }: Props) {
  const tint = TINTS[slug ?? "default"] ?? TINTS.default;
  return (
    <svg
      viewBox="0 0 120 120"
      width="96"
      height="96"
      role="img"
      aria-label="Ritual placeholder illustration"
      style={{ display: "block", margin: "8px auto" }}
    >
      <circle cx="60" cy="36" r="14" fill={tint} opacity="0.85" />
      <rect x="50" y="50" width="20" height="36" rx="6" fill={tint} opacity="0.7" />
      <rect x="38" y="56" width="10" height="22" rx="4" fill={tint} opacity="0.55" />
      <rect x="72" y="56" width="10" height="22" rx="4" fill={tint} opacity="0.55" />
      <rect x="50" y="86" width="8" height="22" rx="3" fill={tint} opacity="0.55" />
      <rect x="62" y="86" width="8" height="22" rx="3" fill={tint} opacity="0.55" />
    </svg>
  );
}
