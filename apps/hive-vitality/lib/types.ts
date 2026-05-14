export type Severity = "mild" | "moderate" | "severe" | "unspecified";

export type KeyFinding = {
  original_report_phrase?: string;
  medical_term: string;
  plain_language_explanation: string;
  severity: Severity;
  severity_if_stated?: string;
  body_location: string;
  anatomic_location?: string;
  laterality_if_stated?: string;
  possible_symptoms: string;
  patient_relevance?: string;
  clinician_review_note?: string;
  doctor_followup: string;
};

export type RedFlagTerm = {
  term: string;
  why_flagged: string;
  clinician_attention_message: string;
};

export type Explanation = {
  exam_type: string;
  body_region: string;
  patient_friendly_title?: string;
  plain_english_summary: string;
  key_findings: KeyFinding[];
  red_flags: string[];
  red_flag_terms_detected?: RedFlagTerm[];
  questions_for_doctor: string[];
  patient_questions?: string[];
  image_prompt: string;
  diagram_prompt?: string;
  disclaimer: string;
  patient_disclaimer?: string;
  requires_physician_approval?: boolean;
};

export type ExplainRequest = {
  reportText: string;
  examType: string;
  bodyRegion: string;
  deleteAfterGeneration: boolean;
};

export type DiagramSource = "ai-image" | "svg-fallback";

export type PhiWarning = {
  type: "name" | "date" | "mrn" | "phone" | "address";
  label: string;
};
