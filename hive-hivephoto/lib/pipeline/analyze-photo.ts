import { getObjectBuffer, getSignedGetUrl } from '@/lib/storage/r2'
import { analyzePhoto } from '@/lib/ai/analyze-photo'
import { updatePhotoAiResults, markPhotoProcessingError, getPhotoById } from '@/lib/db/photos'
import { insertFaces } from '@/lib/db/faces'
import { env } from '@/lib/env'

export async function analyzePhotoById(photoId: string, userId: string): Promise<void> {
  const photo = await getPhotoById(photoId, userId)
  if (!photo?.originalKey) {
    throw new Error(`Photo ${photoId} has no storage key`)
  }

  try {
    const buffer = await getObjectBuffer(env.R2_BUCKET_ORIGINALS, photo.originalKey)
    const result = await analyzePhoto(buffer)

    await updatePhotoAiResults({
      id: photoId,
      title: result.title,
      description: result.description,
      objects: result.objects,
      scenes: result.scenes,
      emotions: result.emotions,
      actions: result.actions,
      colors: result.colors,
      dominantColor: result.dominantColor,
      locationName: result.locationName ?? null,
      faces: result.faces,
    })

    if (result.faces.length > 0) {
      await insertFaces(
        photoId,
        result.faces.map((f) => ({
          boundingBox: f.boundingBox,
          emotion: f.emotion,
          isLookingAtCamera: f.isLookingAtCamera,
          estimatedAgeGroup: f.estimatedAgeGroup,
        }))
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await markPhotoProcessingError(photoId, message)
    throw error
  }
}
