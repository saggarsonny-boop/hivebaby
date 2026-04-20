import { parseSearchQuery } from '@/lib/ai/parse-search'
import type { SearchFilters } from '@/lib/types/search'

export async function parseQuery(query: string): Promise<SearchFilters> {
  if (!query.trim()) return {}
  return parseSearchQuery(query)
}
