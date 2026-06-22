# GrocerLens

A household grocery expense tracker for iOS and Android (Expo) — scan receipts via camera or email forwarding, get AI-powered spending insights, share with family, and manage expenses in INR.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm --filter @workspace/grocerlens run dev` — run the Expo app (port 23190, served at /grocerlens/)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed:revenuecat` — re-seed RevenueCat products/offerings

## Required Secrets

- `DATABASE_URL` — Postgres connection string
- `CLERK_SECRET_KEY` — Clerk backend secret
- `CLERK_PUBLISHABLE_KEY` — Clerk frontend publishable key (also used as EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)
- `OPENAI_API_KEY` — GPT-4.1-mini for receipt OCR and AI insights
- `SENDGRID_API_KEY` — SendGrid Inbound Parse for email receipt forwarding
- `SESSION_SECRET` — Express session secret
- `REVENUECAT_SECRET_KEY` — RevenueCat server-side API key (sk_...)
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` — RevenueCat test store public key
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — RevenueCat App Store public key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — RevenueCat Play Store public key
- `REVENUECAT_PROJECT_ID` — RevenueCat project ID (proj1213fa53)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router, React Native
- API: Express 5, Node.js
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (Google + Apple sign-in)
- AI: OpenAI GPT-4.1-mini (OCR + insights)
- Email receipts: SendGrid Inbound Parse → bills.codegreen.co.in
- Payments: RevenueCat (react-native-purchases) — freemium, ₹99/mo or ₹799/yr
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/grocerlens/` — Expo mobile app
  - `app/` — expo-router screens (tabs, modals)
  - `components/` — shared UI components
  - `context/ExpenseContext.tsx` — global state, sync, quota tracking
  - `lib/revenuecat.tsx` — RevenueCat SDK, SubscriptionProvider, useSubscription hook
  - `hooks/` — useColors, useCurrency
- `artifacts/api-server/src/routes/` — Express route handlers
  - `email.ts` — SendGrid Inbound Parse webhook
  - `ocr.ts` — camera/gallery receipt scanning (GPT-4.1-mini vision)
  - `insights.ts` — AI spending insights (GPT-4.1-mini)
  - `households.ts` — household CRUD + sync endpoint
- `lib/db/src/schema/` — Drizzle schema (source of truth)
  - `households.ts` — households, bills, members, usage_quotas tables
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `scripts/src/seedRevenueCat.ts` — one-time RevenueCat product setup script

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed hooks + Zod schemas
- **Freemium quota**: `usage_quotas` table keyed by `{householdId}-{YYYY-MM}`; email scans soft-counted (never blocked), camera/AI hard-blocked at 4/month returning 402
- **Email receipt domain**: `bills.codegreen.co.in` MX → SendGrid Inbound Parse → `/api/email` webhook; PDF parsed with pdf-parse v2
- **RevenueCat test store**: uses USD prices ($1.99/mo, $14.99/yr) in test; real INR prices (₹99/₹799) configured in App Store Connect / Play Store on launch
- **GPT model**: `gpt-4.1-mini` (not gpt-4o, not gpt-5-mini which doesn't exist)
- **ETag disabled** on API server to prevent 304 caching issues with sync endpoint

## Product

- Scan grocery receipts via camera, photo gallery, or email forwarding (forward to your household address)
- AI extracts store name, date, total, and itemised categories (INR)
- Household/family sharing with invite codes and WhatsApp sharing
- Spending insights: monthly totals, category breakdown, clickable drill-down, AI tips
- Freemium: 4 scans + 4 AI insight refreshes/month free; unlimited with Premium (₹99/mo or ₹799/yr)
- Google + Apple sign-in via Clerk

## User preferences

- Currency: INR (₹) throughout
- Primary colour: #15803d (green-700)
- AI model: gpt-4.1-mini
- Keep "coming soon" alerts replaced with real functionality where possible

## Gotchas

- **pdf-parse v2**: API is `new PDFParse({data: new Uint8Array(buf)})` then `parser.getText()` returns a LineStore `{pages:[{text,num}]}` — join page texts manually, not a plain string
- **RevenueCat test store**: INR not supported; test prices are USD. Set real INR prices in App Store Connect + Google Play Console
- **WhatsApp links on web**: use `window.open(url, '_blank')` not `Linking.openURL` (wa.me blocks iframes)
- **Quota 402 shape**: `{ error: "quota_exceeded", type: "billScans"|"insightRefreshes", used, limit, message }`
- **Always run** `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI spec

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- RevenueCat project: proj1213fa53 | Test Store: app496975e3dd | iOS: apped6462f2a3 | Android: app5b9be64382
