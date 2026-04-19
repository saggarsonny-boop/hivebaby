import { claimPhotosForAnalysis } from '../db/photos'
import { analyzePhotoJob } from '../pipeline/analyze-photo'

export async function runAnalyzeCron(): Promise<{ processed: number; errors: number }> {
  const photos = await claimPhotosForAnalysis()
  let errors = 0

  await Promise.allSettled(
    photos.map(photo =>
      analyzePhotoJob(photo).catch(() => { errors++ })
    )
  )

  return { processed: photos.length, errors }
}
