-- Test fixture: schema persists the governance stamp alongside content.
CREATE TABLE responses (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  content JSONB NOT NULL,
  governance_stamp JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
