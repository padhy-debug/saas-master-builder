# Compliance — Global Frameworks + India (DPDP Act) + Government Projects

**Read this note first:** compliance law is not something an AI agent can certify. Everything below is a grounded, dated starting checklist to structure the engineering work — it is not legal advice, and it does not substitute for an actual lawyer/compliance officer sign-off, especially before submitting anything to a government body. When a user asks "is this compliant," the honest answer is "here's what's implemented against the checklist, and here's what still needs a licensed reviewer" — never a bare "yes, compliant." See file 10.

## Global frameworks — what they are and when they matter

| Framework | Applies when | What it fundamentally demands |
|---|---|---|
| **GDPR** (EU) | You process personal data of anyone in the EU, regardless of where your company is based | Lawful basis for processing, consent, data subject rights (access/erasure/portability), breach notification within 72h, DPO in some cases |
| **SOC 2 Type II** | Selling to US enterprise customers — they'll ask for it | An independent auditor's report on your security controls over a period of time (not a one-time checklist you fill yourself) |
| **ISO 27001** | International enterprise/government sales, especially outside the US | A certified information security management system (ISMS) — policies, risk assessment, continuous improvement, audited by a certification body |
| **PCI-DSS** | You directly handle/store/transmit card numbers | Extensive controls on cardholder data; most SaaS products avoid this scope entirely by using a PCI-compliant processor (Stripe, Razorpay, etc.) and never touching raw card data |
| **HIPAA** | Handling US health data | Specific technical/administrative safeguards, Business Associate Agreements with any vendor touching that data |
| **CCPA/CPRA** | California residents' data | Similar spirit to GDPR — disclosure, opt-out of sale, deletion rights |

## India — Digital Personal Data Protection Act (DPDP), 2023

Grounded facts, current as of this document's research (2026) — **re-verify against the Ministry of Electronics & IT (MeitY) and the Data Protection Board of India before treating any date below as final**, since implementation rules were still being phased in when this was written:

- **It reaches beyond India's borders.** A company doesn't need to be based in India for the Act to apply — if it processes the personal data of people in India in the course of offering them goods or services, it's in scope. That pulls in foreign-hosted SaaS, payment platforms, and cloud services even when none of their infrastructure sits in India.
- **Two roles, separated deliberately.** Whoever decides the purpose and means of processing is the "Data Fiduciary"; anyone processing data on that fiduciary's behalf (a vendor, a sub-processor) is a "Data Processor." Accountability sits primarily with the fiduciary.
- **A dedicated regulator with real teeth.** The Data Protection Board of India can investigate, issue binding directions, and levy financial penalties — reportedly up to roughly ₹250 crore for serious violations such as failing to secure data or failing to report a breach.
- **Rollout is happening in stages**, based on research current as of 2026: the Board itself became operational in the first phase (late 2025); a mandatory "Consent Manager" framework for handling consent takes effect around mid-November 2026; and full, substantive compliance across all obligations — security safeguards, breach response, data-rights handling — becomes enforceable around mid-May 2027. Treat these as directional and confirm the live dates before committing a client to a deadline.
- **The everyday obligations to build toward**: valid, informed consent; a clear notice explaining what's collected and why; proportionate security safeguards; a defined breach-notification process; sensible retention limits; keeping data accurate; and a working way for someone to have their data corrected or erased.
- **"Significant Data Fiduciary" is a heavier tier.** The government can designate an organization as one based on the volume and sensitivity of data it handles, which then adds obligations like appointing a data protection officer, engaging an independent data auditor, and running periodic impact assessments.

The most common mistake documented in the field so far is assuming an existing GDPR privacy policy already covers this — it doesn't, because DPDP has India-specific notice and consent expectations. A closely related mistake is collapsing every kind of consent into one generic "I agree" checkbox instead of asking for consent separately, per purpose.

## Government-facing projects in India — additional layers beyond DPDP

If the project is being built *for* an Indian government department/PSU, expect these on top of DPDP:

- **GIGW (Government of India Guidelines for Websites/Apps)** for anything public-facing: accessibility (WCAG 2.1 AA), bilingual Hindi/English content, specific hosting/domain norms.
- **STQC certification** is sometimes required for government software/hardware procurement.
- **CERT-In empanelled auditor** for a formal VAPT (Vulnerability Assessment & Penetration Test) — many government tenders explicitly require the security audit to come from a CERT-In empanelled firm, not just any security vendor.
- **Data localization**: certain sensitive/critical data categories may need to be stored and processed within India — confirm the specific requirement for the department/sector in question, this is not blanket for all data.
- **MeitY-empanelled cloud service providers**: if the government mandates hosting on an empanelled cloud (rather than any public cloud), confirm this before architecture lock-in — it affects the choice of cloud provider from day one, not something to retrofit later.

## A practical compliance artifact checklist to build into the repo/product

- [ ] Privacy Policy + Terms of Service, reviewed by counsel, versioned and dated
- [ ] Consent flow: granular, purpose-specific, easy to withdraw — not one bundled checkbox
- [ ] Record of Processing Activities (RoPA) / data inventory — what personal data you collect, why, where it's stored, who else touches it
- [ ] Data flow diagram showing every place personal data moves (including third-party SDKs/analytics/ad tools — these are commonly forgotten and are exactly what regulators and app-store reviewers check)
- [ ] Data Processing Agreement (DPA) template for B2B customers and for your own sub-processors/vendors
- [ ] Breach response runbook + regulator/user notification templates, with named owners and timelines
- [ ] Data retention & deletion policy, actually implemented in the product (a real "delete my account and data" flow), not just written in a policy doc
- [ ] Data Subject/Principal rights workflow: access, correction, erasure, grievance — with a real support path, and a named Grievance Officer/DPO contact
- [ ] Vendor/sub-processor register — every third party that touches user data, reviewed periodically
- [ ] Security safeguards matching file 08 (encryption at rest/in transit, access controls, logging per file 04)

## Before telling anyone "this is compliant"

1. Confirm the current legal deadlines/obligations by checking the official regulator source (Data Protection Board of India / MeitY for DPDP; the relevant supervisory authority for GDPR, etc.) — laws and rules get amended.
2. Have the checklist above reviewed by an actual lawyer or compliance professional, not just implemented from this document.
3. For SOC 2/ISO 27001, remember these are **audited** certifications by a third party — no amount of internal checklist completion makes a company "SOC 2 compliant" without the actual audit engagement and report.
