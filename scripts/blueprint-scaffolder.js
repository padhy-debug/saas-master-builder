/**
 * SaaS Master Builder - Blueprint Scaffolder
 * Copies battle-tested, zero-hallucination production blueprints directly into your SaaS project.
 */

const fs = require('fs');
const path = require('path');

const BLUEPRINT_MAP = {
  'rls': {
    source: 'blueprints/01-multi-tenant-rls',
    dest: 'src/lib/multi-tenant',
    description: 'Postgres Row-Level Security, Drizzle/Prisma schema & cross-tenant leak test suite'
  },
  'stripe': {
    source: 'blueprints/02-bulletproof-stripe',
    dest: 'src/lib/billing',
    description: 'Idempotent Stripe webhook handler, DLQ retry logic & subscription state machine'
  },
  'rate-limit': {
    source: 'blueprints/03-redis-sliding-window',
    dest: 'src/lib/rate-limiter',
    description: 'Distributed Redis sliding window rate limiter with Lua script for tenant/IP quotas'
  },
  'licensing': {
    source: 'blueprints/04-cryptographic-licensing',
    dest: 'src/lib/licensing',
    description: 'Ed25519 signed JWT offline license generator, verifier & clock anti-tamper guard'
  },
  'audit': {
    source: 'blueprints/05-rbac-audit-trail',
    dest: 'src/lib/audit-rbac',
    description: 'Append-only immutable audit log table, tamper hash chain & RBAC guard'
  },
  'ai-gateway': {
    source: 'blueprints/06-ai-saas-gateway',
    dest: 'src/lib/ai-gateway',
    description: 'AI SaaS gateway with token budget limits, semantic caching & prompt injection shield'
  },
  'updater': {
    source: 'blueprints/07-bulletproof-auto-updater',
    dest: 'src/lib/auto-updater',
    description: 'Dual-slot self-healing auto-updater with Windows UAC trampoline & auto-rollback'
  },
  'invoice-print': {
    source: 'blueprints/08-universal-print-and-invoice-engine',
    dest: 'src/lib/document-printing',
    description: 'Universal print & invoice engine, letterhead calibrator & ESC/POS thermal generator'
  },
  'enterprise-sso': {
    source: 'blueprints/09-enterprise-sso-scim',
    dest: 'src/lib/enterprise-sso',
    description: 'Enterprise SAML 2.0 SSO, SCIM 2.0 directory sync & superadmin impersonation guard'
  }
};

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Created: ${destPath}`);
    }
  }
}

function scaffold(blueprintKey, targetProjectDir = process.cwd(), repoRootDir = path.resolve(__dirname, '..')) {
  console.log(`\n🚀 [SaaS Master Scaffolder] Processing blueprint: '${blueprintKey}'\n`);

  const keys = blueprintKey === 'all' ? Object.keys(BLUEPRINT_MAP) : [blueprintKey];

  for (const key of keys) {
    const bp = BLUEPRINT_MAP[key];
    if (!bp) {
      console.error(`❌ Unknown blueprint: '${key}'. Available: ${Object.keys(BLUEPRINT_MAP).join(', ')}, all`);
      return false;
    }

    const srcPath = path.join(repoRootDir, bp.source);
    const destPath = path.join(targetProjectDir, bp.dest);

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ Blueprint source folder not found: ${srcPath}`);
      return false;
    }

    console.log(`📦 Scaffolding [${key.toUpperCase()}]: ${bp.description}`);
    copyRecursive(srcPath, destPath);
    console.log(`✅ [${key.toUpperCase()}] successfully installed to ${bp.dest}\n`);
  }

  return true;
}

module.exports = { scaffold, BLUEPRINT_MAP };
