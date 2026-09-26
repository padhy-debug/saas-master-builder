---
name: saas-master-builder
description: Autonomous engineering OS, decision framework, and production breakthrough toolkit for designing, building, securing, and shipping unbreakable multi-tenant SaaS products (web + backend + mobile app together). Use whenever the user is architecting a SaaS platform, designing multi-tenancy/user isolation, building a licensing or subscription system, handling Stripe payments/webhooks, integrating LLM/AI gateways, designing an admin panel or audit-log system, wiring a web app and mobile app to the same backend, preparing compliance docs (GDPR/SOC2/ISO27001/India DPDP Act/government submissions), preparing a Play Store or App Store launch, running a security/vulnerability review, or preparing an executive client handoff. Also use for "production-grade", "enterprise-ready", "compliant", "unbreakable", or "one-shot app store approval" requests, or when asked to stop hallucinating / stop claiming things are "100% done" without proof.
---

# SaaS Master Builder — Autonomous Engineering OS

This is not an ordinary boilerplate. It is a **battle-tested decision framework + production blueprint library + anti-hallucination behavioral contract** for building real, multi-tenant SaaS products without hand-waving the hard parts: tenant isolation, Stripe webhook race conditions, offline licensing, audit logging, app↔web contract drift, compliance, app-store approval, and security review.

It exists to solve a critical failure mode: AI agents (or rushed developers) declaring a SaaS "done," "secure," or "compliant" without ever having actually verified it. Read `references/10-anti-hallucination-protocol.md` first — it governs how every other file in this skill is meant to be used.

## How to use this skill

1. **Always start with the protocol.** Before writing code or making claims, read `references/10-anti-hallucination-protocol.md`. It is the operating contract for this entire skill.
2. **Jump to the relevant reference file(s)** below based on the current objective. Progressive disclosure: load only what is needed.
3. **Use the production blueprints.** Don't re-invent multi-tenancy, Stripe webhooks, or rate limiting from scratch. Scaffold them using `npx saas-master scaffold <blueprint>`.
4. **Treat every checklist as an evidence gate.** A checklist item is only "done" once you have actually produced verifiable evidence (a passing test output, a real scan report, a filled form). Run `npx saas-master check-evidence` to enforce.

## Reference Index

| File | Read this when the user is working on... |
|---|---|
| `references/01-architecture.md` | Overall SaaS system design: layers, services, data flow, tech stack choice, scalability, observability |
| `references/02-multi-tenancy.md` | Handling multiple tenants/organizations/users — isolation model, tenant identification, Row-Level Security, provisioning, noisy-neighbor protection |
| `references/03-licensing-system.md` | A license-key or subscription-gating system, license API design, and **offline validation / grace-period** behavior |
| `references/04-admin-panel-audit-logs.md` | What the internal admin panel needs: modules, audit-log schema, RBAC, impersonation controls, log retention |
| `references/05-web-app-sync-architecture.md` | Making the website/dashboard and the mobile app talk to **one** backend correctly — contract-first API design, no validation drift |
| `references/06-compliance.md` | Compliance documentation: GDPR, SOC 2, ISO 27001, PCI-DSS, and **India's DPDP Act 2023** |
| `references/07-app-store-readiness.md` | Preparing for Google Play / Apple App Store submission so it doesn't get rejected or need multiple review cycles |
| `references/08-security-vulnerability-scanning.md` | Security & vulnerability review: OWASP Top 10, OWASP API Top 10, mobile MASVS, CI scanning stack |
| `references/09-frontend-quality.md` | Making the UI look like a real, designed product instead of a generic AI-generated template |
| `references/10-anti-hallucination-protocol.md` | **Read first, always.** How Claude (or any agent) must behave — evidence before claims, no fabricated APIs, no fake "100% done" |
| `references/11-stripe-billing-and-monetization.md` | Indestructible Stripe billing: Webhook idempotency, dunning, proration, grace periods, disputes |
| `references/12-ai-agent-saas-integration.md` | Production AI SaaS: Semantic caching, token budgeting, prompt injection shields, structured Zod outputs |
| `references/13-database-migrations-disaster-recovery.md` | Zero-downtime expand/contract migrations, connection pooling with PgBouncer, RPO/RTO & PITR recovery |
| `references/14-client-handoff-enterprise-satisfaction.md` | Client satisfaction protocol: ADRs, interactive API docs, sign-off certificates, runbooks |
| `references/15-zero-breakage-auto-update-and-distribution.md` | Dual-slot atomic auto-updates, Windows file-lock trampoline, UAC elevation & self-healing rollback |
| `references/16-universal-document-printing-hardware-engine.md` | Universal invoicing, letterhead margin calibration, zero-gap fiscal sequences & ESC/POS thermal printing |
| `references/17-enterprise-identity-sso-scim-security.md` | Enterprise SAML 2.0 / OIDC SSO, SCIM 2.0 automated directory sync & cryptographic superadmin impersonation |
| `references/18-offline-first-crdt-sync-engine.md` | Offline-first architecture, local mutation outbox queue, CRDTs, vector clocks & deterministic state convergence |
| `references/19-bulletproof-versioning-backward-compatibility.md` | Stripe-style date-based API transformations, additive-only evolution & 100-year backward compatibility |
| `references/20-universal-outbound-webhooks.md` | Universal outbound webhooks dispatcher, HMAC-SHA256 signatures, SSRF protection & retry queues |
| `references/21-secure-object-storage-and-large-file-uploads.md` | Direct-to-S3/R2 presigned upload pipeline, tenant folder sandboxing & MIME validation |
| `references/22-feature-flags-remote-config-entitlements.md` | High-performance in-memory feature flags, percentage canary rollouts & plan tier entitlements |
| `references/23-omnichannel-notifications-and-in-app-inbox.md` | Omni-channel notification hub, in-app notification center inbox & digest batching |
| `references/24-async-data-exports-and-etl-streaming.md` | High-volume streaming CSV exports, cursor pagination & Excel formula injection defense |
| `references/25-internationalization-i18n-currencies-timezones.md` | Universal UTC timestamps, integer minor-unit currencies (no float bugs) & RTL layouts |

## Production Blueprints (`blueprints/`)

- `blueprints/01-multi-tenant-rls/` — PostgreSQL Row-Level Security policies, Drizzle/Prisma schema & cross-tenant leak test suite.
- `blueprints/02-bulletproof-stripe/` — Stripe webhook handler with idempotency table & subscription state machine.
- `blueprints/03-redis-sliding-window/` — Distributed sliding window rate limiter (Lua script + TypeScript).
- `blueprints/04-cryptographic-licensing/` — Ed25519 asymmetric license generator & offline verifier with clock anti-tamper.
- `blueprints/05-rbac-audit-trail/` — Immutable append-only audit trail with SHA-256 hash chains & RBAC matrix.
- `blueprints/06-ai-saas-gateway/` — Enterprise AI gateway with prompt injection shield, caching & per-tenant token limits.
- `blueprints/07-bulletproof-auto-updater/` — Dual-slot self-healing auto-updater with Windows UAC trampoline & auto-rollback.
- `blueprints/08-universal-print-and-invoice-engine/` — Universal print & invoice engine, letterhead calibrator & ESC/POS thermal generator.
- `blueprints/09-enterprise-sso-scim/` — Enterprise SAML 2.0 SSO, SCIM 2.0 directory sync & superadmin impersonation guard.
- `blueprints/10-outbound-webhooks-engine/` — Outbound webhooks dispatcher with HMAC-SHA256 signing, SSRF defense & delivery logging.
- `blueprints/11-secure-storage-uploads/` — Direct-to-S3/R2 presigned upload pipeline with tenant sandboxing & MIME validation.
- `blueprints/12-feature-flags-entitlements/` — In-memory feature flag evaluator with percentage canary rollouts & plan tier limits.
- `blueprints/13-omnichannel-notifications/` — Omni-channel notification hub & in-app notification center inbox.
- `blueprints/14-async-export-data-pipeline/` — High-volume streaming CSV data export worker with Excel injection sanitization.

## Project Templates (`templates/`)

- `templates/CONTEXT.md` — Running project state so an AI agent never starts from zero.
- `templates/TASKS.md` — Task tracker with mandatory evidence column.
- `templates/SECURITY_CHECKLIST.md` — Pre-release security gate.
- `templates/LAUNCH_CHECKLIST.md` — Combined go-live release gate.
- `templates/CLIENT_HANDOFF_CHECKLIST.md` — Complete handoff checklist guaranteeing client satisfaction.
- `templates/ENTERPRISE_SLA_TEMPLATE.md` — Formal SLA commitment (99.9% uptime, RPO/RTO).
- `templates/DISASTER_RECOVERY_RUNBOOK.md` — Step-by-step emergency playbook.
- `templates/ARCHITECTURE_DECISION_RECORD.md` — Professional ADR template for stakeholder communication.

## CLI Commands (`npx saas-master`)

- `npx saas-master audit`: Scans codebase for cross-tenant leaks, hardcoded secrets, and missing webhook idempotency.
- `npx saas-master check-evidence`: Audits `TASKS.md` to ensure zero checklist items are checked without proof.
- `npx saas-master scaffold <name>`: Injects production blueprints directly into your codebase.
- `npx saas-master report "<Client Name>"`: Generates an executive client sign-off report.
- `npx saas-master doctor`: Full system diagnosis across security, evidence, and multi-tenancy.
