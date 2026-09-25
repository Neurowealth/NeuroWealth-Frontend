# Contributing to NeuroWealth Frontend

> Goal: onboard a new contributor in under five minutes.

## Requirements

| Tool | Version |
|------|---------|
| Node.js | **≥ 20** (matches `engines` in `package.json`) |
| Yarn | **1.22.x** — use Corepack (`corepack enable`) or install directly |

Do not commit `package-lock.json` or `npm-shrinkwrap.json`. `yarn.lock` is the canonical lockfile.

## Getting started

```bash
yarn install   # installs deps and activates Husky pre-commit hook
yarn dev       # start local dev server at http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in any values you need.
The app runs in demo/mock mode with no backend required by default.

## Commands

| Command | What it does |
|---------|-------------|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn typecheck` | TypeScript — no emit |
| `yarn lint` | ESLint via `next lint` (CI gate) |
| `yarn test` | Node test runner — `src/**/*.test.ts` |
| `yarn validate:config` | Validate JSON config files (package.json, tsconfig.json) |
| `yarn test:e2e` | Run Playwright end-to-end tests (CI gate) |
| `yarn validate:env` | Validate env vars using hand-rolled checks (no Zod — Zod is used only for API request-body validation) |
| `yarn analyze` | Bundle analysis (writes to `.next/analyze/`) |

## CI gates

Every PR runs `frontend-ci.yml` on GitHub Actions:

1. Config validation (`package.json` and `tsconfig.json`)
2. `yarn typecheck`
3. `yarn test`
4. `yarn lint`
5. `yarn build`
6. `yarn test:e2e` (Playwright E2E tests)

All steps must pass before merge. If CI is red, fix it before requesting review.

## Branch rules

- Target branch for PRs: **`main`**
- Branch from `main`; keep branches short-lived
- Name pattern: `type/short-description` — e.g. `fix/safe-area-nav`, `feat/onboarding-flow`
- Do not push directly to `main` or `master`

## PR checklist

Before opening a PR, confirm:

- [ ] `yarn typecheck` passes locally
- [ ] `yarn lint` passes locally (or lint-staged ran on your staged files)
- [ ] `yarn test` passes locally
- [ ] `yarn build` succeeds (required if you touched routes, layouts, or env vars)
- [ ] `yarn test:e2e` passes locally
- [ ] New behaviour is verifiable — attach screenshots, a test, or written QA steps
- [ ] No new duplicate abstractions introduced without a one-line comment explaining why
- [ ] `.env.example` updated if you added or renamed an env variable

## Code conventions

**Import paths** — use the `@/` alias, never relative `../../` imports across feature boundaries.

**Auth and wallet hooks** — import only from the `@/contexts` barrel:

```ts
// ✅ correct
import { useAuth, useWallet, AuthProvider, WalletProvider } from "@/contexts";

// ❌ wrong — these are enforced by ESLint no-restricted-imports
import { useAuth } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletProvider";
```

**`data-qa` attributes** — kebab-case, describe the flow and action:
`landing-primary-cta-button`, `wallet-connect-button`, `transaction-submit-button`.

**Design tokens** — add new color/spacing tokens to `src/app/globals.css` (`@theme`),
not to `tailwind.config.ts`.

## Optional: pre-commit lint (lint-staged + Husky)

`yarn lint` is the CI gate. Husky is already wired up — after `yarn install` the
pre-commit hook runs `yarn lint-staged`, linting only your staged files.

Skip the hook when needed:

```bash
git commit --no-verify -m "wip: skip pre-commit"
```

See the [Dependency note](#dependency-note) below — no extra install required.

<details>
<summary>Verifying the hook (QA steps)</summary>

1. `yarn install` — the `prepare` script activates Husky automatically.
2. Stage a `.ts` or `.tsx` file: `git add src/some-file.ts`
3. `git commit -m "test: lint-staged check"`
4. Expected: ESLint runs on staged files only. Auto-fixable issues are corrected
   and re-staged; unfixable violations abort the commit with a clear error.
5. Confirm CI still passes independently — `yarn lint` runs the full repo.

</details>

### Dependency note

`husky` and `lint-staged` are in `devDependencies` — no separate install. They
do not run in CI and have zero production bundle impact.

## Issues and backlog

| Resource | Purpose |
|----------|---------|
| [Issue templates](/.github/ISSUE_TEMPLATE/) | Bug, Feature, Frontend task, Design proposal |
| [Backlog](/.github/backlog/) | 50 scoped work items with YAML frontmatter |
| [Audit queue](/.github/audit-issues/) | 30 engineering/platform issues — auth, CI, perf, docs |
| [`.github/ISSUES.md`](/.github/ISSUES.md) | Index and label guide |

When filing a new issue, use the closest template. Add labels that match the
`labels:` frontmatter in backlog and audit files (e.g. `frontend`, `priority-high`).
