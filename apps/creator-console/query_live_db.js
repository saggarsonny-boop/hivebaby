const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function test() {
  try {
    const res = await sql`SELECT COUNT(*) FROM ecosystem_telemetry`;
    console.log('Total live pings in DB:', res[0].count);
  } catch (e) {
    console.error(e);
  }
}
test();
