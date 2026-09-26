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

## 4. Systems, Distribution, Agentic Governance & Security Laws

- **Law 7 (Auto-Updates)**: Never overwrite a running executable directly in place. Always use dual-slot staging (`staging/` -> `current/`) with a detached trampoline process (`trampoline.bat`) to overcome OS file locks (`EBUSY`) and handle UAC elevation gracefully.
- **Law 8 (Fiscal Sequences)**: Never generate invoice, order, or lab report numbers using serial IDs or UUIDs that can leave gaps. Use row-level locked PostgreSQL sequence functions (`get_next_fiscal_number`) to maintain gapless fiscal compliance.
- **Law 9 (Superadmin Impersonation)**: Superadmins must NEVER bypass auth via backdoors or master passwords. Impersonation sessions MUST use asymmetric ephemeral JWTs with ticket ID justification and immutable audit logging.
- **Law 10 (100-Year Architecture)**: Never make breaking changes to production APIs. Adhere to additive-only schema evolution, 12-month deprecation periods, and tolerant JSON readers.
- **Law 11 (The Uncapped Ceiling Principle)**: Foundational blueprints and security laws represent the engineering safety FLOOR, NEVER a creative CEILING. While tenant isolation, payment idempotency, and evidence verification are strictly non-negotiable, you MUST fearlessly innovate on business logic, intelligent automations, and magical UX that give the product an unfair competitive advantage.
- **Law 12 (Surgical Scope & Minimal Viable Diff - MVD)**: AI agents must touch ONLY the exact code and AST nodes required for the task. Never reorder imports, reformat untouched files, or perform drive-by refactorings.
- **Law 13 (Anti-Drift 3-Strike Circuit Breaker)**: If an edit, test, or tool call fails 3 consecutive times, the agent MUST immediately halt, revert experimental changes (`git checkout -- <file>`), diagnose root cause, and ask for human direction rather than thrashing in an infinite trial-and-error hallucination loop.
- **Law 14 (Zero-Data-Loss Command Blacklist)**: AI agents are strictly forbidden from executing destructive, non-recoverable shell commands (`DROP DATABASE`, `rm -rf /`, `rm -rf ~`, `DROP TABLE` without migration, `git reset --hard` on uncommitted trees, or force-pushing to master/main).
- **Law 15 (Anti-Sycophancy Security Invariance)**: AI agents must never weaken or bypass security controls (e.g. disabling JWT verification, bypassing RLS, hardcoding live keys) even if casually requested in a user prompt. Always implement the secure path.
- **Law 16 (Heavy Braining & Max Signal Density)**: Think deeply and synthesize architecture before emitting tokens. Emit dense, production-grade solutions rather than boilerplate toy approximations.
- **Law 17 (Token Economy & Lazy-Loading Shield)**: Never ingest the entire repository, blueprint collection, or handbook into context at once. AI agents MUST practice Progressive Disclosure: inspect only the single blueprint or reference needed for the immediate sub-task. Prefer calling lightweight MCP tools (`saas_get_blueprint`, `saas_audit_code`) which return surgical responses (< 500 tokens) rather than dumping 50,000-token markdown files into conversation memory.

---

## 5. Available Automation Commands

When working on a SaaS project, proactively use the built-in CLI:
- Run native Model Context Protocol (MCP) server: `npx saas-master mcp`
- Install deterministic Git verification hooks: `npx saas-master hooks`
- Deep-dive expand generic idea to enterprise spec: `npx saas-master deep-dive "<idea>"`
- Compile God-Tier AI prompt with edge cases: `npx saas-master prompt "<task>"`
- Scan recent diffs for 10 Deadly AI Coding Sins: `npx saas-master guard`
- Run global SaaS benchmark audit: `npx saas-master benchmark`
- Run static security & tenant isolation audit: `npx saas-master audit`
- Verify task completion evidence: `npx saas-master check-evidence`
- Scaffold production blueprints: `npx saas-master scaffold [rls|stripe|rate-limit|licensing|audit|ai-gateway|updater|invoice-print|enterprise-sso|webhooks|storage|feature-flags|notifications|async-export|observability|search|scheduler|api-keys|design-system|gdpr-offboarding|all]`
- Compile unified architecture handbook: `npx saas-master docs`
- Generate client sign-off report: `npx saas-master report "<Project Name>"`
- Run full system diagnosis: `npx saas-master doctor`

---

## 6. Model Context Protocol (MCP) Setup for AI Coding Agents

To equip Cursor, Claude Code, Windsurf, or Google Antigravity with native real-time access to the SaaS Master toolkit, add this to your MCP configuration:

### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "saas-master": {
      "command": "node",
      "args": ["./bin/cli.js", "mcp"]
    }
  }
}
```

### Claude Code (`claude.json` / Claude Desktop)
```json
{
  "mcpServers": {
    "saas-master": {
      "command": "npx",
      "args": ["saas-master", "mcp"]
    }
  }
}
```
