/**
 * SaaS Master Builder - Static Audit Engine
 * Scans codebases for critical SaaS vulnerabilities, cross-tenant leak risks,
 * unhandled webhook race conditions, and missing production guardrails.
 */

const fs = require('fs');
const path = require('path');

const SECURITY_PATTERNS = [
  {
    id: 'HARDCODED_STRIPE_SECRET',
    regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/,
    severity: 'CRITICAL',
    message: 'Hardcoded Stripe secret key detected. Must use environment variables or secret manager.',
    recommendation: 'Move secret key to process.env.STRIPE_SECRET_KEY and ensure it is in .gitignore.'
  },
  {
    id: 'HARDCODED_JWT_SECRET',
    regex: /(jwt_secret|jwtSecret|JWT_SECRET)\s*=\s*['"][a-zA-Z0-9_\-]{3,15}['"]/,
    severity: 'HIGH',
    message: 'Weak or hardcoded JWT secret found. Subject to brute-force forgery.',
    recommendation: 'Use high-entropy secrets (256-bit+) loaded via environment variables.'
  },
  {
    id: 'MISSING_STRIPE_SIGNATURE_VERIFICATION',
    filePattern: /(webhook|stripe-handler).*\.(ts|js)$/i,
    mustContain: ['stripe.webhooks.constructEvent'],
    severity: 'CRITICAL',
    message: 'Stripe webhook endpoint detected without cryptographic signature verification (constructEvent).',
    recommendation: 'Always verify Stripe webhook signatures to prevent forged payment events.'
  },
  {
    id: 'MISSING_WEBHOOK_IDEMPOTENCY',
    filePattern: /(webhook|stripe-handler).*\.(ts|js)$/i,
    mustContainAny: ['idempotency', 'processed_events', 'event_id', 'processedEvents'],
    severity: 'HIGH',
    message: 'Stripe webhook handler missing idempotency tracking. Network retries can double-charge or duplicate provisioning.',
    recommendation: 'Store event.id in an append-only processed_events database table with a unique constraint.'
  },
  {
    id: 'UNGUARDED_TENANT_QUERY',
    filePattern: /(repo|service|controller|handler).*\.(ts|js)$/i,
    regex: /(select|delete|update)\s+from\s+[a-zA-Z_]+\s+where\s+(?!.*tenant_id)/i,
    severity: 'MEDIUM',
    message: 'Raw SQL query detected on tenant entity without explicit tenant_id scoping.',
    recommendation: 'Enable Postgres Row-Level Security (RLS) or ensure every query filters by tenant_id.'
  },
  {
    id: 'DEBUG_CONSOLE_LOG',
    regex: /console\.(log|debug)\(.*(api_key|secret_key|private_key|auth_token|card_number|cvv|password).*\)/i,
    severity: 'HIGH',
    message: 'Potentially sensitive customer data/secrets logged to stdout via console.log.',
    recommendation: 'Redact PII and secrets before logging; use a structured logger with masking.'
  }
];

function walkDir(dir, fileList = [], ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.turbo']) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        walkDir(filePath, fileList, ignoreDirs);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.ts', '.js', '.tsx', '.jsx', '.sql', '.env', '.json', '.md'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function runAudit(targetDir = process.cwd()) {
  console.log(`\n🔍 [SaaS Master Audit] Scanning directory: ${targetDir}\n`);
  const files = walkDir(targetDir);
  const issues = [];

  for (const filePath of files) {
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const relPath = path.relative(targetDir, filePath);

    for (const rule of SECURITY_PATTERNS) {
      if (rule.filePattern && !rule.filePattern.test(relPath)) {
        continue;
      }

      let triggered = false;
      if (rule.regex && rule.regex.test(content)) {
        triggered = true;
      }

      if (rule.mustContain) {
        const missing = rule.mustContain.filter(keyword => !content.includes(keyword));
        if (missing.length > 0) triggered = true;
      }

      if (rule.mustContainAny) {
        const hasAny = rule.mustContainAny.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
        if (!hasAny) triggered = true;
      }

      if (triggered) {
        issues.push({
          ruleId: rule.id,
          file: relPath,
          severity: rule.severity,
          message: rule.message,
          recommendation: rule.recommendation
        });
      }
    }
  }

  return issues;
}

module.exports = { runAudit };
