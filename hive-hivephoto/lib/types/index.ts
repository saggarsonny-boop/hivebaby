// ─── Upload / Processing status enums ────────────────────────────────────────

export type UploadStatus = 'awaiting_upload' | 'uploaded' | 'abandoned'
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error'
export type DuplicateReviewStatus = 'pending' | 'kept_new' | 'kept_original' | 'kept_both'
export type TakenAtConfidence = 'exif' | 'filename' | 'upload'
export type AgeGroup = 'child' | 'teen' | 'adult' | 'elderly'

// ─── Core DB row types (camelCase mirrors DB snake_case columns) ───────────────

export interface Photo {
  id: string
  userId: string
  originalKey: string | null
  thumbKey: string | null
  thumbUrl: string | null
  format: string | null
  fileSizeBytes: number | null
  width: number | null
  height: number | null
  isProvisional: boolean
  uploadStatus: UploadStatus
  takenAt: Date
  takenAtConfidence: TakenAtConfidence
  uploadedAt: Date
  gpsLat: number | null
  gpsLng: number | null
  locationName: string | null
  cameraMake: string | null
  cameraModel: string | null
  aiTitle: string | null
  userTitle: string | null
  aiDescription: string | null
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominantColor: string | null
  sha256Hash: string
  pHash: string | null
  isNearDuplicate: boolean
  nearDuplicateOf: string | null
  duplicateReviewStatus: DuplicateReviewStatus
  processingStatus: ProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingLastAttemptedAt: Date | null
  deletedAt: Date | null
}

export interface Person {
  id: string
  userId: string
  name: string
  coverPhotoId: string | null
  photoCount: number
  createdAt: Date
  updatedAt: Date
}

export interface PhotoFace {
  id: string
  photoId: string
  personId: string | null
  boundingBox: BoundingBox
  emotion: string | null
  isLookingAtCamera: boolean | null
  estimatedAgeGroup: AgeGroup | null
  confidence: number | null
  createdAt: Date
}

export interface BoundingBox {
  x: number        // 0–1 relative to image width
  y: number        // 0–1 relative to image height
  width: number    // 0–1
  height: number   // 0–1
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface PresignRequest {
  fileName: string
  contentType: string
  fileSizeBytes: number
  sha256Hash: string          // hex, client-computed before upload
  takenAt?: string            // ISO8601, from EXIF if available client-side
}

export interface PresignResponse {
  photoId: string
  uploadUrl: string           // presigned PUT URL for R2
  uploadFields?: Record<string, string>   // only present for mPut flows
  expiresAt: string           // ISO8601
}

export interface CompleteRequest {
  photoId: string
}

export interface CompleteResponse {
  photoId: string
  processingStatus: ProcessingStatus
}

// ─── Gallery query ────────────────────────────────────────────────────────────

export interface GalleryQuery {
  cursor?: string             // ISO8601 takenAt of last item
  limit?: number
  search?: string
  takenAfter?: string
  takenBefore?: string
}

export interface GalleryPage {
  photos: PhotoSummary[]
  nextCursor: string | null
  total: number
}

export interface PhotoSummary {
  id: string
  thumbUrl: string
  takenAt: string
  aiTitle: string | null
  width: number
  height: number
  isNearDuplicate: boolean
  duplicateReviewStatus: DuplicateReviewStatus
}

// ─── AI analysis inputs / outputs ────────────────────────────────────────────

export interface AiAnalysisResult {
  title: string
  description: string
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominantColor: string
  faces: AiFaceResult[]
  locationName: string | null
}

export interface AiFaceResult {
  boundingBox: BoundingBox
  emotion: string | null
  isLookingAtCamera: boolean | null
  estimatedAgeGroup: AgeGroup | null
  confidence: number | null
}

// ─── Image processing intermediates ──────────────────────────────────────────

export interface ExtractedExif {
  takenAt: Date | null
  takenAtConfidence: TakenAtConfidence
  gpsLat: number | null
  gpsLng: number | null
  cameraMake: string | null
  cameraModel: string | null
  width: number | null
  height: number | null
  format: string | null
}

export interface ImageHashes {
  sha256: string
  pHash: string | null
}
