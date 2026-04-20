---
engine: HivePhoto
id: hivephoto
domain: hivephoto.hive.baby
status: building
tier: 2
schema: photo-intelligence
safety: standard
stack: [nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]
version: 1.0.0
---

# HivePhoto

AI-powered photo intelligence. Upload, search, understand your photos.

## GrapplerHook
- owner_check: photo.user_id === clerk.userId on every request
- storage_limit: checked on presign
- no_delete_on_downgrade: photos always accessible
- cron_secret: x-cron-secret header required on all cron routes
- max_retries: 3 per photo
- founding_slots: auto-close via DB trigger
