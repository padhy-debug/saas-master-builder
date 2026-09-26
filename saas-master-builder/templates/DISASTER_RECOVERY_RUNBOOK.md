# Disaster Recovery & Incident Response Runbook

> Step-by-step emergency playbook for database outages, payment webhook failures, secret credential leaks, and data recovery.

---

## Scenario A: Primary Database Outage / Corruption

### 1. Assessment (Minutes 0–5)
- Verify if the outage is network-related, connection starvation (pool exhausted), or disk failure.
- Check connection metrics in cloud provider console (AWS RDS, Supabase, Neon).

### 2. Immediate Failover (Minutes 5–15)
- If using Managed Multi-AZ: Trigger automated promotion of the Read Replica to Primary.
- Update `DATABASE_URL` in application environment variables to point to the promoted instance.
- Redeploy or restart API gateway instances.

### 3. Point-in-Time Recovery (PITR) If Data Was Corrupted
- Locate the timestamp immediately prior to corruption (e.g. `2026-09-26T14:32:00Z`).
- Provision a restored instance from WAL archives:
  ```bash
  # Example AWS CLI / Cloud restore command
  aws rds restore-db-instance-to-point-in-time \
      --source-db-instance-identifier prod-db \
      --target-db-instance prod-db-restored \
      --restore-time 2026-09-26T14:32:00Z
  ```
- Run cross-tenant verification suite against restored instance before pointing traffic:
  ```bash
  npx saas-master audit
  ```

---

## Scenario B: Production API Secret or Stripe Key Leaked

### 1. Immediate Invalidation (Minutes 0–5)
- **Stripe**: Log in to Stripe Dashboard -> Developers -> API Keys. Click **Roll Key** (set grace period to 2 hours so existing requests don't drop abruptly).
- **JWT / Auth Secrets**: Generate a new high-entropy 256-bit secret. Update in Secret Manager. Existing user sessions will be logged out and prompted to re-authenticate.

### 2. Update Production Config (Minutes 5–15)
- Update variables in deployment platform.
- Trigger zero-downtime redeploy.

### 3. Post-Mortem Audit (Within 24 Hours)
- Check audit logs (`audit_logs` table) for any unauthorized API requests during the exposure window.
- If customer data was accessed, invoke notification protocol under GDPR / DPDP Act.

---

## Scenario C: Stripe Webhooks Failing (Dunning & Backlog)

### 1. Check Webhook Delivery Status
- Go to Stripe Dashboard -> Developers -> Webhooks -> Select endpoint -> Check HTTP status codes.
- If returning `500`: Inspect server logs for uncaught exceptions or database connection errors.

### 2. Replay Missed Events
- Once bug is resolved and deployed, Stripe automatically retries failed webhooks with exponential backoff for up to 72 hours.
- To manually force retry: Select failed event in Stripe Dashboard and click **Resend event**.
- Because the `processed_webhook_events` table enforces idempotency, replaying events is 100% safe!
