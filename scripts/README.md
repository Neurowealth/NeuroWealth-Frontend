# Scripts

## Environment validation

Two modules validate different concerns — do not merge them:

| Module | Used by | Purpose |
|--------|---------|---------|
| `scripts/lib/server-env.ts` | `yarn validate:env:server` | WhatsApp and Stellar env vars (APP_ENV, APP_URL, WhatsApp, Stellar network) |
| `src/lib/env.ts` | Next.js app (`@/lib/env`) | Public `NEXT_PUBLIC_*` URLs and optional `NEUROWEALTH_*` backend paths |

Run both:

```bash
yarn validate:env
```

Or individually:

```bash
yarn validate:env:server
yarn validate:env:frontend
```

Load variables from `.env.local` or export them in the shell before running.
