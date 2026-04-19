#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

required=(
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEON_DATABASE_URL
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_PRIVATE_ORIGINALS
  R2_BUCKET_PUBLIC_THUMBS
  R2_PUBLIC_BASE_URL
  ANTHROPIC_API_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  CRON_SECRET
)

echo "Checking required environment variables..."
missing=0
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "MISSING: $key"
    missing=1
  fi
done
if [[ "$missing" -eq 1 ]]; then
  echo "Predeploy check failed: missing environment variables"
  exit 1
fi

echo "Running production build..."
npm run build

echo "Running lint..."
npm run lint

echo "Validating vercel.json..."
if [[ ! -f vercel.json ]]; then
  echo "Missing vercel.json"
  exit 1
fi

echo "Predeploy check passed"
