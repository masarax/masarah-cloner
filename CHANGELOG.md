# Changelog

All notable changes to the `masarah-cloner` package will be documented in this file.

## [0.1.0] - 2026-07-22

### Added
- **Global AI Skill Registration**: Added automated `postinstall` script to automatically register `/masarah-cloner` skills in user home AI agent directories (`~/.claude/skills/masarah-cloner/`, `~/.gemini/skills/masarah-cloner/`, `~/.cursor/skills/masarah-cloner/`, `~/.windsurf/skills/masarah-cloner/`, `~/.agents/skills/masarah-cloner/`, `~/.antigravity/skills/masarah-cloner/`, etc.).
- **Automatic Slash Command Autocomplete**: Fixed skill folder naming structure so typing `/masarah-cloner` in any AI agent chat window instantly triggers autocomplete.
- **Zero Installation Warnings**: Replaced `cheerio` with lightweight, zero-dependency `node-html-parser`, eliminating all deprecation warnings (`whatwg-encoding` warnings) during package installation.
- **Clean Minimal CLI**: Ultra-minimal terminal interface supporting `-v` (showing `v0.1.0`) and `-help`, with zero unwanted file or directory creations in standard shells.
