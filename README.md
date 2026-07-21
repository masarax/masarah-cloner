# Masarah Cloner 🚀

An advanced, framework-aware website cloner and reverse-engineering suite. It replicates any target site, harvests runtime JS chunk assets, downloads custom web fonts, and sets up a local Express server with proxy configurations to bypass origin check blocks.

Built-in **AI Agent Skills** (.gemini, .claude, .cursorrules) enable other AI models and agents to execute pixel-perfect, zero-loss frontend emulations autonomously.

---

## Key Features

- **Framework Detection & Align**: Detects project structures (Next.js, Vite, React, Vue, Svelte, Nuxt).
  - *Framework present*: Organizes scripts/styles into `/src`, assets (media, fonts, icons) into `/public`, and `index.html` at the root.
  - *No framework/Vanilla*: Places all cloned directories, source files, and pages cleanly under `/src`.
- **Dynamic ESM Module Harvester**: Extract and download dynamic modules and chunk mappings (e.g. `./en-BFcamK6q.js`, `./NoticeModal-JasvUa_Z.js`) dynamically parsed from bundle code.
- **Bypass Proxy Configuration**: Generates an Express server mapping domains to separate ports and configures header stripping (`Host`, `Origin`, `Referer` masking + `X-Forwarded-Host` removal) to evade remote server validation blocks.
- **Embedded AI Agent Guidelines**: Equipped with `.claude` and `.gemini` skill prompts, `.cursorrules`, and a detailed markdown reverse engineering inspection guide.

---

## Installation

Install locally or compile as a tarball to publish:

```bash
# Install globally
pnpm add -g ./masarah-cloner

# Or run dynamically via npx
npx masarah-cloner --help
```

---

## CLI Usage

Execute the cloner by providing target URLs. The last argument is optionally parsed as the output path (defaults to `./cloned_websites`).

```bash
masarah-cloner <url1> [url2] [output_path]
```

### Examples

Clone a target page into `./cloned_websites` (default):
```bash
masarah-cloner https://your-domain.com
```

Clone a target page directly into `/fine1` (absolute path) or `./fine1` (relative path):
```bash
masarah-cloner https://your-domain.com /fine1
```

---

## Project Structure (Cloned Output)

### Framework Detected (e.g., Next.js/Vite)
```
cloned_websites/
├── dist/
│   └── your-domain.com/
│       ├── public/          # Fonts, images, SVG icons, manifests
│       ├── src/             # Source files (JS, CSS)
│       └── index.html       # HTML in root
├── server.js                # Express proxy server with CORS bypass
└── package.json
```

### Vanilla / No Framework Detected
```
cloned_websites/
├── dist/
│   └── your-domain.com/
│       └── src/             # All resources structured inside /src
├── server.js                # Express proxy server
└── package.json
```

---

## Integrated AI Agent Skills

- **[docs/INSPECTION_GUIDE.md](docs/INSPECTION_GUIDE.md)**: Visual QA checklists, margin/spacing inspections, line-height rules, and grid layouts.
- **[.claude/skills/clone-website/SKILL.md](.claude/skills/clone-website/SKILL.md)**: Instruction sets, complexity budgets, and DOM extractor scripts for Claude-based agents.
- **[.gemini/skills/clone-website/SKILL.md](.gemini/skills/clone-website/SKILL.md)**: Prompt configurations for Gemini-based agents.
- **[.cursorrules](.cursorrules)**: In-editor rules for Cursor/Windsurf users.

---
License: SEE LICENSE IN LICENSE
Developed by Masarah X for perfect frontend reverse engineering.
