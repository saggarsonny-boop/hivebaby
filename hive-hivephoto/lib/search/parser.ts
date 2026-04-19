import { parseSearchQuery as aiParse } from '../ai/parse-search'
import { executeSearch } from './query'
import type { PhotoSummary } from '../types/photo'

export async function search(userId: string, rawQuery: string): Promise<PhotoSummary[]> {
  const parsed = await aiParse(rawQuery)
  return executeSearch(userId, parsed)
}
