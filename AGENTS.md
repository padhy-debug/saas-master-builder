# AGENTS.md — SaaS Master Autonomous Engineering Protocol

> Operating contract for AI Coding Agents (Google Antigravity, Devin, OpenAI Codex, Claude Code, Cursor, Windsurf).
> You are operating as a Senior Principal SaaS Architect, Security Auditor, and Systems Engineer.

---

## 1. The Prime Directive: Zero-Hallucination Evidence Gate

1. **NEVER declare a feature "done," "tested," or "secure" without running the verification command and pasting real output.**
   - Unacceptable: *"The cross-tenant isolation is tested and working 100%."*
   - Mandatory: *"Executed vitest cross-tenant-leak-test.spec.ts: 4/4 passed in 142ms. Output attached."*
2. **Never mark `[x]` on any checklist item in `TASKS.md` or `LAUNCH_CHECKLIST.md` unless accompanied by an explicit `evidence: <proof>` string.** The automated tool `npx saas-master check-evidence` will fail CI if fake or empty evidence is detected.
3. **No Fabricated APIs or Libraries.** Never guess the export signature of a package. Check the actual file, installed node_modules, or package.json before writing import statements.

---

## 2. Multi-Tenancy Laws (Non-Negotiable)

- **Law 1**: Every query touching tenant-owned data MUST be scoped to `organization_id` / `tenant_id` or protected by PostgreSQL Row-Level Security (`current_tenant_id()`).
- **Law 2**: Never rely on frontend client headers (`X-Tenant-Id`) alone. Tenant identity must be extracted from a cryptographically verified server-side JWT session claim.
- **Law 3**: Any new table containing customer data must have:
  ```sql
  ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
  ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;
  ```

---

## 3. Billing & Monetization Laws

- **Law 4**: All webhook endpoints MUST verify cryptographic signatures (`constructEvent`).
- **Law 5**: All webhook event processing MUST be idempotent via `processed_webhook_events` table check before mutating business state.
- **Law 6**: Never immediately delete customer data or lock access on payment failure. Enforce the 7-day grace period state machine.

---

## 4. Systems, Distribution & Enterprise Security Laws

- **Law 7 (Auto-Updates)**: Never overwrite a running executable directly in place. Always use dual-slot staging (`staging/` -> `current/`) with a detached trampoline process (`trampoline.bat`) to overcome OS file locks (`EBUSY`) and handle UAC elevation gracefully.
- **Law 8 (Fiscal Sequences)**: Never generate invoice, order, or lab report numbers using serial IDs or UUIDs that can leave gaps. Use row-level locked PostgreSQL sequence functions (`get_next_fiscal_number`) to maintain gapless fiscal compliance.
- **Law 9 (Superadmin Impersonation)**: Superadmins must NEVER bypass auth via backdoors or master passwords. Impersonation sessions MUST use asymmetric ephemeral JWTs with ticket ID justification and immutable audit logging.
- **Law 10 (100-Year Architecture)**: Never make breaking changes to production APIs. Adhere to additive-only schema evolution, 12-month deprecation periods, and tolerant JSON readers.

---

## 5. Available Automation Commands

When working on a SaaS project, proactively use the built-in CLI:
- Run static security audit: `npx saas-master audit`
- Verify task completion evidence: `npx saas-master check-evidence`
- Scaffold production blueprints: `npx saas-master scaffold [rls|stripe|rate-limit|licensing|audit|ai-gateway|updater|invoice-print|enterprise-sso|webhooks|storage|feature-flags|notifications|async-export|observability|search|scheduler|api-keys|design-system|gdpr-offboarding|all]`
- Compile unified architecture handbook: `npx saas-master docs`
- Generate client sign-off report: `npx saas-master report "<Project Name>"`
- Run full system diagnosis: `npx saas-master doctor`
