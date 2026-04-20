export interface PresignRequest {
  filename: string
  mimeType: string
  fileSize: number
  sha256Hash: string
}

export interface PresignResponse {
  isDuplicate: boolean
  existingId?: string
  photoId?: string
  uploadUrl?: string
  storageKey?: string
}

export interface CompleteUploadRequest {
  photoId: string
  storageKey: string
}

export interface CompleteUploadResponse {
  success: boolean
  photoId: string
  isNearDuplicate?: boolean
  nearDuplicateOfId?: string
}

export interface ExtractedMetadata {
  width: number
  height: number
  takenAt: Date
  takenAtConfidence: 'exif' | 'filename' | 'upload'
  gpsLat: number | null
  gpsLng: number | null
  cameraMake: string | null
  cameraModel: string | null
  orientation: number | null
}
