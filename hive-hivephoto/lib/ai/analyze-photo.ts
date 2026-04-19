import { getAnthropicClient } from './client'
import type { AiAnalysisResult } from '../types/pipeline'

const MODEL = 'claude-sonnet-4-5'

const SYSTEM_PROMPT = `You are an expert photo analyst. Analyze the provided photo and return a JSON object with these exact fields:
{
  "title": "Short, specific 3-8 word title for this photo",
  "description": "1-2 sentence description of what's in the photo. Be specific — mention people, objects, setting, mood.",
  "objects": ["array", "of", "physical", "objects", "visible"],
  "scenes": ["indoor","outdoor","beach","forest","city","etc"],
  "emotions": ["happy","sad","peaceful","excited","etc — only if clearly present"],
  "actions": ["running","eating","talking","etc — only if happening"],
  "colors": ["dominant", "color", "palette", "as", "color", "names"],
  "dominantColor": "single most prominent color as lowercase color name",
  "faces": [
    {
      "boundingBox": {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.3},
      "emotion": "happy",
      "isLookingAtCamera": true,
      "estimatedAgeGroup": "adult",
      "confidence": 0.9
    }
  ],
  "locationName": "City, Country if GPS or clear visual clues exist, otherwise null"
}
Bounding boxes are 0-1 relative to image dimensions (x,y = top-left corner).
estimatedAgeGroup must be one of: child, teen, adult, elderly, or null.
Return ONLY valid JSON, no markdown, no explanation.`

export async function analyzePhoto(
  imageBuffer: Buffer,
  mimeType: string
): Promise<AiAnalysisResult> {
  const client = getAnthropicClient()

  const base64 = imageBuffer.toString('base64')

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Analyze this photo and return the JSON as specified.',
          },
        ],
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected AI response type')

  return parseAnalysisResponse(content.text)
}

function parseAnalysisResponse(raw: string): AiAnalysisResult {
  // Strip possible markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse AI analysis JSON: ${raw.slice(0, 200)}`)
  }

  return {
    title: String(parsed.title ?? 'Untitled'),
    description: String(parsed.description ?? ''),
    objects: ensureStringArray(parsed.objects),
    scenes: ensureStringArray(parsed.scenes),
    emotions: ensureStringArray(parsed.emotions),
    actions: ensureStringArray(parsed.actions),
    colors: ensureStringArray(parsed.colors),
    dominantColor: String(parsed.dominantColor ?? ''),
    faces: parseFaces(parsed.faces),
    locationName: parsed.locationName ? String(parsed.locationName) : null,
  }
}

function ensureStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.map(String).filter(Boolean)
}

function parseFaces(val: unknown): AiAnalysisResult['faces'] {
  if (!Array.isArray(val)) return []
  return val
    .filter(f => f && typeof f === 'object')
    .map(f => ({
      boundingBox: {
        x: Number(f.boundingBox?.x ?? 0),
        y: Number(f.boundingBox?.y ?? 0),
        width: Number(f.boundingBox?.width ?? 0),
        height: Number(f.boundingBox?.height ?? 0),
      },
      emotion: f.emotion ? String(f.emotion) : null,
      isLookingAtCamera: f.isLookingAtCamera != null ? Boolean(f.isLookingAtCamera) : null,
      estimatedAgeGroup: ['child', 'teen', 'adult', 'elderly'].includes(f.estimatedAgeGroup)
        ? f.estimatedAgeGroup
        : null,
      confidence: f.confidence != null ? Math.min(1, Math.max(0, Number(f.confidence))) : null,
    }))
}
