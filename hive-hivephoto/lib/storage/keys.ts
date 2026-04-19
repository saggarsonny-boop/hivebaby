// Canonical R2 key conventions

export function originalKey(userId: string, photoId: string, ext: string): string {
  return `originals/${userId}/${photoId}.${ext}`
}

export function thumbKey(userId: string, photoId: string): string {
  return `thumbs/${userId}/${photoId}.webp`
}

export function thumbPublicUrl(baseUrl: string, userId: string, photoId: string): string {
  return `${baseUrl}/thumbs/${userId}/${photoId}.webp`
}

export function extFromMime(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/tiff': 'tiff',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/x-adobe-dng': 'dng',
    'image/x-canon-cr2': 'cr2',
    'image/x-canon-cr3': 'cr3',
    'image/x-nikon-nef': 'nef',
    'image/x-sony-arw': 'arw',
    'image/x-fuji-raf': 'raf',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
  }
  return map[contentType] ?? 'bin'
}

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/heic', 'image/heif', 'image/tiff', 'image/avif',
  'image/bmp', 'image/x-adobe-dng', 'image/x-canon-cr2',
  'image/x-canon-cr3', 'image/x-nikon-nef', 'image/x-sony-arw',
  'image/x-fuji-raf', 'video/mp4', 'video/quicktime', 'video/x-msvideo',
])

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024 // 5GB (R2 max via single PUT)

export function isAllowedContentType(ct: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(ct)
}
