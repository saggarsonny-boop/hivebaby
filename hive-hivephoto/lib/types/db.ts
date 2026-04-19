// Raw DB row types (snake_case matching Postgres column names)

export interface PhotoRow {
  id: string
  user_id: string
  original_key: string | null
  thumb_key: string | null
  thumb_url: string | null
  format: string | null
  file_size_bytes: number | null
  width: number | null
  height: number | null
  is_provisional: boolean
  upload_status: string
  taken_at: Date
  taken_at_confidence: string
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
  duplicate_review_status: string
  processing_status: string
  processing_error: string | null
  processing_attempts: number
  processing_last_attempted_at: Date | null
  deleted_at: Date | null
}

export interface PersonRow {
  id: string
  user_id: string
  name: string
  cover_photo_id: string | null
  photo_count: number
  created_at: Date
  updated_at: Date
}

export interface PhotoFaceRow {
  id: string
  photo_id: string
  person_id: string | null
  bounding_box: Record<string, number>
  emotion: string | null
  is_looking_at_camera: boolean | null
  estimated_age_group: string | null
  confidence: number | null
  created_at: Date
}

export interface PricingTierRow {
  id: string
  display_name: string
  tier_class: string
  billing_interval: string | null
  price_cents: number
  original_price_cents: number | null
  storage_bytes: number
  is_founding: boolean
  founding_slots_total: number | null
  founding_slots_used: number
  is_founding_open: boolean
  is_active: boolean
  stripe_price_id: string | null
  features: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface UserSubscriptionRow {
  id: string
  user_id: string
  tier_id: string
  is_founding: boolean
  founding_price_locked_cents: number | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_status: string | null
  current_period_start: Date | null
  current_period_end: Date | null
  cancel_at_period_end: boolean
  storage_used_bytes: number
  storage_limit_bytes: number
  created_at: Date
  updated_at: Date
}

export interface StorageEventRow {
  id: string
  user_id: string
  photo_id: string | null
  event_type: string
  bytes_delta: number
  storage_after_bytes: number
  created_at: Date
}
