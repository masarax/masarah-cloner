#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const VERSION = '1.0.3';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory recursively
function copyDirSync(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Framework detector in current working directory
function detectFramework(cwd) {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return 'vanilla';
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['next']) return 'next';
    if (deps['vite']) return 'vite';
    if (deps['nuxt']) return 'nuxt';
    if (deps['@angular/core']) return 'angular';
    if (deps['react']) return 'react';
    return 'react';
  } catch (e) {
    return 'vanilla';
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Check version flag
  if (args.includes('-v') || args.includes('--version') || args.includes('-version')) {
    console.log(`v${VERSION}`);
    process.exit(0);
  }

  // Check help flag
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('-help') || args.includes('help')) {
    console.log(`
Masarah Cloner AI Initializer 🚀
=================================

An NPM plugin initializer for AI Agents. Sets up pixel-perfect reverse-engineering 
rules, DOM computed style extractors, and visual QA check files inside your workspace.

Once initialized, your AI Agent (Claude, Gemini, Cursor, Windsurf, etc.) reads these 
instructions, uses its browser context to inspect layout rules, and completes 
the clone offline with zero hotlinks.

Usage:
  masarah-cloner <url-1> [url-2] ... [output_path]

Options:
  -v, --version, -version   Print version info
  -h, --help, -help         Show help instructions

Examples:
  # Initialize cloner workspace for target domain
  masarah-cloner https://your-domain.com

  # Initialize cloner workspace for target domain with sub-path folder
  masarah-cloner https://your-domain.com ./fine1
    `);
    process.exit(0);
  }

  const urls = [];
  let outputPath = '.';

  // Parse positional arguments
  args.forEach((arg) => {
    if (arg.startsWith('http://') || arg.startsWith('https://')) {
      urls.push(arg);
    } else {
      outputPath = arg;
    }
  });

  const outputDir = path.resolve(outputPath);
  const pkgRootDir = path.resolve(__dirname, '..'); // Root of installed package

  console.log(`\n======================================================`);
  console.log(`🚀 Masarah Cloner - Workspace Initializer [v${VERSION}]`);
  console.log(`Detected Framework: ${detectFramework(process.cwd()).toUpperCase()}`);
  console.log(`Setting up workspace rules in: ${outputDir}`);
  console.log(`======================================================\n`);

  // 1. Copy all AI skill configs from the globally installed package to the workspace folder
  const foldersToCopy = ['.claude', '.gemini', '.cursor', '.windsurf', '.continue', '.codex', '.augment', '.amazonq', '.opencode'];
  foldersToCopy.forEach((folder) => {
    const srcFolder = path.join(pkgRootDir, folder);
    const destFolder = path.join(outputDir, folder);
    if (fs.existsSync(srcFolder)) {
      copyDirSync(srcFolder, destFolder);
      console.log(`Initialized: ${folder}/ inside workspace`);
    }
  });

  // 2. Copy Cursor rules and Copilot instructions
  const filesToCopy = ['.cursorrules', '.copilotinstructions'];
  filesToCopy.forEach((file) => {
    const srcFile = path.join(pkgRootDir, file);
    const destFile = path.join(outputDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Initialized: ${file} inside workspace`);
    }
  });

  // 3. Copy general inspection docs
  const docSrc = path.join(pkgRootDir, 'docs', 'INSPECTION_GUIDE.md');
  const docDest = path.join(outputDir, 'docs', 'INSPECTION_GUIDE.md');
  ensureDir(path.dirname(docDest));
  if (fs.existsSync(docSrc)) {
    fs.copyFileSync(docSrc, docDest);
    console.log(`Initialized: docs/INSPECTION_GUIDE.md`);
  }

  // 4. Create target.spec.md pointing to target domains
  const specDest = path.join(outputDir, 'docs', 'research', 'target.spec.md');
  ensureDir(path.dirname(specDest));

  let specContent = `# Target Reconfiguration Specification\n\n`;
  specContent += `This workspace has been preconfigured by Masarah Cloner to rebuild the following pages:\n\n`;
  urls.forEach(url => {
    specContent += `- **Target URL**: ${url}\n`;
  });
  specContent += `\n## Next Steps for AI Agent:\n`;
  specContent += `1. Locate and read the visual guidelines in \`docs/INSPECTION_GUIDE.md\`.\n`;
  specContent += `2. Load the slash command custom instructions mapped in \`.cursorrules\` or \`.claude/skills/clone-website/SKILL.md\`.\n`;
  specContent += `3. Execute the style extraction, DOM replication, and offline asset downloader to construct a pixel-perfect, self-contained clone.\n`;

  fs.writeFileSync(specDest, specContent);
  console.log(`Created: docs/research/target.spec.md`);

  console.log('\n======================================================');
  console.log('🎉 Masarah Cloner AI Workspace initialized successfully!');
  console.log(`AI Agent files and visual checklists are ready.`);
  console.log('\nTo start the clone:');
  console.log(`  Open this workspace in your editor (Cursor/Windsurf)`);
  console.log(`  and ask your AI agent: "/masarah-cloner"`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
