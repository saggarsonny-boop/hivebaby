export interface DbPhoto {
  id: string
  user_id: string
  original_key: string | null
  thumb_key: string | null
  thumb_url: string | null
  format: string | null
  file_size_bytes: bigint | null
  width: number | null
  height: number | null
  is_provisional: boolean
  upload_status: 'awaiting_upload' | 'uploaded' | 'abandoned'
  taken_at: Date
  taken_at_confidence: 'exif' | 'filename' | 'upload'
  uploaded_at: Date
  gps_lat: number | null
  gps_lng: number | null
  location_name: string | null
  camera_make: string | null
  camera_model: string | null
  ai_title: string | null
  user_title: string | null
  ai_description: string | null
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominant_color: string | null
  sha256_hash: string
  p_hash: string | null
  is_near_duplicate: boolean
  near_duplicate_of: string | null
  duplicate_review_status: 'pending' | 'kept_new' | 'kept_original' | 'kept_both'
  processing_status: 'pending' | 'processing' | 'done' | 'error'
  processing_error: string | null
  processing_attempts: number
  processing_last_attempted_at: Date | null
  deleted_at: Date | null
}

export interface DbPerson {
  id: string
  user_id: string
  name: string
  cover_photo_id: string | null
  photo_count: number
  created_at: Date
  updated_at: Date
}

export interface DbPhotoFace {
  id: string
  photo_id: string
  person_id: string | null
  bounding_box: { x: number; y: number; w: number; h: number }
  emotion: string | null
  is_looking_at_camera: boolean | null
  estimated_age_group: 'child' | 'teen' | 'adult' | 'elderly' | null
  confidence: number | null
  created_at: Date
}

export interface DbAlbum {
  id: string
  user_id: string
  title: string
  description: string | null
  cover_photo_id: string | null
  is_smart: boolean
  smart_query: string | null
  photo_count: number
  created_at: Date
}

export interface DbAlbumPhoto {
  album_id: string
  photo_id: string
  position: number | null
  added_at: Date
}

export interface DbPricingTier {
  id: string
  name: string
  display_name: string
  price_cents: number
  price_interval: 'month' | 'year' | null
  storage_bytes: bigint
  is_founding: boolean
  founding_slots_total: number | null
  founding_slots_used: number
  founding_closes_at: Date | null
  stripe_price_id: string | null
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface DbUserSubscription {
  id: string
  user_id: string
  tier_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  current_period_start: Date | null
  current_period_end: Date | null
  cancel_at_period_end: boolean
  created_at: Date
  updated_at: Date
}

export interface DbStorageEvent {
  id: string
  user_id: string
  photo_id: string | null
  event_type: 'upload' | 'delete' | 'thumbnail'
  bytes_delta: bigint
  storage_after: bigint
  created_at: Date
}

export interface DbFoundingMember {
  id: string
  user_id: string
  tier_id: string
  joined_at: Date
}
