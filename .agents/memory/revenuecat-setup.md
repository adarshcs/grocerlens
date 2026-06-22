---
name: RevenueCat GrocerLens setup
description: Project IDs, app IDs, product identifiers, and pricing decisions for GrocerLens RevenueCat integration
---

## Project
- Project name: GrocerLens
- Project ID: proj1213fa53
- Test Store App ID: app496975e3dd
- App Store (iOS) App ID: apped6462f2a3
- Play Store (Android) App ID: app5b9be64382
- iOS bundle ID: com.grocerlens.app
- Android package: com.grocerlens.app

## Products
- Monthly: identifier `grocerlens_premium_monthly`, Play Store `grocerlens_premium_monthly:monthly`, duration P1M
- Annual: identifier `grocerlens_premium_annual`, Play Store `grocerlens_premium_annual:annual`, duration P1Y

## Entitlement
- Identifier: `premium` (defined as `REVENUECAT_ENTITLEMENT_IDENTIFIER` in lib/revenuecat.tsx)

## Offering / Packages
- Offering: `default` (is_current = true)
- Monthly package: `$rc_monthly`
- Annual package: `$rc_annual`

## Pricing
- Test store uses USD only (INR not supported in test store): $1.99/mo, $14.99/yr
- Real INR prices (₹99/mo, ₹799/yr) must be set in App Store Connect + Google Play Console at launch

**Why:** RevenueCat test store only accepts USD. Real prices are set in the respective stores and pulled dynamically by the SDK — never hardcode prices in client code, always read from `pkg.product.priceString`.

## Key env vars
- `REVENUECAT_SECRET_KEY` — server-side sk_ key (in Replit secrets)
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` — test_OFBPegUsIRnWBAtqKDnkZWfqFJL
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — appl_NRvSOwmTtxvXTrUOlBgysxpQmts
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — goog_OnvFQjCgWmJpQpUoWwmZQzyqyfd

## Client code
- `artifacts/grocerlens/lib/revenuecat.tsx` — initializeRevenueCat, SubscriptionProvider, useSubscription
- Called at top of `_layout.tsx` with try/catch; SubscriptionProvider wraps entire app
- Paywall uses custom Modal (not Alert.alert) for purchase confirmation per RC skill requirement
