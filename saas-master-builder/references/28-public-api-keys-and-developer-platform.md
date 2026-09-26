# 28: Public API Keys and B2B Developer Platform

> Enterprise standard for developer API key provisioning, constant-time authentication, SHA-256 hashing, fine-grained scopes, and rate limiting.

---

## 1. Architectural Principles

When building a B2B SaaS developer platform:
1. **Never store raw API keys**: Like passwords, raw API keys must NEVER be stored in plaintext. Store an immutable SHA-256 hash in PostgreSQL.
2. **Readable Prefix & Secret Separation**: Format keys as `prefix_env_random` (e.g. `sk_live_9f82...`).
   - Prefix (`sk_live_`): Identifies token type and environment.
   - Display hint (`9f82...`): First 8 characters shown in UI for identification.
   - Secret payload: 24+ high-entropy cryptographically secure random bytes.
3. **Show Once**: Raw keys are displayed to the user **exactly once** upon creation.

---

## 2. Authentication Flow

```
[ Incoming Request: Authorization: Bearer sk_live_abc123... ]
                         │
                         ▼
        [ Extract prefix & hash secret via SHA-256 ]
                         │
                         ▼
       [ Query api_keys WHERE key_hash = $hash AND is_active = true ]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [ Not Found / Revoked ]         [ Match Found ]
   401 Unauthorized                Verify tenant status & scopes
                                   Apply tenant rate limits
                                   Attach context to request
```

---

## 3. Scopes & Granular Permissions

Every key must be bound to explicit authorization scopes (e.g. `["read:invoices", "write:users"]`). Requests without the required scope are rejected with `403 Forbidden` before business logic executes.

---

## 4. Production Checklist

- [ ] Raw API keys are hashed with `crypto.createHash('sha256')` before DB storage.
- [ ] Database queries index `key_hash` with a `UNIQUE` constraint.
- [ ] Key verification uses constant-time comparison or hash equality.
- [ ] Usage tracking updates `last_used_at` asynchronously or throttled (e.g. once per minute) to prevent DB write contention.
- [ ] UI provides instant 1-click revocation and key rotation with zero downtime.
