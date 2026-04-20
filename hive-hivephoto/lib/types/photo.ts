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
  uploadStatus: 'awaiting_upload' | 'uploaded' | 'abandoned'
  takenAt: string // ISO
  takenAtConfidence: 'exif' | 'filename' | 'upload'
  uploadedAt: string
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
  duplicateReviewStatus: 'pending' | 'kept_new' | 'kept_original' | 'kept_both'
  processingStatus: 'pending' | 'processing' | 'done' | 'error'
  processingError: string | null
  processingAttempts: number
  deletedAt: string | null
}

export interface PhotoFace {
  id: string
  photoId: string
  personId: string | null
  boundingBox: { x: number; y: number; w: number; h: number }
  emotion: string | null
  isLookingAtCamera: boolean | null
  estimatedAgeGroup: 'child' | 'teen' | 'adult' | 'elderly' | null
  confidence: number | null
  createdAt: string
}

export interface Person {
  id: string
  userId: string
  name: string
  coverPhotoId: string | null
  photoCount: number
  createdAt: string
  updatedAt: string
  coverThumbUrl?: string
}

export type UploadStatus = 'awaiting_upload' | 'uploaded' | 'abandoned'
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error'
export type DuplicateReviewStatus = 'pending' | 'kept_new' | 'kept_original' | 'kept_both'
