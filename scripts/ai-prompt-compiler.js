/**
 * SaaS Master Builder - AI Prompt Compiler
 * Compiles natural language intent into a God-Tier, zero-hallucination prompt
 * for AI Coding Agents (Claude Code, Cursor, Devin, Antigravity, Copilot).
 */

const fs = require('fs');
const path = require('path');

const KEYWORD_BLUEPRINT_INDEX = [
  { keywords: ['tenant', 'rls', 'isolation', 'multi-tenant', 'org', 'organization'], blueprint: '01-multi-tenant-rls', laws: ['Law 1 (Tenant Scoping)', 'Law 2 (JWT Session Claim)', 'Law 3 (FORCE RLS)'] },
  { keywords: ['stripe', 'billing', 'subscription', 'payment', 'webhook', 'invoice', 'credit card'], blueprint: '02-bulletproof-stripe', laws: ['Law 4 (Signature Verification)', 'Law 5 (Webhook Idempotency)', 'Law 6 (7-day Grace Period)'] },
  { keywords: ['rate limit', 'sliding window', 'ddos', 'throttle', 'quota', 'redis'], blueprint: '03-redis-sliding-window', laws: ['Distributed sliding window Lua execution'] },
  { keywords: ['license', 'offline', 'ed25519', 'dongle', 'hardware', 'activation'], blueprint: '04-cryptographic-licensing', laws: ['Asymmetric Ed25519 signing', 'Anti-clock rollback guard'] },
  { keywords: ['audit', 'log', 'rbac', 'tamper', 'history', 'activity'], blueprint: '05-rbac-audit-trail', laws: ['Append-only immutable table', 'SHA-256 hash chains'] },
  { keywords: ['ai', 'llm', 'prompt', 'openai', 'anthropic', 'token', 'cache'], blueprint: '06-ai-saas-gateway', laws: ['Semantic caching', 'Prompt injection filter', 'Per-tenant token metering'] },
  { keywords: ['update', 'updater', 'exe', 'installer', 'desktop', 'rollback'], blueprint: '07-bulletproof-auto-updater', laws: ['Law 7 (Dual-Slot Staging & Trampoline)'] },
  { keywords: ['print', 'thermal', 'receipt', 'esc/pos', 'letterhead', 'margin'], blueprint: '08-universal-print-and-invoice-engine', laws: ['Law 8 (Gapless Fiscal Numbering via Postgres sequence)'] },
  { keywords: ['sso', 'saml', 'scim', 'okta', 'azure', 'impersonation'], blueprint: '09-enterprise-sso-scim', laws: ['Law 9 (Ephemeral Asymmetric Impersonation JWTs)'] },
  { keywords: ['webhook', 'dispatch', 'outbound', 'event delivery'], blueprint: '10-outbound-webhooks-engine', laws: ['HMAC-SHA256 signature header', 'SSRF private IP blocking'] },
  { keywords: ['storage', 'upload', 's3', 'minio', 'file', 'presigned'], blueprint: '11-secure-storage-uploads', laws: ['Tenant folder isolation', 'Presigned direct-to-S3 upload', 'MIME byte validation'] },
  { keywords: ['feature flag', 'rollout', 'entitlement', 'canary', 'gate'], blueprint: '12-feature-flags-entitlements', laws: ['In-memory evaluation', 'Deterministic hashing', 'Plan tier gating'] },
  { keywords: ['notification', 'inbox', 'email', 'sms', 'alert'], blueprint: '13-omnichannel-notifications', laws: ['Compound-indexed inbox', 'Transactional vs promotional preferences'] },
  { keywords: ['export', 'csv', 'stream', 'download', 'large data'], blueprint: '14-async-export-data-pipeline', laws: ['Cursor-based database streaming', 'CSV formula injection sanitization'] },
  { keywords: ['health', 'probe', 'metrics', 'liveness', 'readiness'], blueprint: '15-observability-health-probes', laws: ['/healthz & /readyz probes', 'W3C distributed trace correlation'] },
  { keywords: ['search', 'vector', 'pgvector', 'semantic', 'hybrid', 'trigram'], blueprint: '16-universal-search-vector', laws: ['tsvector + pg_trgm + pgvector HNSW with RRF ranking'] },
  { keywords: ['cron', 'scheduler', 'job', 'background', 'worker'], blueprint: '17-distributed-cron-scheduler', laws: ['PostgreSQL 64-bit advisory lock leader election'] },
  { keywords: ['api key', 'developer', 'token', 'public api', 'sdk'], blueprint: '18-api-key-management', laws: ['SHA-256 hash storage', 'sk_live_ prefix', 'Scope enforcement'] },
  { keywords: ['design', 'ui', 'theme', 'css', 'modal', 'skeleton', 'empty state'], blueprint: '19-saas-design-system-tokens', laws: ['CSS variables', '4 canonical UI states', 'WCAG AA accessibility'] },
  { keywords: ['gdpr', 'privacy', 'erasure', 'delete account', 'offboarding'], blueprint: '20-gdpr-tenant-offboarding', laws: ['Right to be Forgotten', 'Gapless fiscal preservation', 'Certificate of Destruction'] },
];

function compilePrompt(taskDescription, repoRootDir = path.resolve(__dirname, '..')) {
  if (!taskDescription || taskDescription.trim().length === 0) {
    console.error('❌ Please provide a task description. Example: npx saas-master prompt "Add team member invite flow with role-based permissions"');
    return false;
  }

  const lowerTask = taskDescription.toLowerCase();
  const matchedBlueprints = [];
  const matchedLaws = new Set([
    'Law 1: All customer data queries MUST be scoped to organization_id or protected by Postgres RLS.',
    'Zero-Hallucination Gate: NEVER mark tasks complete without running real terminal tests.'
  ]);

  KEYWORD_BLUEPRINT_INDEX.forEach(entry => {
    const isMatched = entry.keywords.some(kw => lowerTask.includes(kw));
    if (isMatched) {
      matchedBlueprints.push(entry.blueprint);
      entry.laws.forEach(l => matchedLaws.add(l));
    }
  });

  // Default to core architecture if no specific blueprint keyword matched
  if (matchedBlueprints.length === 0) {
    matchedBlueprints.push('01-multi-tenant-rls', '05-rbac-audit-trail');
  }

  let prompt = `================================================================================
🤖 COMPILED GOD-TIER AI PROMPT (Copy & Paste to Claude, Cursor, Devin, Antigravity)
================================================================================

<ROLE_AND_OBJECTIVE>
You are operating as a Senior Principal SaaS Architect and Systems Security Engineer.
Your objective is to implement the following user feature with ZERO hallucinations, production-grade security, and complete multi-tenant isolation:

FEATURE REQUIREMENT:
"${taskDescription.trim()}"
</ROLE_AND_OBJECTIVE>

<ARCHITECTURAL_CONSTRAINTS_AND_LAWS>
You must strictly obey the SaaS Master Builder Engineering Laws:
${Array.from(matchedLaws).map((law, i) => `${i + 1}. ${law}`).join('\n')}
- Never use floating-point numbers for currency; store monetary amounts in integer cents.
- Wrap multi-table operations in atomic database transactions (BEGIN ... COMMIT).
- Do NOT fabricate APIs or packages. Verify existing signatures before writing imports.
</ARCHITECTURAL_CONSTRAINTS_AND_LAWS>

<RELEVANT_BLUEPRINTS_AND_PATTERNS>
This project has battle-tested blueprints located in 'blueprints/':
${matchedBlueprints.map(bp => `- blueprints/${bp}/ (Inspect this folder for battle-tested implementation patterns)`).join('\n')}
</RELEVANT_BLUEPRINTS_AND_PATTERNS>

<IMPLEMENTATION_STEPS>
1. Review the database schema and add necessary migrations using additive-only evolution.
2. Implement the business logic layer with strict typing (TypeScript) and input validation (Zod).
3. If creating HTTP routes, ensure authentication claims extract 'organization_id' server-side.
4. Implement both success and error edge-cases (rate-limits, concurrency, duplicate requests).
5. Write and execute an automated test suite verifying both correct behavior and cross-tenant leak isolation.
</IMPLEMENTATION_STEPS>

<VERIFICATION_GATE>
Before declaring your work complete, you MUST execute the verification command in the terminal:
  npm test  OR  npx vitest  OR  npx saas-master doctor
and attach the exact terminal output as proof.
Do not say "I have verified this" without pasting the execution trace!
================================================================================`;

  console.log(prompt);
  return true;
}

module.exports = { compilePrompt };
