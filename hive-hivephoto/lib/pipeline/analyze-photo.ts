import { applyAiEnrichment, markAnalysisFailed } from '../db/photos'
import { insertFaces } from '../db/faces'
import { downloadObject } from '../storage/r2'
import { analyzePhoto } from '../ai/analyze-photo'
import type { Photo } from '../types/photo'

export async function analyzePhotoJob(photo: Photo): Promise<void> {
  if (!photo.originalKey || !photo.format) {
    await markAnalysisFailed(photo.id, 'Missing original key or format')
    return
  }

  try {
    const buffer = await downloadObject(photo.originalKey)

    // Map format to MIME type for Anthropic
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', gif: 'image/gif', heic: 'image/jpeg',
      heif: 'image/jpeg', tiff: 'image/jpeg',
    }
    const mimeType = mimeMap[photo.format.toLowerCase()] ?? 'image/jpeg'

    const result = await analyzePhoto(buffer, mimeType)

    await applyAiEnrichment({
      photoId: photo.id,
      aiTitle: result.title,
      aiDescription: result.description,
      objects: result.objects,
      scenes: result.scenes,
      emotions: result.emotions,
      actions: result.actions,
      colors: result.colors,
      dominantColor: result.dominantColor,
      locationName: result.locationName,
    })

    if (result.faces.length > 0) {
      await insertFaces(photo.id, result.faces)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await markAnalysisFailed(photo.id, message)
    throw err
  }
}
