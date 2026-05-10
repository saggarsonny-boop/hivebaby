import type { Explanation, KeyFinding, Severity } from "./types";

const glossary = [
  {
    term: "stenosis",
    regex: /\b(?:central canal )?stenosis\b/i,
    plain: "Narrowing of a space where nerves travel.",
    question: "How much narrowing is present, and does it match my symptoms?"
  },
  {
    term: "disc bulge",
    regex: /\b(?:disc bulg(?:e|ing)|disc protrusion|protrusion)\b/i,
    plain: "A spinal disc is pushing outward, often from wear-and-tear changes.",
    question: "Is the disc bulge touching or irritating a nerve?"
  },
  {
    term: "herniation",
    regex: /\bherniat(?:ion|ed)\b/i,
    plain: "Part of a disc has pushed out farther than usual.",
    question: "Is the herniation expected to improve, and what symptoms should I watch for?"
  },
  {
    term: "spondylolisthesis",
    regex: /\bspondylolisthesis\b/i,
    plain: "One spinal bone has slipped slightly compared with the bone next to it.",
    question: "Is the slipping stable, and are follow-up images needed?"
  },
  {
    term: "facet arthritis",
    regex: /\b(?:facet arthropathy|facet arthritis|facet hypertrophy)\b/i,
    plain: "Small joints in the back of the spine show arthritis or wear-and-tear change.",
    question: "Could facet arthritis be contributing to my pain?"
  },
  {
    term: "degenerative changes",
    regex: /\bdegenerative\b/i,
    plain: "Wear-and-tear changes are described in the report.",
    question: "Are these changes typical for my age and history?"
  },
  {
    term: "foraminal narrowing",
    regex: /\bforaminal (?:narrowing|stenosis)\b/i,
    plain: "The opening where a nerve exits is narrowed.",
    question: "Which nerve opening is narrowed, and could that explain symptoms in my arm or leg?"
  },
  {
    term: "nerve root compression",
    regex: /\b(?:nerve root|root) (?:compression|impingement|contact)\b/i,
    plain: "The report describes pressure on or contact with a nerve.",
    question: "Does the nerve finding match my pain, numbness, tingling, or weakness?"
  },
  {
    term: "effusion",
    regex: /\beffusion\b/i,
    plain: "Extra fluid is present in or around a joint or body space.",
    question: "What might be causing the extra fluid?"
  },
  {
    term: "edema",
    regex: /\bedema\b/i,
    plain: "Swelling or extra fluid is seen in the tissue.",
    question: "What does the swelling suggest in my situation?"
  },
  {
    term: "tear",
    regex: /\btear\b/i,
    plain: "A structure such as a tendon, ligament, cartilage, or muscle may be partly or fully torn.",
    question: "Is the tear partial or complete, and what activities should I avoid until follow-up?"
  },
  {
    term: "mass",
    regex: /\bmass\b(?!\s+effect)/i,
    plain: "The report describes an area or growth that needs clinical follow-up.",
    question: "What follow-up testing or specialist visit is recommended?"
  },
  {
    term: "nodule",
    regex: /\bnodule\b/i,
    plain: "A small rounded spot is described in the report.",
    question: "Does this nodule need comparison with older imaging or follow-up imaging?"
  }
];

const urgentTerms = [
  { label: "cord compression or cord flattening", regex: /\b(?:cord compression|cord flattening|flattening .* cord|mass effect .* cord)\b/i },
  { label: "cauda equina", regex: /\bcauda equina\b/i },
  { label: "fracture", regex: /\bfracture\b/i },
  { label: "mass", regex: /\bmass\b(?!\s+effect)/i },
  { label: "aneurysm", regex: /\baneurysm\b/i },
  { label: "bleed", regex: /\b(?:bleed|hemorrhage)\b/i },
  { label: "abscess", regex: /\babscess\b/i },
  { label: "infection", regex: /\binfection\b/i }
];

function inferSeverity(text: string): Severity {
  if (/\bsevere\b/i.test(text)) return "severe";
  if (/\bmoderate\b/i.test(text)) return "moderate";
  if (/\bmild\b/i.test(text)) return "mild";
  return "unspecified";
}

function locationFromText(text: string): string {
  const level = text.match(/\b(?:C|T|L|S)\d(?:[-/](?:C|T|L|S)?\d)?\b/i)?.[0];
  if (level) return level.toUpperCase();
  const side = text.match(/\b(left|right|bilateral|central|midline)\b/i)?.[0];
  return side ? side.toLowerCase() : "Location not clearly stated";
}

function spineSections(text: string) {
  const matches = [...text.matchAll(/\b([CTL]\d(?:[-–](?:[CTL])?\d)?)\s*:\s*/gi)];
  return matches.map((match, index) => {
    const start = match.index || 0;
    const next = matches[index + 1]?.index ?? text.length;
    const sectionText = text.slice(start, next).split(/\n(?:Apart\b|IMPRESSION\b|--)/i)[0];
    return {
      level: match[1].replace("–", "-").replace(/([CTL])(\d)-(?=\d)/i, "$1$2-$1").toUpperCase(),
      text: sectionText
    };
  });
}

function isNegatedFinding(sectionText: string, term: string) {
  const text = sectionText.replace(/\s+/g, " ").toLowerCase();
  if ((term === "herniation" || term === "disc bulge") && /no disc herniation or bulg(?:e|ing)/i.test(text)) {
    return true;
  }
  if (term === "stenosis" && /no (?:canal or foraminal|central canal|canal) stenosis/i.test(text)) {
    return true;
  }
  if (term === "foraminal narrowing" && /no (?:canal or foraminal|foraminal) stenosis/i.test(text)) {
    return true;
  }
  return false;
}

function sectionFindings(reportText: string): KeyFinding[] {
  const sections = spineSections(reportText);
  if (sections.length < 2) return [];

  return sections.flatMap((section) =>
    glossary
      .filter((item) => item.regex.test(section.text) && !isNegatedFinding(section.text, item.term))
      .slice(0, 4)
      .map((item) => ({
        medical_term: item.term,
        plain_language_explanation: item.plain,
        severity: inferSeverity(section.text),
        body_location: section.level,
        possible_symptoms: "This may or may not cause symptoms. Symptoms depend on location and your exam.",
        doctor_followup: item.question
      }))
  );
}

export function fallbackExplanation(reportText: string, examType: string, bodyRegion: string): Explanation {
  const findingsFromSections = sectionFindings(reportText);
  const findings: KeyFinding[] =
    findingsFromSections.length > 0
      ? findingsFromSections
      : glossary
          .filter((item) => item.regex.test(reportText))
          .slice(0, 7)
          .map((item) => ({
            medical_term: item.term,
            plain_language_explanation: item.plain,
            severity: inferSeverity(reportText),
            body_location: locationFromText(reportText),
            possible_symptoms: "This may or may not cause symptoms. Symptoms depend on location and your exam.",
            doctor_followup: item.question
          }));

  const redFlags = urgentTerms
    .filter((term) => term.regex.test(reportText))
    .map((term) => `The report mentions "${term.label}". Contact your clinician promptly. Seek urgent care now for severe or worsening symptoms.`);

  const safeFindings: KeyFinding[] =
    findings.length > 0
      ? findings
      : [
          {
            medical_term: "No specific glossary term detected",
            plain_language_explanation:
              "The app could not confidently identify a common finding from the report text. Review the exact wording with your clinician.",
            severity: "unspecified",
            body_location: "Not specified",
            possible_symptoms: "Symptoms cannot be estimated from this text alone.",
            doctor_followup: "Can you walk me through the main impression of this report?"
          }
        ];

  return {
    exam_type: examType || "Imaging exam",
    body_region: bodyRegion || "Body area not specified",
    plain_english_summary:
      "Your report describes imaging findings that should be reviewed with the clinician who ordered the test. This explanation summarizes the written report in plain language and does not interpret the images.",
    key_findings: safeFindings,
    red_flags: redFlags,
    questions_for_doctor: [
      "What are the main findings in this report?",
      "Do the findings match my symptoms and physical exam?",
      "Do I need follow-up imaging, a referral, or any activity limits?",
      "What symptoms should make me call you or seek urgent care?"
    ],
    image_prompt: `Create a simple patient education diagram for a ${examType || "medical imaging"} report of the ${bodyRegion || "reported body area"}, highlighting: ${safeFindings
      .map((item) => item.medical_term)
      .join(", ")}.`,
    disclaimer:
      "This is not a diagnostic tool. It explains the written imaging report only and does not replace a physician, radiologist, or clinical evaluation."
  };
}
