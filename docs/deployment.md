# Deployment Guide — NeuroWealth Frontend

## Environments

| Environment | Branch    | Stellar Network | URL                                   |
|-------------|-----------|-----------------|---------------------------------------|
| Staging     | `dev`     | Testnet         | https://staging.neurowealth.com       |
| Production  | `main`    | **Mainnet**     | https://neurowealth.com               |

> ⚠️ Production uses Stellar Mainnet and real USDC. Never deploy untested code to `main`.

---

## Environment Variables

Copy `.env.example` and fill in real values before deploying:

```bash
cp .env.example .env.local   # local dev
```

Required secrets stored in GitHub → Settings → Secrets and variables → Actions:

| Secret name (staging prefix `STAGING_`, production prefix `PROD_`) | Description |
|---|---|
| `APP_URL` | Public origin, e.g. `https://staging.neurowealth.com` |
| `WHATSAPP_APP_SECRET` | Meta WhatsApp Cloud API secret |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token |
| `WHATSAPP_ACCESS_TOKEN` | API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Linked phone number ID |
| `WHATSAPP_WABA_ID` | WhatsApp Business Account ID |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel org/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

This frontend has no database client and never persists wallet secrets — see
[`src/lib/wallet-persistence.ts`](../src/lib/wallet-persistence.ts), which stores
only the connected wallet's public key and provider id (non-sensitive) in
`localStorage`. `DB_*` and `WALLET_ENCRYPTION_KEY` secrets belong to a separate
backend deployment and are not required here.

---

## CI Pipeline (all PRs and main/dev pushes)

Workflow: `.github/workflows/frontend-ci.yml`

Steps run on every PR and push to `main`/`master`:

1. `yarn install` — install locked dependencies
2. `yarn typecheck` — TypeScript strict check
3. `yarn test` — unit tests
4. `yarn lint` — ESLint
5. `yarn build` — production build

---

## Deploying to Staging

Push to or merge a PR into `dev` (or `staging`).  
Workflow `.github/workflows/deploy-staging.yml` triggers automatically.

Steps:
1. `yarn install --frozen-lockfile`
2. `yarn validate:env` — validates all required env vars are present
3. `yarn typecheck` + `yarn lint`
4. `yarn build` with `NEXT_PUBLIC_APP_ENV=staging`
5. `npx vercel --yes` — deploy preview to Vercel

Monitor: **GitHub → Actions → Deploy to Staging**

### Manual staging deploy

```bash
NEXT_PUBLIC_APP_ENV=staging NEXT_PUBLIC_APP_URL=https://staging.neurowealth.com yarn build
npx vercel --token=$VERCEL_TOKEN --yes
```

---

## Deploying to Production

Merge `dev` → `main` via a reviewed Pull Request.  
Workflow `.github/workflows/deploy-production.yml` triggers automatically.

Steps:
1. `yarn install --frozen-lockfile`
2. `yarn validate:env` — validates all required env vars are present
3. `yarn typecheck` + `yarn lint`
4. `yarn build` with `NEXT_PUBLIC_APP_ENV=production`
5. `npx vercel --prod --yes` — promote to Vercel production alias

Monitor: **GitHub → Actions → Deploy to Production**

---

## Pre-Release Checklist

- [ ] PR reviewed and approved by at least 1 maintainer
- [ ] All CI checks green (typecheck, tests, lint, build)
- [ ] Staging deploy verified — test deposit, balance check, withdrawal flows
- [ ] No browser console errors or warnings on staging
- [ ] `STELLAR_NETWORK=mainnet` confirmed in production Vercel env vars
- [ ] CHANGELOG updated
- [ ] Smoke-test production URL after deploy

---

## Rollback Instructions

### Option A — Vercel Dashboard (fastest, ~30 seconds)

1. Go to vercel.com → NeuroWealth project → **Deployments** tab
2. Find the last known-good deployment
3. Click **⋮ → Promote to Production**
4. Verify live URL is restored

### Option B — Git Revert (triggers automatic redeploy)

```bash
git checkout main
git revert HEAD          # or: git revert <bad-commit-sha>
git push origin main     # CI redeploys automatically
```

### Option C — Vercel CLI

```bash
vercel rollback --token=$VERCEL_TOKEN
```

---

## Post-Rollback Verification

- [ ] Site loads at production URL without errors
- [ ] Send "hi" to NeuroWealth WhatsApp number — bot responds
- [ ] `NEXT_PUBLIC_APP_ENV` shows `production` (check via browser → Network → document response headers)
- [ ] Stellar Horizon URL is `https://horizon.stellar.org` (mainnet)
- [ ] Notify team: rollback reason, affected versions, resolution ETA

---

## Docker (self-hosted / alternative deploys)

A `Dockerfile` is included for teams that prefer containerised deploys instead of Vercel.

```bash
# Build image
docker build \
  --build-arg NEXT_PUBLIC_APP_ENV=production \
  --build-arg NEXT_PUBLIC_APP_URL=https://neurowealth.com \
  -t neurowealth-frontend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_APP_ENV=production \
  neurowealth-frontend:latest
```

See `Dockerfile` at the repo root for the full multi-stage build definition.
