/**
 * SaaS Master Builder - Anti-Hallucination Evidence Gate
 * Enforces the strict rule: "No checklist item can be checked [x] or marked 'Done' without verifiable proof."
 * Eliminates AI hallucinations and fake "100% done" claims.
 */

const fs = require('fs');
const path = require('path');

function checkEvidence(targetDir = process.cwd()) {
  console.log(`\n🛡️ [Anti-Hallucination Protocol] Verifying task evidence in: ${targetDir}\n`);

  const checklistCandidates = [
    'templates/TASKS.md',
    'saas-master-builder/templates/TASKS.md',
    'TASKS.md',
    'templates/LAUNCH_CHECKLIST.md',
    'saas-master-builder/templates/LAUNCH_CHECKLIST.md',
    'LAUNCH_CHECKLIST.md',
    'templates/SECURITY_CHECKLIST.md',
    'saas-master-builder/templates/SECURITY_CHECKLIST.md',
    'SECURITY_CHECKLIST.md',
    'templates/CLIENT_HANDOFF_CHECKLIST.md',
    'saas-master-builder/templates/CLIENT_HANDOFF_CHECKLIST.md',
    'CLIENT_HANDOFF_CHECKLIST.md'
  ];

  let filesChecked = 0;
  let totalCheckedItems = 0;
  let missingEvidenceItems = [];
  const visitedPaths = new Set();

  for (const candidate of checklistCandidates) {
    const fullPath = path.isAbsolute(candidate) ? candidate : path.join(targetDir, candidate);
    if (!fs.existsSync(fullPath) || visitedPaths.has(fullPath)) continue;
    visitedPaths.add(fullPath);

    filesChecked++;
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // 1. Matches Markdown Checkboxes: - [x] Some task...
      if (/^\s*-\s*\[x\]/i.test(line)) {
        totalCheckedItems++;
        const hasEvidence = /evidence:\s*\S+/i.test(line);
        const isDummyEvidence = /evidence:\s*(none|n\/a|todo|test|na|pending|—|-|\s*$)/i.test(line);

        if (!hasEvidence || isDummyEvidence) {
          missingEvidenceItems.push({
            file: path.relative(targetDir, fullPath),
            lineNum: index + 1,
            text: line.trim()
          });
        }
      }

      // 2. Matches Markdown Table rows with Status = Done:
      // Format: | Task | Status | Evidence | ...
      if (/^\|.*\|\s*done\s*\|/i.test(line)) {
        totalCheckedItems++;
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        // cols[0] = Task, cols[1] = Status ('Done'), cols[2] = Evidence
        const evidenceCol = cols[2] || '';
        const isDummy = !evidenceCol || /^(none|n\/a|todo|test|na|pending|—|-|\s*)$/i.test(evidenceCol);

        if (isDummy) {
          missingEvidenceItems.push({
            file: path.relative(targetDir, fullPath),
            lineNum: index + 1,
            text: line.trim()
          });
        }
      }
    });
  }

  if (filesChecked === 0) {
    return {
      success: true,
      filesChecked: 0,
      totalCheckedItems: 0,
      missingEvidence: [],
      warning: 'No task/checklist files found (e.g., TASKS.md). Consider copying from templates/TASKS.md.'
    };
  }

  const success = missingEvidenceItems.length === 0;
  return {
    success,
    filesChecked,
    totalCheckedItems,
    missingEvidence: missingEvidenceItems
  };
}

module.exports = { checkEvidence };
