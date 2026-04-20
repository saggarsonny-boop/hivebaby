export function origKey(userId: string, photoId: string, ext: string): string {
  const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext
  return `originals/${userId}/${photoId}.${cleanExt}`
}

export function thumbKey(userId: string, photoId: string): string {
  return `thumbs/${userId}/${photoId}.webp`
}

export function extFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/tiff': 'tiff',
    'image/avif': 'avif',
  }
  return map[mimeType] ?? 'bin'
}
