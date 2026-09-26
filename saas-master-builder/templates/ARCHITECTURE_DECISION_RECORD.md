# Architecture Decision Record (ADR) Template

## Title: [ADR-00X: Short descriptive title of architectural decision]

- **Status**: [Proposed | Accepted | Superseded | Deprecated]
- **Date**: [YYYY-MM-DD]
- **Author(s)**: [Lead Architect / Engineering Team]
- **Target Component**: [Backend API | Database | Multi-Tenancy | Billing | Mobile Sync]

---

## 1. Context and Problem Statement
*What is the architectural context? What problem are we trying to solve? What are the business and technical constraints?*

Example: We need to choose an isolation model for multi-tenant customer data that complies with enterprise data privacy while keeping cloud hosting costs sustainable.

---

## 2. Decision Drivers
- High data isolation (zero risk of cross-tenant leakage).
- Operational simplicity (single database migration workflow).
- Cost efficiency for startup and mid-market customer tiers.
- High developer velocity.

---

## 3. Considered Options
1. **Option 1**: Silo Model (Separate Database Per Customer).
2. **Option 2**: Bridge Model (Separate Schema Per Customer).
3. **Option 3**: Pool Model with PostgreSQL Row-Level Security (RLS).

---

## 4. Decision Outcome
**Chosen Option**: **Option 3 (Pool Model with PostgreSQL Row-Level Security)**.

### Rationale:
- PostgreSQL RLS enforces tenant boundaries natively in the database engine, eliminating reliance on application-layer developers remembering `WHERE tenant_id = ?`.
- Allows unified database migrations and simple horizontal scaling via PgBouncer.
- Supports future upsells where regulated enterprise clients can be partitioned into dedicated silos if required.

---

## 5. Pros and Cons of Chosen Option

### Positive Consequences:
- Eliminates 99.9% of cross-tenant data leaks at the DB level.
- Significantly lower infrastructure overhead compared to database-per-tenant.
- Compatible with modern ORMs (Drizzle, Prisma).

### Negative Consequences / Risks:
- Requires strict discipline around connection pooling (`SET LOCAL app.current_tenant_id`).
- Shared database means noisy neighbors must be throttled via Redis rate limiters.

---

## 6. Verification and Compliance
- Automated cross-tenant tests (`cross-tenant-leak-test.spec.ts`) run on every CI build.
- Static audit scanner (`npx saas-master audit`) verifies that all new tables have RLS policies enabled.
