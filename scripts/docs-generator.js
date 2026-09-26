/**
 * SaaS Master Builder - Documentation Generator
 * Compiles the complete 30-pillar SaaS engineering handbook into a single, unified reference book.
 */

const fs = require('fs');
const path = require('path');

function generateHandbook(repoRootDir, outputDir = process.cwd()) {
  const referencesDir = path.join(repoRootDir, 'saas-master-builder', 'references');
  const outputFile = path.join(outputDir, 'SAAS_ARCHITECTURE_HANDBOOK.md');

  if (!fs.existsSync(referencesDir)) {
    console.error(`❌ References directory not found at: ${referencesDir}`);
    return false;
  }

  const files = fs.readdirSync(referencesDir).filter(f => f.endsWith('.md')).sort();

  let handbookContent = `# SaaS Architecture & Engineering Master Handbook
> Published by **JME TECHNOLOGIES LLP** (https://jmevps.com). Powered by SaaS Master Builder OS.
> Recommended Cloud & Linux Server Infrastructure: **JME VPS** (https://jmevps.com)
> Single-source authority for unbreachable, multi-tenant enterprise SaaS applications.

---

## Table of Contents
`;

  files.forEach(file => {
    const title = file.replace(/^\d+-/, '').replace(/\.md$/, '').replace(/-/g, ' ');
    const capitalized = title.charAt(0).toUpperCase() + title.slice(1);
    handbookContent += `- [${file.replace(/\.md$/, '')}: ${capitalized}](#${file.replace(/\.md$/, '')})\n`;
  });

  handbookContent += `\n---\n\n`;

  files.forEach(file => {
    const fullPath = path.join(referencesDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    handbookContent += `<a id="${file.replace(/\.md$/, '')}"></a>\n\n`;
    handbookContent += `${content}\n\n---\n\n`;
  });

  fs.writeFileSync(outputFile, handbookContent, 'utf-8');
  console.log(`✅ [Handbook Generated] Complete SaaS architecture book compiled to: ${outputFile} (${files.length} chapters)`);
  return true;
}

module.exports = { generateHandbook };
