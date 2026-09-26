# SaaS Master Builder

A decision framework + reference library + behavioral contract for building a real, multi-tenant SaaS product — web, backend, and mobile app together — without hand-waving the hard parts.

This is not a boilerplate you clone and `npm run deploy`. It's the guide an AI coding agent (or a human) should read *before* and *while* building a SaaS product, so decisions about tenant isolation, licensing, admin/audit logging, app↔web contract integrity, compliance, app-store readiness, and security review are made deliberately — and nothing gets marked "done" without actual evidence.

## Why this exists

Left unguided, AI coding agents (and rushed humans) reliably do a few specific things wrong on SaaS projects: they skip tenant isolation until it's discovered in production, they build licensing that hard-locks the moment wifi drops, they let the web and mobile client quietly re-implement the same business rule two different ways until they drift, and — most damagingly — they declare things "done," "secure," or "compliant" without ever actually checking. This repo is built to close all five gaps at once.

## How to use it

**As a Claude Skill**: drop this folder into your skills directory (or install the packaged `.skill` file). Claude will consult `SKILL.md` whenever a conversation involves SaaS architecture, multi-tenancy, licensing, admin panels, compliance, app-store submission, or security review.

**As a plain repo / with any other AI coding agent**: point the agent at `SKILL.md` as the entry point, the same way you'd point it at an `AGENTS.md` or `CLAUDE.md`. Copy `templates/CONTEXT.md` and `templates/TASKS.md` into your actual project root and keep them updated as the project evolves.

**As a human reference**: every file under `references/` is a standalone, readable guide — read the one relevant to what you're working on.

```
saas-master-builder/
├── SKILL.md                                 <- start here
├── references/
│   ├── 01-architecture.md
│   ├── 02-multi-tenancy.md
│   ├── 03-licensing-system.md
│   ├── 04-admin-panel-audit-logs.md
│   ├── 05-web-app-sync-architecture.md
│   ├── 06-compliance.md
│   ├── 07-app-store-readiness.md
│   ├── 08-security-vulnerability-scanning.md
│   ├── 09-frontend-quality.md
│   └── 10-anti-hallucination-protocol.md    <- read this one first, always
└── templates/
    ├── CONTEXT.md
    ├── TASKS.md
    ├── SECURITY_CHECKLIST.md
    └── LAUNCH_CHECKLIST.md
```

## Scope and honesty about what this is (and isn't)

This is a **guide and framework**, not a working application. It contains real, usable code snippets (Postgres RLS policies, JWT license-token verification, audit log schemas) but it is not a boilerplate codebase you deploy as-is. Compliance and app-store content is dated and sourced at the time of writing — re-verify against official sources before making any compliance or approval claim to a real client. See `references/10-anti-hallucination-protocol.md` for the operating principle behind that distinction: never let "addresses the checklist" get reported as "certified compliant."

## Acknowledgements

The idea of encoding a project's engineering discipline as a machine-readable behavioral contract the AI agent reads every session — rather than relying on the agent "remembering" good practice — is one this repo shares with the broader agent-guardrails community, including the publicly available `agent-constitution` project. The compliance and app-store checklists here are grounded in officially published standards and current reporting (OWASP Foundation's Top 10 and API Security Top 10, India's DPDP Act 2023 and DPDP Rules 2025, and current Google Play / Apple App Store review guidance) rather than any single other repository.

## License

Use, fork, and adapt freely for personal and commercial projects.
