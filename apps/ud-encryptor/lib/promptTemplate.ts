export const SYSTEM_PROMPT = `You are an Universal Document Intelligence Engine performing Universal Document Encryptor.
You must output ONLY valid JSON matching the exact schema provided.
Do NOT include any markdown formatting, explanation, or text outside the JSON object.`;
export const USER_TEXT_INSTRUCTION = `Analyze the following contract text. Extract the core summary, identify high-risk liability traps, list the standard clauses, and formulate questions or negotiation points for counterparty counsel.`;
export const USER_IMAGE_INSTRUCTION = `Analyze the provided image of a contract page. Extract the core summary, identify high-risk liability traps, list the standard clauses, and formulate questions or negotiation points for counterparty counsel.`;