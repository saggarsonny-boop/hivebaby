import sql from "./db";

export async function runMigration() {
  await sql`
    CREATE TABLE IF NOT EXISTS hbs_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]',
      cadence TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, name)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hbs_preferences (
      user_id TEXT PRIMARY KEY,
      budget_ceiling NUMERIC,
      substitution_tolerance TEXT NOT NULL DEFAULT 'flexible'
        CHECK (substitution_tolerance IN ('strict', 'flexible', 'auto')),
      preferred_backends JSONB NOT NULL DEFAULT '[]',
      dietary_rules JSONB NOT NULL DEFAULT '[]',
      delivery_constraints JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hbs_usage (
      user_id TEXT NOT NULL,
      year_month TEXT NOT NULL,
      run_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, year_month)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hbs_magic_keys (
      key_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hbs_ext_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      items JSONB NOT NULL,
      backend TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'executing', 'done', 'failed')),
      result JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hbs_subscriptions (
      user_id TEXT PRIMARY KEY,
      tier TEXT NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'pro', 'premium')),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
