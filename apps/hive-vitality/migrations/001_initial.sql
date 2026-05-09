-- HiveVitality v0.1 — initial schema. All tables prefixed `hv_` for fleet
-- isolation; can co-exist with other engines on the same Neon database.
--
-- Idempotent: every CREATE / ALTER uses IF NOT EXISTS so re-running is safe.
-- Migrations roll forward only; squash + tag when v0.2 lands.

-- ── Users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hv_users (
  id              BIGSERIAL PRIMARY KEY,
  clerk_user_id   TEXT UNIQUE NOT NULL,
  email           TEXT,
  tier            TEXT NOT NULL DEFAULT 'free'
                    CHECK (tier IN ('free', 'basic', 'pro', 'premium')),
  current_week    INTEGER NOT NULL DEFAULT 1
                    CHECK (current_week BETWEEN 1 AND 10),
  streak_count    INTEGER NOT NULL DEFAULT 0
                    CHECK (streak_count >= 0),
  ritual_count    INTEGER NOT NULL DEFAULT 0
                    CHECK (ritual_count >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hv_users_clerk_user_id
  ON hv_users (clerk_user_id);

-- ── Sessions (one per ritual completion) ─────────────────────────────
-- completed_components is a JSONB array of component slugs the user
-- finished, e.g. ["tibetan_1","balance_left","balance_right","tibetan_2",...]
-- mood_rating is optional (1-5 Likert), reflection_text optional (10-sec
-- daily reflection captured on the next page).
--
-- governance_stamp persists the QB envelope returned by govern() — the
-- HiveOps G05 rule scans schema files for this column name. The stamp is
-- the audit trail proving QB validated the session payload.
CREATE TABLE IF NOT EXISTS hv_sessions (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES hv_users(id) ON DELETE CASCADE,
  ritual_date         DATE NOT NULL,
  duration_seconds    INTEGER NOT NULL CHECK (duration_seconds >= 0),
  completed_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflection_text     TEXT,
  mood_rating         INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  governance_stamp    JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hv_sessions_user_date
  ON hv_sessions (user_id, ritual_date DESC);

-- One ritual log per (user, date). Re-submitting the same day updates
-- the existing row instead of creating a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hv_sessions_user_day
  ON hv_sessions (user_id, ritual_date);

-- ── Milestones (30-day, 90-day, 1-year) ──────────────────────────────
CREATE TABLE IF NOT EXISTS hv_milestones (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES hv_users(id) ON DELETE CASCADE,
  milestone_type  TEXT NOT NULL
                    CHECK (milestone_type IN ('30day', '90day', '1year')),
  achieved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, milestone_type)
);

-- ── Subscriptions (Stripe-mirrored; safe to be empty in v0.1) ────────
CREATE TABLE IF NOT EXISTS hv_subscriptions (
  stripe_subscription_id  TEXT PRIMARY KEY,
  user_id                 BIGINT NOT NULL REFERENCES hv_users(id) ON DELETE CASCADE,
  tier                    TEXT NOT NULL
                            CHECK (tier IN ('free', 'basic', 'pro', 'premium')),
  status                  TEXT NOT NULL,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hv_subscriptions_user
  ON hv_subscriptions (user_id);
