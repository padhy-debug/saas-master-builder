#!/usr/bin/env node

/**
 * SaaS Master Builder - Native Model Context Protocol (MCP) Server
 * Exposes the entire SaaS Master brain and toolchain directly to AI Coding Agents
 * (Claude Code, Cursor, Windsurf, Google Antigravity, Devin, Codex) via standard JSON-RPC 2.0 stdio.
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');

const { runAudit } = require('../scripts/audit-engine');
const { checkEvidence } = require('../scripts/evidence-checker');
const { BLUEPRINT_MAP } = require('../scripts/blueprint-scaffolder');
const { compilePrompt } = require('../scripts/ai-prompt-compiler');
const { inspectSnippet, runAgentGuard } = require('../scripts/agent-diff-guard');
const { expandIdea, DOMAIN_KNOWLEDGE } = require('../scripts/deep-dive-expander');

const LAWS = {
  1: {
    title: 'PostgreSQL Row-Level Security & Mandatory Tenant Scoping',
    summary: 'Every query touching tenant-owned data MUST be scoped to organization_id / tenant_id or protected by PostgreSQL Row-Level Security (current_tenant_id()).',
    violationConsequence: 'Cross-tenant data leakage causing catastrophic GDPR/HIPAA compliance violations and multi-million dollar liability.',
    remedy: 'ALTER TABLE <table> ENABLE ROW LEVEL SECURITY; ALTER TABLE <table> FORCE ROW LEVEL SECURITY; CREATE POLICY tenant_isolation ON <table> USING (tenant_id = current_setting(\'app.current_tenant_id\', true)::uuid);'
  },
  2: {
    title: 'Cryptographic Server-Side Tenant Extraction',
    summary: 'Never rely on frontend client headers (X-Tenant-Id) alone. Tenant identity must be extracted from a cryptographically verified server-side JWT session claim.',
    violationConsequence: 'Any malicious tenant can forge the header and modify another organization\'s database records.',
    remedy: 'Extract tenant ID from verified session: req.user.organization_id.'
  },
  3: {
    title: 'Forced RLS on All Tenant Tables',
    summary: 'Any new table containing customer data must have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY applied.',
    violationConsequence: 'Table owners or superuser queries without explicit scoping accidentally leak records across tenants.',
    remedy: 'Always run FORCE ROW LEVEL SECURITY to guarantee policy enforcement even for table creators.'
  },
  4: {
    title: 'Cryptographic Webhook Signature Verification',
    summary: 'All webhook endpoints MUST verify cryptographic signatures (e.g. stripe.webhooks.constructEvent).',
    violationConsequence: 'Attackers can spoof payment confirmations, provision premium subscriptions for free, or hijack customer accounts.',
    remedy: 'Use raw request body + signature header + webhook secret to verify authenticity.'
  },
  5: {
    title: 'Idempotent Webhook & Event Processing',
    summary: 'All webhook event processing MUST be idempotent via a processed_webhook_events table check before mutating business state.',
    violationConsequence: 'Network retries result in duplicate charges, multiple shipments, or multiple license issuances.',
    remedy: 'Check SELECT 1 FROM processed_webhook_events WHERE event_id = $1 FOR UPDATE. If present, return 200 OK immediately.'
  },
  6: {
    title: '7-Day Dunning State Machine & Grace Period',
    summary: 'Never immediately delete customer data or lock access on payment failure. Enforce the 7-day grace period state machine.',
    violationConsequence: 'Temporary card declines trigger immediate churn, data loss, and furious customer escalations.',
    remedy: 'Transition tenant to \'past_due\', fire dunning notifications, retry card on day 1, 3, 5, and only suspend on day 7.'
  },
  7: {
    title: 'Dual-Slot Staging & Detached Trampoline Auto-Updates',
    summary: 'Never overwrite a running executable directly in place. Always use dual-slot staging (staging/ -> current/) with a detached trampoline process.',
    violationConsequence: 'OS file locks (EBUSY) on Windows/Linux corrupt binaries mid-update, bricking the client software.',
    remedy: 'Download update to staging/, verify Ed25519 signature, spawn detached trampoline.bat, terminate main app, swap directories.'
  },
  8: {
    title: 'Row-Level Locked Gapless Fiscal Sequences',
    summary: 'Never generate invoice, order, or lab report numbers using serial IDs or UUIDs that can leave gaps. Use row-level locked PostgreSQL sequence functions (get_next_fiscal_number).',
    violationConsequence: 'Financial tax audits fail due to missing invoice numbers (e.g. INV-1001, INV-1003 without INV-1002), resulting in heavy statutory fines.',
    remedy: 'SELECT prefix || \'-\' || year || \'-\' || LPAD(next_val::TEXT, 6, \'0\') FROM fiscal_sequences WHERE tenant_id = $1 FOR UPDATE;'
  },
  9: {
    title: 'Asymmetric Ephemeral Superadmin Impersonation',
    summary: 'Superadmins must NEVER bypass auth via backdoors or master passwords. Impersonation sessions MUST use asymmetric ephemeral JWTs with ticket ID justification and immutable audit logging.',
    violationConsequence: 'Internal rogue employees or compromised support accounts gain untraceable root access to customer data.',
    remedy: 'Issue 15-minute asymmetric JWT with aud="impersonation", record target organization, ticket ID, and write audit log entry to append-only table.'
  },
  10: {
    title: '100-Year API Architecture & Additive Evolution',
    summary: 'Never make breaking changes to production APIs. Adhere to additive-only schema evolution, 12-month deprecation periods, and tolerant JSON readers.',
    violationConsequence: 'Client mobile apps, third-party integrations, and legacy desktop agents instantly crash when backend deploys.',
    remedy: 'Add new fields as optional, never rename or delete active columns without multi-stage migration and schema versioning.'
  },
  11: {
    title: 'The Uncapped Ceiling Principle',
    summary: 'Foundational blueprints and security laws represent the engineering safety FLOOR, NEVER a creative CEILING. Fearlessly innovate on business logic, intelligent automations, and magical UX.',
    violationConsequence: 'AI builds generic, boring, toy MVPs that fail to deliver real market value.',
    remedy: 'Keep security, multi-tenancy, and payment idempotency strict, while building domain-deep workflows, predictive features, and exceptional UX.'
  },
  12: {
    title: 'Surgical Scope & Minimal Viable Diff (MVD)',
    summary: 'AI agents must touch ONLY the exact code and AST nodes required for the task. Never reorder imports, reformat untouched files, or perform drive-by refactorings.',
    violationConsequence: 'Unrelated code breaks silently, git blame history is corrupted, and cross-feature merge conflicts explode.',
    remedy: 'Verify git diff before committing. Every changed line must directly justify the user request.'
  },
  13: {
    title: 'Anti-Drift 3-Strike Circuit Breaker',
    summary: 'If an edit, test, or tool call fails 3 consecutive times, the agent MUST immediately halt, revert experimental changes, diagnose root cause, and ask for human direction.',
    violationConsequence: 'AI thrashes in an infinite hallucination loop, creating messy patch-on-top-of-patch and destroying the codebase.',
    remedy: 'On 3rd consecutive failure: git checkout -- <file>, document the hypothesis failure, and present the blocking choice to the user.'
  },
  14: {
    title: 'Zero-Data-Loss Command Blacklist',
    summary: 'AI agents are strictly forbidden from executing destructive, non-recoverable shell commands (DROP DATABASE, rm -rf /, git reset --hard on uncommitted trees, force pushing).',
    violationConsequence: 'Catastrophic loss of developer progress, uncommitted work, and production databases.',
    remedy: 'Use reversible actions, additive database migrations, stash rather than hard reset, and safe branch isolation.'
  },
  15: {
    title: 'Anti-Sycophancy Security Invariance',
    summary: 'AI agents must never weaken or bypass security controls (e.g. disabling JWT verification, bypassing RLS, hardcoding live keys) even if casually requested in a user prompt.',
    violationConsequence: 'Vibe coders unintentionally push insecure prototypes into production where they are immediately breached.',
    remedy: 'Politely refuse security-breaking bypasses and implement the production-grade, secure pattern directly.'
  },
  16: {
    title: 'Heavy Braining & Max Signal Density',
    summary: 'Think deeply and synthesize architecture before emitting tokens. Emit dense, production-grade solutions rather than boilerplate toy code.',
    violationConsequence: 'Shallow AI-generated filler that requires massive manual rewriting.',
    remedy: 'Plan state machines, concurrency locks, data flows, and edge cases prior to code generation.'
  },
  17: {
    title: 'Token Economy & Lazy-Loading Shield',
    summary: 'Never ingest the entire repository or handbook at once. AI agents must practice Progressive Disclosure: inspect only the single blueprint or reference needed for the immediate sub-task.',
    violationConsequence: 'Exhausts user context window, skyrockets API token costs, degrades model reasoning, and slows responses.',
    remedy: 'Call MCP tools (saas_get_blueprint, saas_explain_law) on demand to inject surgical snippets (< 500 tokens).'
  }
};

const TOOLS = [
  {
    name: 'saas_get_blueprint',
    description: 'Retrieve battle-tested production blueprint code, database schemas, and integration guides for 20 essential SaaS infrastructure components (RLS, Stripe, Ed25519 licensing, rate limiting, audit logging, updater, invoice printing, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Blueprint name: rls, stripe, rate-limit, licensing, audit, ai-gateway, updater, invoice-print, enterprise-sso, webhooks, storage, feature-flags, notifications, async-export, observability, search, scheduler, api-keys, design-system, gdpr-offboarding, or all.'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'saas_audit_code',
    description: 'Scan source code or directory for multi-tenant isolation breaches, lack of RLS, unhandled webhook errors, hardcoded secrets, and security vulnerabilities.',
    inputSchema: {
      type: 'object',
      properties: {
        targetDir: {
          type: 'string',
          description: 'Absolute or relative directory path to audit (defaults to current working directory).'
        }
      }
    }
  },
  {
    name: 'saas_guard_diff',
    description: 'Scan code snippet or recent git diff against the 10 Deadly AI Coding Sins (weak crypto, unverified client tenant headers, float math on currency, mock tests, unverified webhooks, gap-leaving invoice generation, destructive shell commands, hardcoded secrets, unconstrained mutations, and lazy truncation).',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Raw code snippet to inspect for AI coding sins.'
        },
        targetDir: {
          type: 'string',
          description: 'Directory path to scan recent git diffs from (if code not provided).'
        }
      }
    }
  },
  {
    name: 'saas_compile_prompt',
    description: 'Compile a natural language SaaS feature request into a God-Tier architectural prompt enriched with domain knowledge, non-negotiable enterprise constraints, and edge-case defenses.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Natural language description of what you want to build (e.g. "dental appointment scheduler with SMS reminders and Stripe deposit").'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'saas_deep_dive',
    description: 'Expand a generic SaaS concept into a deep, production-grade enterprise specification across 12 industry verticals (Healthcare, FinTech, POS, Legal, PropTech, EdTech, DevTools, Logistics, etc.) with schema, state machines, gapless sequence, and compliance rules.',
    inputSchema: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: 'SaaS concept or vertical (e.g. "private medical clinic", "fleet logistics", "subscription legal firm").'
        }
      },
      required: ['idea']
    }
  },
  {
    name: 'saas_check_evidence',
    description: 'Enforce the Anti-Hallucination verification gate on TASKS.md or LAUNCH_CHECKLIST.md to guarantee that every checked task has real execution proof attached.',
    inputSchema: {
      type: 'object',
      properties: {
        targetDir: {
          type: 'string',
          description: 'Target directory containing checklist files (defaults to current working directory).'
        }
      }
    }
  },
  {
    name: 'saas_explain_law',
    description: 'Retrieve the exact architectural rationale, failure modes, and compliant code implementation for any of the 17 Non-Negotiable SaaS Master Autonomous Engineering Laws.',
    inputSchema: {
      type: 'object',
      properties: {
        lawNumber: {
          type: 'integer',
          description: 'The law number to inspect (1 through 17).'
        }
      },
      required: ['lawNumber']
    }
  }
];

function handleToolCall(name, params) {
  switch (name) {
    case 'saas_get_blueprint': {
      const blueprintKey = (params.name || '').toLowerCase();
      const bp = BLUEPRINT_MAP[blueprintKey];
      if (!bp) {
        return `Blueprint "${blueprintKey}" not found. Available blueprints: ${Object.keys(BLUEPRINT_MAP).join(', ')}`;
      }
      const repoRoot = path.resolve(__dirname, '..');
      const bpDir = path.join(repoRoot, bp.sourceDir);
      if (!fs.existsSync(bpDir)) {
        return `Blueprint directory not found at: ${bpDir}`;
      }
      const files = fs.readdirSync(bpDir);
      let content = `# Blueprint: ${blueprintKey.toUpperCase()} - ${bp.description}\n\n`;
      files.forEach(f => {
        const full = path.join(bpDir, f);
        if (fs.statSync(full).isFile()) {
          content += `### File: ${f}\n\`\`\`typescript\n${fs.readFileSync(full, 'utf-8')}\n\`\`\`\n\n`;
        }
      });
      return content;
    }

    case 'saas_audit_code': {
      const targetDir = params.targetDir ? path.resolve(params.targetDir) : process.cwd();
      const issues = runAudit(targetDir);
      if (issues.length === 0) {
        return '✅ [PASSED] Zero critical vulnerabilities, leak risks, or unhandled webhooks found!';
      }
      return `⚠️ Found ${issues.length} potential issue(s):\n` +
        issues.map((iss, i) => `[${i + 1}] [${iss.severity}] ${iss.ruleId} in ${iss.file}: ${iss.message}\nFix: ${iss.recommendation}`).join('\n\n');
    }

    case 'saas_guard_diff': {
      if (params.code) {
        const violations = inspectSnippet(params.code);
        if (violations.length === 0) {
          return '✅ [PASSED] Zero AI coding sins detected in snippet!';
        }
        return `⚠️ Detected ${violations.length} AI Coding Sin(s):\n` +
          violations.map((v, i) => `[${i + 1}] 🚨 ${v.sinId} (Line ${v.lineNum}): ${v.message}\nFix: ${v.fix}`).join('\n\n');
      }
      const targetDir = params.targetDir ? path.resolve(params.targetDir) : process.cwd();
      const result = runAgentGuard(targetDir);
      if (result.violations.length === 0) {
        return '✅ [PASSED] Zero AI coding sins detected in working tree!';
      }
      return `⚠️ Detected ${result.violations.length} AI Coding Sin(s) in working tree:\n` +
        result.violations.map((v, i) => `[${i + 1}] 🚨 ${v.sinId} (${v.file}:${v.lineNum}): ${v.message}\nFix: ${v.fix}`).join('\n\n');
    }

    case 'saas_compile_prompt': {
      const repoRoot = path.resolve(__dirname, '..');
      const compiled = compilePrompt(params.task, repoRoot, false);
      return compiled;
    }

    case 'saas_deep_dive': {
      const idea = params.idea;
      const lower = idea.toLowerCase();
      let matchedKey = null;
      for (const key of Object.keys(DOMAIN_KNOWLEDGE)) {
        if (lower.includes(key) || DOMAIN_KNOWLEDGE[key].title.toLowerCase().includes(lower)) {
          matchedKey = key;
          break;
        }
      }
      if (!matchedKey) matchedKey = 'healthcare';
      const domain = DOMAIN_KNOWLEDGE[matchedKey];
      return `# DEEP-DIVE DOMAIN SPECIFICATION: ${domain.title.toUpperCase()}
Generated by SaaS Master Universal Deep-Dive Engine

## 1. Domain Entities & Database Schema
${domain.entities.map(e => `- \`${e}\``).join('\n')}

## 2. Gapless Fiscal Sequence
\`${domain.fiscalSequence}\`

## 3. High-Value SaaS Revenue Levers
${domain.revenueLevers.map(r => `- ${r}`).join('\n')}

## 4. Critical Edge-Case Defenses
${domain.criticalEdgeCases.map(c => `- ${c}`).join('\n')}

## 5. Non-Negotiable Regulatory & Compliance Rules
${domain.compliance.map(cp => `- ${cp}`).join('\n')}
`;
    }

    case 'saas_check_evidence': {
      const targetDir = params.targetDir ? path.resolve(params.targetDir) : process.cwd();
      const res = checkEvidence(targetDir);
      if (res.warning) return `ℹ️ ${res.warning}`;
      if (res.success) return `✅ [PASSED] All ${res.totalCheckedItems} checklist tasks have valid execution evidence attached.`;
      return `❌ [FAILED] Found ${res.missingEvidence.length} task(s) marked [x] without valid evidence:\n` +
        res.missingEvidence.map((m, i) => `[${i + 1}] ${m.file}:${m.lineNum} "${m.text}"`).join('\n');
    }

    case 'saas_explain_law': {
      const lawNum = parseInt(params.lawNumber, 10);
      const law = LAWS[lawNum];
      if (!law) {
        return `Law #${lawNum} not found. Available laws: 1 through 17.`;
      }
      return `# LAW ${lawNum}: ${law.title}

## Summary
${law.summary}

## Catastrophic Failure Mode (Why Violating This Is Fatal)
${law.violationConsequence}

## Compliant Production Implementation Pattern
\`\`\`sql / typescript
${law.remedy}
\`\`\`
`;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Set up JSON-RPC stdio interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line || !line.trim()) return;

  try {
    const request = JSON.parse(line.trim());
    const id = request.id;
    const method = request.method;

    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'saas-master-mcp',
            version: '1.0.0'
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (method === 'notifications/initialized') {
      // Notification, no reply expected
    } else if (method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: {} }) + '\n');
    } else if (method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (method === 'tools/call') {
      const toolName = request.params?.name;
      const toolParams = request.params?.arguments || {};
      try {
        const textResult = handleToolCall(toolName, toolParams);
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: textResult
              }
            ]
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (toolErr) {
        const response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: toolErr.message
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } else {
      // Method not found
      if (id !== undefined) {
        const response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  } catch (err) {
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${err.message}`
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});
