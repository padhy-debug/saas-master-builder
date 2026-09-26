# Database Migrations, Zero-Downtime & Disaster Recovery

A SaaS product that takes 30 minutes of downtime for every schema update or loses customer data on a database crash cannot charge enterprise prices. Real SaaS architectures are built to survive failure without data loss.

---

## 1. The Expand and Contract Migration Pattern (Zero Downtime)

Never drop or rename a column in production while existing application servers are running. Existing queries in flight will crash with `column does not exist`.

### Phase 1: Expand
- Add the new column as nullable:
  ```sql
  ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
  ```
- Deploy backend version that writes to BOTH old and new columns, but reads from old.

### Phase 2: Backfill
- Run a background worker/script to backfill existing records in batches (e.g. 1,000 rows at a time) to prevent table locks:
  ```sql
  UPDATE users SET full_name = first_name || ' ' || last_name WHERE full_name IS NULL LIMIT 1000;
  ```

### Phase 3: Switch
- Deploy backend version that reads from the new column `full_name`.

### Phase 4: Contract
- Once verified in production, drop the old columns:
  ```sql
  ALTER TABLE users DROP COLUMN first_name, DROP COLUMN last_name;
  ```

---

## 2. Connection Pooling (PgBouncer / Supavisor)

Postgres allocates a separate OS process for every open client connection (approx 10MB RAM per connection). At 300 concurrent requests, a server without connection pooling will run out of file descriptors and crash.

- **Pool Mode**: Use `transaction` pooling for web API workloads.
- **Session Variables Caution**: When using transaction pooling with Row-Level Security (`app.current_tenant_id`), ALWAYS use `SET LOCAL app.current_tenant_id = ...` inside an explicit transaction block (`BEGIN; ... COMMIT;`). A regular `SET` will bleed tenant context into other queries re-using that pool connection!

---

## 3. Disaster Recovery Objectives (RPO & RTO)

| Metric | Target for Standard SaaS | Target for Enterprise SaaS | How to Achieve |
|---|---|---|---|
| **RPO (Recovery Point Objective)** | < 1 hour | < 5 minutes | Continuous Write-Ahead Log (WAL) archiving to S3/GCS. |
| **RTO (Recovery Time Objective)** | < 2 hours | < 15 minutes | Automated Read Replica promotion or managed failover. |

---

## 4. Disaster Recovery Drill (Run Annually)

1. Provision an isolated staging environment.
2. Restore the latest backup snapshot.
3. Replay WAL archives up to a target timestamp.
4. Execute the automated cross-tenant test suite (`blueprints/01-multi-tenant-rls/cross-tenant-leak-test.spec.ts`) against the restored database to confirm zero data corruption.
5. Record the actual RTO/RPO achieved in the team audit logs.
