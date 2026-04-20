import ExifReader from 'exifreader'
import sharp from 'sharp'
import type { ExtractedMetadata } from '@/lib/types/pipeline'

/**
 * Extract image metadata from a buffer.
 * Width/height are authoritative from sharp.
 * takenAt fallback chain: exif DateTimeOriginal → filename date pattern → new Date()
 */
export async function extractMetadata(
  buffer: Buffer,
  filename?: string
): Promise<ExtractedMetadata> {
  // Get authoritative dimensions from sharp
  const sharpMeta = await sharp(buffer).metadata()
  const width = sharpMeta.width ?? 0
  const height = sharpMeta.height ?? 0
  const orientation = sharpMeta.orientation ?? null

  let tags: ExifReader.Tags = {} as ExifReader.Tags
  try {
    tags = ExifReader.load(buffer)
  } catch {
    // Non-fatal
  }

  // Timestamp
  let takenAt: Date | null = null
  let takenAtConfidence: 'exif' | 'filename' | 'upload' = 'upload'

  const exifDate = tags['DateTimeOriginal']?.description as string | undefined
  if (exifDate) {
    const normalized = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
    const parsed = new Date(normalized)
    if (!isNaN(parsed.getTime())) {
      takenAt = parsed
      takenAtConfidence = 'exif'
    }
  }

  if (!takenAt && filename) {
    const match = filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})/)
    if (match) {
      const parsed = new Date(`${match[1]}-${match[2]}-${match[3]}`)
      if (!isNaN(parsed.getTime())) {
        takenAt = parsed
        takenAtConfidence = 'filename'
      }
    }
  }

  if (!takenAt) takenAt = new Date()

  // GPS
  let gpsLat: number | null = null
  let gpsLng: number | null = null

  try {
    const latTag = tags['GPSLatitude']
    const lngTag = tags['GPSLongitude']
    const latRef = tags['GPSLatitudeRef']?.description as string | undefined
    const lngRef = tags['GPSLongitudeRef']?.description as string | undefined

    if (latTag && lngTag) {
      gpsLat = parseGpsCoord(latTag.value, latRef)
      gpsLng = parseGpsCoord(lngTag.value, lngRef)
    }
  } catch {
    gpsLat = null
    gpsLng = null
  }

  // Camera
  const cameraMake = (tags['Make']?.description as string) ?? null
  const cameraModel = (tags['Model']?.description as string) ?? null

  return {
    width,
    height,
    takenAt,
    takenAtConfidence,
    gpsLat,
    gpsLng,
    cameraMake,
    cameraModel,
    orientation,
  }
}

type GpsValue = Array<[number, number]> | number | unknown

function parseGpsCoord(value: GpsValue, ref?: string): number {
  let decimal: number

  if (Array.isArray(value)) {
    const toDecimal = (pair: unknown): number => {
      if (Array.isArray(pair) && pair.length === 2) {
        return (pair[0] as number) / (pair[1] as number)
      }
      return pair as number
    }
    const deg = toDecimal(value[0])
    const min = toDecimal(value[1])
    const sec = toDecimal(value[2])
    decimal = deg + min / 60 + sec / 3600
  } else {
    decimal = value as number
  }

  if (ref === 'S' || ref === 'W') decimal = -decimal
  return decimal
}
