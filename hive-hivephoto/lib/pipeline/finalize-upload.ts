// GOVERNANCE: Photos are NEVER deleted due to tier changes or downgrades.
// Photos are NEVER held hostage. On downgrade: all existing photos remain
// accessible and downloadable. New uploads blocked only if over storage limit.
// This is a Hive governance rule — not a product decision.

import { objectExists, getObjectBuffer, putObject } from '@/lib/storage/r2'
import { extractMetadata } from '@/lib/image/metadata'
import { pHash } from '@/lib/image/hash'
import { generateThumbnail } from '@/lib/image/thumbnail'
import {
  updatePhotoAfterUpload,
  findNearDuplicates,
  markNearDuplicate,
  getStorageUsedBytes,
  trackStorageEvent,
} from '@/lib/db/photos'
import { thumbKey } from '@/lib/storage/keys'
import { env } from '@/lib/env'
import type { CompleteUploadResponse } from '@/lib/types/pipeline'

export async function finalizeUpload(
  userId: string,
  photoId: string,
  storageKey: string,
  filename?: string
): Promise<CompleteUploadResponse> {
  // Verify object exists in R2
  const exists = await objectExists(env.R2_BUCKET_ORIGINALS, storageKey)
  if (!exists) throw new Error(`Object not found in R2: ${storageKey}`)

  const buffer = await getObjectBuffer(env.R2_BUCKET_ORIGINALS, storageKey)
  const metadata = await extractMetadata(buffer, filename)
  const photoHash = await pHash(buffer)

  const thumb = await generateThumbnail(buffer)
  const tKey = thumbKey(userId, photoId)
  await putObject(env.R2_BUCKET_THUMBS, tKey, thumb, 'image/webp')

  const thumbUrl = `${env.R2_PUBLIC_THUMB_URL}/${tKey}`
  const extParts = storageKey.split('.')
  const format = extParts[extParts.length - 1] ?? 'jpg'

  await updatePhotoAfterUpload({
    id: photoId,
    originalKey: storageKey,
    thumbKey: tKey,
    thumbUrl,
    format,
    fileSizeBytes: buffer.length,
    width: metadata.width,
    height: metadata.height,
    takenAt: metadata.takenAt,
    takenAtConfidence: metadata.takenAtConfidence,
    gpsLat: metadata.gpsLat,
    gpsLng: metadata.gpsLng,
    cameraMake: metadata.cameraMake,
    cameraModel: metadata.cameraModel,
    pHash: photoHash,
  })

  // Track storage event
  const storageAfter = await getStorageUsedBytes(userId)
  await trackStorageEvent({
    userId,
    photoId,
    eventType: 'upload',
    bytesDelta: BigInt(buffer.length),
    storageAfter,
  })

  // Near-duplicate check (only against same user, hamming <= 3)
  const nearDupes = await findNearDuplicates(userId, photoHash)
  const dupes = nearDupes.filter((p) => p.id !== photoId)

  if (dupes.length > 0) {
    await markNearDuplicate(photoId, dupes[0].id)
    return {
      success: true,
      photoId,
      isNearDuplicate: true,
      nearDuplicateOfId: dupes[0].id,
    }
  }

  return { success: true, photoId }
}
