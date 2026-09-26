# Stripe Billing, Monetization & Payment Idempotency

Building SaaS billing is where 80% of revenue leaks, duplicate subscriptions, and customer support disputes happen. An AI agent or developer who connects Stripe using only checkout redirects without webhook idempotency is building a time bomb.

---

## 1. The Core Law of SaaS Billing: Idempotency

Stripe guarantees **at-least-once delivery** of webhooks. This means your webhook endpoint will receive the exact same event multiple times due to network retries, connection timeouts, or Stripe internal redeliveries.

### The Catastrophic Failure Mode (Without Idempotency):
1. Customer pays $99 for Pro tier.
2. Webhook `checkout.session.completed` arrives.
3. Your server begins processing, but network latency causes response to take 2.1 seconds.
4. Stripe times out (default 2s) and fires the webhook again.
5. Both requests execute simultaneously:
   - Tenant receives double credits or duplicated activation records.
   - Welcome emails fire twice.
   - Accounting reports record duplicate revenue.

### The Indestructible Fix:
Always wrap webhook processing in a database idempotency table with a `UNIQUE(event_id)` constraint before doing ANY business logic:

```sql
INSERT INTO processed_webhook_events (event_id, event_type, status)
VALUES ($1, $2, 'processing')
ON CONFLICT (event_id) DO NOTHING;
```

If row count returned is `0`, return HTTP `200 OK` immediately.

---

## 2. Mandatory Webhooks to Support

Never build a SaaS that only listens to `checkout.session.completed`. You must implement the full subscription lifecycle:

| Event Name | What it means | Action Required |
|---|---|---|
| `checkout.session.completed` | Initial checkout succeeded | Link `stripe_customer_id` and `stripe_subscription_id` to `tenant_id`. Activate plan. |
| `invoice.payment_succeeded` | Recurring payment processed | Extend `current_period_end`. Clear any outstanding `past_due` warning flags. |
| `invoice.payment_failed` | Recurring charge card declined | Mark tenant as `past_due`. Trigger automated dunning email (Smart Retries). Do not immediately wipe data! |
| `customer.subscription.updated` | Upgrade, downgrade, or cancel-at-period-end toggled | Recalculate feature limits and update plan tier immediately. |
| `customer.subscription.deleted` | Subscription canceled or terminated | Downgrade tenant to `free` tier or freeze access according to retention policy. |

---

## 3. Subscription State Machine & Grace Periods

Never hard-lock a customer the second a credit card fails:
1. **Day 0**: Payment fails (`invoice.payment_failed`). Status = `past_due`.
2. **Days 1–7 (Grace Period)**: Customer retains full access. Display a non-intrusive warning banner: *"Your recent payment could not be processed. Please update your payment method to avoid service interruption."*
3. **Days 8–14 (Degraded Mode)**: Read-only access. Disallow creating new resources or exporting data.
4. **Day 15+ (Suspended)**: Block app access and redirect to Stripe Customer Portal.
5. **Day 60 (Data Retention Expiry)**: Notify customer before permanent soft/hard deletion.

---

## 4. Proration & Plan Switching

When a customer upgrades mid-cycle (e.g. from Starter $20/mo to Pro $100/mo on day 15):
- Use Stripe Proration:
  ```ts
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: currentItemId, price: newPriceId }],
    proration_behavior: 'always_invoice', // Immediately bills the prorated difference
  });
  ```
- Use `always_invoice` for immediate upgrades so they pay upfront before accessing higher tier limits.
- Use `create_prorations` for downgrades, crediting the customer's balance toward their next invoice.

---

## 5. Dispute & Chargeback Defense

1. **Keep Audit Logs of User Activity**: In case of a fraudulent "unauthorized transaction" dispute, your audit logs (see `references/04-admin-panel-audit-logs.md`) prove that the customer logged in from their IP, used the service, and consumed quota.
2. **Self-Service Cancellation**: Make canceling easy via Stripe Customer Portal (`stripe.billingPortal.sessions.create`). A user who cannot find a cancel button will call their bank and file a chargeback, costing you a $15 fee and damaging your Stripe merchant rating.
