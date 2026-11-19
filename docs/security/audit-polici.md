# npm audit triage policy for Stellar and wallet dependencies

## Snapshot

- Reviewed on: `2026-09-24`
- `next` re-checked on `2026-09-24` after the `14.2.3` → `14.2.35` upgrade (#875) via the npm bulk advisory endpoint (`POST https://registry.npmjs.org/-/npm/v1/security/advisories/bulk` with `{"next":["14.2.35"]}`), because `yarn audit --json` timed out again against the registry. `next` advisories went from `3 critical / 12 high / 16 moderate / 4 low` (35) to `2 critical / 8 high / 11 moderate / 2 low` (23). The tree-wide counts below predate the upgrade; refresh them on the next successful full audit.
- Command: `yarn audit --json` (canonical lockfile is `yarn.lock`; `npm audit --json` was attempted but timed out against the registry in this environment — same installed tree)
- Summary (unique advisories): `4 critical`, `54 high`, `51 moderate`, `7 low` (116 total)
- Yarn instance rollup across the tree: `5 critical`, `123 high`, `111 moderate`, `12 low` (251 total)
- Direct-dependency risk is concentrated in:
  - `next@14.2.35` (middleware authorization bypass GHSA-f82v-jwr5-mffw is **patched**; image optimization RCE GHSA-2xp9-vwfh-vxw4 and Windows RCE GHSA-p293-qw3h-jr36 remain — fixed only in `>=15.5.24`, with no 14.2.x backport; several high DoS/SSRF advisories remain)
  - `@creit.tech/stellar-wallets-kit@1.9.5` and its transitive wallet tree (`@trezor/*`, `@hot-wallet/sdk`, `@solana/web3.js`, `axios`, `protobufjs`, `ws`)
- Prior `secp256k1` critical via `@near-js/crypto` is no longer reported as critical; residual crypto risk in that chain is `elliptic` at `low`.

## Policy

- Do not run `npm audit fix --force` / `yarn upgrade` with breaking upgrades without maintainer sign-off.
- Treat direct dependencies with patched releases as `must-fix`, especially framework and auth-routing packages.
- Treat transitive wallet findings as one of: `must-fix now`, `accepted temporary risk`, or `monitor only`. Every accepted risk needs a reason and a review date.
- Prefer this order of remediation:
  1. Patch or minor upgrade the direct dependency.
  2. Add a targeted `overrides` entry only after build, typecheck, tests, and wallet smoke checks pass.
  3. If no safe override exists, open or link an upstream issue and schedule a review instead of forcing the tree.

## Current decisions

| Package path | Severity | Decision | Reason | Next action |
| --- | --- | --- | --- | --- |
| `next@14.2.35` (direct) | `critical` (+ multiple `high`) | `must-fix` | Upgraded from `14.2.3` (#875): clears the critical middleware authorization bypass GHSA-f82v-jwr5-mffw (`x-middleware-subrequest`, fixed in `>=14.2.25`), which `middleware.ts` depends on to gate `/dashboard`, `/profile`, `/settings`, `/onboarding`. `14.2.35` is the last 14.x release; GHSA-2xp9-vwfh-vxw4 (image optimization RCE) and GHSA-p293-qw3h-jr36 (Windows-hosted RCE) are only fixed in `>=15.5.24`, plus high DoS/SSRF advisories (e.g. GHSA-c4j6-fc7j-m34r, GHSA-36qx-fr4f-26g5, GHSA-89xv-2m56-2m9x, GHSA-p9j2-gv94-2wf4) fixed in 15.5.x. | Open/land a dedicated Next 15.5.x (`>=15.5.24`) upgrade PR. Until then, avoid Windows hosting and keep `next/image` remote patterns tight. Re-run audit, typecheck, test, build, and smoke `/login` + middleware-protected routes after. |
| `protobufjs` via `@trezor/protobuf` → `@trezor/connect` → `@creit.tech/stellar-wallets-kit` | `critical` | `accepted temporary risk` | Arbitrary code execution advisory (GHSA-xq3m-2v4x-88gg). Trezor hardware integration is not wired into the current Stellar connect/sign flow, so the critical path is not reachable in the shipped UI. | Keep wallet scope limited to Freighter/Albedo/Lobstr. Track upstream `@creit.tech` / `@trezor/*` for a patched transitive tree. Re-evaluate within **7 days** or on next wallet SDK update. |
| `@creit.tech/stellar-wallets-kit@1.9.5` (direct) | `high` (rolled up transitive) | `must-fix` (upgrade path) | Direct dependency still pulls `@trezor/*`, `@hot-wallet/sdk`, and Solana tooling. Bumped from the prior `1.8.x` snapshot to `1.9.5`, but the transitive critical/high surface remains. | Prefer upstream kit bump over forced overrides. Run wallet connect / deposit / withdrawal smoke tests on each kit release. |
| `axios` via `@trezor/blockchain-link` → `@creit.tech/stellar-wallets-kit` | `high` | `accepted temporary risk` | Multiple prototype-pollution / header / proxy advisories. Path sits under unused Trezor blockchain-link code for the current Stellar demo scope. | Resolved automatically if the kit drops or patches the Trezor tree. Recheck on next wallet SDK bump. |
| `ws` via `@trezor/websocket-client` / `@solana/web3.js` → wallet kit | `high` | `accepted temporary risk` | Memory-exhaustion DoS on fragmented frames. Not on the Freighter-only connect/sign path used by the app. | Recheck on next wallet SDK bump. Prefer upstream refresh over a forced override. |
| `defu` via `@walletconnect/*` → wallet kit | `high` | `accepted temporary risk` | Prototype pollution in defaults merge. WalletConnect is not the active Stellar integration surface in this app. | Monitor upstream kit releases; avoid enabling WalletConnect modules until patched. |
| `uuid < 11.1.1` via `jayson` → `@solana/web3.js` → `@hot-wallet/sdk` | `moderate` | `accepted temporary risk` | Buffer-bounds issue in v3/v5/v6 only when an optional `buf` argument is provided. Application code does not call uuid directly. | Schedule with the `@creit.tech` upgrade PR. |
| `ua-parser-js 2.0.1–2.0.9` via `@trezor/env-utils` | `moderate` | `monitor only` | UAParser ReDoS via `withClientHints()`. This app does not parse UA strings server-side from that package. | Clear on next routine dependency maintenance / kit bump. |
| Tooling chain (`minimatch`, `brace-expansion`, `js-yaml`, `glob` via eslint / typescript-eslint) | `high` | `monitor only` | DevDependency / lint-time only; not shipped to browsers. | Address on next eslint / typescript-eslint maintenance PR. |
| `elliptic` via wallet / near / hot-wallet tree | `low` | `monitor only` | Replaces the prior critical `secp256k1` finding in this snapshot. No clean patched recommendation without forcing the wallet tree. | Track upstream guidance; rerun audit on each wallet SDK update. |
| `@near-js/*` / Solana sibling packages via `@hot-wallet/sdk` | `low`–`moderate` (rollup) | `monitor only` | NEAR and Solana are not active integration targets for NeuroWealth Stellar flows. | Resolved automatically if the kit drops `@hot-wallet/sdk` or patches the tree. |

## Review cadence

- Re-run `yarn audit --json` (or `npm audit --json` when registry-responsive) on every dependency upgrade PR that touches `next`, wallet SDKs, or auth/middleware code.
- Re-review `critical` and `high` accepted wallet risks within **7 days** while `@creit.tech/stellar-wallets-kit` remains in use.
- Treat the remaining `next` criticals (RCE advisories fixed only in `>=15.5.24`) as blocking for production hardening — do not roll the 7-day wallet cadence into a deferral for framework auth advisories.
- Run a full audit at least **monthly** until all critical and high production-reachable findings are cleared.

## PR QA checklist for dependency triage changes

- `yarn typecheck`
- `yarn test`
- `yarn build`
- Smoke test `/login`, `/dashboard`, `/dashboard/settings/security`, and wallet-connect entry points after any dependency upgrade
