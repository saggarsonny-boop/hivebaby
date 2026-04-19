import sharp from 'sharp'
import type { ThumbnailResult } from '../types/pipeline'

const THUMB_WIDTH = 800
const THUMB_QUALITY = 82

export async function generateThumbnail(
  buffer: Buffer,
  orientation: number | null
): Promise<ThumbnailResult> {
  let pipeline = sharp(buffer)

  // Rotate according to EXIF orientation before resizing
  if (orientation && orientation !== 1) {
    pipeline = pipeline.rotate()
  }

  const { data, info } = await pipeline
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    format: 'webp',
    sizeBytes: info.size,
  }
}

export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(buffer).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions')
  }
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format ?? 'unknown',
  }
}
