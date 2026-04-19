import { insertProvisionalPhoto, findExactDuplicate } from '../db/photos'
import { getOrCreateSubscription, checkStorageAvailable } from '../db/subscriptions'
import { createPresignedPutUrl } from '../storage/r2'
import { originalKey, extFromMime, isAllowedContentType, MAX_FILE_SIZE_BYTES } from '../storage/keys'
import type { PresignRequest, PresignResponse } from '../types/photo'

export async function handlePresign(
  userId: string,
  req: PresignRequest
): Promise<PresignResponse> {
  // 1. Validate content type
  if (!isAllowedContentType(req.contentType)) {
    throw new ValidationError(`Unsupported file type: ${req.contentType}`)
  }

  // 2. Validate file size
  if (req.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(`File too large: ${req.fileSizeBytes} bytes (max 5GB)`)
  }

  // 3. Check exact duplicate by SHA-256
  const existing = await findExactDuplicate(userId, req.sha256Hash)
  if (existing) {
    throw new DuplicateError(existing.id)
  }

  // 4. Check storage availability
  const sub = await getOrCreateSubscription(userId)
  const hasSpace = sub.storageLimitBytes === -1 || 
    (sub.storageUsedBytes + req.fileSizeBytes) <= sub.storageLimitBytes
  if (!hasSpace) {
    throw new StorageLimitError(sub.storageLimitBytes, sub.storageUsedBytes)
  }

  // 5. Determine takenAt
  const takenAt = req.takenAt ? new Date(req.takenAt) : new Date()
  const takenAtConfidence = req.takenAtConfidence ?? (req.takenAt ? 'exif' : 'upload')

  // 6. Generate object key
  const ext = extFromMime(req.contentType)
  // We'll use a temp UUID-like key; photoId becomes the authoritative ID
  const tempId = crypto.randomUUID()
  const key = originalKey(userId, tempId, ext)

  // 7. Insert provisional DB row
  const photoId = await insertProvisionalPhoto(userId, {
    ...req,
    originalKey: key,
    takenAt,
    takenAtConfidence,
  })

  // Override key with real photoId
  const finalKey = originalKey(userId, photoId, ext)

  // 8. Generate presigned PUT URL
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const uploadUrl = await createPresignedPutUrl(finalKey, req.contentType, 900)

  // Update key in DB
  const { getDb } = await import('../db/client')
  const sql = getDb()
  await sql`UPDATE photos SET original_key = ${finalKey} WHERE id = ${photoId}`

  return {
    photoId,
    uploadUrl,
    expiresAt: expiresAt.toISOString(),
  }
}

export class ValidationError extends Error {
  status = 400
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}

export class DuplicateError extends Error {
  status = 409
  existingPhotoId: string
  constructor(existingPhotoId: string) {
    super('Exact duplicate detected')
    this.name = 'DuplicateError'
    this.existingPhotoId = existingPhotoId
  }
}

export class StorageLimitError extends Error {
  status = 402
  constructor(limitBytes: number, usedBytes: number) {
    super(`Storage limit reached: ${usedBytes}/${limitBytes} bytes used`)
    this.name = 'StorageLimitError'
  }
}
