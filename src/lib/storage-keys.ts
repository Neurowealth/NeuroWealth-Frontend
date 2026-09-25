/**
 * Centralized storage key registry
 * All localStorage keys must be defined here to ensure consistency and prevent duplication.
 * Keys mirror existing app behavior and may use either `nw_` or legacy hyphenated names.
 */

export const STORAGE_KEYS = {
  // Cookie consent
  COOKIE_CONSENT: "nw_cookie_consent",

  // Theme mode
  THEME: "nw-theme",

  // Dashboard settings
  PREFERENCES: "nw_preferences",
  NOTIFICATIONS: "nw_notifications",
  NOTIFICATIONS_LIST: "nw_notifications_list",
  SECURITY: "nw_security",

  // User profile
  PROFILE: "nw_profile",

  // Strategy selection
  STRATEGY_PREFERENCE: "nw_strategy_preference",

  // Sandbox state
  SANDBOX_SCENARIOS: "sandbox-scenarios",

  // Onboarding flow
  ONBOARDING_STATE: "onboarding-state",
  ONBOARDING_USER_STRATEGY: "user-strategy",
  ONBOARDING_FIRST_DEPOSIT: "first-deposit",

  // Stellar wallet connection (WalletProvider)
  WALLET_CONNECTED: "nw_wallet_connected",
  WALLET_PUBLIC_KEY: "nw_wallet_public_key",
  WALLET_NETWORK: "nw_wallet_network",
  WALLET_PROVIDER: "nw_wallet_provider",
  WALLET_DISPLAY_NAME: "nw_wallet_display_name",

  // UI translation locale (I18nContext). Distinct from the BCP47 locale stored
  // inside the PROFILE / PREFERENCES blobs — see src/lib/locale-options.ts.
  LOCALE: "neurowealth.locale",
} as const;

/** Legacy keys used before centralization; migrated on read. */
export const LEGACY_WALLET_STORAGE_KEYS = {
  CONNECTED: "stellar_wallet_connected",
  PROVIDER: "stellar_wallet_id",
  PUBLIC_KEY: "stellar_wallet_address",
  DISPLAY_NAME: "stellar_wallet_name",
} as const;

/**
 * Type-safe storage key getter
 * Usage: getStorageKey('COOKIE_CONSENT')
 */
export function getStorageKey(key: keyof typeof STORAGE_KEYS): string {
  return STORAGE_KEYS[key];
}
