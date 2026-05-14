const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function init() {
  console.log('Initializing DB Schema...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS ecosystem_telemetry (
        id SERIAL PRIMARY KEY,
        engine_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        user_agent TEXT,
        geo_country VARCHAR(2),
        event_type VARCHAR(50) NOT NULL,
        governance_stamp VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table ecosystem_telemetry created or already exists.');
  } catch (e) {
    console.error('Failed to init schema:', e);
  }
}
init();
