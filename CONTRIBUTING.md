# Contributing to Corvin

Thank you for helping build a free, open source chess platform. Online play against real people comes first. Everything chess-specific is ours. No ads, no paywall, no trackers.

## Before you start

- Read this file, the [Code of Conduct](CODE_OF_CONDUCT.md), [Governance](GOVERNANCE.md), [Support](SUPPORT.md), and [Security](SECURITY.md) policies.
- Corvin is a multi-repository organization. Open pull requests in the repository that owns the change (see the organization profile repository table).
- Default code license is AGPL-3.0-or-later. Documentation and assets are CC BY-SA 4.0. `sdk` and `bots` are Apache-2.0. Match the `LICENSE` file in the repository you change.

## Hard product rules

1. Do not import Stockfish, Leela, or any third-party engine, network weights, piece sets, boards, or sounds. Do not copy code from Lichess or Chess.com.
2. Fair play detection code may be public. Thresholds, weights, trained detection models, and review heuristics must never be committed.
3. UI strings go through locale files. Ship complete `en` and `it` entries for any new user-visible string.
4. Accessibility is a release blocker: keyboard play, screen reader announcements, and WCAG 2.2 AA contrast and focus behavior for UI work.
5. No emoji in commits, code, docs, or UI copy for Corvin repositories.
6. No tool attribution in commits, code comments, metadata, or documentation. No `Co-authored-by` lines for tools.

## How to contribute

1. Find or open an issue describing the change. Use the issue forms when available.
2. Fork the target repository (or push a branch if you have write access).
3. Keep the change scoped to one problem. Prefer the smallest complete fix.
4. Add or update tests that express the acceptance criteria before or with the implementation.
5. Run the repository's documented lint, typecheck, test, and build commands until they pass.
6. Open a pull request using the pull request template. Link the issue.

## Pull request expectations

- Conventional commit subjects are preferred (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, …).
- Explain why the change is needed. The diff already shows what changed.
- For protocol or API changes, update the relevant contract tests and docs.
- For UI changes, note light/dark theme and keyboard checks you performed.
- Do not force-push shared branches without agreement from maintainers.

## Security and abuse reports

Do not file public issues for security vulnerabilities. Follow [SECURITY.md](SECURITY.md).

## Questions

Product and contribution process questions belong in ordinary issues after reading [SUPPORT.md](SUPPORT.md). Architecture decisions are recorded as ADRs once the docs site and repositories are published.
