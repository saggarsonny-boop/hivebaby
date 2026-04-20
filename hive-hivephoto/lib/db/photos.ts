import { sql } from './client'
import type { DbPhoto } from '@/lib/types/db'
import type { Photo } from '@/lib/types/photo'
import type { SearchFilters } from '@/lib/types/search'
import { mapPhoto } from './mappers'
import { hammingDistance } from '@/lib/image/hash'

export async function createProvisionalPhoto(params: {
  userId: string
  sha256Hash: string
  format: string
  fileSizeBytes: number
  takenAt: Date
  takenAtConfidence: 'exif' | 'filename' | 'upload'
}): Promise<string> {
  const rows = await sql`
    INSERT INTO photos (
      user_id, sha256_hash, format, file_size_bytes,
      taken_at, taken_at_confidence, is_provisional, upload_status, processing_status
    ) VALUES (
      ${params.userId}, ${params.sha256Hash}, ${params.format},
      ${params.fileSizeBytes}, ${params.takenAt.toISOString()},
      ${params.takenAtConfidence}, TRUE, 'awaiting_upload', 'pending'
    )
    RETURNING id
  `
  return (rows[0] as { id: string }).id
}

export async function findPhotoByHash(userId: string, sha256Hash: string): Promise<Photo | null> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND sha256_hash = ${sha256Hash}
      AND upload_status = 'uploaded'
      AND deleted_at IS NULL
    LIMIT 1
  `
  if (!rows.length) return null
  return mapPhoto(rows[0] as unknown as DbPhoto)
}

export async function getPhotoById(id: string, userId: string): Promise<Photo | null> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
    LIMIT 1
  `
  if (!rows.length) return null
  return mapPhoto(rows[0] as unknown as DbPhoto)
}

export async function getPhotosByUser(userId: string, limit = 50, offset = 0): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND is_provisional = FALSE
      AND is_near_duplicate = FALSE
      AND deleted_at IS NULL
    ORDER BY taken_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return (rows as unknown as DbPhoto[]).map(mapPhoto)
}

export async function countPhotosByUser(userId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS cnt FROM photos
    WHERE user_id = ${userId}
      AND is_provisional = FALSE
      AND deleted_at IS NULL
  `
  return (rows[0] as { cnt: number }).cnt
}

export async function updatePhotoAfterUpload(params: {
  id: string
  originalKey: string
  thumbKey: string
  thumbUrl: string
  format: string
  fileSizeBytes: number
  width: number
  height: number
  takenAt: Date
  takenAtConfidence: 'exif' | 'filename' | 'upload'
  gpsLat: number | null
  gpsLng: number | null
  cameraMake: string | null
  cameraModel: string | null
  pHash: string | null
  locationName?: string | null
}): Promise<void> {
  await sql`
    UPDATE photos SET
      original_key = ${params.originalKey},
      thumb_key = ${params.thumbKey},
      thumb_url = ${params.thumbUrl},
      format = ${params.format},
      file_size_bytes = ${params.fileSizeBytes},
      width = ${params.width},
      height = ${params.height},
      taken_at = ${params.takenAt.toISOString()},
      taken_at_confidence = ${params.takenAtConfidence},
      gps_lat = ${params.gpsLat},
      gps_lng = ${params.gpsLng},
      camera_make = ${params.cameraMake},
      camera_model = ${params.cameraModel},
      p_hash = ${params.pHash},
      location_name = ${params.locationName ?? null},
      is_provisional = FALSE,
      upload_status = 'uploaded',
      processing_status = 'pending'
    WHERE id = ${params.id}
  `
}

export async function updatePhotoAiResults(params: {
  id: string
  title: string
  description: string
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominantColor: string
  locationName: string | null
  faces: Array<{ boundingBox: { x: number; y: number; w: number; h: number }; emotion?: string; isLookingAtCamera?: boolean; estimatedAgeGroup?: string }>
}): Promise<void> {
  await sql`
    UPDATE photos SET
      ai_title = ${params.title},
      ai_description = ${params.description},
      objects = ${params.objects},
      scenes = ${params.scenes},
      emotions = ${params.emotions},
      actions = ${params.actions},
      colors = ${params.colors},
      dominant_color = ${params.dominantColor},
      location_name = COALESCE(location_name, ${params.locationName}),
      processing_status = 'done'
    WHERE id = ${params.id}
  `
}

export async function markPhotoProcessingError(id: string, error: string): Promise<void> {
  await sql`
    UPDATE photos SET
      processing_status = CASE WHEN processing_attempts + 1 >= 3 THEN 'error' ELSE 'pending' END,
      processing_attempts = processing_attempts + 1,
      processing_error = ${error},
      processing_last_attempted_at = NOW()
    WHERE id = ${id}
  `
}

export async function claimPhotosForProcessing(limit: number): Promise<Photo[]> {
  const rows = await sql`
    UPDATE photos SET
      processing_status = 'processing',
      processing_last_attempted_at = NOW()
    WHERE id IN (
      SELECT id FROM photos
      WHERE upload_status = 'uploaded'
        AND processing_status IN ('pending','error')
        AND processing_attempts < 3
        AND deleted_at IS NULL
      ORDER BY uploaded_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `
  return (rows as unknown as DbPhoto[]).map(mapPhoto)
}

export async function findNearDuplicates(userId: string, pHashStr: string): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND p_hash IS NOT NULL
      AND upload_status = 'uploaded'
      AND deleted_at IS NULL
  `
  return (rows as unknown as DbPhoto[])
    .map(mapPhoto)
    .filter((p) => p.pHash && hammingDistance(pHashStr, p.pHash) <= 3)
}

export async function markNearDuplicate(id: string, nearDuplicateOf: string): Promise<void> {
  await sql`
    UPDATE photos SET
      is_near_duplicate = TRUE,
      near_duplicate_of = ${nearDuplicateOf},
      duplicate_review_status = 'pending'
    WHERE id = ${id}
  `
}

export async function updateDuplicateReviewStatus(
  id: string,
  userId: string,
  status: 'kept_new' | 'kept_original' | 'kept_both'
): Promise<void> {
  await sql`
    UPDATE photos SET duplicate_review_status = ${status}
    WHERE id = ${id} AND user_id = ${userId}
  `
}

export async function getPendingDuplicates(userId: string): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND is_near_duplicate = TRUE
      AND duplicate_review_status = 'pending'
      AND deleted_at IS NULL
    ORDER BY uploaded_at DESC
  `
  return (rows as unknown as DbPhoto[]).map(mapPhoto)
}

export async function softDeletePhoto(id: string, userId: string): Promise<void> {
  await sql`
    UPDATE photos SET deleted_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `
}

export async function updateUserTitle(id: string, userId: string, title: string): Promise<void> {
  await sql`
    UPDATE photos SET user_title = ${title}
    WHERE id = ${id} AND user_id = ${userId}
  `
}

export async function searchPhotos(
  userId: string,
  filters: SearchFilters,
  limit = 50,
  offset = 0
): Promise<Photo[]> {
  // Build base query — array operators handled in JS post-filter for simplicity
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND is_provisional = FALSE
      AND is_near_duplicate = FALSE
      AND deleted_at IS NULL
      AND (${filters.dateFrom ?? null}::timestamptz IS NULL OR taken_at >= ${filters.dateFrom ?? null}::timestamptz)
      AND (${filters.dateTo ?? null}::timestamptz IS NULL OR taken_at <= ${filters.dateTo ?? null}::timestamptz)
      AND (${filters.location ?? null} IS NULL OR location_name ILIKE ${'%' + (filters.location ?? '') + '%'})
      AND (${filters.freeText ?? null} IS NULL OR ai_description ILIKE ${'%' + (filters.freeText ?? '') + '%'}
           OR ai_title ILIKE ${'%' + (filters.freeText ?? '') + '%'})
    ORDER BY taken_at DESC
    LIMIT ${limit * 3} OFFSET ${offset}
  `
  let photos = (rows as unknown as DbPhoto[]).map(mapPhoto)

  if (filters.objects?.length) {
    const objs = filters.objects.map((o) => o.toLowerCase())
    photos = photos.filter((p) =>
      objs.some((o) => p.objects.some((po) => po.toLowerCase().includes(o)))
    )
  }
  if (filters.scenes?.length) {
    const sc = filters.scenes.map((s) => s.toLowerCase())
    photos = photos.filter((p) =>
      sc.some((s) => p.scenes.some((ps) => ps.toLowerCase().includes(s)))
    )
  }
  if (filters.emotions?.length) {
    const em = filters.emotions.map((e) => e.toLowerCase())
    photos = photos.filter((p) =>
      em.some((e) => p.emotions.some((pe) => pe.toLowerCase().includes(e)))
    )
  }

  return photos.slice(0, limit)
}

export async function getGeotaggedPhotos(userId: string): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND gps_lat IS NOT NULL
      AND gps_lng IS NOT NULL
      AND is_provisional = FALSE
      AND deleted_at IS NULL
    ORDER BY taken_at DESC
    LIMIT 1000
  `
  return (rows as unknown as DbPhoto[]).map(mapPhoto)
}

export async function deleteProvisionalPhotos(olderThanMinutes: number): Promise<number> {
  const rows = await sql`
    DELETE FROM photos
    WHERE is_provisional = TRUE
      AND upload_status = 'awaiting_upload'
      AND uploaded_at < NOW() - (${olderThanMinutes} || ' minutes')::interval
    RETURNING id
  `
  return rows.length
}

export async function getStorageUsedBytes(userId: string): Promise<bigint> {
  const rows = await sql`
    SELECT COALESCE(SUM(file_size_bytes), 0)::bigint AS total
    FROM photos
    WHERE user_id = ${userId}
      AND is_provisional = FALSE
      AND deleted_at IS NULL
  `
  return BigInt((rows[0] as { total: string }).total)
}

export async function getRecentStorageEvents(userId: string, limit = 20): Promise<Array<{
  id: string
  eventType: string
  bytesDelta: number
  storageAfter: number
  createdAt: string
  photoId: string | null
}>> {
  const rows = await sql`
    SELECT * FROM storage_events
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return (rows as Array<{
    id: string
    event_type: string
    bytes_delta: string
    storage_after: string
    created_at: Date
    photo_id: string | null
  }>).map((r) => ({
    id: r.id,
    eventType: r.event_type,
    bytesDelta: Number(r.bytes_delta),
    storageAfter: Number(r.storage_after),
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    photoId: r.photo_id,
  }))
}

export async function trackStorageEvent(params: {
  userId: string
  photoId: string | null
  eventType: 'upload' | 'delete' | 'thumbnail'
  bytesDelta: bigint
  storageAfter: bigint
}): Promise<void> {
  await sql`
    INSERT INTO storage_events (user_id, photo_id, event_type, bytes_delta, storage_after)
    VALUES (${params.userId}, ${params.photoId}, ${params.eventType}, ${params.bytesDelta.toString()}, ${params.storageAfter.toString()})
  `
}
