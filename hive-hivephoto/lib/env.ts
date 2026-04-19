function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing required env var: ${key}`)
  return v
}

export const env = {
  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Clerk
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',

  // Neon
  get neonDatabaseUrl() { return required('NEON_DATABASE_URL') },

  // Cloudflare R2
  get r2AccountId() { return required('R2_ACCOUNT_ID') },
  get r2AccessKeyId() { return required('R2_ACCESS_KEY_ID') },
  get r2SecretAccessKey() { return required('R2_SECRET_ACCESS_KEY') },
  get r2BucketPrivate() { return required('R2_BUCKET_PRIVATE_ORIGINALS') },
  get r2BucketPublic() { return required('R2_BUCKET_PUBLIC_THUMBS') },
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL || '',

  // Anthropic
  get anthropicApiKey() { return required('ANTHROPIC_API_KEY') },

  // Stripe
  get stripeSecretKey() { return required('STRIPE_SECRET_KEY') },
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Cron
  get cronSecret() { return required('CRON_SECRET') },
} as const
