export type UploadStatus = 'awaiting_upload' | 'uploaded' | 'abandoned'
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error'
export type DuplicateReviewStatus = 'pending' | 'kept_new' | 'kept_original' | 'kept_both'
export type TakenAtConfidence = 'exif' | 'filename' | 'upload'
export type AgeGroup = 'child' | 'teen' | 'adult' | 'elderly'
export type TierClass = 'free' | 'patron' | 'sovereign'
export type BillingInterval = 'monthly' | 'annual' | 'lifetime'
export type StorageEventType = 'upload' | 'delete' | 'thumbnail'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

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

export interface PhotoSummary {
  id: string
  thumbUrl: string
  takenAt: Date
  takenAtConfidence: TakenAtConfidence
  aiTitle: string | null
  userTitle: string | null
  width: number
  height: number
  isNearDuplicate: boolean
  duplicateReviewStatus: DuplicateReviewStatus
  processingStatus: ProcessingStatus
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

// ─── Presign / upload flow ────────────────────────────────────────────────────

export interface PresignRequest {
  fileName: string
  contentType: string
  fileSizeBytes: number
  sha256Hash: string
  takenAt?: string
  takenAtConfidence?: TakenAtConfidence
}

export interface PresignResponse {
  photoId: string
  uploadUrl: string
  expiresAt: string
}

export interface CompleteRequest {
  photoId: string
}

export interface CompleteResponse {
  photoId: string
  thumbUrl: string
  isNearDuplicate: boolean
  processingStatus: ProcessingStatus
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export interface GalleryPage {
  photos: PhotoSummary[]
  nextCursor: string | null
  total: number
}

// ─── Pricing / subscription ──────────────────────────────────────────────────

export interface PricingTier {
  id: string
  displayName: string
  tierClass: TierClass
  billingInterval: BillingInterval | null
  priceCents: number
  originalPriceCents: number | null
  storageBytes: number
  isFounding: boolean
  foundingSlotsTotal: number | null
  foundingSlotsUsed: number
  isFoundingOpen: boolean
  stripePriceId: string | null
  features: TierFeatures
}

export interface TierFeatures {
  smartAlbums: boolean
  autoFaceClustering: boolean
  familyVault: boolean
  apiAccess: boolean
  prioritySupport: boolean
  sharedAlbums: boolean
  collaborativeAlbums: boolean
  aiMemoryReports: boolean
  migrationTools: boolean
  rawVault: boolean
  maxVideoSizeBytes: number  // -1 = unlimited
  sharedAlbumMaxMembers: number
  savedSearches: boolean
  priorityProcessing: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  tierId: string
  tier: PricingTier
  isFounding: boolean
  foundingPriceLockedCents: number | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeStatus: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  storageUsedBytes: number
  storageLimitBytes: number
}
