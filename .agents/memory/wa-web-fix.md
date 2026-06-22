---
name: WhatsApp link on web (iframe fix)
description: wa.me URLs refuse to load in iframes; must use window.open on web
---

## Rule
When opening `https://wa.me/...` URLs on `Platform.OS === "web"`, always use `window.open(url, "_blank")` instead of `Linking.openURL(url)`.

**Why:** `Linking.openURL` on web navigates the current frame/window. Since the Replit preview (and many embeds) run in an iframe, `wa.me` returns an X-Frame-Options/CSP block ("refused to connect"). Opening in a new tab bypasses the iframe restriction entirely.

**How to apply:** Any time a `wa.me` URL is about to be opened, branch on `Platform.OS`:
```ts
if (Platform.OS === "web") {
  window.open(url, "_blank");
  return;
}
// native path
const canOpen = await Linking.canOpenURL(url);
if (canOpen) Linking.openURL(url);
```

Applied in: `app/(tabs)/insights.tsx` (share summary) and `app/(tabs)/family.tsx` (invite via WhatsApp).
