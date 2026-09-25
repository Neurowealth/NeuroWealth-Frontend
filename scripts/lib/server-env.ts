/**
 * Server-side / integration environment validation (WhatsApp, Stellar).
 * Used by `yarn validate:env:server` — not imported by the Next.js app bundle.
 * For frontend runtime config see `src/lib/env.ts`.
 *
 * DB_* and WALLET_ENCRYPTION_KEY are intentionally not checked here: this
 * frontend has no database client and never persists wallet secrets — see
 * `src/lib/wallet-persistence.ts`, which stores only the public key/provider
 * (non-sensitive) in localStorage. Those vars belong to a separate backend
 * deployment, not this repo.
 */
const requiredEnvVars = [
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_URL",
  "WHATSAPP_APP_SECRET",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_WABA_ID",
  "STELLAR_NETWORK",
  "STELLAR_HORIZON_URL",
] as const;

export function validateServerEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`,
    );
  }

  const network = process.env.STELLAR_NETWORK!;
  if (!["testnet", "mainnet"].includes(network)) {
    throw new Error("STELLAR_NETWORK must be 'testnet' or 'mainnet'");
  }
}
