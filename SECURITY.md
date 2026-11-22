# Security policy

Corvin takes security and player privacy seriously. Report vulnerabilities privately. Do not open public issues, pull requests, or discussions that describe an unfixed vulnerability.

## How to report

1. Prefer GitHub private vulnerability reporting on the affected repository once the organization owner has enabled it (Security tab, then Advisories, then Report a vulnerability). Do not use public issues for unfixed vulnerabilities even if private reporting is not yet enabled.
2. Until a dedicated security contact email is published by the organization owner, do not invent or guess an address. Use private vulnerability reporting when available, or contact an organization owner through a private GitHub channel.
3. Include steps to reproduce, affected repositories or components, impact, and any proof-of-concept details needed for verification. Keep reports factual.

We will acknowledge reports as capacity allows and coordinate disclosure after a fix is available or a clear timeline is agreed.

## Scope

In scope examples:

- Authentication and session handling flaws
- Cross-site scripting, CSRF, injection, or privilege escalation in Corvin services
- Unauthorized access to games, accounts, or personal data
- Worker job signing or analysis result forgery issues
- Secrets or private fair-play configuration accidentally exposed in public repositories

Out of scope examples:

- Denial of service from ordinary volume without a novel amplifier
- Issues that require physical access or a fully compromised client device
- Social engineering of individual users
- Purely theoretical issues without a plausible path to impact

## Fair play configuration

Public repositories may describe detection mechanisms. Thresholds, weights, trained detection models, and review heuristics are private configuration. Do not request or publish those values in issues, pull requests, or advisories beyond what is required for a confidential fix.

## Safe harbor

We will not pursue legal action against researchers who:

- Report in good faith through private channels
- Avoid privacy violations, data destruction, and service disruption beyond what is necessary to demonstrate the issue
- Give us a reasonable time to fix before public disclosure

## Owner follow-up

The organization owner must publish a durable security contact address and enable private vulnerability reporting on organization repositories. Until then, this document intentionally omits a placeholder email.
