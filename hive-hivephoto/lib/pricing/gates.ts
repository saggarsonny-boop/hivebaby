import type { PricingTier } from '@/lib/types/photo'

// Hive governance rule: data is always accessible even after downgrade.
export function canAccessData(): boolean {
  return true
}

export function canUsePremiumFeature(tier: PricingTier, featureKey: keyof PricingTier['features']): boolean {
  return Boolean(tier.features[featureKey])
}

export function canUploadAtCurrentUsage(storageUsedBytes: number, storageLimitBytes: number): boolean {
  if (storageLimitBytes === -1) return true
  return storageUsedBytes < storageLimitBytes
}
