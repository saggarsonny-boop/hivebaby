CREATE TABLE pricing_tiers (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  tier_class TEXT NOT NULL
    CHECK (tier_class IN ('free','patron','sovereign')),
  billing_interval TEXT
    CHECK (billing_interval IN ('monthly','annual','lifetime',NULL)),
  price_cents INTEGER NOT NULL DEFAULT 0,
  original_price_cents INTEGER,
  storage_bytes BIGINT NOT NULL,
  is_founding BOOLEAN NOT NULL DEFAULT FALSE,
  founding_slots_total INTEGER,
  founding_slots_used INTEGER NOT NULL DEFAULT 0,
  is_founding_open BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  tier_id TEXT NOT NULL REFERENCES pricing_tiers(id),
  is_founding BOOLEAN NOT NULL DEFAULT FALSE,
  founding_price_locked_cents INTEGER,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE founding_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  tier_id TEXT NOT NULL REFERENCES pricing_tiers(id),
  slot_number INTEGER NOT NULL,
  locked_price_cents INTEGER NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_slot_per_tier UNIQUE (tier_id, slot_number)
);

CREATE TABLE storage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('upload','delete','thumbnail')),
  bytes_delta BIGINT NOT NULL,
  storage_after_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_id TEXT NOT NULL REFERENCES pricing_tiers(id),
  old_price_cents INTEGER NOT NULL,
  new_price_cents INTEGER NOT NULL,
  reason TEXT,
  effective_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON user_subscriptions(tier_id);
CREATE INDEX idx_subscriptions_stripe
  ON user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_storage_events_user
  ON storage_events(user_id, created_at DESC);
CREATE INDEX idx_founding_tier
  ON founding_members(tier_id, slot_number);

CREATE OR REPLACE FUNCTION check_founding_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.founding_slots_used >= NEW.founding_slots_total
     AND NEW.founding_slots_total IS NOT NULL THEN
    NEW.is_founding_open = FALSE;
    INSERT INTO pricing_history (
      tier_id, old_price_cents, new_price_cents, reason, effective_at
    ) VALUES (
      NEW.id,
      NEW.price_cents,
      NEW.original_price_cents,
      'Founding period closed - all slots filled',
      NOW()
    );
    NEW.price_cents = NEW.original_price_cents;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER founding_slots_check
  BEFORE UPDATE OF founding_slots_used ON pricing_tiers
  FOR EACH ROW
  WHEN (NEW.is_founding = TRUE AND NEW.founding_slots_total IS NOT NULL)
  EXECUTE FUNCTION check_founding_slots();

CREATE TRIGGER pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
