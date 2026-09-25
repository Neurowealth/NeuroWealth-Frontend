# Cookie Consent QA Checklist (Issue #131)

> **Canonical doc** — `cookie-consent-integration-checklist.md` has been merged into this file and deleted (reconciled in #928).

## Overview

This document provides QA steps to verify cookie consent functionality across all paths: accept, reject, custom, and revoke. It covers banner behaviour, localStorage state, Settings page labels, and cross-session persistence.

**Storage Key:** `nw_cookie_consent` (centralized in `src/lib/storage-keys.ts`)

## Storage Contract

### Data Structure

```typescript
{
  status: "pending" | "accepted" | "rejected" | "custom",
  preferences: {
    necessary: true,      // always true
    analytics: boolean,
    marketing: boolean,
    personalization: boolean
  },
  lastUpdated: ISO string | null
}
```

### Storage Key Registry

All localStorage keys are centralized in `src/lib/storage-keys.ts`:

```typescript
STORAGE_KEYS = {
  COOKIE_CONSENT: "nw_cookie_consent",
  THEME: "nw-theme",
  PREFERENCES: "nw_preferences",
  NOTIFICATIONS: "nw_notifications",
  NOTIFICATIONS_LIST: "nw_notifications_list",
  SECURITY: "nw_security",
  PROFILE: "nw_profile",
  STRATEGY_PREFERENCE: "nw_strategy_preference",
  SANDBOX_SCENARIOS: "sandbox-scenarios",
  ONBOARDING_STATE: "onboarding-state",
  ONBOARDING_USER_STRATEGY: "user-strategy",
  ONBOARDING_FIRST_DEPOSIT: "first-deposit",
  WALLET_CONNECTED: "nw_wallet_connected",
  WALLET_PUBLIC_KEY: "nw_wallet_public_key",
  WALLET_NETWORK: "nw_wallet_network",
  WALLET_PROVIDER: "nw_wallet_provider",
  WALLET_DISPLAY_NAME: "nw_wallet_display_name",
  LOCALE: "neurowealth.locale",
};
```

---

## QA Test Cases

### 1. Initial State (No Consent)

**Pre-requisites:** Open DevTools → Application → Local Storage.

**Steps:**

1. Run `localStorage.clear()` in the console.
2. Reload the page.
3. Verify the banner appears.

**Expected:**

- Cookie banner visible at bottom of screen.
- Status: `"pending"`.
- Storage: key absent.

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // null
```

---

### 2. Accept All Path

**Steps:**

1. Click **"Accept all"** in the banner.
2. Verify the banner disappears.
3. Check storage.
4. Navigate to **Settings > Cookie & Privacy Preferences**.

**Expected:**

- Banner hidden.
- Status: `"accepted"`, all preferences `true`, `lastUpdated` set to current timestamp.
- Settings status label reads: **"All cookies accepted"** (green accent).
- All toggle indicators read **"On"**.

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status);       // "accepted"
console.log(consent.preferences);  // { necessary: true, analytics: true, marketing: true, personalization: true }
```

---

### 3. Reject All Path

**Steps:**

1. Clear the `nw_cookie_consent` key from Local Storage and reload the page.
2. Click **"Reject"** in the banner.
3. Verify the banner disappears.
4. Check storage.
5. Navigate to **Settings > Cookie & Privacy Preferences**.

**Expected:**

- Banner hidden.
- Status: `"rejected"`, only `necessary: true`, others `false`, `lastUpdated` set.
- Settings status label reads: **"Non-essential cookies rejected"** (red accent).
- Only "Strictly Necessary" reads **"On"**; all others read **"Off"**.

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status);       // "rejected"
console.log(consent.preferences);  // { necessary: true, analytics: false, marketing: false, personalization: false }
```

---

### 4. Custom Preferences Path

**Steps:**

1. Clear the `nw_cookie_consent` key from Local Storage and reload the page.
2. Click **"Manage preferences"** (from the banner or Settings).
3. In the Privacy Modal toggle **Analytics** ON, **Marketing** OFF, **Personalization** ON.
4. Click **"Save preferences"**.
5. Verify the banner disappears.
6. Check storage.
7. Navigate to **Settings > Cookie & Privacy Preferences**.

**Expected:**

- Banner hidden.
- Status: `"custom"`, preferences: `{ necessary: true, analytics: true, marketing: false, personalization: true }`, `lastUpdated` set.
- Settings status label reads: **"Custom preferences saved"** (amber accent).

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status);                    // "custom"
console.log(consent.preferences.analytics);    // true
console.log(consent.preferences.marketing);    // false
```

---

### 5. Revoke Consent Path

**Steps:**

1. Accept all cookies (test case 2).
2. Navigate to **Settings > Cookie & Privacy Preferences**.
3. Click the **"Reset"** button.
4. Verify the banner reappears immediately at the bottom of the screen.
5. Check storage.

**Expected:**

- Banner visible again.
- `nw_cookie_consent` key no longer exists in Local Storage.
- Settings status label reads: **"No preference set"**.
- All toggles except "Strictly Necessary" read **"Off"**.

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // null
```

---

### 6. Settings Page Integration

**Steps:**

1. Accept all cookies.
2. Navigate to **Settings > Cookie & Privacy Preferences**.
3. Verify the current status label and preference toggles.
4. Click **"Manage preferences"**, modify a preference, click **"Save preferences"**.
5. Return to the Settings page.
6. Verify the updated preferences are displayed.

**Expected:**

- Status label matches storage state.
- Preferences match storage on every visit.
- Changes persist across page reloads.
- `lastUpdated` timestamp visible.

**Verification:**

```javascript
// After modifying preferences
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.lastUpdated); // recent timestamp
```

---

### 7. Modal Consistency

**Steps:**

1. Accept all cookies.
2. Open the banner → click **"Options"** (or "Manage preferences").
3. Verify the modal reflects current preferences.
4. Modify one preference.
5. Close the modal **without** saving.
6. Reopen the modal.
7. Verify preferences reverted to the saved state.

**Expected:**

- Modal reflects current storage state on open.
- Unsaved changes don't persist.
- Closing the modal doesn't modify storage.

---

### 8. Persistence Across Sessions

**Steps:**

1. Accept all cookies.
2. Close the browser tab.
3. Reopen the site.
4. Verify the banner is **not** visible.
5. Verify storage is intact.

**Expected:**

- Banner hidden (consent remembered via localStorage).
- Storage unchanged.
- Status: `"accepted"`.

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // contains previous consent
```

---

### 9. Storage Key Consistency

**Steps:**

1. Search the codebase for raw `localStorage` references to cookie consent.
2. Verify all use `STORAGE_KEYS.COOKIE_CONSENT`.
3. Verify no hardcoded `"nw_cookie_consent"` strings outside of `storage-keys.ts`.

**Expected:**

- All references use the centralized constant.
- No duplicate storage keys.
- Single source of truth.

**Files to Check:**

- `src/contexts/CookieConsentContext.tsx`
- `src/components/cookie/CookieBanner.tsx`
- `src/components/cookie/PrivacyModal.tsx`
- `src/components/settings/CookieConsentSettings.tsx`

---

## Browser DevTools Verification

### Chrome DevTools

1. Open DevTools (F12).
2. Go to **Application → Local Storage**.
3. Verify `nw_cookie_consent` key exists.
4. Inspect the JSON structure matches the storage contract above.
5. Verify no other cookie-related keys are present.

### Firefox Developer Tools

1. Open DevTools (F12).
2. Go to **Storage → Local Storage**.
3. Verify `nw_cookie_consent` key exists.
4. Inspect the JSON structure.

---

## Automated Test Template

```typescript
// Example test case (Node.js test module)
import { test } from "node:test";
import assert from "node:assert";

test("Cookie consent: accept all", () => {
  // Setup
  localStorage.clear();

  // Action
  acceptAllButton.click();

  // Verify
  const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
  assert.strictEqual(consent.status, "accepted");
  assert.strictEqual(consent.preferences.analytics, true);
  assert.strictEqual(consent.preferences.marketing, true);
  assert.strictEqual(consent.preferences.personalization, true);
});
```

---

## Related Issues

- #131: Align cookie consent storage keys and settings page labels
- #928: Reconcile the two overlapping, unlinked cookie-consent QA checklist docs
- #422: Data viz: verify chart colors against design tokens and contrast for CVD
- #167: Document NEUROWEALTH_API contract (paths, auth, error JSON) for integration
