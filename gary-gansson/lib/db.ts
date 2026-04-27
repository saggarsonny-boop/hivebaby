import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const sql = neon(process.env.DATABASE_URL)

export async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      name TEXT,
      country TEXT,
      response TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used BOOLEAN NOT NULL DEFAULT FALSE,
      episode_id INTEGER
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS episodes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      script TEXT,
      audio_url TEXT,
      video_url TEXT,
      published_at TIMESTAMPTZ,
      platforms_json JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS publish_log (
      id SERIAL PRIMARY KEY,
      episode_id INTEGER NOT NULL REFERENCES episodes(id),
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      response_json JSONB DEFAULT '{}'::jsonb
    )
  `
}
