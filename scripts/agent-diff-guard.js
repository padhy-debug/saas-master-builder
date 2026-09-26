/**
 * SaaS Master Builder - Agent Diff Guard & Vibe-Coder Real-Time Linter
 * Scans recent modifications and git diffs to catch the "10 Deadly AI Coding Sins".
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AI_SINS = [
  {
    id: 'AI_SIN_WEAK_RANDOM',
    pattern: /Math\.random\(\)\.toString\(36\)/,
    message: 'AI used Math.random() for security token / ID generation.',
    fix: 'Use crypto.randomBytes(32).toString("hex") or crypto.randomUUID() for cryptographic security.'
  },
  {
    id: 'AI_SIN_CLIENT_TENANT_TRUST',
    pattern: /req\.(headers|query)\[['"]x-tenant-id['"]\](?!\s*&&\s*session)/i,
    message: 'AI trusted raw client X-Tenant-Id header without server-side JWT verification (Law 2 violation).',
    fix: 'Extract tenant identity directly from verified server-side session: req.user.organization_id'
  },
  {
    id: 'AI_SIN_FLOAT_CURRENCY',
    pattern: /(amount|price|total|tax|fee)\s*[\*\/]\s*0\.\d+/i,
    message: 'AI used floating-point math on monetary values (rounding bug risk).',
    fix: 'Calculate prices using integer minor units (cents): Math.round(amountInCents * rate)'
  },
  {
    id: 'AI_SIN_MOCKED_FAKE_TEST',
    pattern: /expect\((true|1)\)\.to(Be|Equal)\((true|1)\)/,
    message: 'AI generated a hollow / fake test assertion to fake a passing test suite.',
    fix: 'Write an assertion testing actual business logic outputs or database state.'
  },
  {
    id: 'AI_SIN_STRIPE_UNVERIFIED_WEBHOOK',
    pattern: /(stripe.*webhook|webhook.*stripe).*(req\.body)(?!\s*,\s*sig)/i,
    message: 'AI accessed raw Stripe webhook payload without cryptographic signature verification (Law 4 violation).',
    fix: 'Verify event signature: stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)'
  },
  {
    id: 'AI_SIN_RAW_SERIAL_INVOICE',
    pattern: /(invoice_number|order_number)\s*=\s*['"]INV-['"]\s*\+\s*(Date\.now\(\)|Math\.random\(\))/i,
    message: 'AI generated invoice numbers using random dates/strings leaving fiscal gaps (Law 8 violation).',
    fix: 'Use PostgreSQL locked fiscal sequence: SELECT get_next_fiscal_number(tenant_id, "INV", EXTRACT(YEAR FROM NOW())::INT)'
  },
  {
    id: 'AI_SIN_DESTRUCTIVE_COMMAND',
    pattern: /(?:execSync|exec|spawn|execFile|runCommand|shell\.exec)\s*\([^)]*\b(DROP\s+DATABASE|rm\s+-rf\s+[\/~]|git\s+reset\s+--hard\s+HEAD~)/i,
    message: 'AI attempted destructive / unrecoverable operation violating Zero Data Loss constitutional law (Law 14).',
    fix: 'Never drop databases or wipe trees in code. Use additive migrations and safe rollbacks.'
  },
  {
    id: 'AI_SIN_HARDCODED_SECRET',
    pattern: /['"](sk_live_[0-9a-zA-Z]{24,}|ghp_[0-9a-zA-Z]{36}|xoxb-[0-9]{11,})['"]/,
    message: 'AI hardcoded live API keys or production secrets in source code.',
    fix: 'Store secrets in environment variables (process.env.STRIPE_SECRET_KEY) and load via .env'
  },
  {
    id: 'AI_SIN_CROSS_TENANT_MUTATION',
    pattern: /\b(UPDATE\s+[a-zA-Z0-9_]+\s+SET|DELETE\s+FROM\s+[a-zA-Z0-9_]+)\b(?![^;]*(tenant_id|organization_id|current_tenant_id))/i,
    message: 'AI generated SQL UPDATE or DELETE without explicit tenant_id scoping (Law 1 violation).',
    fix: 'Scope all database mutations: WHERE id = $1 AND tenant_id = current_tenant_id()'
  },
  {
    id: 'AI_SIN_LAZY_TRUNCATION',
    pattern: /\/\/\s*TODO:\s*(rest of the code remains the same|previous code here|omitted for brevity)/i,
    message: 'AI used lazy placeholder comments truncating or erasing production code.',
    fix: 'Provide full, functional, surgically scoped code without omitting existing implementations.'
  }
];

function inspectSnippet(content, fileName = 'snippet.ts') {
  const violations = [];
  const lines = content.split('\n');

  AI_SINS.forEach(sin => {
    lines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();
      // Skip comment lines unless checking for lazy comment truncation
      if (sin.id !== 'AI_SIN_LAZY_TRUNCATION' && (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#'))) {
        return;
      }
      if (sin.pattern.test(lineText)) {
        violations.push({
          sinId: sin.id,
          file: fileName,
          lineNum: idx + 1,
          lineContent: trimmed,
          message: sin.message,
          fix: sin.fix
        });
      }
    });
  });

  return violations;
}

function runAgentGuard(targetDir = process.cwd()) {
  console.log(`\n🛡️ [Agent Diff Guard] Inspecting AI-generated changes in: ${targetDir}...\n`);

  let modifiedFiles = [];

  // Try to get modified files from git diff
  try {
    const gitDiff = execSync('git status --porcelain', { cwd: targetDir, encoding: 'utf-8' });
    const lines = gitDiff.split('\n').filter(l => l.trim().length > 0);
    modifiedFiles = lines
      .map(l => l.substring(3).trim())
      .filter(f => f.match(/\.(ts|js|tsx|jsx|sql)$/) && !f.includes('node_modules') && !f.startsWith('scripts/') && !f.startsWith('bin/'));
  } catch (e) {
    // If git not available, scan all src / blueprints files
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          scanDir(full);
        } else if (entry.isFile() && entry.name.match(/\.(ts|js|tsx|jsx|sql)$/) && !entry.name.includes('agent-diff-guard.js')) {
          modifiedFiles.push(path.relative(targetDir, full));
        }
      }
    };
    scanDir(path.join(targetDir, 'src'));
    scanDir(path.join(targetDir, 'blueprints'));
  }

  if (modifiedFiles.length === 0) {
    console.log('ℹ️ No active code modifications found to inspect. Working tree is clean.\n');
    return { violations: [] };
  }

  console.log(`🔍 Inspecting ${modifiedFiles.length} modified file(s) for the 10 Deadly AI Sins...\n`);

  const violations = [];

  for (const file of modifiedFiles) {
    const fullPath = path.join(targetDir, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    AI_SINS.forEach(sin => {
      lines.forEach((lineText, idx) => {
        if (sin.pattern.test(lineText)) {
          violations.push({
            sinId: sin.id,
            file,
            lineNum: idx + 1,
            lineContent: lineText.trim(),
            message: sin.message,
            fix: sin.fix
          });
        }
      });
    });
  }

  if (violations.length === 0) {
    console.log('✅ [PASSED] Zero AI coding sins detected!');
    console.log('🌟 Your AI agent has produced clean, compliant, enterprise-grade SaaS code.\n');
    return { violations: [] };
  } else {
    console.log(`⚠️ [WARNING] Detected ${violations.length} AI Coding Sin(s):\n`);
    violations.forEach((v, idx) => {
      console.log(`[${idx + 1}] 🚨 ${v.sinId}`);
      console.log(`    File: ${v.file}:${v.lineNum}`);
      console.log(`    Line: "${v.lineContent}"`);
      console.log(`    Issue: ${v.message}`);
      console.log(`    👉 Prompt to give AI: "Fix line ${v.lineNum} in ${v.file}: ${v.fix}"\n`);
    });
    return { violations };
  }
}

module.exports = { runAgentGuard, inspectSnippet, AI_SINS };
