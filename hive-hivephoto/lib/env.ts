function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[HivePhoto] Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requireEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  CLERK_SECRET_KEY: requireEnv('CLERK_SECRET_KEY'),
  R2_ACCOUNT_ID: requireEnv('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: requireEnv('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: requireEnv('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET_ORIGINALS: requireEnv('R2_BUCKET_ORIGINALS'),
  R2_BUCKET_THUMBS: requireEnv('R2_BUCKET_THUMBS'),
  R2_PUBLIC_THUMB_URL: requireEnv('R2_PUBLIC_THUMB_URL'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  ANTHROPIC_API_KEY: requireEnv('ANTHROPIC_API_KEY'),
  NEXT_PUBLIC_APP_URL: requireEnv('NEXT_PUBLIC_APP_URL'),
  CRON_SECRET: requireEnv('CRON_SECRET'),
  STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
} as const
