# Multi-Tenancy — Handling Multiple Customers/Organizations Safely

This is the single highest-consequence design decision in a SaaS product. Get it wrong and one customer can eventually see another customer's data — the most damaging bug class a SaaS company can have.

## The three isolation models

| Model | What it means | Isolation strength | Ops cost | When to use |
|---|---|---|---|---|
| **Silo** | Separate database (sometimes separate infra) per tenant | Strongest | Highest — migrations, backups, monitoring all multiply per tenant | Enterprise/government/regulated clients demanding physical data separation; very large tenants |
| **Bridge** (schema-per-tenant) | One database, separate schema per tenant | Strong | Medium — still N schemas to migrate, but shared infra | Mid-market B2B with moderate tenant count (dozens–low hundreds) and some compliance pressure |
| **Pool** (shared schema + `tenant_id`) | One database, one schema, every table has a `tenant_id` column, rows filtered by it | Depends entirely on discipline | Lowest — one schema to run/migrate/scale | Most PLG/startup SaaS, high tenant count, cost-sensitive |

Most SaaS products should start **pooled**, and offer silo/dedicated isolation only as an enterprise-tier upsell if a customer's compliance team requires it. Don't build silo-per-tenant from day one unless you already know your buyers require it (common in gov/healthcare/finance sales).

## Enforcing isolation in the pooled model — Postgres Row-Level Security

Don't rely on "every developer remembers to add `WHERE tenant_id = ?`" — that's how cross-tenant leaks happen. Enforce it at the database layer:

```sql
-- every tenant-owned table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- the app sets this once per request/connection, before any query runs
SET app.tenant_id = '3fae2b1e-...';
```

With RLS enabled, even a query that forgets the `WHERE tenant_id = ...` clause simply cannot return another tenant's rows — the database enforces it, not application code. Set `app.tenant_id` in a connection-scoped middleware at the very start of request handling, from a trusted source (the authenticated JWT's tenant claim), never from a client-supplied header alone.

If you're on a database without RLS, replicate the same idea in code: a single shared repository base class/query builder that *always* injects the tenant filter, so no query path can bypass it by accident. Never let individual feature code build raw queries against tenant tables directly.

## Tenant identification

Pick one (or combine) based on your product's UX:

- **Subdomain**: `acme.yourapp.com` — clean UX, easy to resolve tenant before auth even runs (useful for tenant-branded login pages).
- **Custom domain**: `app.acme.com` mapped via CNAME — needed for white-label/enterprise tiers; requires a domain-verification and SSL-provisioning flow (e.g. via your CDN/load balancer, Let's Encrypt automation).
- **Path or header-based** (`/t/acme/...` or `X-Tenant-Id` header): common for API-only or mobile clients where subdomains are awkward.
- **JWT claim**: once authenticated, the access token itself should carry the resolved `tenant_id` as a signed claim — this becomes the trusted source for RLS, not anything the client can freely set.

## Tenant provisioning workflow

1. Signup creates a `tenant` record (status: `trial` or `pending_activation`).
2. Seed default roles/permissions and a default admin user for that tenant.
3. Create the corresponding billing customer record in your payment provider (Stripe/Razorpay/etc.), linked by `tenant_id`.
4. Fire an onboarding event/webhook (welcome email, in-app checklist).
5. Tenant status transitions are explicit and logged: `trial → active → past_due → suspended → cancelled`. Never silently soft-delete a tenant's data on cancellation — follow whatever retention/export window your ToS and compliance obligations (file 06) require before actual deletion.

## Noisy-neighbor protection

- Per-tenant rate limiting on the API gateway (token bucket keyed by `tenant_id`, not just IP).
- Per-tenant resource quotas where relevant (storage, API calls/month, background job concurrency) tied to their plan tier.
- Background jobs processed from a queue with per-tenant fairness (round-robin across tenants) so one tenant's large batch job doesn't starve everyone else's queue.

## Testing tenant isolation — don't just assume it

Write it as an explicit, automated test class, not a manual check:

- Seed two tenants with data.
- Authenticate as a user of tenant A.
- Attempt to read/update/delete a resource ID belonging to tenant B, via every relevant endpoint.
- Assert every single attempt returns `404`/`403` — never leaking even the *existence* of the resource.

This test suite should run in CI on every PR that touches a tenant-owned table. A cross-tenant leak is the one class of bug this skill treats as a release blocker, full stop — see the "before you say done" gate in file 10.
