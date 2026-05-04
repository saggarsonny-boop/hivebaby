# Hive Billing Reconciliation

Per-engine cost-of-goods-sold estimate and pricing tier. Used to track which engines are net cost vs net contribution to Hive ops. Append-only.

| Engine | Monthly COGS estimate | Pricing tier | Status | Notes |
|---|---|---|---|---|
| ParkBack | ~$0 | free forever | shipped | Client-only PWA, no backend, no DB. Vercel hobby tier (free). Plausible analytics free trial then $9/mo if kept. Reverse geocoding via Nominatim (free, no key). No infra cost beyond Vercel-hobby + the optional Plausible. |
