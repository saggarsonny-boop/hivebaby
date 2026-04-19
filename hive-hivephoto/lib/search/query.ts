import { getDb } from '../db/client'
import type { ParsedSearchQuery } from '../types/search'
import type { PhotoSummary } from '../types/photo'
import type { PhotoRow } from '../types/db'
import { mapPhotoSummaryRow } from '../db/mappers'

export async function executeSearch(
  userId: string,
  parsed: ParsedSearchQuery,
  limit = 60
): Promise<PhotoSummary[]> {
  const { filters, fallbackTextQuery } = parsed
  const sql = getDb()

  // Build dynamic query using tagged template literals
  // We construct conditions as an array and join
  const rows = await sql`
    SELECT DISTINCT p.*
    FROM photos p
    ${
      filters.personNames?.length
        ? sql`
          JOIN photo_faces pf ON pf.photo_id = p.id
          JOIN people pe ON pe.id = pf.person_id
        `
        : sql``
    }
    WHERE p.user_id = ${userId}
      AND p.deleted_at IS NULL
      AND p.is_provisional = FALSE
      AND p.upload_status = 'uploaded'
      ${filters.dateAfter ? sql`AND p.taken_at >= ${filters.dateAfter}` : sql``}
      ${filters.dateBefore ? sql`AND p.taken_at <= ${filters.dateBefore}` : sql``}
      ${filters.objects?.length ? sql`AND p.objects && ${filters.objects}` : sql``}
      ${filters.scenes?.length ? sql`AND p.scenes && ${filters.scenes}` : sql``}
      ${filters.emotions?.length ? sql`AND p.emotions && ${filters.emotions}` : sql``}
      ${filters.actions?.length ? sql`AND p.actions && ${filters.actions}` : sql``}
      ${filters.dominantColor ? sql`AND p.dominant_color ILIKE ${filters.dominantColor}` : sql``}
      ${filters.locationName ? sql`AND p.location_name ILIKE ${'%' + filters.locationName + '%'}` : sql``}
      ${filters.cameraModel ? sql`AND p.camera_model ILIKE ${'%' + filters.cameraModel + '%'}` : sql``}
      ${filters.personNames?.length ? sql`AND pe.name = ANY(${filters.personNames})` : sql``}
      ${
        fallbackTextQuery
          ? sql`AND p.ai_description ILIKE ${'%' + fallbackTextQuery + '%'}`
          : sql``
      }
    ORDER BY p.taken_at DESC
    LIMIT ${limit}
  ` as PhotoRow[]

  return rows.map(mapPhotoSummaryRow)
}
