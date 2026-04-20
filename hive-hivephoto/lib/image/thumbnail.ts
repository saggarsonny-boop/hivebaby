import sharp from 'sharp'

/**
 * Generate a thumbnail: max 800px wide, WebP quality 80, orientation-corrected.
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Auto-rotate from EXIF orientation
    .resize(800, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer()
}
