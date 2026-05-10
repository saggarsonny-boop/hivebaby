import { NextResponse } from 'next/server';
import { parseDocument } from '@hive/parser';
import Anthropic from '@anthropic-ai/sdk';
import { saveUniversalDocument } from '@hive/storage';
import { parseSessionCookie } from '@hive/auth';

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

    const prompt = `You are a world-class Human Resources Compliance expert. Analyze this employee handbook/policy document and extract:
1. Compliance Violations against Federal Labor Standards.
2. Incomplete or ambiguous PTO/Leave policies.
3. Hidden liability regarding wrongful termination language.

Document Text:
${text.substring(0, 50000)} // Chunking to avoid massive token limits
`;

    // Dummy response for local testing if API key is missing
    let analysisResult = `### M&A Analysis (Simulated)\n\n**1. Liability Shifts:** Found standard mutual indemnification.\n\n**2. Governing Law:** Delaware.\n\n**3. Anomalies:** Section 4.2 contains a non-standard IP assignment clause.`;
    
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0,
        messages: [{ role: "user", content: prompt }]
      });
      analysisResult = response.content[0].text;
    }

    // Queen Bee Enforcement: Get owner ID from cookie
    const cookieHeader = request.headers.get('cookie');
    const session = parseSessionCookie(cookieHeader);
    const ownerId = session ? session.userId : 'anonymous_or_mock';

    // Build the Universal Document Object
    const udDocument = {
      id: crypto.randomUUID(),
      sourceEngine: 'ud-hr',
      ownerId: ownerId,
      originalFileName: file.name,
      structuredData: { analysis: analysisResult },
      metadata: {
        language: language,
        parsedAt: new Date().toISOString(),
        wordCount: metadata.wordCount,
        aiModelUsed: 'claude-3-opus-20240229'
      },
      rawText: text.substring(0, 50000)
    };

    // Save to the Neon Ledger
    await saveUniversalDocument(udDocument);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      metadata
    });

  } catch (error: any) {
    console.error("Analysis Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
