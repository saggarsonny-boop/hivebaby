CREATE TABLE photo_faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  bounding_box JSONB NOT NULL,
  emotion TEXT,
  is_looking_at_camera BOOLEAN,
  estimated_age_group TEXT CHECK (estimated_age_group IN ('child','teen','adult','elderly')),
  confidence DOUBLE PRECISION CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_faces_photo ON photo_faces(photo_id);
CREATE INDEX idx_faces_person ON photo_faces(person_id) WHERE person_id IS NOT NULL;
