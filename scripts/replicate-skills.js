const fs = require('fs');
const path = require('path');

const AGENT_FOLDERS = [
  '.claude',
  '.gemini',
  '.cursor',
  '.windsurf',
  '.continue',
  '.codex',
  '.augment',
  '.amazonq',
  '.opencode',
  '.agents',
  '.antigravity'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function removeDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function main() {
  const rootDir = path.resolve(__dirname, '..');
  
  // Find source SKILL.md
  let sourceSkillPath = path.join(rootDir, '.claude', 'skills', 'masarah-cloner', 'SKILL.md');
  if (!fs.existsSync(sourceSkillPath)) {
    sourceSkillPath = path.join(rootDir, '.claude', 'skills', 'clone-website', 'SKILL.md');
  }

  if (!fs.existsSync(sourceSkillPath)) {
    console.error('Source skill file does not exist at:', sourceSkillPath);
    process.exit(1);
  }

  const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');
  console.log('Replicating skills under masarah-cloner folder name...');

  AGENT_FOLDERS.forEach(agent => {
    // Remove old clone-website folder if present
    const oldDir = path.join(rootDir, agent, 'skills', 'clone-website');
    removeDirSync(oldDir);

    // Create new masarah-cloner directory
    const destDir = path.join(rootDir, agent, 'skills', 'masarah-cloner');
    ensureDir(destDir);
    const destFile = path.join(destDir, 'SKILL.md');
    fs.writeFileSync(destFile, skillContent);
    console.log(`Replicated: ${agent} -> ${destFile}`);
  });

  // Remove old .claude/skills/clone-website if left behind
  removeDirSync(path.join(rootDir, '.claude', 'skills', 'clone-website'));

  const copilotFile = path.join(rootDir, '.copilotinstructions');
  fs.writeFileSync(copilotFile, skillContent);
  console.log(`Replicated: GitHub Copilot -> ${copilotFile}`);

  console.log('AI Agent Skill Replication Completed Successfully!');
}

main();
