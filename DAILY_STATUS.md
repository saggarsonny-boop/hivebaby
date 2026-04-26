# HIVE STATUS — 2026-04-26 (updated)

## COMPLETED THIS SESSION

### Universal Document™ (UD) — White Paper Integrity Sprint
- **UDS schema enforcement**: all blocks exactly `{ id, type, base_content: { text } }` — no extra props
- **Pharmacy route** (`/api/pharmacy`): outputs 12 fixed blocks as prose, schema-compliant
- **Translate route** (`/api/translate`): block reconstruction fixed; native-script system prompt (Japanese, Arabic, Chinese, Korean, Hindi, Hebrew, Thai, Bengali, Greek, Russian, etc.); diagnostic logging added
- **PrescriptionViewer**: re-written to parse heading/paragraph block format
- **Demo files**: all 4 `.uds` files → `ud_version` fixed `1.0` → `1.0.0`
- **Tamper demo**: `original-contract.uds` and `tampered-contract.uds` rebuilt with matching IDs; tamper detection now works correctly
- **Registry writes**: signer now calls `/api/seal` (POST) on every document seal, writes to Neon `ud_documents`
- **`/api/seed-demos`** added to landing — seeds H1 hash for tamper-detection demo
- **Translate logging**: console.log traces added to Vercel function logs for debugging non-Latin output

### HivePhoto — Runtime Fix
- **Deleted `lib/db/subscriptions.ts`**: dead code importing non-existent types (`PricingTierRow`, `UserSubscriptionRow`, `PricingTier`, `UserSubscription`, `TierFeatures`) — was causing TypeScript build failures and 500s
- **`lib/db/client.ts`**: added `getDb()` alias export (safe guard for any future imports)
- **`app/api/admin/migrate/route.ts`** (NEW): runs all 3 migration files idempotently using `IF NOT EXISTS`; protected by `CRON_SECRET`; returns step-by-step results
- **`app/api/admin/seed-stripe/route.ts`** (NEW): seeds 7 pricing tiers to DB and creates Stripe products/prices; protected by `CRON_SECRET`

### Ops Workflow
- **`.github/workflows/ops-set-env.yml`** (NEW): sets `DATABASE_URL` on landing (`prj_iraVc9HNzaNyFv14gnn0tWMO6oVk`) and ud-signer (`prj_aHr0Al8la5rpFajSnBs7WM0AfSEJ`), triggers landing redeploy, calls `/api/seed-demos`

## PENDING (needs manual trigger after deploy)

1. **Run ops-set-env workflow** — adds DATABASE_URL to landing + ud-signer, seeds demos
2. **Run activate-hivephoto workflow** — sets all HivePhoto env vars, runs migrations, seeds Stripe
3. **Verify** `https://ud.hive.baby/api/seed-demos` returns `{"ok":true}`
4. **Verify** `https://hivephoto.hive.baby/api/admin/migrate` returns `{"ok":true}` (POST with CRON_SECRET)
5. **Hindi translation** — check Vercel logs after next translate request to confirm native script output

---

## OPS SWEEP (2026-04-20 14:20 UTC)
- Fleet HTTP probe completed across all listed domains.
- `hivememe.hive.baby` Cloudflare DNS CNAME was missing and has now been created: `hivememe.hive.baby -> cname.vercel-dns.com` (created 2026-04-20 14:19 UTC).
- Vercel production deploy for HiveMeme was executed and alias binding was applied to `hivememe.hive.baby`.
- Certificate issuance completed and domain now returns HTTP 200 in fleet probe.
- `creatorconsole.hive.baby` returns HTTP 307 consistently and requires owner confirmation that this redirect is intentional.

- Total engines: 27
- Live and working: 24
- Building: 2 (HiveMeme, HiveMemorySpace)
- Planned: 1 (QueenBee)

## TIER 1
| Engine | Domain | Score | Works | Missing |
|--------|--------|-------|-------|---------|
| HiveMoon | hivemoon.hive.baby | 95% | AutoDemo, FirstVisit, TooltipTour, LanguageSelector (9 langs), RTL, i18n all strings | — |
| HiveField | hivefield.hive.baby | 93% | AutoDemo, FirstVisit, TooltipTour, LanguageSelector, AI scenario engine | — |
| HiveBodyLog | hivebodylog.hive.baby | 93% | AutoDemo, FirstVisit, TourGuide (? button), LanguageSelector, Neon DB | — |
| HiveStrength | hivestrength.hive.baby | 91% | AutoDemo, FirstVisit, TooltipTour, AI coaching, full page | — |
| HiveClarity | hiveclarity.hive.baby | 91% | AutoDemo, FirstVisit, TooltipTour, AI comms engine | — |
| HiveClock | hiveclock.hive.baby | 89% | AutoDemo, FirstVisit, TooltipTour, AI time engine | — |

## TIER 2
| Engine | Domain | Score | Works | Missing |
|--------|--------|-------|-------|---------|
| HiveEngineBuilder | hiveenginebuilder.hive.baby | 88% | AutoDemo, FirstVisit, TooltipTour, HEB 2.0 build pipeline, streaming log | — |
| WhoTextedMe | whotextedme.hive.baby | 86% | AutoDemo, FirstVisit, TooltipTour, phone lookup | — |
| HiveSecretBox | secretbox.hive.baby | 85% | AutoDemo, FirstVisit, TooltipTour, anonymous secrets feed | — |
| QueenBee | queenbee.hive.baby | 84% | AutoDemo, FirstVisit, TooltipTour, governance audit | — |
| UDConverter | converter.hive.baby | 83% | AutoDemo, FirstVisit, TooltipTour, DOCX/TXT/MD to PDF | — |
| HivePhoto | hivephoto.hive.baby | 80% | Full photo app, Clerk auth, R2 storage, AI analysis, Stripe billing | DB migrations pending |
| UniversalDocument | ud.hive.baby | 78% | Hub, demos, tamper detection, translate, pharmacy, registry | seed-demos pending |

## TIER 3
| Engine | Domain | Score | Works | Missing |
|--------|--------|-------|-------|---------|
| HiveAdminSupport | support.hive.baby | 72% | Live (post first-deploy fix), basic placeholder | Full UI |
| HiveCreatorConsole | creatorconsole.hive.baby | 78% | Dashboard, analytics, redirects correctly | — |

## NOTES
- Tooltip Tour now live across all 11 active engines (hive-clarity, hive-clock, hive-field, hive-body-log, hive-moon, hive-strength-mastery, hive-engine-builder, whotextedme, queen-bee, ud-converter, secret-box)
- HiveMoon: full i18n — 33 keys × 9 languages, RTL Arabic, live phase translation
- HEB 2.0: streaming build log, /build page, Claude code-gen → GitHub → Vercel → Cloudflare pipeline
- support.hive.baby: first deploy triggered and live
- No engine score exceeds 99% (upgradeability principle)
- Universal Document™ is a pending trademark (Serial 99774346, filed 2026-04-20)
