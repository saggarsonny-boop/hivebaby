CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  original_key TEXT,
  thumb_key TEXT,
  thumb_url TEXT,
  format TEXT,
  file_size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  is_provisional BOOLEAN NOT NULL DEFAULT TRUE,
  upload_status TEXT NOT NULL DEFAULT 'awaiting_upload'
    CHECK (upload_status IN ('awaiting_upload','uploaded','abandoned')),
  taken_at TIMESTAMPTZ NOT NULL,
  taken_at_confidence TEXT NOT NULL DEFAULT 'upload'
    CHECK (taken_at_confidence IN ('exif','filename','upload')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  location_name TEXT,
  camera_make TEXT,
  camera_model TEXT,
  ai_title TEXT,
  user_title TEXT,
  ai_description TEXT,
  objects TEXT[] NOT NULL DEFAULT '{}',
  scenes TEXT[] NOT NULL DEFAULT '{}',
  emotions TEXT[] NOT NULL DEFAULT '{}',
  actions TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  dominant_color TEXT,
  sha256_hash TEXT NOT NULL,
  p_hash TEXT,
  is_near_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  near_duplicate_of UUID REFERENCES photos(id) ON DELETE SET NULL,
  duplicate_review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (duplicate_review_status IN ('pending','kept_new','kept_original','kept_both')),
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending','processing','done','error')),
  processing_error TEXT,
  processing_attempts INTEGER NOT NULL DEFAULT 0 CHECK (processing_attempts >= 0),
  processing_last_attempted_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_hash_per_user UNIQUE (user_id, sha256_hash),
  CONSTRAINT finalized_photos_require_storage CHECK (
    is_provisional = TRUE OR (
      original_key IS NOT NULL AND thumb_key IS NOT NULL AND thumb_url IS NOT NULL
      AND format IS NOT NULL AND file_size_bytes IS NOT NULL
      AND width IS NOT NULL AND height IS NOT NULL
    )
  ),
  CONSTRAINT gps_both_or_neither CHECK ((gps_lat IS NULL) = (gps_lng IS NULL))
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  photo_count INTEGER NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_person_name_per_user UNIQUE (user_id, name)
);

CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  is_smart BOOLEAN NOT NULL DEFAULT FALSE,
  smart_query TEXT,
  photo_count INTEGER NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE album_photos (
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  position INTEGER,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (album_id, photo_id)
);

-- Indexes
CREATE INDEX idx_photos_gallery ON photos(user_id, taken_at DESC)
  WHERE deleted_at IS NULL AND is_provisional = FALSE AND is_near_duplicate = FALSE;
CREATE INDEX idx_photos_analysis_queue ON photos(processing_attempts, processing_last_attempted_at, uploaded_at)
  WHERE upload_status = 'uploaded' AND processing_status IN ('pending','error') AND processing_attempts < 3 AND deleted_at IS NULL;
CREATE INDEX idx_photos_dupe_review ON photos(user_id, uploaded_at DESC)
  WHERE is_near_duplicate = TRUE AND duplicate_review_status = 'pending' AND deleted_at IS NULL;
CREATE INDEX idx_photos_provisional_cleanup ON photos(upload_status, uploaded_at)
  WHERE is_provisional = TRUE AND upload_status = 'awaiting_upload';
CREATE INDEX idx_photos_sha256 ON photos(user_id, sha256_hash);
CREATE INDEX idx_photos_phash ON photos(p_hash) WHERE p_hash IS NOT NULL;
CREATE INDEX idx_photos_gps ON photos(gps_lat, gps_lng) WHERE gps_lat IS NOT NULL AND gps_lng IS NOT NULL;
CREATE INDEX idx_photos_objects ON photos USING GIN(objects);
CREATE INDEX idx_photos_scenes ON photos USING GIN(scenes);
CREATE INDEX idx_photos_emotions ON photos USING GIN(emotions);
CREATE INDEX idx_photos_actions ON photos USING GIN(actions);
CREATE INDEX idx_photos_description_trgm ON photos USING GIN(ai_description gin_trgm_ops)
  WHERE ai_description IS NOT NULL;
CREATE INDEX idx_people_user ON people(user_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
