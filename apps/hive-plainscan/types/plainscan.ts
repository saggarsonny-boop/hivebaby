export type Severity = "mild" | "moderate" | "severe" | "not specified";

export interface Finding {
  level: string | null;
  finding: string;
  plainLanguage: string;
  severity: Severity;
  possibleSymptoms: string[];
}

export interface ExplainResult {
  bodyRegion: string;
  reportType: string;
  summary: string;
  findings: Finding[];
  questionsForDoctor: string[];
  redFlags: string[];
  disclaimer: string;
}

export interface ExplainError {
  error: string;
}

export type ExplainPayload = ExplainResult | ExplainError;

export type ExplainRequestBody =
  | { reportText: string }
  | { imageBase64: string; mediaType: "image/jpeg" | "image/png" };
