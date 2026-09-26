# Admin Panel — Modules, Audit Logs, and What's Necessary vs. Extra

## Core modules a real SaaS admin panel needs

Split into **tenant-facing admin** (an admin *within* a customer's own org) and **internal/ops admin** (your own team's back office) — they have very different access levels and should probably be different apps or at least different permission tiers, not one panel with everything mixed together.

**Tenant-facing admin (inside the product):**
- User & role management (invite, deactivate, assign roles) for that tenant only
- Billing & subscription view (plan, usage, invoices) — read access to their own billing, not everyone's
- Team/seat management
- API key management (create/rotate/revoke, scoped to that tenant)
- Notification/preference settings
- Their own audit log — "who did what in our org" (this one specifically should be exposed to customers on higher plans; it's a common enterprise sales requirement)

**Internal/ops admin (your team only, separate auth, ideally separate network/VPN or SSO with hardware-key MFA):**
- Tenant management: search, view, suspend, adjust plan/limits, impersonate (with logging — see below)
- Global user search across tenants (for support), with access logged
- License management (issue, revoke, view seat usage) — see file 03
- Feature flag management
- Security center: failed login attempts, active sessions, suspicious activity alerts
- System health dashboard (queue depth, error rates, background job failures)
- Compliance/export center: handle data subject access/erasure requests (see file 06), generate the reports an auditor will actually ask for

## What's necessary vs. what's just extra noise

**Necessary** (security/compliance load-bearing — don't skip these):
- Immutable audit log of every privileged action
- RBAC with least-privilege defaults
- Impersonation controls with mandatory reason + logging + time-boxed session
- Session management (view/revoke active sessions, force logout on password change)
- Failed-login/lockout tracking

**Genuinely useful, add as the product matures:**
- Feature flags / gradual rollout controls
- In-app changelog/announcement management
- Support ticket integration view

**Often over-built too early — don't let this absorb months of effort before you have real admin users:**
- Elaborate analytics dashboards duplicating what your BI tool already does
- Highly configurable custom report builders
- White-label theming controls, unless white-labeling is an actual sold feature

## Audit log schema

```sql
CREATE TABLE audit_log (
  id             BIGSERIAL PRIMARY KEY,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id      UUID,                 -- null for platform-level/internal actions
  actor_id       UUID,                 -- user or internal-admin id
  actor_type     TEXT NOT NULL,        -- 'user' | 'internal_admin' | 'system' | 'api_key'
  action         TEXT NOT NULL,        -- 'user.invite', 'billing.plan_change', 'impersonation.start', etc.
  resource_type  TEXT,
  resource_id    TEXT,
  before_state   JSONB,
  after_state    JSONB,
  result         TEXT NOT NULL,        -- 'success' | 'failure'
  ip_address     INET,
  user_agent     TEXT,
  request_id     TEXT                  -- correlates to app logs/traces for the same request
);

-- append-only: revoke UPDATE/DELETE at the DB role level, or write via a
-- dedicated append-only service/table with no application code path that can mutate it
```

## What MUST be logged (security/compliance-critical)

- Authentication events: login success/failure, logout, password reset, MFA enrollment/removal
- Authorization changes: role grants/revokes, permission changes
- Data export or bulk download events
- Data deletion/erasure requests and their completion
- Admin impersonation: start, end, and every action taken while impersonating
- Billing/license changes: plan upgrade/downgrade, license issue/revoke, seat changes
- API key creation, rotation, revocation
- Security-relevant settings changes (SSO config, IP allowlist, session timeout policy)

## Impersonation, done safely

Support impersonation is necessary (you can't debug a customer issue blind), but it's also one of the highest-risk features in the panel:

- Require a reason field before starting an impersonation session.
- Time-box the session (e.g. auto-expire after 30–60 minutes).
- Log every action taken while impersonating, tagged as `actor_type: internal_admin, on_behalf_of: <tenant_user_id>`.
- Make it visible to the impersonated user — either a persistent banner in their UI during the session, or at minimum a notification afterward ("An admin accessed your account on [date] for [reason]"). Silent impersonation is a trust and, in several compliance frameworks, a legal problem.

## Log retention

Don't hardcode a retention period from memory — it depends on which framework/contract applies (SOC 2 audits commonly expect ~1 year of security log history; PCI-DSS has its own specific windows; a specific enterprise customer's contract may specify something else). Treat the retention period as a configuration decision made during the actual compliance review in file 06, not something invented here. What's universal: whatever the period is, the logs must be tamper-evident (append-only) for that entire window, and backed up separately from the primary application database.

## RBAC baseline

A reasonable starting role set — adjust names/granularity to the product:

| Role | Can do |
|---|---|
| Owner | Everything in their tenant, including billing and deleting the tenant |
| Admin | Manage users/roles/settings, cannot delete the tenant or change billing |
| Manager | Manage content/data within their scope, no user management |
| Member | Standard product usage, no admin functions |
| Read-only / Auditor | View everything relevant, change nothing — useful for compliance reviewers |
| Internal Support (your team) | Scoped, logged, time-boxed access via impersonation only — never standing access to customer data |

Enforce this server-side on every endpoint, not just by hiding UI elements — a hidden button is not access control.
