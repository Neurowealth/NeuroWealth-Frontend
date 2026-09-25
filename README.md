# NeuroWealth — Frontend

This repository contains the Next.js frontend for NeuroWealth. It's a demo-ready frontend with mock authentication, UI components, and client-side adapters that let the app run without a backend.

**Assumptions**: This frontend targets the **Stellar testnet** by default (`NEXT_PUBLIC_STELLAR_NETWORK=testnet`). For production, configure `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` and provide a real API backend via `NEUROWEALTH_API_BASE_URL`.

## Package manager

This project uses **Yarn 1 (Classic)** as the package manager. The exact version is pinned in the
`packageManager` field of `package.json` (`yarn@1.22.22`).

**Do not use `npm install` or `pnpm install`** — they will produce a different lockfile format and
break the Corepack pin. Always run `yarn install` to install dependencies.

The lockfile (`yarn.lock`) is committed to the repository. After adding or upgrading packages,
commit the updated `yarn.lock` alongside the `package.json` change.

Next.js uses the **SWC compiler** for both development (Fast Refresh) and production builds.
No Babel configuration is present; SWC is the default when using Next.js 13+. The SWC binary
is resolved automatically by Next.js — no extra install step is needed.

**Platform-specific dependency**: `@tailwindcss/oxide-linux-x64-gnu` is listed under
`optionalDependencies` in `package.json`. This is the native Rust engine binary for
Tailwind CSS v4 on Linux x86-64 GNU targets (e.g. most CI and Codespace environments).
It is marked optional so `yarn install` does not fail on macOS or Windows — Tailwind CSS
falls back to a pure-JS engine on those platforms automatically. No manual action needed.

## Quick start

Requirements: Node.js 20+, Yarn (Corepack supported)

Install and run:

```bash
# Enable the pinned yarn version via Corepack (run once per machine)
corepack enable
corepack prepare

yarn install
yarn dev
```

Run tests:

```bash
yarn test
```

Inspect bundle size locally:

```bash
yarn analyze
```

This runs a production build with the Next.js bundle analyzer enabled via `ANALYZE=true`.
The report is written under `.next/analyze/`, which is already ignored by git.

Use this command when checking for bundle regressions before merging. We do not run it in CI
because analyzer builds are slower than the normal test/lint/build pipeline.

## What this repo contains

- Next.js 14 app under `src/app`
- Client-side mock auth (`src/lib/mock-auth.ts`) that persists an in-browser session in `localStorage` and mirrors it to a non-httpOnly cookie so `middleware.ts` can perform edge-side redirects.
- Edge middleware (`middleware.ts`) that protects routes under `/dashboard`, `/profile`, and `/settings` and redirects unauthenticated users to `/login?from=...`.
- Tests using the Node test runner (match: `src/**/*.test.ts`).

## Folder structure

```
src/
├── app/                   # Next.js App Router — routes and layouts
│   ├── (auth)/            # Signup flow route group only
│   ├── (errors)/          # Standalone error pages (401 unauthorized, 403 forbidden, 500 server-error)
│   ├── api/               # Route handlers for app APIs and mock backends
│   ├── dashboard/         # Protected dashboard shell and sub-routes
│   │   ├── dev-errors/    # Dev-only error trigger routes (hidden in production)
│   │   ├── portfolio/
│   │   ├── activity/
│   │   ├── strategy/
│   │   └── settings/
│   ├── demo/              # Dev-only demo pages and UI probes
│   ├── docs/              # Reference docs pages and examples
│   ├── login/             # Login entry flow and redirect handling
│   ├── not-found.tsx      # Global 404 page
│   ├── onboarding/        # Multi-step onboarding flow
│   ├── page.tsx           # Landing page and marketing entry screen
│   ├── profile/           # Account and profile pages
│   ├── settings/          # Top-level settings shell and pages
│   └── error.tsx          # Global 500 / uncaught error boundary
├── components/            # Shared UI components (ui/, dashboard/, auth/, layout/)
├── features/              # Feature-scoped logic co-located with its UI
├── hooks/                 # Reusable React hooks
├── lib/                   # Pure utilities, constants, and adapters
│   ├── mock-auth.ts       # Client-side mock auth session
│   ├── auth-constants.ts  # Canonical storage/cookie key names
│   └── …
└── types/                 # Shared TypeScript types and interfaces
```

TypeScript strict mode is enabled (`tsconfig.json` → `"strict": true`).
Lint runs via `yarn lint` (ESLint + `eslint-config-next`).

## Environment variables

See `docs/env.md` for the full variable reference, including the public/server-only split,
Edge middleware constraints, and runtime validation notes. Typed accessors and validation
live in `src/lib/env.ts` — each field is documented with its corresponding env var name.

## Backend integration (mock vs real API)

The frontend supports two runtime modes controlled by **server-only** env vars (see
`src/lib/env.ts` and [NEUROWEALTH_API.md](NEUROWEALTH_API.md)):

| Mode | Condition | Behaviour |
| --- | --- | --- |
| **Demo / mock** | `NEUROWEALTH_API_BASE_URL` unset | All `/api/*` route handlers return in-process mock data (`source: "demo"`). No backend required — default for local dev and PR previews. |
| **Real API** | `NEUROWEALTH_API_BASE_URL` set | Route handlers proxy to the backend via `createServerApiClient()` with `Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN>`. |

### Request paths

| Browser calls | Next.js route | Backend path (when configured) |
| --- | --- | --- |
| Portfolio data | `GET /api/portfolio` | `GET {NEUROWEALTH_PORTFOLIO_PATH}` (default `/portfolio/overview`) |
| Transactions | `POST /api/transactions` | `POST {NEUROWEALTH_TRANSACTIONS_PATH}` (default `/transactions`) |
| Strategy | `GET/PUT /api/strategy` | `GET/PUT {NEUROWEALTH_STRATEGY_PATH}` (default `/strategy/preference`) |

Browser → Next.js requests authenticate via the httpOnly session cookie (`nw_session`).
Next.js → backend requests require the Bearer token — never expose it to the client bundle.

### Headers

| Hop | Required headers |
| --- | --- |
| Browser → `/api/*` | `Accept: application/json`; `Content-Type: application/json` on writes; session cookie |
| Server → backend | `Accept: application/json`; `Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN>` |

### Response envelope & errors

All `/api/*` responses use the unified envelope defined in `src/lib/api-response.ts`:

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "…", "details": { } } }
```

The typed client in `src/lib/api-client.ts` unwraps success payloads and throws `ApiRequestError`
on failure. Built-in client error codes include `REQUEST_TIMEOUT` (408), `NETWORK_ERROR` (503),
`INVALID_JSON`, and `INVALID_ENVELOPE`. Backend codes are forwarded verbatim.

Use `useAsyncData((signal) => apiRequest("/api/…", { signal }))` so in-flight requests abort on
unmount. See [NEUROWEALTH_API.md](NEUROWEALTH_API.md) and [docs/api-integration.md](docs/api-integration.md)
for full endpoint schemas and integration checklists.

## Provider tree & data flow

The React provider tree is composed in `src/components/ClientProviders.tsx` using grouped sub-composers and a conditional wallet mount:

```
ClientProviders
├── Providers
│   ├── AppShellProviders
│   │   ├── SandboxProvider          # Dev-only error trigger context
│   │   ├── ThemeProvider            # Dark/light theme with localStorage persistence
│   │   └── I18nProvider             # Internationalization & locale state
│   ├── AuthProviders
│   │   └── AuthProvider             # User session: localStorage ↔ cookie sync
│   └── FeedbackProviders
│       ├── ToastProvider            # Toast notifications & alerts
│       └── CookieConsentProvider    # Privacy & cookie banner state
├── ErrorTrackingMount               # Global error tracking (window errors + unhandledrejections)
├── WalletProvider                   # Conditional: only on /dashboard and /profile
│   └── children
├── CookieBanner                     # Cookie consent banner
├── PrivacyModal                     # Consent modal
└── children
```

**Provider order matters**: Each provider depends on layers below it. For example, `ThemeProvider` initializes before `AuthProvider` so theme preferences load before the user checks authentication, and the wallet context is mounted only on wallet-capable routes.

### Key data flows

1. **Authentication**:
   - User signs in via `/login` → `AuthContext.signIn()` → `mock-auth.ts` creates session
   - Session stored in `localStorage` (key: `SESSION_STORAGE_KEY`)
   - Session mirrored to httpOnly cookie (key: `SESSION_COOKIE_NAME`) for middleware
   - Middleware (`middleware.ts`) reads cookie to redirect unauth users
   - Sign-in on other tabs triggers `storage` event → all tabs sync

2. **Stellar wallet integration**:
   - `WalletProvider` resolves network based on `NEXT_PUBLIC_STELLAR_NETWORK` env (testnet/mainnet)
   - Horizon URL configurable via `NEXT_PUBLIC_STELLAR_HORIZON_URL` (falls back to public nodes)
   - `useWallet()` hook provides wallet state and account info

3. **API requests**:
   - Browser → Next.js `/api/*` routes: authenticated via httpOnly cookie (no extra header needed)
   - Next.js → Real backend: use `createServerApiClient()` in route handlers to inject Bearer token (from `NEUROWEALTH_API_AUTH_TOKEN` env)
   - All responses must conform to the standard envelope (see NEUROWEALTH_API.md)
   - Demo mode (no backend): all `/api/*` routes return mock data

4. **Internationalization**:
   - Active locale stored in `localStorage` (key from `auth-constants.ts`)
   - `dictionaries` map locale codes to message objects
   - All formatters (`formatCurrency`, `formatDate`, etc.) use `getActiveIntlLocale()` for locale-aware output

5. **Theme**:
   - Light/dark mode persisted to `localStorage`
   - CSS variables injected into `:root` for tailwind theming
   - `ThemeProvider` initializes before auth so theme loads without flash

## Auth syncing note

The mock auth flow stores the session in `localStorage` using `SESSION_STORAGE_KEY` and mirrors it into a cookie named `SESSION_COOKIE_NAME`. This allows the browser UI and Next.js middleware to agree on authentication state in demo setups. See `src/lib/auth-constants.ts` for the canonical values.

## Contributing

- Follow existing patterns for components and hooks.
- Tests live next to logic under `src/` and run via `yarn test`.
- For bundle-size checks, run `yarn analyze` locally and review the generated report before
  changing code that affects route or vendor bundles.
- Use `data-qa` only for smoke-flow anchors, with kebab-case names that describe the flow and
  action, for example `landing-primary-cta-button`, `wallet-connect-button`, and
  `transaction-submit-button`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, CI gates, branch rules, and
PR checklist.

### Issue queues

| Queue | Purpose |
|-------|---------|
| [Audit issues](/.github/audit-issues/) | 30 engineering/platform issues — auth, CI, performance, docs |
| [Backlog](/.github/backlog/) | 50 scoped feature and design work items |
| [Issues index](/.github/ISSUES.md) | Label guide and queue overview |

When picking up work, choose an item from the audit queue (engineering clean-up) or the
backlog (features), then open a GitHub issue using the closest
[issue template](/.github/ISSUE_TEMPLATE/).

## Security

To report a vulnerability or for our handling and response expectations, see [SECURITY.md](SECURITY.md). Please do not file public issues for security reports.

## License

Internal/demo project — see repository owner for license details
