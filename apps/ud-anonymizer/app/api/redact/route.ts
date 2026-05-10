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
    
    const { text, metadata } = await parseDocument(file.name, buffer, file.type, { targetLanguage: language });

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key'
    });

    const prompt = `You are a military-grade HIPAA compliance engine.
Please scan the following text and replace ALL Personally Identifiable Information (PII) including Names, SSNs, Dates of Birth, Addresses, and Phone Numbers with the exact string "[REDACTED]".
Do not modify any other text. Maintain the original formatting as much as possible.
If the target language is not English, output the response in ${language}.

Text:
${text.substring(0, 50000)}
`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        redactedText: `[REDACTED] was born on [REDACTED] and lives at [REDACTED].\n(Simulated Redaction since no Anthropic API Key is present)`,
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
      redactedText: response.content[0].text,
      metadata
    });

  } catch (error: any) {
    console.error("Redaction Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
