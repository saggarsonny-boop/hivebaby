import { getAnthropicClient } from './client'
import type { SearchFilters } from '@/lib/types/search'

const SYSTEM_PROMPT = `You are a photo search query parser. Parse the user's natural language query into structured search filters.
Return a JSON object with these optional fields:
- dateFrom: ISO date string (YYYY-MM-DD)
- dateTo: ISO date string (YYYY-MM-DD)
- objects: array of objects to filter by
- scenes: array of scene types
- emotions: array of emotions/moods
- actions: array of actions
- location: location name string
- personName: person name string
- freeText: remaining free-text

Return ONLY valid JSON. No markdown. Only include fields with clear evidence.`

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: query }],
  })

  const text = response.content.find((c) => c.type === 'text')?.text ?? '{}'

  try {
    const parsed = JSON.parse(text) as Partial<SearchFilters>
    return {
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
      objects: Array.isArray(parsed.objects) ? parsed.objects : undefined,
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : undefined,
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions : undefined,
      actions: Array.isArray(parsed.actions) ? parsed.actions : undefined,
      location: parsed.location,
      personName: parsed.personName,
      freeText: parsed.freeText ?? (Object.keys(parsed).length === 0 ? query : undefined),
    }
  } catch {
    return { freeText: query }
  }
}
