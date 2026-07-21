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
  '.opencode'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const sourceSkillPath = path.join(rootDir, '.claude', 'skills', 'clone-website', 'SKILL.md');
  
  if (!fs.existsSync(sourceSkillPath)) {
    console.error('Source skill file does not exist at:', sourceSkillPath);
    process.exit(1);
  }
  
  const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');
  console.log('Copying skill instructions to all AI Agent directories...');
  
  AGENT_FOLDERS.forEach(agent => {
    const destDir = path.join(rootDir, agent, 'skills', 'clone-website');
    ensureDir(destDir);
    const destFile = path.join(destDir, 'SKILL.md');
    fs.writeFileSync(destFile, skillContent);
    console.log(`Replicated: ${agent} -> ${destFile}`);
  });

  const copilotFile = path.join(rootDir, '.copilotinstructions');
  fs.writeFileSync(copilotFile, skillContent);
  console.log(`Replicated: GitHub Copilot -> ${copilotFile}`);
  
  console.log('AI Agent Skill Replication Completed Successfully!');
}

main();
