# Environment variables

## Public vs server-only

In Next.js, any variable prefixed with `NEXT_PUBLIC_` is embedded into the client bundle
and **must be treated as public**.

| Prefix | Where it runs | Can it hold secrets? |
| --- | --- | --- |
| `NEXT_PUBLIC_*` | Browser bundle + server | **No** — visible to every user |
| (no prefix) | Server only (Node runtime) | **Yes** — never sent to the browser |

Never put API keys, tokens, or any secret in a `NEXT_PUBLIC_*` variable.

---

## Variables used by this repository

### Public (browser-safe)

Set these in `.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_WEBHOOK_URL` | Yes | WhatsApp / webhook receiver URL |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for internal Next.js `/api/*` routes |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Optional | Network name — `testnet` or `mainnet` (default: `testnet`) |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Optional | Stellar Horizon endpoint (overrides the SDK default) |
| `NEXT_PUBLIC_APP_ENV` | Optional | App environment label — e.g. `development`, `production`. Used by `scripts/lib/server-env.ts` |
| `NEXT_PUBLIC_APP_URL` | Optional | Canonical app URL (e.g. `http://localhost:3000`). Used by `scripts/lib/server-env.ts` |
| `NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX` | Optional | Feature flag — `"true"` enables the `/dashboard/sandbox` route |
| `NEXT_PUBLIC_DEMO_SEED` | Optional | String seed for deterministic mock data in demos and visual baselines. Any non-empty string activates the Mulberry32 seeded PRNG; unset or empty uses `Math.random()`. See `docs/qa/demo-seed.md`. |

Example `.env.local`:

```bash
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:2000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_DEMO_SEED=demo-seed-2026
```

### Server-only (Node runtime)

These must **not** be exposed to the browser. Set them in `.env.local` or your hosting
platform's secret store (Vercel environment variables, Railway secrets, etc.).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEUROWEALTH_API_BASE_URL` | No | — | Real backend base URL (e.g. `https://api.neurowealth.app`). When unset the UI uses demo/mock data for all API routes. |
| `NEUROWEALTH_API_AUTH_TOKEN` | When base URL is set | — | Bearer token sent from Next.js route handlers to the real backend. Injected as `Authorization: Bearer <token>`. |
| `NEUROWEALTH_PORTFOLIO_PATH` | No | `/portfolio/overview` | Backend path for portfolio data |
| `NEUROWEALTH_TRANSACTIONS_PATH` | No | `/transactions` | Backend path for transaction submission |
| `NEUROWEALTH_STRATEGY_PATH` | No | `/strategy/preference` | Backend path for strategy preference reads and writes |

`NEUROWEALTH_API_BASE_URL` is the primary gate. When it is not set, every route handler
falls back to demo data automatically — no other configuration change is needed for local
development or PR previews.

**`AUTH_SECRET` is not currently used anywhere in this codebase.** The session cookie
(`nw_session`) is intentionally unsigned while auth is mock-only: `middleware.ts` only
checks that the cookie decodes to JSON with a `token` string and a future `expiresAt` — it
does not verify a signature, so it is not a substitute for real authentication. Wiring
`AUTH_SECRET` into real JWT signing/verification is part of the "Production-Ready httpOnly
Cookie Flow" already documented in `src/lib/auth-constants.ts`, and should land before any
real backend auth integration. Until then, treat every route guard here as a UX redirect,
not a security boundary.

---

## How variables flow at runtime

```
Browser request
  └─ Next.js server (Node)
       ├─ reads NEXT_PUBLIC_* variables from the bundle (public, already embedded)
       ├─ reads server-only variables from process.env (never leaves the server)
       └─ calls real backend (if NEUROWEALTH_API_BASE_URL is set)
              with Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN>
```

The `src/lib/api-client.ts` module handles this split:

- `apiRequest()` — used in browser-side client components; calls Next.js `/api/*` routes,
  authenticated via the `nw_session` cookie. Note: this cookie is **not** currently
  `httpOnly` and carries no signature (see the `AUTH_SECRET` note above) — it is set by
  client-side JS in `AuthContext.tsx` for the mock auth flow.
- `createServerApiClient()` — used inside Next.js route handlers; calls the real backend
  and automatically injects the `Authorization` header.

See `docs/api-integration.md` for the full API integration guide.

---

## Edge runtime and middleware constraints

The current middleware at `middleware.ts` runs on the **Edge runtime**. Constraints:

- Edge runtime does **not** support all Node.js APIs (`fs`, many `crypto` patterns,
  `child_process`, etc.).
- `middleware.ts` must only use Web APIs and Next.js `NextResponse` utilities.
- **Server-only variables are available in middleware** but reading secrets in Edge code
  carries higher risk than reading them in standard Node route handlers — prefer route
  handlers for anything that touches `NEUROWEALTH_API_AUTH_TOKEN`.
- Secrets must never be referenced from `"use client"` components or `NEXT_PUBLIC_*`
  variables.

If this project introduces Edge Route Handlers (e.g. `export const runtime = "edge"` in
a route file), apply the same constraints: use only Web APIs, pass data through server
components or standard route handlers instead of reading secrets directly.

See the [Next.js Edge Runtime documentation](https://nextjs.org/docs/app/api-reference/edge)
for the full list of supported APIs.

---

## Validation

Runtime validation runs at startup via `src/lib/env.ts`. The `getEnv()` call throws if any
**required** public variable is missing, and logs a warning in development when
`NEUROWEALTH_API_BASE_URL` is set without a matching `NEUROWEALTH_API_AUTH_TOKEN`.

To validate server variables separately before deploying:

```bash
yarn validate:env:server
yarn validate:env:frontend
```
