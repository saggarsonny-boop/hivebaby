import { getAnthropicClient } from './client'
import type { ParsedSearchQuery, SearchFilters } from '../types/search'

const MODEL = 'claude-sonnet-4-5'

const SYSTEM_PROMPT = `You are a photo search query parser. Convert natural language search queries into structured JSON filters.
Return ONLY valid JSON with these optional fields (omit fields that don't apply):
{
  "dateAfter": "ISO8601 date string",
  "dateBefore": "ISO8601 date string",
  "objects": ["list", "of", "objects"],
  "scenes": ["indoor", "outdoor", "beach", etc],
  "emotions": ["happy", "sad", etc],
  "actions": ["running", "eating", etc],
  "locationName": "city or place name",
  "personNames": ["names", "of", "people"],
  "dominantColor": "color name",
  "cameraModel": "camera model",
  "fallbackText": "text to use for full-text search if structured filtering is insufficient"
}
Be conservative — only include fields you are confident about.`

export async function parseSearchQuery(query: string): Promise<ParsedSearchQuery> {
  if (!query.trim()) {
    return {
      filters: { rawQuery: query },
      fallbackTextQuery: null,
      parseConfidence: 'fallback',
    }
  }

  try {
    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Search query: "${query}"` }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    const filters: SearchFilters = {
      rawQuery: query,
      dateAfter: parsed.dateAfter as string | undefined,
      dateBefore: parsed.dateBefore as string | undefined,
      objects: parsed.objects as string[] | undefined,
      scenes: parsed.scenes as string[] | undefined,
      emotions: parsed.emotions as string[] | undefined,
      actions: parsed.actions as string[] | undefined,
      locationName: parsed.locationName as string | undefined,
      personNames: parsed.personNames as string[] | undefined,
      dominantColor: parsed.dominantColor as string | undefined,
      cameraModel: parsed.cameraModel as string | undefined,
    }

    return {
      filters,
      fallbackTextQuery: (parsed.fallbackText as string) ?? null,
      parseConfidence: 'high',
    }
  } catch {
    // Always return something — fall back to full-text search
    return {
      filters: { rawQuery: query },
      fallbackTextQuery: query,
      parseConfidence: 'fallback',
    }
  }
}
