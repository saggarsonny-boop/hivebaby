import type { BoundingBox, AgeGroup, TakenAtConfidence } from './photo'

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
  orientation: number | null
}

export interface ImageHashes {
  sha256: string
  pHash: string | null
}

export interface ThumbnailResult {
  buffer: Buffer
  width: number
  height: number
  format: string
  sizeBytes: number
}

// ─── AI analysis ─────────────────────────────────────────────────────────────

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

// ─── Upload finalize ─────────────────────────────────────────────────────────

export interface FinalizeResult {
  photoId: string
  thumbUrl: string
  isNearDuplicate: boolean
  nearDuplicateOf: string | null
}
