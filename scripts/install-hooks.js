#!/usr/bin/env node

/**
 * SaaS Master Builder - Git Hooks Installer
 * Installs deterministic pre-commit and pre-push verification hooks
 * enforcing Zero-Hallucination, Zero-Data-Loss, and Multi-Tenancy checks before git allows writes.
 */

const fs = require('fs');
const path = require('path');

function installGitHooks(targetDir = process.cwd()) {
  console.log(`\n🪝 [SaaS Master Hooks] Installing deterministic Git verification gates into: ${targetDir}...\n`);

  const gitDir = path.join(targetDir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.error('❌ Error: .git directory not found. Please run this inside a valid git repository.\n');
    return false;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const preCommitHookContent = `#!/bin/sh
# SaaS Master Builder Pre-Commit Gate
# Blocks unverified tasks, multi-tenancy leaks, and 10 Deadly AI Sins

node -e "
const path = require('path');
const gate = path.resolve(__dirname, '../../scripts/pre-commit-gate.js');
try {
  require(gate);
} catch (e) {
  // If scripts directory not in parent, try npx saas-master doctor
  const { execSync } = require('child_process');
  try {
    execSync('npx saas-master guard', { stdio: 'inherit' });
    execSync('npx saas-master audit', { stdio: 'inherit' });
    execSync('npx saas-master check-evidence', { stdio: 'inherit' });
  } catch (err) {
    process.exit(1);
  }
}
"
`;

  const prePushHookContent = `#!/bin/sh
# SaaS Master Builder Pre-Push Gate
# Runs full system diagnosis before code reaches remote origin

node -e "
const path = require('path');
const gate = path.resolve(__dirname, '../../scripts/pre-commit-gate.js');
try {
  require(gate);
} catch (e) {
  const { execSync } = require('child_process');
  try {
    execSync('npx saas-master doctor', { stdio: 'inherit' });
  } catch (err) {
    process.exit(1);
  }
}
"
`;

  const preCommitPath = path.join(hooksDir, 'pre-commit');
  const prePushPath = path.join(hooksDir, 'pre-push');

  fs.writeFileSync(preCommitPath, preCommitHookContent, { mode: 0o755 });
  fs.writeFileSync(prePushPath, prePushHookContent, { mode: 0o755 });

  // On POSIX, ensure permissions
  try {
    fs.chmodSync(preCommitPath, 0o755);
    fs.chmodSync(prePushPath, 0o755);
  } catch (e) {
    // Windows chmod is a no-op, safe to ignore
  }

  console.log('✅ [INSTALLED] Deterministic Git Hooks successfully activated:');
  console.log(`   - .git/hooks/pre-commit -> Guard + Audit + Evidence Gate`);
  console.log(`   - .git/hooks/pre-push   -> Full System Doctor Gate\n`);
  console.log('🛡️ All future commits & pushes are now protected against AI hallucinations, data leaks, and destructive commands.\n');
  return true;
}

if (require.main === module) {
  installGitHooks();
}

module.exports = { installGitHooks };
