# Masarah Cloner 🚀

An AI Agent Skill Plugin designed for reverse-engineering and cloning websites. It equips AI coding assistants (Claude, Gemini, Cursor, Windsurf, Copilot, etc.) with structured rules, DOM style extractors, visual inspection checklists, and framework-aware asset organization directives.

---

## How It Works

This package does not execute file scraping directly inside standard terminals. Instead, it provides pre-packaged **AI Skills and Guidelines** that any AI Agent reads and executes when pair-programming with a developer.

### Usage with AI Agents

1. **Install the package globally or in your workspace**:
   ```bash
   npm install -g masarah-cloner
   ```

2. **Open your project in your AI-assisted IDE** (Cursor, Windsurf, or VS Code with Claude/Gemini agents).

3. **Ask your AI Agent in the chat window**:
   ```text
   "Use the masarah-cloner skill to clone https://your-domain.com"
   ```

4. **The AI Agent will execute the step-by-step reverse engineering**:
   - Inspects design tokens (computed CSS, colors, line heights, font faces).
   - Downloads all visual assets (images, SVGs, background videos, fonts) locally to `/public` or `/src`.
   - Replicates interactive states (scroll observers, hover transitions, tab cycling).
   - Ensures zero remote hotlinking and strict offline self-contained execution.

---

## Command Line Options

```bash
masarah-cloner -v       # Print version info
masarah-cloner -help    # Show help instructions
```

---

## Embedded AI Agent Guidelines

- **[docs/INSPECTION_GUIDE.md](docs/INSPECTION_GUIDE.md)**: Visual QA checklists, margin/spacing inspections, line-height rules, and grid layouts.
- **[.claude/skills/clone-website/SKILL.md](.claude/skills/clone-website/SKILL.md)**: Instruction sets, complexity budgets, and DOM extractor scripts for Claude-based agents.
- **[.gemini/skills/clone-website/SKILL.md](.gemini/skills/clone-website/SKILL.md)**: Prompt configurations for Gemini-based agents.
- **[.cursorrules](.cursorrules)**: In-editor rules for Cursor/Windsurf users.

---
License: SEE LICENSE IN LICENSE  
Developed by MasaraX for perfect frontend reverse engineering.
