# Enterprise Service Level Agreement (SLA) Template

**Service Name**: [Your SaaS Product Name]  
**Customer Name**: [Client / Organization Name]  
**Effective Date**: [Date]  

---

## 1. Service Availability Commitment (Uptime SLA)

The Provider guarantees that the Service will achieve **99.9% Monthly Uptime Percentage** (excluding Scheduled Maintenance).

$$\text{Uptime \%} = \frac{\text{Total Minutes in Month} - \text{Downtime Minutes}}{\text{Total Minutes in Month}} \times 100$$

### Service Credits for Uptime Breach:
| Monthly Uptime Percentage | Service Credit Issued |
|---|---|
| 99.0% - 99.89% | 10% credit of monthly billing |
| 95.0% - 98.99% | 25% credit of monthly billing |
| Below 95.0% | 50% credit of monthly billing |

---

## 2. Incident Classification & Response Times

| Severity | Definition | Initial Response Time | Resolution Target |
|---|---|---|---|
| **Severity 1 (Critical)** | Core service completely unavailable; all users unable to process data or transactions. | < 30 minutes (24/7) | < 4 hours |
| **Severity 2 (High)** | Significant service degradation; major feature unavailable with no immediate workaround. | < 2 hours (Business hours) | < 12 hours |
| **Severity 3 (Medium)** | Minor feature malfunction or performance impairment; workaround exists. | < 8 hours (Business hours) | < 48 hours |
| **Severity 4 (Low)** | Cosmetic issue, general inquiry, or documentation feedback. | < 24 hours (Business hours) | Next sprint release |

---

## 3. Data Protection, RPO & RTO

- **Recovery Point Objective (RPO)**: Maximum 5 minutes of data loss in catastrophic outage. Continuous WAL archiving enabled.
- **Recovery Time Objective (RTO)**: Maximum 30 minutes to failover and restore full read/write operations.
- **Data Encryption**: All data encrypted in transit using TLS 1.3 and at rest using AES-256.

---

## 4. Scheduled Maintenance

- Scheduled maintenance shall be performed during off-peak hours (e.g., Sundays between 02:00 UTC and 04:00 UTC).
- Customers will receive at least 72 hours prior notification via email and dashboard announcements.
