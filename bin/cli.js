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

  case 'report': {
    const projectName = args[1] || 'Production SaaS Platform';
    generateClientReport(process.cwd(), projectName);
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
  audit [dir]              Run static analysis for multi-tenancy leaks & security gaps
  check-evidence [dir]     Enforce Anti-Hallucination verification gate on TASKS.md
  scaffold <blueprint>     Copy battle-tested blueprints (rls, stripe, rate-limit, licensing, audit, ai-gateway, all)
  report [projectName]     Generate executive Client Delivery & Handoff Sign-off Report
  doctor                   Run full system diagnosis across evidence, security & architecture
  help                     Show this help screen

Examples:
  npx saas-master audit
  npx saas-master check-evidence
  npx saas-master scaffold rls
  npx saas-master scaffold stripe
  npx saas-master report "Acme Analytics SaaS"
  npx saas-master doctor
`);
    break;
  }
}
