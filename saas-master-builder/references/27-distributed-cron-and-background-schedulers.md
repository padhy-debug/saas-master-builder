# 27: Distributed Cron and Background Schedulers

> Production architecture for fault-tolerant background scheduling, singleton execution, and leader election using PostgreSQL advisory locks.

---

## 1. The Distributed Cron Problem in SaaS

When running multi-instance deployments (Kubernetes, ECS, Render, Railway, Fly.io):
- Standard cron utilities (`node-cron`, `setInterval`) fire on **every active container instance**, causing duplicate invoicing, duplicate email dispatches, and double-billing.
- External scheduling services (AWS EventBridge, Google Cloud Scheduler) add external cloud dependencies and network failure points.

---

## 2. Solution: PostgreSQL Advisory Lock Leader Election

PostgreSQL provides fast, application-level 64-bit advisory locks (`pg_try_advisory_lock` / `pg_advisory_unlock`) that:
1. Live in PostgreSQL shared memory (zero disk I/O).
2. Automatically release if the owning connection disconnects or crashes (zero deadlocks).
3. Guarantee that **exactly one** worker executes a job across any number of cluster replicas.

```typescript
const lockAcquired = await db.query(
  'SELECT pg_try_advisory_lock($1) as acquired',
  [jobLockKey]
);

if (lockAcquired.rows[0].acquired) {
  try {
    await executeJob();
  } finally {
    await db.query('SELECT pg_advisory_unlock($1)', [jobLockKey]);
  }
}
```

---

## 3. Persistent Job Heartbeats & Overrun Detection

To prevent long-running jobs from stalling the cluster:
1. Schedulers must write a `last_heartbeat_at` timestamp into `scheduled_jobs`.
2. Schedulers must define a `max_runtime_ms`.
3. If a node holding a lock freezes without closing its socket, watchdog health monitors detect stale locks and alert the ops team.

---

## 4. Production Checklist

- [ ] Every recurring cron task has a unique deterministic 64-bit integer lock key.
- [ ] Advisory locks use `pg_try_advisory_lock` (non-blocking) rather than `pg_advisory_lock` (blocking).
- [ ] Jobs use distributed lock release in a `finally` block to prevent lock leakage.
- [ ] Job logs are persisted in a centralized audit table (`scheduled_job_runs`) for tracing.
