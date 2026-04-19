import { neon } from '@neondatabase/serverless'
import { env } from '../env'

// Singleton connection — safe for serverless (neon() is already pooled)
let _sql: ReturnType<typeof neon> | null = null

export function getDb() {
  if (!_sql) {
    _sql = neon(env.neonDatabaseUrl)
  }
  return _sql
}

// Convenience alias
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_t, prop) {
    return getDb()[prop as keyof ReturnType<typeof neon>]
  },
  apply(_t, _thisArg, args) {
    return (getDb() as unknown as (...a: unknown[]) => unknown)(...args)
  },
})
