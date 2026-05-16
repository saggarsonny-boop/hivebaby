import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client (will safely fail if no key is provided in dev)
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// Mock Data for the RBAC Sandbox
const ENTERPRISE_DATA = {
  L1_PUBLIC: "You have access to basic operational manuals, employee handbooks, and cafeteria schedules.",
  L3_CONFIDENTIAL: "You have access to L1 data, plus engineering roadmaps, Q2 architectural specs, and internal hiring plans.",
  L5_EXECUTIVE: "You have access to all data, including Q3 financial projections ($8.4M ARR, 82% margin), M&A targets, and confidential executive summaries."
};

function getSystemPrompt(clearance: string, toneProfile: string) {
  let roleData = ENTERPRISE_DATA[clearance as keyof typeof ENTERPRISE_DATA] || ENTERPRISE_DATA.L1_PUBLIC;
  
  let toneInstruction = "Be helpful and professional.";
  if (toneProfile === "gentle") toneInstruction = "Speak warmly, with extreme empathy and patience. Use phrases that make the user feel supported.";
  if (toneProfile === "direct") toneInstruction = "Be extremely concise, blunt, and direct. No fluff. Use bracketed [System Message] formats where appropriate.";
  if (toneProfile === "energetic") toneInstruction = "Be highly enthusiastic! Use emojis 🚀. Pace the user to be excited and productive!";

  return `You are the Adaptive AI Activity Companion (AAC), an enterprise-grade AI assistant. 
Your current active memory partition is sandboxed to the user's Active Directory clearance level: ${clearance}.
You MUST NOT invent or hallucinate data outside of this clearance. 

Here is the data you are permitted to access: 
${roleData}

If the user asks for data outside their clearance (e.g., asking for financials while on L1_PUBLIC), you must strictly deny access, citing their security clearance limit.

Tone Instruction: ${toneInstruction}`;
}

export async function POST(req: Request) {
  try {
    const { messages, clearance, toneProfile } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(clearance, toneProfile);

    // If Anthropic is connected, try to use real inference
    if (anthropic) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        });
        
        const content = response.content[0].type === 'text' ? response.content[0].text : "Unprocessable format.";
        return NextResponse.json({ role: "assistant", content });
      } catch (anthropicError) {
        console.warn('Anthropic API failed or rate-limited. Falling back to mocked sandbox logic seamlessly.', anthropicError);
        // Do not return 500. Fall through to the mock logic below.
      }
    }

    // Fallback Mock Logic (If API key is missing during local dev)
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate latency

    let reply = "";
    const isAskingAboutFinancials = lastMessage.includes("finance") || lastMessage.includes("revenue") || lastMessage.includes("q3");
    
    if (isAskingAboutFinancials) {
      if (clearance === "L1_PUBLIC" || clearance === "L3_CONFIDENTIAL") {
        reply = "I'm sorry, but my active memory partition is sandboxed to your current security clearance. I cannot access Q3 financial data or revenue projections. I can, however, assist you with company-wide schedules or engineering roadmaps.";
      } else {
        reply = "Accessing restricted vector space... Our Q3 revenue projection is sitting at $8.4M ARR, primarily driven by the new Enterprise AAC licensing model. The margins remain healthy at 82%.";
      }
    } else {
      reply = `I have received your query. I am accessing the standard operational data pool to assist you.`;
    }

    if (toneProfile === "gentle") reply = `*Warmly:* ${reply} Please let me know if there's absolutely anything else I can do to support you today.`;
    if (toneProfile === "direct") reply = `[Direct Response]: ${reply}`;
    if (toneProfile === "energetic") reply = `*Enthusiastically:* ${reply} We are absolutely crushing it! Let's keep the momentum going! 🚀`;

    return NextResponse.json({ role: "assistant", content: reply });
    
  } catch (error) {
    console.error('AAC Inference Error:', error);
    return NextResponse.json({ error: 'Inference Engine Error' }, { status: 500 });
  }
}
