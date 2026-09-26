# CLAUDE.md — SaaS Master Builder Protocol

This project uses the **SaaS Master Builder** operating contract.

## Core Rules for Claude Code
1. **Evidence Before Assertion**: You must run the actual verification commands (e.g. `npx vitest run`, `npx saas-master audit`, `npm run build`) and show the terminal output before stating that any feature is complete, secure, or working.
2. **Never Fabricate Checklist Completion**: When updating `TASKS.md` or checklists, every `[x]` requires an `evidence: <real_proof>` line. Run `npx saas-master check-evidence` to verify.
3. **Multi-Tenancy Isolation**: Never execute un-scoped queries on tenant data. Always enforce Postgres RLS or explicit `organization_id` filters.
4. **Indestructible Webhooks**: Stripe/payment handlers must check the `processed_webhook_events` table before executing side-effects.

## Common Commands
- Audit Codebase: `node bin/cli.js audit`
- Check Evidence Integrity: `node bin/cli.js check-evidence`
- Scaffold Production Blueprints: `node bin/cli.js scaffold [rls|stripe|rate-limit|licensing|audit|ai-gateway|updater|invoice-print|enterprise-sso|all]`
- Run Doctor Diagnostics: `node bin/cli.js doctor`
- Generate Client Delivery Certificate: `node bin/cli.js report "<Project Name>"`
