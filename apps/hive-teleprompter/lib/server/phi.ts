const patterns = [
  { label: "mrn", regex: /\b(MRN|medical record number)\s*[:#-]?\s*[A-Z0-9-]{4,}\b/gi },
  { label: "dob", regex: /\b(DOB|date of birth)\s*[:#-]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi },
  { label: "phone", regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  { label: "email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { label: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: "accession", regex: /\b(accession|acct|account)\s*[:#-]?\s*[A-Z0-9-]{5,}\b/gi },
  { label: "name", regex: /\b(patient name|name)\s*[:#-]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g },
  { label: "address", regex: /\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln)\b/gi }
];

export function redactPHI(input: unknown) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  return patterns.reduce((current, item) => current.replace(item.regex, `[REDACTED_${item.label.toUpperCase()}]`), text);
}

export function stripIdentifiersForAi(reportText: string) {
  return redactPHI(reportText).slice(0, 15000);
}

export function classifyPhiPresence(reportText: string) {
  return patterns
    .filter((item) => {
      item.regex.lastIndex = 0;
      return item.regex.test(reportText);
    })
    .map((item) => item.label);
}
