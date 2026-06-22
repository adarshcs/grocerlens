---
name: GrocerLens freemium quota design
description: How the usage_quotas table works, 402 shape, soft vs hard blocking, and isPremium flag
---

## Table
- Table: `usage_quotas` in `lib/db/src/schema/households.ts`
- Primary key: `"${householdId}-${YYYY-MM}"` (e.g. `"abc123-2026-06"`) — resets automatically each month by natural key expiry
- Columns: `id`, `householdId`, `billScans`, `insightRefreshes`, `isPremium`, `updatedAt`
- Free limits: 4 bill scans/month, 4 insight refreshes/month

## Quota helpers (`artifacts/api-server/src/lib/quota.ts`)
- `checkAndIncrementQuota(householdId, type)` — hard blocks at limit, returns 402 data
- `softCountQuota(householdId, type)` — increments without blocking (used for email scans)
- `getQuota(householdId)` — reads current usage for sync response

## 402 response shape
```json
{ "error": "quota_exceeded", "type": "billScans"|"insightRefreshes", "used": 4, "limit": 4, "message": "..." }
```

## Blocking rules
- Email-forwarded receipts: soft-counted only (async, can't block mid-email)
- Camera/gallery OCR (`/api/ocr`): hard-blocked
- AI insight refresh (`/api/insights`): hard-blocked
- Premium users (`isPremium=true`): bypass all checks

## Client handling
- 402 → `router.push("/paywall")` + Alert with message
- Quota state in ExpenseContext: `quota: { billScans: {used, limit}, insightRefreshes: {used, limit}, isPremium }`
- QuotaBanner component shows usage on Capture and Insights tabs
- Sync endpoint returns quota alongside bills/members

**Why:** Email is fire-and-forget (webhook), can't return 402 to the sender. Camera/AI are synchronous user actions, so hard-blocking is appropriate.
