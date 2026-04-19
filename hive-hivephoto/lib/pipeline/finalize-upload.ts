import { getPhotoById, finalizePhoto, findNearDuplicates } from '../db/photos'
import { trackStorageEvent } from '../db/subscriptions'
import { downloadObject, uploadThumbnail } from '../storage/r2'
import { thumbKey, thumbPublicUrl } from '../storage/keys'
import { extractExif } from '../image/metadata'
import { generateThumbnail, getImageDimensions } from '../image/thumbnail'
import { computePHash } from '../image/hash'
import { env } from '../env'
import type { FinalizeResult } from '../types/pipeline'

export async function finalizeUpload(userId: string, photoId: string): Promise<FinalizeResult> {
  // 1. Fetch provisional record
  const photo = await getPhotoById(photoId, userId)
  if (!photo) throw new Error(`Photo not found: ${photoId}`)
  if (!photo.originalKey) throw new Error(`No original key for photo: ${photoId}`)

  // 2. Download from R2
  const buffer = await downloadObject(photo.originalKey)

  // 3. Sharp: authoritative dimensions + format
  const { width, height, format } = await getImageDimensions(buffer)

  // 4. ExifReader: metadata
  const exif = await extractExif(buffer, photo.originalKey.split('/').pop() ?? '')

  // 5. Compute pHash server-side
  const pHash = await computePHash(buffer)

  // 6. Check perceptual near-duplicates
  let isNearDuplicate = false
  let nearDuplicateOf: string | null = null
  if (pHash) {
    const dupes = await findNearDuplicates(userId, pHash)
    if (dupes.length > 0) {
      isNearDuplicate = true
      nearDuplicateOf = dupes[0].id
    }
  }

  // 7. Generate thumbnail (orientation-corrected via Sharp)
  const thumb = await generateThumbnail(buffer, exif.orientation)
  const tKey = thumbKey(userId, photoId)
  const tUrl = thumbPublicUrl(env.r2PublicBaseUrl, userId, photoId)

  // 8. Upload thumbnail to public R2 bucket
  await uploadThumbnail(tKey, thumb.buffer)

  // 9. Finalize DB row
  await finalizePhoto({
    photoId,
    thumbKey: tKey,
    thumbUrl: tUrl,
    format,
    fileSizeBytes: buffer.length,
    width,
    height,
    gpsLat: exif.gpsLat,
    gpsLng: exif.gpsLng,
    cameraMake: exif.cameraMake,
    cameraModel: exif.cameraModel,
    takenAt: exif.takenAt ?? new Date(),
    takenAtConfidence: exif.takenAtConfidence,
    pHash,
    isNearDuplicate,
    nearDuplicateOf,
  })

  // 10. Track storage event
  await trackStorageEvent(userId, photoId, 'upload', buffer.length)
  await trackStorageEvent(userId, photoId, 'thumbnail', thumb.sizeBytes)

  return {
    photoId,
    thumbUrl: tUrl,
    isNearDuplicate,
    nearDuplicateOf,
  }
}
