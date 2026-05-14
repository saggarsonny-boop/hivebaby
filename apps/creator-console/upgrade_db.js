const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function upgrade() {
  console.log('Upgrading DB Schema...');
  try {
    await sql`
      ALTER TABLE ecosystem_telemetry ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) DEFAULT 0;
    `;
    console.log('Column "amount" added.');
  } catch (e) {
    console.error('Failed to upgrade schema:', e);
  }
}
upgrade();
