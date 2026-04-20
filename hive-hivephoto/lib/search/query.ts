import { searchPhotos } from '@/lib/db/photos'
import { parseQuery } from './parser'
import type { SearchFilters } from '@/lib/types/search'
import type { Photo } from '@/lib/types/photo'

export async function executeSearch(
  userId: string,
  rawQuery: string,
  limit = 50,
  offset = 0
): Promise<{ filters: SearchFilters; photos: Photo[]; total: number }> {
  const filters = await parseQuery(rawQuery)
  const photos = await searchPhotos(userId, filters, limit, offset)
  return { filters, photos, total: photos.length }
}
