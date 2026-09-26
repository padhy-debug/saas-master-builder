/**
 * SaaS Master Builder - Deep-Dive Domain Expander & Product Architecture Engine
 * Transforms high-level, generic user ideas into deep, enterprise-grade specifications
 * and architecture contracts that prevent AI agents from generating shallow, toy MVPs.
 */

const fs = require('fs');
const path = require('path');

const DOMAIN_KNOWLEDGE_BASE = {
  'healthcare': {
    aliases: ['doctor', 'clinic', 'hospital', 'patient', 'medical', 'health', 'telehealth', 'ehr', 'emr', 'dentist', 'pharma'],
    industryName: 'Healthcare & Clinical Management (EHR / Telehealth / Clinic Ops)',
    regulatoryFrameworks: ['HIPAA (US)', 'India DPDP Act 2023 / DISHA', 'GDPR Health Data Special Category (EU)', 'ISO 27799'],
    nonNegotiableModules: [
      'Patient Identity & Multi-Tenant Longitudinal Record (PHI)',
      'Double-Booking Prevention via PostgreSQL Row-Level Concurrency Locks',
      'Clinical Encounter & SOAP Notes (Subjective, Objective, Assessment, Plan)',
      'E-Prescription Engine with Drug-Drug Interaction Warning Gates',
      'Diagnostic Lab Orders & Secure HL7 / FHIR Payload Ingestion',
      'Patient Telehealth Room with WebRTC & Ephemeral E2E Key Exchange',
      'Medical Letterhead PDF Generator with Doctor Digital Signature Verification',
      'Statutory Clinical Audit Trail (Immutable Log of Every PHI Access)'
    ],
    hiddenFailureModes: [
      'Concurrency Overbooking: Two receptionists book the same slot simultaneously. Solved with SELECT ... FOR UPDATE or Redis lock.',
      'Audit Tampering: Staff viewing celebrity/VIP patient records without authorization. Solved with immutable append-only access triggers.',
      'Unsigned Prescriptions: Prescriptions sent to pharmacy without cryptographic doctor signature. Solved with Ed25519 signing.',
      'Offline Clinic Outage: Wi-Fi goes down in rural clinic; doctors cannot view charts. Solved with CRDT local mutation outbox.',
      'Billing / Medical Code Errors: Wrong ICD-10 / CPT codes causing claim rejections. Solved with schema-level code validations.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '04-cryptographic-licensing',
      '05-rbac-audit-trail',
      '08-universal-print-and-invoice-engine',
      '11-secure-storage-uploads',
      '18-offline-first-crdt-sync-engine',
      '20-gdpr-tenant-offboarding'
    ]
  },

  'fintech': {
    aliases: ['finance', 'accounting', 'invoice', 'billing', 'tax', 'ledger', 'payment', 'expense', 'payroll', 'bank', 'crypto'],
    industryName: 'FinTech, Enterprise Invoicing & Double-Entry Accounting',
    regulatoryFrameworks: ['PCI-DSS Level 1', 'SOX Compliance', 'GAAP / IFRS', 'Statutory Tax Rules (GST/VAT/IRS)'],
    nonNegotiableModules: [
      'Immutable Double-Entry General Ledger (Debits == Credits Invariant)',
      'Statutory Gapless Fiscal Sequence Numbering (Law 8)',
      'Automated Multi-Jurisdiction Tax Engine (GST, VAT, Sales Tax)',
      'Bank Feed Ingestion & Automated Rule-Based Reconciliation',
      'Payment Gateway Orchestrator with Webhook Idempotency (Law 4, Law 5)',
      'Dunning State Machine with 7-Day Grace Period (Law 6)',
      'Currency Minor-Unit Engine (Zero Floating-Point Calculations)',
      'Granular Auditor & Accountant Read-Only Scoped Access'
    ],
    hiddenFailureModes: [
      'Floating Point Penny Drift: Using JavaScript 0.1 + 0.2 leading to accounting discrepancies. Solved with integer minor-units.',
      'Gap in Fiscal Invoices: Deleting a draft leaves INV-004 missing between INV-003 and INV-005. Solved with PostgreSQL locked sequence function.',
      'Webhook Double-Credits: Network timeout causes Stripe to replay charge.succeeded. Solved with processed_webhook_events atomic insert.',
      'Concurrent Account Balance Overdraft: Two payouts simultaneously drain balance. Solved with SELECT balance FROM accounts WHERE id = ? FOR UPDATE.',
      'Retroactive Ledger Modification: Editing last month\'s closed books. Solved with append-only reversing journal entries.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '02-bulletproof-stripe',
      '03-redis-sliding-window',
      '05-rbac-audit-trail',
      '08-universal-print-and-invoice-engine',
      '10-outbound-webhooks-engine',
      '14-async-export-data-pipeline'
    ]
  },

  'ecommerce_pos': {
    aliases: ['pos', 'retail', 'inventory', 'store', 'shop', 'ecommerce', 'checkout', 'cart', 'warehouse', 'barcode', 'products'],
    industryName: 'Omnichannel Retail, Inventory & Thermal POS Systems',
    regulatoryFrameworks: ['PCI-DSS', 'Fiscal Cash Register Regulations', 'Consumer Protection Law'],
    nonNegotiableModules: [
      'Atomic Real-Time Inventory Stock Reservation (Hold for 10 mins)',
      'High-Speed Barcode & SKU Scanner Interface (Sub-100ms keyboard hook)',
      'ESC/POS Thermal Receipt Generator (58mm/80mm raw byte stream)',
      'Physical Cash Drawer & Shift Handover Reconciliation Journal',
      'Offline-First Local POS Operation with Cloud CRDT Sync',
      'Omnichannel Order Routing (BOPIS - Buy Online, Pick Up in Store)',
      'Multi-Tier Loyalty Points & Discount Promotion Evaluator',
      'Automated Purchase Order & Low-Stock Supplier Reorder Alerts'
    ],
    hiddenFailureModes: [
      'Inventory Overselling: Last item sold online while in-store customer has it in basket. Solved with distributed Redis stock hold lease.',
      'Thermal Printer Buffer Freeze: USB/Network printer stalls during rush hour. Solved with background raw byte spooler.',
      'Cash Shortage Disputes: Shift ending with cash mismatch without proof. Solved with opening/closing drawer float count log.',
      'Offline Sales Loss: Wi-Fi disconnects on Black Friday; staff cannot ring up sales. Solved with local SQLite/IndexedDB outbox.',
      'Return Fraud: Returning item with forged receipt. Solved with cryptographic QR barcode on physical thermal receipt.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '03-redis-sliding-window',
      '04-cryptographic-licensing',
      '08-universal-print-and-invoice-engine',
      '16-universal-search-vector',
      '18-offline-first-crdt-sync-engine'
    ]
  },

  'legaltech': {
    aliases: ['legal', 'lawyer', 'contract', 'agreement', 'signature', 'nda', 'compliance', 'court', 'case', 'paralegal'],
    industryName: 'LegalTech, Contract Lifecycle & Digital E-Signatures',
    regulatoryFrameworks: ['ESIGN Act (US)', 'eIDAS (EU)', 'Information Technology Act 2000 (India)', 'Attorney-Client Privilege Standards'],
    nonNegotiableModules: [
      'Cryptographic Biometric / Public Key E-Signature Workflow',
      'Audit Trail of Intent (IP address, user agent, timestamps, certificate)',
      'Contract Redlining & Multi-Party Real-Time Version Diffing',
      'Document Access Privilege Separation with Role-Based Encryption',
      'Contract Renewal & Obligation Deadline Watchdog Alerts',
      'Template Variable Dynamic Merge Engine with Conditional Logic',
      'Exportable Signed PDF with Embedded X.509 Cryptographic Certificate',
      'Immutable Matter & Case File Archival Storage'
    ],
    hiddenFailureModes: [
      'Signature Repudiation: Signer claims they did not sign document. Solved with tamper-evident HMAC certificate & audit trail hash chain.',
      'Accidental Privilege Leakage: Opposing counsel sees internal notes. Solved with database kernel Row-Level Security on document notes.',
      'Version Drift: Parties sign different versions of agreement. Solved with cryptographic SHA-256 hash check before signing execution.',
      'Storage URL Expiry: Download link dies after 30 days. Solved with secure presigned download proxy.',
      'Missed Renewal Penalties: Auto-renewal clause triggers unnoticed. Solved with distributed cron scheduler alerts.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '04-cryptographic-licensing',
      '05-rbac-audit-trail',
      '11-secure-storage-uploads',
      '17-distributed-cron-scheduler',
      '20-gdpr-tenant-offboarding'
    ]
  },

  'realestate': {
    aliases: ['property', 'real estate', 'tenant', 'landlord', 'rent', 'lease', 'apartment', 'realtor', 'housing'],
    industryName: 'PropTech, Real Estate & Tenant Lifecycle Management',
    regulatoryFrameworks: ['Fair Housing Act', 'Local Rent Control & Escrow Regulations', 'GDPR/DPDP'],
    nonNegotiableModules: [
      'Property, Unit & Floor Plan Hierarchy with Multi-Tenant Scoping',
      'Automated Monthly Rent Billing & Split Payment Gateway',
      'Lease Agreement Lifecycle with E-Sign & Security Deposit Escrow',
      'Maintenance Work Order Dispatcher with Photo Uploads & Contractor SLAs',
      'Automated Tenant Screening & Credit Verification Pipeline',
      'Owner Disbursement Accounting & Management Fee Splits',
      'Tenant Portal with In-App Maintenance Chat & Notifications',
      'Key & Access Card Digital Authorization Log'
    ],
    hiddenFailureModes: [
      'Double Leasing: Same apartment leased to two tenants. Solved with atomic DB lease status state machine.',
      'Late Fee Calculation Disputes: Grace period ambiguity. Solved with deterministic rule-based fee calculator.',
      'Security Deposit Accounting Violations: Mingling deposits with operational cash. Solved with segregated ledger accounts.',
      'Contractor SLA Ignored: Urgent water leak unattended for 48 hours. Solved with escalating cron notification watchdog.',
      'Unnotified Rent Increase: Rent hikes without statutory 30-day notice. Solved with automated legal notice mailer.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '02-bulletproof-stripe',
      '08-universal-print-and-invoice-engine',
      '11-secure-storage-uploads',
      '13-omnichannel-notifications',
      '17-distributed-cron-scheduler'
    ]
  },

  'edtech': {
    aliases: ['education', 'school', 'course', 'lms', 'student', 'teacher', 'academy', 'class', 'quiz', 'exam', 'university'],
    industryName: 'EdTech, Learning Management & Examination Systems',
    regulatoryFrameworks: ['FERPA (US)', 'COPPA (Children\'s Privacy)', 'GDPR Student Data', 'Accessible E-Learning Standards (WCAG AA)'],
    nonNegotiableModules: [
      'Curriculum, Module, Lesson & Video Streaming Hierarchy',
      'Anti-Cheating Timed Exam Engine with Server-Enforced Clock',
      'Automated & Rubric-Based Assignment Grading System',
      'Cryptographically Verifiable Completion Certificates (QR Code Verification)',
      'Multi-Role Hierarchy (Superadmin, School Admin, Teacher, Student, Parent)',
      'Live Virtual Classroom & Interactive Whiteboard State Sync',
      'Progress Tracking & Learning Analytics Dashboard',
      'Drip Content Scheduler & Prerequisite Course Gate'
    ],
    hiddenFailureModes: [
      'Client Clock Tampering in Quizzes: Student changes laptop clock to gain exam time. Solved with server-authoritative timer.',
      'Certificate Forgery: Student edits PDF name in Photoshop. Solved with asymmetric Ed25519 signature & online verification endpoint.',
      'Video CDN URL Leaks: Students sharing private course video links. Solved with short-lived presigned HLS/DASH tokens.',
      'Simultaneous Multi-Device Login: Account sharing among 10 students. Solved with Redis single-active-session revocation.',
      'Student PII Exposure: Grades visible to other class members. Solved with Postgres RLS isolating student records.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '02-bulletproof-stripe',
      '04-cryptographic-licensing',
      '11-secure-storage-uploads',
      '16-universal-search-vector',
      '19-saas-design-system-tokens'
    ]
  },

  'developer_tools': {
    aliases: ['devtool', 'developer', 'api', 'sdk', 'cloud', 'infrastructure', 'monitoring', 'observability', 'git', 'cli'],
    industryName: 'Developer Tools, Cloud Platforms & B2B APIs',
    regulatoryFrameworks: ['SOC 2 Type II', 'ISO 27001', 'Cloud Security Alliance (CSA)'],
    nonNegotiableModules: [
      'Public API Platform with sk_live_ Keys & Fine-Grained Scopes (Law 28)',
      'Sub-Millisecond Distributed Rate Limiting & Usage Metering (Law 3)',
      'Outbound Webhook Dispatcher with HMAC-SHA256 Signing (Law 10)',
      'Interactive OpenAPI 3.1 & Swagger Playground Documentation',
      'High-Speed Hybrid Log & Metric Search (tsvector + pgvector) (Law 16)',
      'Zero-Downtime Distributed Job Scheduler & Heartbeat Probes (Law 17)',
      'Audit Trail with Exportable JSONL Streaming (Law 14)',
      'Team SSO & SCIM Directory Synchronization (Law 9)'
    ],
    hiddenFailureModes: [
      'DDoS by Tenant: One rogue script overloads the central database. Solved with Redis sliding window Lua limiter.',
      'Secret Leak in UI: API keys visible in admin console. Solved with show-once SHA-256 hash storage.',
      'Webhook SSRF Attack: Malicious customer registers http://169.254.169.254/metadata as webhook. Solved with private IP blocklist.',
      'Stale Connection Pool: Database pool runs out of connections during traffic spikes. Solved with PgBouncer & health probes.',
      'Breaking API Updates: Changing a response field breaks 500 customer integrations. Solved with date-based API transformations.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '03-redis-sliding-window',
      '05-rbac-audit-trail',
      '09-enterprise-sso-scim',
      '10-outbound-webhooks-engine',
      '15-observability-health-probes',
      '18-api-key-management'
    ]
  }
};

function matchDomain(ideaText) {
  const lower = ideaText.toLowerCase();
  for (const [key, domain] of Object.entries(DOMAIN_KNOWLEDGE_BASE)) {
    if (domain.aliases.some(alias => lower.includes(alias))) {
      return { key, ...domain };
    }
  }

  // Universal Enterprise Fallback
  return {
    key: 'general_enterprise_saas',
    aliases: ['general', 'saas', 'enterprise', 'b2b'],
    industryName: 'High-Growth Enterprise B2B SaaS Platform',
    regulatoryFrameworks: ['GDPR (EU)', 'SOC 2 Type II', 'ISO 27001', 'India DPDP Act 2023'],
    nonNegotiableModules: [
      'Multi-Tenant Row-Level Security (RLS) Data Isolation',
      'Idempotent Stripe Billing with Subscription Lifecycle State Machine',
      'Distributed Rate Limiting with Redis Sliding Window',
      'Enterprise SSO (SAML 2.0 / OIDC) & SCIM 2.0 Directory Sync',
      'Immutable Append-Only Audit Trail with SHA-256 Hash Chains',
      'Direct-to-S3 Presigned Upload Pipeline with Tenant Sandboxing',
      'Omni-Channel Notifications & In-App Notification Center',
      'High-Volume Cursor-Based Streaming Data Export (CSV/JSONL)'
    ],
    hiddenFailureModes: [
      'Cross-Tenant Data Leak: One missing WHERE clause exposes Customer A data to Customer B. Solved with Postgres kernel RLS.',
      'Duplicate Payment Charges: Stripe webhook retries charge the customer twice. Solved with atomic idempotency tables.',
      'AI Agent Code Slop: AI delivers 1-page shallow toy form instead of real platform. Solved with SaaS Master Prompt Compiler.',
      'Account Takeover via Impersonation: Admin backdoors without audit log. Solved with asymmetric ephemeral impersonation tokens.',
      'Database Exhaustion: Large export runs out of node memory. Solved with cursor-based streaming pipeline.'
    ],
    recommendedBlueprints: [
      '01-multi-tenant-rls',
      '02-bulletproof-stripe',
      '03-redis-sliding-window',
      '05-rbac-audit-trail',
      '09-enterprise-sso-scim',
      '10-outbound-webhooks-engine',
      '11-secure-storage-uploads',
      '13-omnichannel-notifications',
      '14-async-export-data-pipeline',
      '15-observability-health-probes'
    ]
  };
}

function expandIdea(userIdea, outputDir = process.cwd()) {
  if (!userIdea || userIdea.trim().length === 0) {
    console.error('❌ Please provide an idea. Example: npx saas-master deep-dive "SaaS platform for private dental clinics"');
    return false;
  }

  const domain = matchDomain(userIdea);
  const specFileName = 'PRODUCT_SPEC_AND_ARCHITECTURE.md';
  const fullOutputPath = path.join(outputDir, specFileName);

  console.log(`\n========================================================================`);
  console.log(`🧠 SAAS MASTER BUILDER — DEEP-DIVE ARCHITECTURAL SPECIFICATION`);
  console.log(`========================================================================`);
  console.log(`🎯 Input Idea      : "${userIdea.trim()}"`);
  console.log(`🏢 Recognized Niche: ${domain.industryName}`);
  console.log(`⚖️  Compliance Core : ${domain.regulatoryFrameworks.join(', ')}\n`);

  let specContent = `# Product Specification & Enterprise Architecture Contract

> **Target Vertical**: ${domain.industryName}  
> **Original User Concept**: "${userIdea.trim()}"  
> **Engineered By**: SaaS Master Builder OS (Autonomous Deep-Dive Architect)  
> **Standard**: Enterprise Tier 1 (5-Star Market Satisfaction & High ACV Readiness)

---

## 1. Executive Product Vision & Problem Statement

Most AI-generated products in this space fail because they build a shallow "toy MVP"—a basic form and a list with fake data.
In reality, paying customers in **${domain.industryName}** require enterprise-grade reliability, strict legal compliance, and deep workflow integration before they will pay or give 5-star reviews.

This specification provides the **unbreakable architectural blueprint** that forces any AI agent (Claude, Cursor, Devin, Antigravity) to build the complete, production-ready system.

---

## 2. The 8 Non-Negotiable Core Modules
Paying customers demand these modules on Day 1. Omitting any of them results in immediate churn:

${domain.nonNegotiableModules.map((mod, i) => `### ${i + 1}. ${mod}
- **Enterprise Requirement**: Must be fully persistent, multi-tenant isolated, and covered by automated tests.
- **Security Scope**: Tenant-scoped at database kernel level.`).join('\n\n')}

---

## 3. The 5 Hidden Failure Modes (Edge Cases That Kill 99% of MVPs)

These are the critical edge cases that junior developers and shallow AI prompts miss:

${domain.hiddenFailureModes.map((fm, i) => `### ${i + 1}. Edge Case: ${fm.split(':')[0]}
- **The Risk**: ${fm.split(':')[1]?.split('. Solved with')[0]?.trim() || 'Data corruption or user dissatisfaction.'}
- **The Architectural Fix**: ${fm.split('. Solved with')[1]?.trim() || 'Enforce atomic database transaction and guard.'}`).join('\n\n')}

---

## 4. Statutory Regulatory & Compliance Invariants

This application must comply with:
${domain.regulatoryFrameworks.map(reg => `- **${reg}**: Mandatory data encryption, audit trails, and data subject access request (DSAR) handling.`).join('\n')}

---

## 5. Mandatory Production Blueprints to Scaffold

Run the following command to inject the exact battle-tested blueprints needed for this vertical:

\`\`\`bash
${domain.recommendedBlueprints.map(bp => `npx saas-master scaffold ${bp.replace(/^\d+-/, '')}`).join('\n')}
\`\`\`

---

## 6. Zero-Hallucination AI Prompt Contract

Copy and paste the prompt generated by:
\`\`\`bash
npx saas-master prompt "${userIdea.trim()}"
\`\`\`
into your AI agent to begin code implementation.

---

## 7. Quality & Verification Evidence Gate

Before declaring this project complete:
1. Run \`npx saas-master audit\` (Must have 0 critical vulnerabilities).
2. Run \`npx saas-master guard\` (Must have 0 AI coding sins).
3. Run \`npx saas-master check-evidence\` (Must verify all tests in terminal).
4. Run \`npx saas-master report "${domain.industryName}"\` (Generates client handoff certificate).

---

## 8. Frontier Innovation & Category-Defining Killer Features (Uncapped Ceiling)

> **Law 11 (The Uncapped Ceiling Principle)**: The foundational blueprints, modules, and edge-cases above represent the engineering safety **FLOOR, NEVER A CREATIVE CEILING**!

The AI agent is explicitly authorized and commanded to:
1. **Pioneer Unfair Moats**: Proactively architect intelligent automations, predictive AI workflows, and smart co-pilots that competitors have not built.
2. **Magical Micro-Interactions**: Implement delightful UX states, keyboard shortcuts (Command+K bar), instant optimistic UI updates, and zero Cumulative Layout Shift.
3. **Viral Retention Loops**: Design frictionless invite mechanics, automated ROI metrics for admins, and scheduled digest reports.
Build with fearless innovation on top of unbreakable security foundations.
`;

  fs.writeFileSync(fullOutputPath, specContent, 'utf-8');

  console.log(`✅ [DEEP-DIVE SPEC GENERATED]`);
  console.log(`📄 Saved to: ${fullOutputPath}`);
  console.log(`\n📦 Recommended Blueprints for this Domain:`);
  domain.recommendedBlueprints.forEach(bp => console.log(`   - blueprints/${bp}`));
  console.log(`\n💡 Next Step: Run 'npx saas-master prompt "${userIdea.trim()}"' to generate the God-Tier AI prompt!\n`);

  return { domain, specFile: fullOutputPath };
}

module.exports = { expandIdea, matchDomain, DOMAIN_KNOWLEDGE_BASE, DOMAIN_KNOWLEDGE: DOMAIN_KNOWLEDGE_BASE };
