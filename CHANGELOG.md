# Changelog

All notable changes to the `masarah-cloner` package will be documented in this file.

## [1.0.2] - 2026-07-22

### Changed
- **Dependencies Refactor**: Updated `cheerio` package specification to stable `^1.0.0` version, resolving transitively deprecated sub-dependency warnings (`whatwg-encoding` warnings) during install.

## [1.0.1] - 2026-07-22

### Added
- **Dynamic Local API Scraping**: Automatically fetches and writes dynamic API endpoints (e.g. `/api/status`, `/api/home_page_content`, `/api/notice`, `/api/notice/i18n`) as local JSON configurations during cloner runs, enabling offline execution.
- **Offline API Fallback Routing**: Express generated server intercepts `/api/*` and serves static local JSON responses if present, otherwise falling back to proxy.
- **Alias Slash Command Registration**: Changed YAML frontmatter names across all AI Agent skill sets (`.claude`, `.gemini`, `.cursor`, `.windsurf`, etc.) to `masarah-cloner` to enable `/masarah-cloner` autocomplete trigger.
- **Slash CLI Bindings**: Added `"/masarah-cloner"` inside package.json `"bin"` keys.
- **Help Layout Improvements**: Custom cli.js help interceptor cleanups.

## [1.0.0] - 2026-07-21

### Added
- **Initial Release**: AI-powered pixel-perfect website cloner.
- **Framework Auto-Detection**: Sorts scripts/styles into `/src` and assets into `/public` if Vite/Next.js/React is detected, or defaults to a clean `/src` layout if vanilla.
- **Hotlink Protection Bypass**: Resolves asset blocks by sending browser headers (`Host`, `Origin`, and target `Referer`) dynamically.
- **Asset Filename Cleanups**: Strips query strings (e.g. `font.woff2?v=4` saves as `font.woff2`), resolving bad paths on disk.
- **Multimedia Support**: Downloads posters and background videos from `<video>`, `<audio>`, and `<source>` tags.
- **Bypass Reverse Proxy**: Setup Express proxy that maps target domains to ports and strips `X-Forwarded-Host`, `X-Forwarded-Proto`, and `X-Forwarded-For` to bypass local origin locks.
- **All-AI Agent Skills**: Added `.claude`, `.gemini`, `.cursor`, `.windsurf`, `.continue`, `.codex`, `.augment`, `.amazonq`, `.opencode` and `.copilotinstructions`.
- **CI/CD Workflow**: Pre-configured GitHub Action `publish.yml` for automated registry deployment on push.

### Changed
- **Author**: Assigned to `MasaraX`.
- **License**: Changed to custom proprietary copyright in `LICENSE` file.
- **Documentation**: Normalized all example links to show `https://your-domain.com`.
