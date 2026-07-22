const fs = require('fs');
const path = require('path');
const os = require('os');

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

function main() {
  try {
    const pkgRootDir = path.resolve(__dirname, '..');
    const sourceSkillPath = path.join(pkgRootDir, '.claude', 'skills', 'masarah-cloner', 'SKILL.md');

    if (!fs.existsSync(sourceSkillPath)) {
      return;
    }

    const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');
    const userHome = os.homedir();

    // Register skill globally across all AI Agent directories in user's home folder
    AGENT_FOLDERS.forEach(agentDirName => {
      const globalAgentSkillDir = path.join(userHome, agentDirName, 'skills', 'masarah-cloner');
      ensureDir(globalAgentSkillDir);
      const targetSkillFile = path.join(globalAgentSkillDir, 'SKILL.md');
      fs.writeFileSync(targetSkillFile, skillContent);
    });

    // Also register global .copilotinstructions in user home if possible
    const globalCopilot = path.join(userHome, '.copilotinstructions');
    if (!fs.existsSync(globalCopilot)) {
      fs.writeFileSync(globalCopilot, skillContent);
    }
  } catch (e) {
    // Postinstall should never break npm install
  }
}

main();
