import { findPhotoByHash, createProvisionalPhoto } from '@/lib/db/photos'
import { checkStorageLimit } from '@/lib/pricing/gates'
import { getPresignedPutUrl } from '@/lib/storage/r2'
import { origKey, extFromMime } from '@/lib/storage/keys'
import { env } from '@/lib/env'
import type { PresignRequest, PresignResponse } from '@/lib/types/pipeline'

export async function presignUpload(
  userId: string,
  request: PresignRequest
): Promise<PresignResponse> {
  // Check exact duplicate (sha256_hash per user)
  const existing = await findPhotoByHash(userId, request.sha256Hash)
  if (existing) {
    return { isDuplicate: true, existingId: existing.id }
  }

  // Check storage limit
  const canStore = await checkStorageLimit(userId, request.fileSize)
  if (!canStore) {
    throw Object.assign(new Error('Storage limit exceeded'), { code: 'STORAGE_LIMIT' })
  }

  const ext = extFromMime(request.mimeType)
  // Create provisional row to reserve photoId
  const photoId = await createProvisionalPhoto({
    userId,
    sha256Hash: request.sha256Hash,
    format: ext,
    fileSizeBytes: request.fileSize,
    takenAt: new Date(),
    takenAtConfidence: 'upload',
  })

  const key = origKey(userId, photoId, ext)
  const uploadUrl = await getPresignedPutUrl(env.R2_BUCKET_ORIGINALS, key, request.mimeType, 3600)

  return {
    isDuplicate: false,
    photoId,
    uploadUrl,
    storageKey: key,
  }
}

