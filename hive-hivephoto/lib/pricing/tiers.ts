export const TIER_IDS = {
  FREE: 'free',
  FOUNDING_PATRON_MONTHLY: 'founding_patron_monthly',
  PATRON_MONTHLY: 'patron_monthly',
  PATRON_ANNUAL: 'patron_annual',
  FOUNDING_SOVEREIGN_MONTHLY: 'founding_sovereign_monthly',
  SOVEREIGN_MONTHLY: 'sovereign_monthly',
  SOVEREIGN_ANNUAL: 'sovereign_annual',
} as const

export const FOUNDING_CAPS = {
  founding_patron_monthly: 1000,
  founding_sovereign_monthly: 500,
} as const
