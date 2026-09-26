#!/usr/bin/env node

/**
 * SaaS Master Builder CLI
 * The Autonomous Engineering OS & Production Breakthrough Toolkit
 */

const path = require('path');
const fs = require('fs');
const { runAudit } = require('../scripts/audit-engine');
const { checkEvidence } = require('../scripts/evidence-checker');
const { scaffold, BLUEPRINT_MAP } = require('../scripts/blueprint-scaffolder');
const { generateClientReport } = require('../scripts/client-report');
const { generateHandbook } = require('../scripts/docs-generator');
const { compilePrompt } = require('../scripts/ai-prompt-compiler');
const { runAgentGuard } = require('../scripts/agent-diff-guard');
const { runBenchmark } = require('../scripts/benchmark-auditor');

const args = process.argv.slice(2);
const command = args[0] || 'help';

const BANNER = `
========================================================================
   ____               ____    __  __           _            
  / ___|  __ _  __ _ / ___|  |  \\/  | __ _ ___| |_ ___ _ __ 
  \\___ \\ / _\` |/ _\` |\\___ \\  | |\\/| |/ _\` / __| __/ _ \\ '__|
   ___) | (_| | (_| | ___) | | |  | | (_| \\__ \\ ||  __/ |   
  |____/ \\__,_|\\__,_|____/   |_|  |_|\\__,_|___/\\__\\___|_|   
                     B U I L D E R                          
  The Autonomous Engineering OS for Unbreakable SaaS Projects
========================================================================
`;

console.log(BANNER);

switch (command) {
  case 'audit': {
    const targetDir = args[1] ? path.resolve(args[1]) : process.cwd();
    const issues = runAudit(targetDir);

    if (issues.length === 0) {
      console.log('✅ [PASSED] Zero critical vulnerabilities, leak risks, or unhandled webhooks found!\n');
      process.exit(0);
    } else {
      console.log(`⚠️ Found ${issues.length} potential issue(s):\n`);
      issues.forEach((iss, idx) => {
        console.log(`[${idx + 1}] [${iss.severity}] ${iss.ruleId}`);
        console.log(`    File: ${iss.file}`);
        console.log(`    Issue: ${iss.message}`);
        console.log(`    Fix: ${iss.recommendation}\n`);
      });
      process.exit(1);
    }
    break;
  }

  case 'check-evidence': {
    const targetDir = args[1] ? path.resolve(args[1]) : process.cwd();
    const result = checkEvidence(targetDir);

    if (result.warning) {
      console.log(`ℹ️ ${result.warning}\n`);
      process.exit(0);
    }

    if (result.success) {
      console.log(`✅ [PASSED] All ${result.totalCheckedItems} checked tasks have verified proof/evidence attached!`);
      console.log('🛡️ Zero hallucinations detected in checklist execution.\n');
      process.exit(0);
    } else {
      console.error(`❌ [FAILED] Anti-Hallucination Gate triggered! Found ${result.missingEvidence.length} task(s) marked [x] without valid evidence:\n`);
      result.missingEvidence.forEach((item, idx) => {
        console.error(`  ${idx + 1}. [${item.file}:${item.lineNum}] "${item.text}"`);
        console.error(`     -> RULE VIOLATION: Must attach real output (e.g. "evidence: vitest passed 14/14 tests in 1.2s") before checking [x].\n`);
      });
      process.exit(1);
    }
    break;
  }

  case 'scaffold': {
    const blueprint = args[1];
    if (!blueprint) {
      console.log('Available blueprints to scaffold:');
      Object.entries(BLUEPRINT_MAP).forEach(([k, v]) => {
        console.log(`  - ${k.padEnd(12)} : ${v.description}`);
      });
      console.log('  - all          : Scaffolds all production blueprints\n');
      console.log('Usage: saas-master scaffold <blueprint-name>\n');
      process.exit(0);
    }
    const success = scaffold(blueprint);
    process.exit(success ? 0 : 1);
    break;
  }

  case 'init': {
    const projectName = args[1] || 'my-saas-app';
    const targetDir = path.resolve(process.cwd(), projectName);
    const repoRootDir = path.resolve(__dirname, '..');

    console.log(`🚀 [SaaS Master Init] Initializing full-stack SaaS project at: ${targetDir}\n`);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Copy root configuration & docker files
    const rootFilesToCopy = ['.env.example', 'docker-compose.yml', '.gitignore', 'AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules'];
    rootFilesToCopy.forEach(file => {
      const src = path.join(repoRootDir, file);
      const dest = path.join(targetDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Created: ${file}`);
      }
    });

    // 2. Copy templates folder
    const templatesSrc = path.join(repoRootDir, 'saas-master-builder', 'templates');
    const templatesDest = path.join(targetDir, 'templates');
    if (fs.existsSync(templatesSrc)) {
      if (!fs.existsSync(templatesDest)) fs.mkdirSync(templatesDest, { recursive: true });
      fs.readdirSync(templatesSrc).forEach(tFile => {
        fs.copyFileSync(path.join(templatesSrc, tFile), path.join(templatesDest, tFile));
        console.log(`  ✓ Created: templates/${tFile}`);
      });
    }

    // 3. Create target package.json if not present
    const targetPkgJson = path.join(targetDir, 'package.json');
    if (!fs.existsSync(targetPkgJson)) {
      const pkgContent = {
        name: projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        version: '0.1.0',
        private: true,
        scripts: {
          "dev": "echo 'Configure your web/backend framework (Next.js/Fastify)'",
          "audit": "saas-master audit",
          "check-evidence": "saas-master check-evidence",
          "doctor": "saas-master doctor"
        },
        dependencies: {
          "saas-master-builder": "^1.0.0"
        }
      };
      fs.writeFileSync(targetPkgJson, JSON.stringify(pkgContent, null, 2), 'utf-8');
      console.log(`  ✓ Created: package.json`);
    }

    // 4. Scaffold all blueprints into target
    console.log('\n📦 Scaffolding all 20 production blueprints into src/lib/...');
    scaffold('all', targetDir, repoRootDir);

    console.log(`
🎉 [SUCCESS] SaaS Project '${projectName}' successfully created!

Next steps:
  1. cd ${projectName}
  2. cp .env.example .env (and configure secrets)
  3. docker compose up -d (starts Postgres RLS, Redis, MinIO & Mailpit)
  4. Start building with zero hallucinations!
`);
    process.exit(0);
    break;
  }

  case 'report': {
    const projectName = args[1] || 'Production SaaS Platform';
    generateClientReport(process.cwd(), projectName);
    process.exit(0);
    break;
  }

  case 'docs': {
    const outputDir = args[1] ? path.resolve(args[1]) : process.cwd();
    const repoRootDir = path.resolve(__dirname, '..');
    const success = generateHandbook(repoRootDir, outputDir);
    process.exit(success ? 0 : 1);
    break;
  }

  case 'prompt': {
    const taskDescription = args.slice(1).join(' ');
    const repoRootDir = path.resolve(__dirname, '..');
    compilePrompt(taskDescription, repoRootDir);
    process.exit(0);
    break;
  }

  case 'guard': {
    const targetDir = args[1] ? path.resolve(args[1]) : process.cwd();
    const result = runAgentGuard(targetDir);
    process.exit(result.violations.length === 0 ? 0 : 1);
    break;
  }

  case 'benchmark': {
    const repoRootDir = path.resolve(__dirname, '..');
    runBenchmark(repoRootDir);
    process.exit(0);
    break;
  }

  case 'doctor': {
    console.log('🩺 [Doctor] Running comprehensive SaaS health & anti-hallucination check...\n');
    let hasErrors = false;

    console.log('1. Checking task evidence integrity...');
    const evResult = checkEvidence(process.cwd());
    if (!evResult.success) {
      hasErrors = true;
      console.log(`   ❌ Evidence check failed: ${evResult.missingEvidence.length} unverified items.`);
    } else {
      console.log('   ✓ Evidence check passed.');
    }

    console.log('2. Running security and multi-tenancy audit...');
    const auditIssues = runAudit(process.cwd());
    if (auditIssues.length > 0) {
      hasErrors = true;
      console.log(`   ❌ Audit found ${auditIssues.length} issue(s).`);
    } else {
      console.log('   ✓ Security & multi-tenancy audit clean.');
    }

    if (hasErrors) {
      console.log('\n❌ Doctor diagnosis: SYSTEM NEEDS WORK before production launch.\n');
      process.exit(1);
    } else {
      console.log('\n🎉 Doctor diagnosis: SYSTEM IS UNBREAKABLE AND PRODUCTION READY!\n');
      process.exit(0);
    }
    break;
  }

  case 'help':
  default: {
    console.log(`
Usage: saas-master <command> [options]

Commands:
  init [projectName]       Scaffold a brand new complete full-stack SaaS project with all 20 blueprints
  prompt <task>            Compile natural language intent into a God-Tier AI prompt for Claude/Cursor
  guard [dir]              Real-time AI agent code scanner (detects the 10 Deadly AI Coding Sins)
  benchmark                Run unbiased empirical benchmark comparing against global SaaS standards
  audit [dir]              Run static analysis for multi-tenancy leaks & security gaps
  check-evidence [dir]     Enforce Anti-Hallucination verification gate on TASKS.md
  scaffold <blueprint>     Copy specific blueprints (rls, stripe, rate-limit, licensing, audit, ai-gateway, updater, invoice-print, enterprise-sso, webhooks, storage, feature-flags, notifications, async-export, observability, search, scheduler, api-keys, design-system, gdpr-offboarding, all)
  docs [outputDir]         Generate unified SAAS_ARCHITECTURE_HANDBOOK.md (30 chapters)
  report [projectName]     Generate executive Client Delivery & Handoff Sign-off Report
  doctor                   Run full system diagnosis across evidence, security & architecture
  help                     Show this help screen

Examples:
  npx saas-master prompt "Add team member invite flow with role-based permissions"
  npx saas-master guard
  npx saas-master benchmark
  npx saas-master init my-saas-platform
  npx saas-master audit
  npx saas-master check-evidence
  npx saas-master scaffold all
  npx saas-master docs
  npx saas-master report "Acme Analytics SaaS"
  npx saas-master doctor
`);
    break;
  }
}
