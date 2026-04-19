import { abandonStaleProvisional } from '../db/photos'

export async function runCleanupProvisional(): Promise<{ abandoned: number }> {
  const abandoned = await abandonStaleProvisional()
  return { abandoned }
}
