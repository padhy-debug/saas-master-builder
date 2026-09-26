# 30: GDPR/CCPA Tenant Offboarding and Data Scrubbing

> Enterprise compliance protocol for Right to be Forgotten, data export, PII pseudonymization, object storage purging, and verifiable Certificates of Destruction.

---

## 1. Compliance Mandates vs. Fiscal Preservation

Enterprise SaaS products must balance two conflicting legal requirements:
- **Article 17 GDPR (Right to Erasure)**: Personal data must be erased upon request without undue delay.
- **Statutory Fiscal Retention (Law 8)**: Tax authorities require gapless historical invoices and fiscal journals to be preserved for 7–10 years.

### The Resolution: Pseudonymization & Dissociation
Invoices and financial transactions are NOT deleted; rather, all PII (customer names, personal emails, physical addresses, IP logs) is permanently overwritten with synthetic tokens (`anonymized-<id>@erased.local`), breaking the link between the individual and the fiscal journal entry while retaining gapless accounting continuity.

---

## 2. Multi-Phase Offboarding Architecture

```
[ Tenant Requests Erasure ]
            │
            ▼
[ Step 1: Pre-Deletion Data Export ] ──► (Generate encrypted ZIP of all tenant data)
            │
            ▼
[ Step 2: Stripe Subscription Cancellation ]
            │
            ▼
[ Step 3: S3/Storage Asset Purge ] ──► (Remove s3://bucket/tenants/{tenantId}/*)
            │
            ▼
[ Step 4: PostgreSQL Cascade Scrubber ] ──► (Anonymize PII, purge ephemeral tables)
            │
            ▼
[ Step 5: Redis Session & Token Invalidation ]
            │
            ▼
[ Step 6: Certificate of Destruction ] ──► (HMAC-SHA256 signed audit artifact)
```

---

## 3. Cryptographic Certificate of Destruction

Upon completion, the system generates an immutable, tamper-evident certificate containing:
- Unique Certificate ID (`CERT-ERASURE-XXXX`)
- Timestamp of deletion
- Count of scrubbed user profiles and purged objects
- HMAC-SHA256 signature generated using a tamper-proof corporate signing key

This certificate serves as legal proof during GDPR compliance audits.

---

## 4. Production Checklist

- [ ] All customer data deletion endpoints require Organization Owner or Superadmin authorization.
- [ ] PII anonymization updates user records in a single atomic database transaction.
- [ ] Invoices and fiscal ledger entries remain gapless and mathematically balanced.
- [ ] Object storage prefixes for the tenant are purged to prevent orphaned file costs.
- [ ] A signed Certificate of Destruction is delivered to the customer and preserved in audit archives.
