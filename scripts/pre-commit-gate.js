#!/usr/bin/env node

/**
 * SaaS Master Builder - Pre-Commit Verification Hook
 * Automatically runs before git commit to block hallucinations and secrets leaks.
 */

const { runAudit } = require('./audit-engine');
const { checkEvidence } = require('./evidence-checker');
const { runAgentGuard } = require('./agent-diff-guard');

console.log('🔒 [Git Pre-Commit Hook] Running SaaS Master Verification Gates...\n');

// 1. Evidence Gate
const evidenceResult = checkEvidence(process.cwd());
if (!evidenceResult.success) {
  console.error('❌ Commit Blocked: Anti-hallucination gate detected unverified tasks in checklists.\n');
  process.exit(1);
}

// 2. Security & Multi-Tenancy Audit
const auditIssues = runAudit(process.cwd());
if (auditIssues.length > 0) {
  console.error(`❌ Commit Blocked: Found ${auditIssues.length} potential security or leak issue(s).\n`);
  process.exit(1);
}

// 3. Agent Diff Guard (10 Deadly AI Sins)
const guardResult = runAgentGuard(process.cwd());
if (guardResult.violations.length > 0) {
  console.error(`❌ Commit Blocked: Detected ${guardResult.violations.length} AI coding sin(s). Fix violations before committing.\n`);
  process.exit(1);
}

console.log('✅ [Pre-Commit Passed] All verification gates clear. Proceeding with commit.\n');
process.exit(0);
