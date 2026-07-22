#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const os = require('os');

const args = process.argv.slice(2);
const VERSION = '0.1.0';

// Version flag
if (args.includes('-v') || args.includes('--version') || args.includes('-version')) {
  console.log(`v${VERSION}`);
  process.exit(0);
}

// Help output
const helpMessage = `Masarah Cloner (AI Agent Plugin)

Usage:
  masarah-cloner [options]

Options:
  -v, --version  Show version
  -h, --help     Show help`;

if (args.includes('--help') || args.includes('-h') || args.includes('-help') || args.includes('help')) {
  console.log(helpMessage);
  process.exit(0);
}

// If invoked in terminal, sync skills locally and globally for AI models
try {
  const pkgRootDir = path.resolve(__dirname, '..');
  const sourceSkillPath = path.join(pkgRootDir, '.claude', 'skills', 'masarah-cloner', 'SKILL.md');

  if (fs.existsSync(sourceSkillPath)) {
    const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');
    const agentFolderNames = ['.claude', '.gemini', '.cursor', '.windsurf', '.continue', '.codex', '.augment', '.amazonq', '.opencode', '.agents', '.antigravity'];

    // 1. Sync to global home directory
    const userHome = os.homedir();
    agentFolderNames.forEach(folder => {
      const targetDir = path.join(userHome, folder, 'skills', 'masarah-cloner');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'SKILL.md'), skillContent);
    });

    // 2. Sync to current working directory
    const cwd = process.cwd();
    agentFolderNames.forEach(folder => {
      const targetDir = path.join(cwd, folder, 'skills', 'masarah-cloner');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'SKILL.md'), skillContent);
    });
  }
} catch (e) {}

console.log(helpMessage);
process.exit(0);
