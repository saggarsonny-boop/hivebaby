// The schema design for the Neon Serverless Postgres DB
export const TelemetrySchema = `
  CREATE TABLE IF NOT EXISTS ecosystem_telemetry (
    id SERIAL PRIMARY KEY,
    engine_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_hash VARCHAR(255),
    geo_country VARCHAR(2),
    geo_city VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    governance_stamp VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_engine_id ON ecosystem_telemetry(engine_id);
  CREATE INDEX IF NOT EXISTS idx_created_at ON ecosystem_telemetry(created_at);
`;
