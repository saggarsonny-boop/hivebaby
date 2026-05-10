import type { Explanation } from "./types";

function spineRegion(explanation: Explanation) {
  const combined = `${explanation.body_region} ${explanation.key_findings
    .map((finding) => `${finding.body_location} ${finding.medical_term} ${finding.plain_language_explanation}`)
    .join(" ")}`;
  if (/\bC\d|cervical/i.test(combined)) return "cervical spine";
  if (/\bL\d|lumbar/i.test(combined)) return "lumbar spine";
  if (/\bT\d|thoracic/i.test(combined)) return "thoracic spine";
  return explanation.body_region || "reported anatomy";
}

export function buildMedicalIllustrationPrompt(explanation: Explanation) {
  const findings = explanation.key_findings
    .slice(0, 6)
    .map(
      (finding) =>
        `${finding.body_location || "unspecified location"}: ${finding.severity !== "unspecified" ? `${finding.severity} ` : ""}${finding.medical_term} - ${finding.plain_language_explanation}`
    )
    .join("\n");

  return `Create a polished patient-education medical illustration plate for the ${spineRegion(explanation)}.

Visual quality target:
- High-end medical atlas illustration, hand-painted anatomical realism, warm bone tones, blue-gray intervertebral discs, yellow nerve roots, crisp black leader lines, clean white background.
- Similar level of anatomical polish to a professional medical textbook illustration, but do not copy any named artist's exact style.
- Landscape infographic composition, suitable for a patient handout.

Content:
- Main large sagittal anatomy view showing the relevant spine region and levels.
- Add a smaller axial inset at the most important level.
- Add a small comparison/detail inset if relevant, such as facet joint narrowing, disc bulge, foraminal narrowing, or canal narrowing.
- Use calm color-coded callout boxes for key levels and findings.
- Keep text short and legible. Avoid dense paragraphs.
- Include an anatomy key with bone, disc, nerve/canal, and highlighted finding.

Report-derived findings:
${findings || "No specific findings were extracted."}

Safety and accuracy constraints:
- This is an educational illustration based only on written report text.
- Do not depict this as an actual MRI, CT, X-ray, or ultrasound.
- Do not invent extra diagnoses beyond the listed findings.
- Include this exact note at the bottom: "Educational illustration based on report text - not an actual image and not to scale."`;
}
