import { NextResponse } from 'next/server';
import { parseDocument } from '@hive/parser';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'en';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Use the new parser SDK
    const { text, metadata } = await parseDocument(file.name, buffer, file.type, { targetLanguage: language });

    // Send to LLM for M&A Analysis
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key'
    });

    const prompt = `You are a world-class M&A corporate attorney. 
Please analyze the following contract and extract:
1. All Liability Shifts and Indemnifications
2. Governing Law / Jurisdiction
3. Hidden Risk Anomalies (e.g. one-sided termination clauses)
Output your analysis in structured markdown. If the target language is not English, output the response in ${language}.

Contract Text:
${text.substring(0, 50000)} // Chunking to avoid massive token limits
`;

    // Dummy response for local testing if API key is missing
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        analysis: `### M&A Analysis (Simulated)\n\n**1. Liability Shifts:** Found standard mutual indemnification.\n\n**2. Governing Law:** Delaware.\n\n**3. Anomalies:** Section 4.2 contains a non-standard IP assignment clause.`,
        metadata
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0,
      messages: [{ role: "user", content: prompt }]
    });

    return NextResponse.json({
      success: true,
      analysis: response.content[0].text,
      metadata
    });

  } catch (error: any) {
    console.error("Analysis Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
