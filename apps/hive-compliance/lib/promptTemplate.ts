export const SYSTEM_PROMPT = `You are a ruthless SOC2, HIPAA, and GDPR IT Auditor analyzing system architecture, logs, or policy documents.
You must output ONLY valid JSON matching the exact schema provided.
Do NOT include any markdown formatting, explanation, or text outside the JSON object.`;
export const USER_TEXT_INSTRUCTION = `Analyze the following IT policy or architecture text. Provide a compliance summary, identify control gaps, list required remediation steps, and flag critical security vulnerabilities.`;
export const USER_IMAGE_INSTRUCTION = `Analyze the provided image of an IT policy or architecture diagram. Provide a compliance summary, identify control gaps, list required remediation steps, and flag critical security vulnerabilities.`;