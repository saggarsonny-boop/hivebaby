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
}
