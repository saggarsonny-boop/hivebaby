# Universal Document™ ecosystem audit — 2026-05-15

> Snapshot of the UD fleet under `/apps/ud-*` as of 2026-05-15. This is the audit that fed PR `claude/audit-ud-ecosystem-zV8ad`. Future audits should append, not overwrite.

---

## Headline numbers

| Question | Answer |
|---|---|
| How many UD engines exist on disk? | **128** Next.js apps in `apps/ud-*`, plus 128 vestigial root-level stubs (deleted in this PR), plus an empty `universal-document/` dir (deleted in this PR). |
| How many are registered in `engines.json`? | **0** before this PR, **128** after. |
| How many have a DNS entry in `registry/dns-inventory.md`? | **0** before this PR, **128** after (all marked `STATUS: NOT REGISTERED` to make the gap visible). |
| How many appear on the hive.baby planet `ENGINES` array? | **0**. Not addressed in this PR — design question (128 cells may not be desirable). |
| How many are deployed at their declared `<slug>.hive.baby` domain? | **0** verified. None are reachable in production. |
| How many function according to their declared scope? | **1** (`ud-medical`, by accident — it fits the cloned clinical-document template). |
| How many are differentiated from the cloned template? | **2** (`ud-medical` happens to fit; `ud-bulk` is a custom Enterprise Dropzone UI). |
| How many would survive a customer demo today? | **<5** (likely 1–2). |

---

## The mass-clone problem

125 of the 128 engines under `apps/ud-*` are byte-identical clones of the **HivePlainScan** clinical-document-analysis template:

- All carry the same component set: `DoctorQuestions.tsx`, `RedFlagBox.tsx`, `FindingsTable.tsx`, `Disclaimer.tsx`, `IllustrationDisplay.tsx`, `ResultsSummary.tsx`, `ReportInput.tsx`, `ReportExport.tsx`, `B2BTierLanding.tsx`, `WaitlistForm.tsx`, `PhilanthropicFooter.tsx`.
- All carry the same `types/plainscan.ts` data shapes.
- All carry the same `app/api/{extract-report, explain, chat, waitlist, checkout, stripe/webhook, health, me}` route set.
- Verification: `diff -q apps/ud-converter/components/FindingsTable.tsx apps/ud-medical/components/FindingsTable.tsx` produces no output (files are identical).

The naming implies domain specialization (ud-1099 should handle 1099 tax forms, ud-dna-sequence should analyze DNA sequences, ud-passport should process passport docs), but every engine ships the same clinical reporting flow. A user landing on `ud-1099.hive.baby` would be asked the same "Doctor Questions" as a user landing on `ud-medical.hive.baby`.

**This is not a fixable bug — it is the result of a bulk-scaffold script that was never followed up with per-engine differentiation.** The differentiation work is roughly 125 × (1–2 days) = ~6 person-months. It is not in scope for this PR.

---

## The hub problem (ud-inc)

`apps/ud-inc/` — the hub at `universaldocument.hive.baby` per CLAUDE.md — has **no `app/` directory**. It cannot run as a Next.js app router project. It carries the full `package.json` (Next 14.2.3, Clerk, Stripe, Anthropic SDK, pdf-parse, mammoth) and the cloned PlainScan components, but it has nothing for Next.js to route to. The supposed front door of the entire UD ecosystem is broken at the filesystem level.

This PR repairs ud-inc with a real `app/` directory: `layout.tsx`, `page.tsx`, `globals.css`, `manifest.ts`, plus a favicon set, UD design system compliance (Playfair Display + DM Sans + DM Mono, gold `#c8960a`), `Universal Document™` first-mention hygiene, and copy aligned with §A canonical pricing (free + $0.97/mo Plus + $29/mo Pro).

---

## Marketability gaps (across the whole fleet)

| Gap | Severity | Scope |
|---|---|---|
| Trademark hygiene — zero `Universal Document™` first-mention compliance | High (§H violation) | All 128 |
| Wrong font stack — `Inter` instead of Playfair Display + DM Sans + DM Mono | High (§G HARD-rule violation) | All 128 |
| Wrong gold — `#D4AF37` (Hive gold) instead of `#c8960a` (UD gold) | High (§G HARD-rule violation) | All 128 |
| Boilerplate marketing copy — "Sovereign-Lite tactical engine" jargon | High (§C8 violation) | 119 / 128 |
| Invented pricing — "$699/month" / "$1,500/month" contradicts §A canonical pricing | High (§A violation) | Many of 119 boilerplate engines |
| Missing favicon set | Medium (H15 violation) | All 128 sampled |
| UDR/UDS icons referenced but files missing under `/public/icons/` | Medium | 1 sampled (ud-converter) |
| No registration in `engines.json`, `registry/engines.md`, planet | High | All 128 (fixed for first two by this PR) |
| No DNS provisioning | High | All 128 (made visible by this PR) |
| No Vercel deployment | High (likely Hobby-tier blocker — 128 projects exceeds the plan) | All 128 |

---

## Recommended next actions (post-this-PR)

In rough priority order:

1. **Decide the strategic question first**: are 128 single-purpose document tools the right product surface, or should the UD ecosystem consolidate around 5–10 hubs (Converter, Reader, Validator, Signer, Creator, Utilities, Medical, Legal, Finance, Bulk) with the long-tail folded in as features? Rebuilding 125 engines individually is a six-month workstream — consolidating is a few weeks.
2. **Clone differentiation OR retirement** for the 125. If consolidating, retire the long-tail under §VIII (mark dormant in ENGINE_GRAMMAR.md, remove from registry). If keeping all 128, scope the differentiation work and stage it in batches of 5–10.
3. **Design system migration** — script the Inter→Playfair/DM Sans swap and `#D4AF37`→`#c8960a` swap across whichever engines survive step 2. Add ™ on first mention.
4. **Hub polish** — flesh out ud-inc beyond the minimum landing scaffolded in this PR. Add value prop, pricing table, links to the 5–10 anchor sub-engines, trademark notice, contact path.
5. **DNS + Vercel provisioning** — for whichever engines survive step 2, run the §C11 Cloudflare CNAME pattern + create Vercel projects. Hobby tier may force a Pro upgrade or a single-project monorepo deployment instead of one-project-per-engine.
6. **Planet placement** — design where (and whether) UD engines appear on the hive.baby planet. 128 cells is probably too many; a single "UD" hex linking out to ud.hive.baby is one option.
7. **Trademark hygiene script** — a one-shot pass that adds `Universal Document™` on first mention across every engine landing.
8. **Reconsider the empty `universal-document/` claim in older docs** — the CLAUDE.md update in this PR fixes that file, but other docs may still claim a separate `universal-document` repo. Search-and-update pass.
