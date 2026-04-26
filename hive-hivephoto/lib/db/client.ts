import { neon } from '@neondatabase/serverless'
import { env } from '@/lib/env'

export const sql = neon(env.DATABASE_URL)

// Legacy alias for modules that import getDb()
export function getDb() { return sql }
