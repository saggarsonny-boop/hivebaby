CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_interval TEXT CHECK (price_interval IN ('month','year')),
  storage_bytes BIGINT NOT NULL,
  is_founding BOOLEAN NOT NULL DEFAULT FALSE,
  founding_slots_total INTEGER,
  founding_slots_used INTEGER NOT NULL DEFAULT 0,
  founding_closes_at TIMESTAMPTZ,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  tier_id UUID NOT NULL REFERENCES pricing_tiers(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE founding_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  tier_id UUID NOT NULL REFERENCES pricing_tiers(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tier_id)
);

CREATE TABLE storage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('upload','delete','thumbnail')),
  bytes_delta BIGINT NOT NULL DEFAULT 0,
  storage_after BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  from_tier_id UUID REFERENCES pricing_tiers(id),
  to_tier_id UUID REFERENCES pricing_tiers(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

-- Indexes
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_storage_events_user ON storage_events(user_id, created_at DESC);
CREATE INDEX idx_founding_members_tier ON founding_members(tier_id);

-- Auto-close founding tiers when slots fill
CREATE OR REPLACE FUNCTION check_founding_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_founding = TRUE AND NEW.founding_slots_total IS NOT NULL
     AND NEW.founding_slots_used >= NEW.founding_slots_total THEN
    NEW.founding_closes_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER founding_slots_check
  BEFORE INSERT OR UPDATE ON pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION check_founding_slots();

-- Updated_at triggers
CREATE TRIGGER pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
