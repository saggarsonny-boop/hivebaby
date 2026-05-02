CREATE TABLE IF NOT EXISTS hive_alerts (
  id uuid primary key default gen_random_uuid(),
  tier int not null check (tier in (1,2,3)),
  agent text not null,
  subject text not null,
  body text not null,
  action_required boolean default false,
  action_url text,
  sent boolean default false,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_alerts_unsent ON hive_alerts(sent, tier, created_at);
