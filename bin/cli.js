#!/usr/bin/env node

const args = process.argv.slice(2);
const VERSION = '1.0.5';

// Version flag
if (args.includes('-v') || args.includes('--version') || args.includes('-version')) {
  console.log(`v${VERSION}`);
  process.exit(0);
}

// Minimal help text
const helpMessage = `Masarah Cloner (AI Agent Plugin)

Usage:
  masarah-cloner [options]

Options:
  -v, --version  Show version
  -h, --help     Show help`;

// Help flag or any other command output
console.log(helpMessage);
process.exit(0);
