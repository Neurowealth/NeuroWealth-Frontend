# Changelog

All notable changes to NeuroWealth Frontend are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are tagged in GitHub Releases and linked from this file.

---

## [Unreleased] — 2026-09-25 (Through PR #899)

### Fixed / Refactored
- Guard `useStorageSync` callback against editing state to prevent overwriting active user edits during background sync (PR #899)
- Remove dead `setAuditService` export and clean up unused audit service bindings (PR #898)

### Added
- `CHANGELOG.md` with initial dated section and release notes process (closes #168)
- `.lintstagedrc` for optional pre-commit lint-staged setup (closes #166)
- Body size limit (100 kb) and JSON parse error handling on all POST API routes (closes #165)
- `env(safe-area-inset-bottom)` padding on `MobileBottomNav` and fixed CTAs for notched devices (closes #164)

### Process
Release notes are maintained manually in this file by the PR author.
Each PR that ships user-visible changes must add an entry under `[Unreleased]`.
On release, the maintainer renames `[Unreleased]` to the version + date and opens a GitHub Release linking back here.

No automation (Changesets, semantic-release) is required at this stage.
If the team later adopts Changesets, this file becomes the generated output target.
