import ExifReader from 'exifreader'
import type { ExtractedExif } from '../types/pipeline'

export async function extractExif(buffer: Buffer, fileName: string): Promise<ExtractedExif> {
  let tags: Record<string, unknown> = {}
  try {
    tags = ExifReader.load(buffer, { expanded: false }) as unknown as Record<string, unknown>
  } catch {
    // Non-EXIF images fail silently
  }

  const takenAt = parseExifDate(tags as ExifReader.Tags)
  const confidence = takenAt ? 'exif' : tryFilenameDate(fileName) ? 'filename' : 'upload'
  const finalDate = takenAt ?? tryFilenameDate(fileName) ?? new Date()

  const lat = parseGps(tags['GPSLatitude'] as ExifReader.XmpTag | undefined, tags['GPSLatitudeRef'] as ExifReader.XmpTag | undefined)
  const lng = parseGps(tags['GPSLongitude'] as ExifReader.XmpTag | undefined, tags['GPSLongitudeRef'] as ExifReader.XmpTag | undefined)

  return {
    takenAt: finalDate,
    takenAtConfidence: confidence as ExtractedExif['takenAtConfidence'],
    gpsLat: lat,
    gpsLng: lng,
    cameraMake: tagString(tags['Make'] as ExifReader.XmpTag | undefined),
    cameraModel: tagString(tags['Model'] as ExifReader.XmpTag | undefined),
    width: tagNumber(tags['Image Width'] as ExifReader.XmpTag | undefined) ?? tagNumber(tags['PixelXDimension'] as ExifReader.XmpTag | undefined),
    height: tagNumber(tags['Image Height'] as ExifReader.XmpTag | undefined) ?? tagNumber(tags['PixelYDimension'] as ExifReader.XmpTag | undefined),
    format: null, // Determined by Sharp
    orientation: tagNumber(tags['Orientation'] as ExifReader.XmpTag | undefined),
  }
}

function parseExifDate(tags: ExifReader.Tags): Date | null {
  const raw = tagString(tags['DateTimeOriginal']) ?? tagString(tags['DateTime'])
  if (!raw) return null
  // EXIF format: "YYYY:MM:DD HH:MM:SS"
  const parts = raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (!parts) return null
  const d = new Date(`${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}:${parts[6]}`)
  return isNaN(d.getTime()) ? null : d
}

function tryFilenameDate(fileName: string): Date | null {
  // Common patterns: IMG_20231225_143022, 2023-12-25_14-30-22, 20231225_143022
  const match = fileName.match(/(\d{4})[_-]?(\d{2})[_-]?(\d{2})[ _T-]?(\d{2})[ _:-]?(\d{2})[ _:-]?(\d{2})/)
  if (!match) return null
  const d = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`)
  return isNaN(d.getTime()) ? null : d
}

function parseGps(
  val: any,
  ref: any
): number | null {
  if (!val) return null
  try {
    const desc = typeof val === 'object' && 'description' in val ? String(val.description) : ''
    const degrees = parseFloat(desc)
    if (isNaN(degrees)) return null
    const direction = ref && 'value' in ref ? String(ref.value) : ''
    return (direction === 'S' || direction === 'W') ? -degrees : degrees
  } catch {
    return null
  }
}

function tagString(tag: any): string | null {
  if (!tag) return null
  const v = 'description' in tag ? String(tag.description) : 'value' in tag ? String(tag.value) : null
  return v?.trim() || null
}

function tagNumber(tag: any): number | null {
  if (!tag) return null
  const v = 'value' in tag ? tag.value : null
  if (v === null || v === undefined) return null
  if (Array.isArray(v)) return typeof v[0] === 'number' ? v[0] : null
  const n = Number(v)
  return isNaN(n) ? null : n
}
