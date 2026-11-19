# Security Policy

## Scope and ownership

This policy applies to the `Neurowealth/NeuroWealth-Frontend` repository and the code it contains.

- Owner: NeuroWealth frontend maintainers
- In scope: frontend application code, frontend build/runtime configuration, and repository workflows
- Out of scope: backend services, smart contracts, third-party infrastructure, and organization-wide policies outside this repository

## Reporting a vulnerability

Please do not open public GitHub issues for security reports.

Use one of these private channels:

1. Preferred: GitHub private vulnerability reporting (Security tab)  
   `https://github.com/Neurowealth/NeuroWealth-Frontend/security/advisories/new`
2. Fallback: email `support@neurowealth.app` with subject prefix `[SECURITY]`

Include as much detail as possible:

- Affected route, component, or file path
- Reproduction steps and expected vs actual behavior
- Impact assessment (data exposure, auth bypass, privilege escalation, etc.)
- Proof-of-concept details, logs, screenshots, or request samples

## Response expectations

- Initial acknowledgement: within 3 business days
- Triage and severity classification: within 7 business days
- Remediation plan or mitigation update: within 14 business days for high/critical findings
- Coordinated disclosure after a fix is available and validated

## Supported versions

Security fixes are prioritized for the latest `main` branch state. Older snapshots or forks may not receive backports.
