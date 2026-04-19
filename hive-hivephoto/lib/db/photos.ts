import { getDb } from './client'
import { mapPhotoRow, mapPhotoSummaryRow } from './mappers'
import type { PhotoRow } from '../types/db'
import type { Photo, PhotoSummary, PresignRequest, GalleryPage } from '../types/photo'

const MAX_RETRIES = 3
const PROVISIONAL_TTL_MINUTES = 15
const ANALYZE_BATCH_SIZE = 10

// ─── Insert provisional photo record ─────────────────────────────────────────

export async function insertProvisionalPhoto(
  userId: string,
  req: Omit<PresignRequest, 'takenAt' | 'takenAtConfidence'> & {
    originalKey: string
    takenAt: Date
    takenAtConfidence: 'exif' | 'filename' | 'upload'
  }
): Promise<string> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO photos (
      user_id, original_key, sha256_hash,
      taken_at, taken_at_confidence,
      is_provisional, upload_status, processing_status
    ) VALUES (
      ${userId}, ${req.originalKey}, ${req.sha256Hash},
      ${req.takenAt.toISOString()}, ${req.takenAtConfidence},
      TRUE, 'awaiting_upload', 'pending'
    )
    RETURNING id
  ` as { id: string }[]
  return rows[0].id
}

// ─── Check exact duplicate ────────────────────────────────────────────────────

export async function findExactDuplicate(userId: string, sha256Hash: string): Promise<Photo | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND sha256_hash = ${sha256Hash}
      AND deleted_at IS NULL
    LIMIT 1
  ` as PhotoRow[]
  return rows[0] ? mapPhotoRow(rows[0]) : null
}

// ─── Check perceptual near-duplicate via pHash ────────────────────────────────

export async function findNearDuplicates(userId: string, pHash: string, maxHamming = 3): Promise<Photo[]> {
  // Hamming distance via XOR on stored hashes — approximated in SQL using bit_count on xor.
  // For Hobby tier we do a simple LIKE fallback via prefix comparison.
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND p_hash IS NOT NULL
      AND deleted_at IS NULL
      AND is_provisional = FALSE
      AND upload_status = 'uploaded'
      AND (
        -- Bit-level Hamming distance on 64-char hex pHash, computed via similarity
        -- Full hamming done server-side on returned rows
        LEFT(p_hash, 8) = LEFT(${pHash}, 8)
        OR LEFT(p_hash, 16) = LEFT(${pHash}, 16)
      )
    LIMIT 20
  ` as PhotoRow[]

  // Filter by actual Hamming distance server-side
  return rows
    .filter(r => r.p_hash && hammingDistance(r.p_hash, pHash) <= maxHamming)
    .map(mapPhotoRow)
}

function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Infinity
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    const xor = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    dist += xor.toString(2).split('1').length - 1
  }
  return dist
}

// ─── Finalize upload ──────────────────────────────────────────────────────────

export interface FinalizePhotoParams {
  photoId: string
  thumbKey: string
  thumbUrl: string
  format: string
  fileSizeBytes: number
  width: number
  height: number
  gpsLat: number | null
  gpsLng: number | null
  cameraMake: string | null
  cameraModel: string | null
  takenAt: Date
  takenAtConfidence: 'exif' | 'filename' | 'upload'
  pHash: string | null
  isNearDuplicate: boolean
  nearDuplicateOf: string | null
}

export async function finalizePhoto(params: FinalizePhotoParams): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET
      thumb_key = ${params.thumbKey},
      thumb_url = ${params.thumbUrl},
      format = ${params.format},
      file_size_bytes = ${params.fileSizeBytes},
      width = ${params.width},
      height = ${params.height},
      gps_lat = ${params.gpsLat},
      gps_lng = ${params.gpsLng},
      camera_make = ${params.cameraMake},
      camera_model = ${params.cameraModel},
      taken_at = ${params.takenAt.toISOString()},
      taken_at_confidence = ${params.takenAtConfidence},
      p_hash = ${params.pHash},
      is_near_duplicate = ${params.isNearDuplicate},
      near_duplicate_of = ${params.nearDuplicateOf},
      is_provisional = FALSE,
      upload_status = 'uploaded',
      processing_status = 'pending'
    WHERE id = ${params.photoId}
  `
}

// ─── Apply AI enrichment ──────────────────────────────────────────────────────

export interface ApplyAiParams {
  photoId: string
  aiTitle: string
  aiDescription: string
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominantColor: string
  locationName: string | null
}

export async function applyAiEnrichment(params: ApplyAiParams): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET
      ai_title = ${params.aiTitle},
      ai_description = ${params.aiDescription},
      objects = ${params.objects},
      scenes = ${params.scenes},
      emotions = ${params.emotions},
      actions = ${params.actions},
      colors = ${params.colors},
      dominant_color = ${params.dominantColor},
      location_name = ${params.locationName},
      processing_status = 'done',
      processing_error = NULL
    WHERE id = ${params.photoId}
  `
}

// ─── Claim photos for AI analysis (FOR UPDATE SKIP LOCKED) ───────────────────

export async function claimPhotosForAnalysis(): Promise<Photo[]> {
  const sql = getDb()
  const rows = await sql`
    WITH claimed AS (
      SELECT id FROM photos
      WHERE upload_status = 'uploaded'
        AND processing_status IN ('pending', 'error')
        AND processing_attempts < ${MAX_RETRIES}
        AND deleted_at IS NULL
      ORDER BY uploaded_at ASC
      LIMIT ${ANALYZE_BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE photos SET
      processing_status = 'processing',
      processing_attempts = processing_attempts + 1,
      processing_last_attempted_at = NOW()
    FROM claimed
    WHERE photos.id = claimed.id
    RETURNING photos.*
  ` as PhotoRow[]
  return rows.map(mapPhotoRow)
}

// ─── Mark analysis failed ─────────────────────────────────────────────────────

export async function markAnalysisFailed(photoId: string, error: string): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET
      processing_status = CASE
        WHEN processing_attempts >= ${MAX_RETRIES} THEN 'error'
        ELSE 'pending'
      END,
      processing_error = ${error}
    WHERE id = ${photoId}
  `
}

// ─── Gallery query ────────────────────────────────────────────────────────────

export async function getGalleryPage(
  userId: string,
  cursor: string | null,
  limit = 40
): Promise<GalleryPage> {
  const sql = getDb()

  const countRow = await sql`
    SELECT COUNT(*) as total FROM photos
    WHERE user_id = ${userId}
      AND deleted_at IS NULL
      AND is_provisional = FALSE
      AND is_near_duplicate = FALSE
  ` as unknown as { total: string }[]

  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND deleted_at IS NULL
      AND is_provisional = FALSE
      AND is_near_duplicate = FALSE
      ${cursor ? sql`AND taken_at < ${cursor}` : sql``}
    ORDER BY taken_at DESC
    LIMIT ${limit + 1}
  ` as unknown as PhotoRow[]

  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? pageRows[pageRows.length - 1].taken_at.toISOString() : null

  return {
    photos: pageRows.map(mapPhotoSummaryRow),
    nextCursor,
    total: parseInt(String(countRow[0]?.total ?? '0')),
  }
}

// ─── Single photo fetch ───────────────────────────────────────────────────────

export async function getPhotoById(photoId: string, userId: string): Promise<Photo | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM photos
    WHERE id = ${photoId}
      AND user_id = ${userId}
      AND deleted_at IS NULL
    LIMIT 1
  ` as PhotoRow[]
  return rows[0] ? mapPhotoRow(rows[0]) : null
}

// ─── Soft delete ──────────────────────────────────────────────────────────────

export async function softDeletePhoto(photoId: string, userId: string): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET deleted_at = NOW()
    WHERE id = ${photoId} AND user_id = ${userId}
  `
}

// ─── Reanalyze reset ─────────────────────────────────────────────────────────

export async function resetAnalysis(photoId: string, userId: string): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET
      processing_status = 'pending',
      processing_attempts = 0,
      processing_error = NULL
    WHERE id = ${photoId} AND user_id = ${userId}
  `
}

// ─── Duplicate resolution ─────────────────────────────────────────────────────

export async function resolveDuplicate(
  photoId: string,
  userId: string,
  status: 'kept_new' | 'kept_original' | 'kept_both'
): Promise<void> {
  const sql = getDb()
  if (status === 'kept_original') {
    // Delete the near-duplicate (the new one)
    await sql`
      UPDATE photos SET deleted_at = NOW()
      WHERE id = ${photoId} AND user_id = ${userId}
    `
  }
  await sql`
    UPDATE photos SET
      duplicate_review_status = ${status},
      is_near_duplicate = CASE WHEN ${status} = 'kept_both' THEN FALSE ELSE is_near_duplicate END
    WHERE id = ${photoId} AND user_id = ${userId}
  `
}

// ─── Pending duplicates list ──────────────────────────────────────────────────

export async function getPendingDuplicates(userId: string): Promise<Array<{ photo: PhotoSummary; original: PhotoSummary | null }>> {
  const sql = getDb()
  const rows = await sql`
    SELECT p.*, orig.id as orig_id, orig.thumb_url as orig_thumb_url,
           orig.taken_at as orig_taken_at, orig.taken_at_confidence as orig_taken_at_confidence,
           orig.ai_title as orig_ai_title, orig.user_title as orig_user_title,
           orig.width as orig_width, orig.height as orig_height,
           orig.is_near_duplicate as orig_is_near_duplicate,
           orig.duplicate_review_status as orig_duplicate_review_status,
           orig.processing_status as orig_processing_status
    FROM photos p
    LEFT JOIN photos orig ON orig.id = p.near_duplicate_of
    WHERE p.user_id = ${userId}
      AND p.is_near_duplicate = TRUE
      AND p.duplicate_review_status = 'pending'
      AND p.deleted_at IS NULL
    ORDER BY p.uploaded_at DESC
    LIMIT 50
  ` as (PhotoRow & {
    orig_id: string | null; orig_thumb_url: string | null; orig_taken_at: Date | null
    orig_taken_at_confidence: string | null; orig_ai_title: string | null; orig_user_title: string | null
    orig_width: number | null; orig_height: number | null; orig_is_near_duplicate: boolean | null
    orig_duplicate_review_status: string | null; orig_processing_status: string | null
  })[]

  return rows.map(row => ({
    photo: mapPhotoSummaryRow(row),
    original: row.orig_id ? {
      id: row.orig_id,
      thumbUrl: row.orig_thumb_url!,
      takenAt: row.orig_taken_at!,
      takenAtConfidence: (row.orig_taken_at_confidence || 'upload') as PhotoSummary['takenAtConfidence'],
      aiTitle: row.orig_ai_title,
      userTitle: row.orig_user_title,
      width: row.orig_width!,
      height: row.orig_height!,
      isNearDuplicate: row.orig_is_near_duplicate!,
      duplicateReviewStatus: (row.orig_duplicate_review_status || 'pending') as PhotoSummary['duplicateReviewStatus'],
      processingStatus: (row.orig_processing_status || 'pending') as PhotoSummary['processingStatus'],
    } : null,
  }))
}

// ─── Abandon stale provisional uploads ───────────────────────────────────────

export async function abandonStaleProvisional(): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    UPDATE photos SET upload_status = 'abandoned'
    WHERE is_provisional = TRUE
      AND upload_status = 'awaiting_upload'
      AND uploaded_at < NOW() - INTERVAL '${PROVISIONAL_TTL_MINUTES} minutes'
    RETURNING id
  ` as { id: string }[]
  return rows.length
}

// ─── Hard-delete abandoned/old deleted rows ───────────────────────────────────

export async function purgeDeleted(olderThanDays = 30): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    DELETE FROM photos
    WHERE (
      (upload_status = 'abandoned' AND is_provisional = TRUE)
      OR deleted_at < NOW() - INTERVAL '${olderThanDays} days'
    )
    RETURNING id
  ` as { id: string }[]
  return rows.length
}

// ─── Update user title ────────────────────────────────────────────────────────

export async function updateUserTitle(photoId: string, userId: string, title: string): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photos SET user_title = ${title}
    WHERE id = ${photoId} AND user_id = ${userId}
  `
}
