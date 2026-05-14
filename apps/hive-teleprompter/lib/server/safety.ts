import type { SafetyFlagLevel } from "@prisma/client";

const urgentTerms = [
  "aneurysm",
  "dissection",
  "hemorrhage",
  "stroke",
  "infarct",
  "pulmonary embolism",
  "cord compression",
  "cauda equina",
  "unstable fracture",
  "abscess",
  "osteomyelitis",
  "critical result",
  "emergent",
  "compression of spinal cord"
];

const cautionTerms = [
  "mass",
  "malignancy",
  "cancer",
  "metastasis",
  "tumor",
  "suspicious lesion",
  "severe stenosis",
  "fracture",
  "infection",
  "urgent",
  "new lesion",
  "worsening lesion"
];

export function detectSafetyFlags(reportText: string): {
  flagLevel: SafetyFlagLevel;
  detectedTerms: string[];
  clinicianAttentionMessage: string;
} {
  const normalized = reportText.toLowerCase();
  const urgent = urgentTerms.filter((term) => normalized.includes(term));
  const caution = cautionTerms.filter((term) => normalized.includes(term));
  const detectedTerms = Array.from(new Set([...urgent, ...caution]));
  const flagLevel: SafetyFlagLevel = urgent.length > 0 ? "urgent" : caution.length > 0 ? "caution" : "none";
  const clinicianAttentionMessage =
    flagLevel === "urgent"
      ? "Urgent or high-attention report language detected. Physician review is required before patient release."
      : flagLevel === "caution"
        ? "Sensitive report language detected. Clinician review is required before patient release."
        : "No configured safety flag terms detected.";

  return { flagLevel, detectedTerms, clinicianAttentionMessage };
}
