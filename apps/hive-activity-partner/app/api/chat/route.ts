import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, clearance, toneProfile } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simulate latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    let reply = "";

    // 1. RBAC Sandbox Logic (Mocked)
    const isAskingAboutFinancials = lastMessage.includes("finance") || lastMessage.includes("revenue") || lastMessage.includes("q3") || lastMessage.includes("profit") || lastMessage.includes("financials");
    
    if (isAskingAboutFinancials) {
      if (clearance === "L1_PUBLIC" || clearance === "L2_INTERNAL") {
        reply = "I'm sorry, but my active memory partition is sandboxed to your current security clearance. I cannot access Q3 financial data or revenue projections. I can, however, assist you with company-wide schedules, HR manuals, or standard operational procedures.";
        return NextResponse.json({ role: "assistant", content: reply });
      } else {
        reply = "Accessing restricted vector space... Our Q3 revenue projection is sitting at $8.4M ARR, primarily driven by the new Enterprise AAC licensing model. The margins remain healthy at 82%.";
      }
    } else {
      reply = `I have received your query regarding "${lastMessage.substring(0, 30)}...". I am accessing the standard operational data pool to assist you.`;
    }

    // 2. Tone Engine Modification (Mocked)
    if (toneProfile === "gentle") {
      reply = `*Warmly:* ${reply} Please let me know if there's absolutely anything else I can do to support you today.`;
    } else if (toneProfile === "direct") {
      reply = `[Direct Response]: ${reply} Proceed.`;
    } else if (toneProfile === "energetic") {
      reply = `*Enthusiastically:* ${reply} We are absolutely crushing it! Let's keep the momentum going! 🚀`;
    }

    return NextResponse.json({ role: "assistant", content: reply });
    
  } catch (error) {
    console.error('AAC Inference Error:', error);
    return NextResponse.json({ error: 'Inference Engine Error' }, { status: 500 });
  }
}
