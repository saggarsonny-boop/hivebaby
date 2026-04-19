# HIVE STATUS — 2026-04-19 11:45 CDT

- Total engines: 14
- Live and working: 13
- Building: 1
- Started: 0
- Not started: 0
- Biggest risk: support.hive.baby DEPLOYMENT_NOT_FOUND — Vercel project not linked to GitHub repo
- Recommended next priority: Fix support.hive.baby first-deploy, then Tooltip Tour (blocks 95%+ scores across all engines)

## TIER 1

| Engine | Domain | Score | Works | Missing |
|--------|--------|-------|-------|---------|
| HiveClarity | hiveclarity.hive.baby | 90% | AutoDemo, FirstVisitCard, Multilingual, LanguageSelector | Tooltip Tour |
| HiveField | hivefield.hive.baby | 90% | AutoDemo, FirstVisitCard, Multilingual, LanguageSelector | Tooltip Tour |
| HiveClock | hiveclock.hive.baby | 90% | AutoDemo, FirstVisitCard, Multilingual, LanguageSelector | Tooltip Tour |
| HiveBodyLog | hivebodylog.hive.baby | 90% | AutoDemo, FirstVisitCard, Multilingual, LanguageSelector | Tooltip Tour |
| HiveMoon | hivemoon.hive.baby | 92% | AutoDemo, FirstVisitCard, Full i18n 9 langs + RTL | Tooltip Tour |
| HiveStrength | hivestrength.hive.baby | 80% | AutoDemo, FirstVisitCard | Multilingual, Tooltip Tour |
| HiveEngineBuilder | heb.hive.baby | 88% | AutoDemo, FirstVisitCard, /build pipeline, VERCEL_TOKEN | Tooltip Tour |
| QueenBee | queenbee.hive.baby | 72% | Governance v0.2.0, audit/health/registry endpoints | Multilingual, Tooltip Tour |
| WhoTextedMe | whotextedme.hive.baby | 80% | AutoDemo, FirstVisitCard | Multilingual, Tooltip Tour |
| UDConverter | converter.hive.baby | 78% | AutoDemo, FirstVisitCard | Multilingual, Tooltip Tour |
| HiveSecretBox | secretbox.hive.baby | 72% | AutoDemo, FirstVisitCard | Multilingual, Tooltip Tour |
| HiveCreatorConsole | creatorconsole.hive.baby | 70% | Live (302 redirect) | Deployment Protection ON — disable in Vercel |
| UniversalDocument | ud.hive.baby | 60% | Hub live | AutoDemo, FirstVisitCard, Multilingual, Tooltip Tour |

## TIER 2

| Engine | Domain | Score | Works | Missing |
|--------|--------|-------|-------|---------|
| HiveAdminSupport | support.hive.baby | 55% | Code + env vars ready | DEPLOYMENT_NOT_FOUND — connect GitHub repo in Vercel then deploy once |

## FLAGS

- support.hive.baby: Vercel project not linked to GitHub repo — domain resolves but returns DEPLOYMENT_NOT_FOUND
- creatorconsole.hive.baby: Deployment Protection ON — returns 307 with no target for external visitors
- Tooltip Tour: 0/14 engines — single biggest blocker to 95%+ scores across the board

## LAST 24H

- HiveClarity: Multilingual ribbon shipped (9 languages)
- HiveField: Multilingual ribbon shipped (9 languages)
- HiveClock: Multilingual ribbon shipped (9 languages)
- HiveBodyLog: Multilingual ribbon + lang passthrough to Claude API
- HiveMoon: Full i18n — lib/i18n.ts 33 keys x 9 langs, useTranslation hook, RTL for Arabic
- HiveEngineBuilder: HEB 2.0 — /build pipeline, orchestrator, dark UI, VERCEL_TOKEN set
- QueenBee: Confirmed live at queenbee.hive.baby v0.2.0
- Deploy hooks: hivebaby + hive-body-log triggered post quota reset
- VERCEL_TOKEN: Updated on HEB Vercel project — full engine provisioning now enabled
