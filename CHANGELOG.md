# Changelog

All notable changes to NeuroWealth Frontend are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are tagged in GitHub Releases and linked from this file.

---

## [Unreleased]

### Added
- Provider service layer, storage adapters, and onboarding hook refactor (#335, #337, #338, #339; #597)
- Global search and validation system with race-safety / no-results coverage (#520, #515, #365, #366)
- Shared form-field accessibility wiring and chart `aria-label` / `prefers-reduced-motion` support (#498, #594)
- Auth middleware, consolidated Tailwind token sources, and env-example hardening (#511, #510)
- Bundle analyzer support and major dashboard surface work (#497, #496)
- Comprehensive i18n test coverage and dashboard string migration (#584, #587)
- Test coverage for pagination, z-index scale, form field validation, and settings hooks (#667, #668, #670, #671)
- Role/notifications/diagnostics list migration (#701, #696, #698, #699; #762)
- Privacy settings page, cookie consent settings, and SandboxBadge component (#724, #752)
- Preview endpoint caching (#716; #753)
- Initial release hygiene: `CHANGELOG.md` and its process, optional lint-staged setup, POST body/JSON validation, and safe-area CTA/navigation padding (#164, #165, #166, #168)
- Regression coverage for preview cache headers, privacy and cookie-consent settings, role adaptation, notification preferences, release-checklist flows, transaction forms, debounce behavior, and wallet/UI accessibility (#833, #834, #836, #837, #844, #846, #847)

### Changed
- Consolidated `/signin` into `/login` as the canonical auth route (#381, #508)
- Performance pass: memoized Auth/Sandbox provider values, lazy-loaded GlobalSearch, shared formatters (#588, #589, #586)
- Unified seed strategy across mock services and chart data (#661)
- Aligned signup validation with shared helpers; standardized API validation errors to 400 (#658, #571)
- Unified route metadata and isolated dev-error routes from breadcrumbs (#659, #662)
- Settings theming cleanup and service-layer ID store strategy consistency (#693, #694, #695, #697; #759, #762)
- Client providers, navbar, transaction-flow, and auth-context refactor (#332, #333, #334, #336; #679)
- CI now uses the shared `validate:config` command, documents and runs Playwright in the intended order, and removes duplicate E2E execution (#763, #764, #845, #891)
- Replaced stale documentation and demo-seed guidance, removed `yarn` from runtime dependencies, and reconciled environment, security, and issue-template references (#826, #827, #839, #893, #894)
- StrategyList, TransactionList, and strategy confirmation flows now use shared badges, theme-aware text, and the shared modal stacking/focus patterns (#828, #829, #843)
- Standardized API error presentation and failure logging across portfolio, settings, and transaction flows; malformed cookie-consent state is rejected safely (#834, #840)
- Added shared cross-tab storage synchronization and stale-response protection for settings and async state (#846, #847)
- Upgraded Next.js and `eslint-config-next` to 14.2.35 to address the middleware authentication bypass advisory (#896)
- Added a light-mode surface to the command palette while preserving the dark-mode presentation (#885)

### Fixed
- Accessibility hardening: modal/drawer focus traps, keyboard-operable controls, navbar touch targets, Switch focus-visible ring (#595, #660, #585, #663)
- Deposit/withdraw `aria-invalid` / `aria-describedby`, notification keyboard semantics, portfolio breakpoint alignment (#594, #523, #564)
- Fetch recovery UX, logger/PII hardening, and API timeout documentation (#389, #390, #357–#360)
- Storage key / sandbox scenario sharing and frontend persistence cleanup (#341–#344, #513)
- CI typecheck/test/lint gate stability (including Next 14 `.eslintrc.json` for `next lint`) (#592, #593)
- Error boundary focus target collision and wallet state a11y (#615, #617; #746, #747)
- Security and E2E issues (#622, #625; #680)
- Transaction stages a11y (#616; #681)
- Switch focus-visible ring (#663)
- Round 3 audit fixes (#684, #687; #757)
- Settings/storage error logging (#755)
- Round-3/round-4 audit follow-ups for dead code, preview caching, diagnostics focus, filter memoization, auth helpers, and responsive layout checks (#832, #833, #835, #837, #844, #845)
- Dialog and tab accessibility: diagnostics tabs, privacy modal focus/Escape handling, keyboard-operable onboarding cards, and focus traps for diagnostics and confirmation dialogs (#803, #804, #802, #812, #843, #844, #846, #895)
- Strategy and notification state reliability: pagination reset, cross-tab preference sync, stale async-response handling, theme preference application, notification toggle names, and duplicate error-page landmark IDs (#771, #772, #773, #774, #775, #777, #778, #846, #847, #848)
- API mutation protection now requires a matching Origin, rate-limits transaction writes, and derives strategy rate-limit keys only from trusted client IP headers (#691, #700, #702, #703, #708, #841, #842, #896)
- Command palette focus is trapped and uses the shared `z-modal` tier (#881, #882, #896)
- Wallet connection DOM mutation, observer scope, amount parsing, and selectable-card accessibility gaps (#877, #878, #879, #880, #895)
- Replaced StrategyList's hand-rolled status colors with shared Badge variants and corrected the misleading PreferenceToggle test comment (#883, #884)

### Removed
- Orphaned service layer module (#727; #749)
- Unused CVD chart-color exports (#725; #751)
- Dead `next/script` import and stale DB/WALLET_ENCRYPTION_KEY secrets (#717; #672, #765)
- Dead service-layer adapters, fake session-sync tests, unused chart exports, duplicate E2E execution, and other audit-identified helpers (#717, #718, #720, #721, #795, #799, #800, #835, #837, #845, #891)
- Stale duplicate QA documentation and the dead `src/useDateFilterMock.ts` helper (#826, #839, #848)

### Security
- Continued dependency and audit hygiene tracked under `docs/security/` (see npm audit policy reviews)
- Auth security docs and demo-seed audit fixes (#666, #672)
- Audit issues remediation (#539, #581, #582, #583; #669, #664)
- Audit docs and demo issues (#666)
- API authentication, Origin/CSRF validation, transaction rate limiting, trusted proxy IP handling, and password-change failure logging (#691, #700, #702, #703, #708, #840, #841, #842)
- Restricted the diagnostics debug bypass, redacted error/stack fields, and hardened mock-auth throttling (#791, #792, #837)
- Hardened wallet connection DOM handling and refreshed the September npm audit policy snapshot (#875, #877, #878, #890, #894, #896)

### Documented
- Folder structure documentation in `README.md` covering all top-level `src/` directories (closes #428)
- Release notes process confirmed as manual Keep a Changelog (closes #427)
- Authenticated dashboard shell verified: protected route, responsive layout (sidebar + top header / mobile bottom nav), skeleton loading states, and error boundary all in place (closes #429)
- Error pages verified: 401, 403, 404, and 500 pages implemented with recovery actions; dev-only mock triggers available at `/dashboard/dev-errors` (closes #449)
- CI and Playwright contribution steps, provider tree, route folders, security reporting, and public environment variables were reconciled (#708, #709, #710, #711, #763, #764, #839, #845, #893)
- Chart accessibility recommendations were verified and marked resolved (#888, #892)
- Pull request and npm audit policy documentation were refreshed for the current repository state (#890, #894, #896)

### Process
- Release notes remain manual Keep a Changelog entries under the single, date-free `[Unreleased]` section.
- Release automation (release-please / Changesets) is not configured; retain the manual process until a dedicated tooling decision is made.
- This refresh consolidates the previously duplicated dated `[Unreleased]` sections and records merged work through PR #896.
- Each PR that ships user-visible changes should add an entry here; maintainers fold `[Unreleased]` into a versioned section on release.
