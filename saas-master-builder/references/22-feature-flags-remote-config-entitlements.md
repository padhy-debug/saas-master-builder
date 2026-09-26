# Feature Flags, Remote Config & Plan Entitlements Engine

In a high-velocity SaaS engineering team, deploying code to production is completely decoupled from releasing features to customers.

Without a robust feature flagging and entitlement engine:
- Releasing a feature requires deploying new code, making rollbacks slow and dangerous.
- Tier-based monetization (`starter` vs `pro` vs `enterprise`) ends up hardcoded across dozens of `if (user.plan === 'pro')` spaghetti statements.
- You cannot perform canary releases (e.g. 5% rollout to test performance before 100% rollout).

---

## 1. The Entitlements vs Flags Distinction

| Concept | Purpose | Managed By | Evaluation Frequency |
|---|---|---|---|
| **Feature Flags** (Toggles) | Risk mitigation, canary rollouts, kill switches, A/B experiments | Engineering & Product | Evaluated on every request / UI render |
| **Plan Entitlements** | Monetization rules, feature access based on billing plan, numeric usage quotas (e.g. max seats, max exports) | Billing / Sales | Tied to subscription state in PostgreSQL |

---

## 2. In-Memory Evaluation with Zero Network Latency

Calling a remote database or external service every time `isEnabled('new_dashboard')` is evaluated adds 50ms of latency to every click and request.

### The High-Performance Pattern:
1. **Local In-Memory Cache**: The application maintains a synchronized in-memory dictionary of active flags and tenant overrides.
2. **Pub/Sub Invalidation**: When a flag is toggled in the internal admin panel, an invalidation message is published over Redis Pub/Sub (`PUBLISH feature_flags_updated`).
3. **Instant Cache Flush**: All connected application instances flush their local cache and reload the latest flag state in < 5ms.

---

## 3. Deterministic Percentage Rollouts (MurmurHash)

When rolling out a feature to 20% of users, you must ensure that User X consistently stays in the 20% bucket across reloads, mobile devices, and server instances without storing persistent state for millions of users.

### The Deterministic Hash Algorithm:
```ts
import crypto from 'crypto';

export function isUserInPercentageRollout(userId: string, featureKey: string, rolloutPercent: number): boolean {
  if (rolloutPercent <= 0) return false;
  if (rolloutPercent >= 100) return true;

  // Hash the combination of featureKey + userId
  const hash = crypto.createHash('sha256').update(`${featureKey}:${userId}`).digest('hex');
  // Take first 8 characters and convert to an integer between 0 and 99
  const bucket = parseInt(hash.substring(0, 8), 16) % 100;
  return bucket < rolloutPercent;
}
```

---

## 4. Emergency Kill Switch Architecture

Every integration with an external third-party API (LLM provider, payment gateway, sync service, third-party analytics) must have an associated boolean kill switch.
- If the third-party provider goes down or begins throwing 500 errors, the kill switch can be flipped in the internal admin panel in 1 second.
- The application automatically falls back to an offline state or displays a graceful warning banner without requiring a git commit or redeployment.
