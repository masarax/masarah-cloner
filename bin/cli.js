#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { scrapePage, ensureDir } = require('../lib/scraper');
const { generateServerJs } = require('../lib/server-template');

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
  if (args.length === 0) {
    console.log('\nUsage:');
    console.log('  masarah-cloner <url-1> [url-2] ... [output_path]');
    console.log('\nExamples:');
    console.log('  masarah-cloner https://your-domain.com');
    console.log('  masarah-cloner https://your-domain.com /fine1');
    console.log('  masarah-cloner https://your-domain.com ./fine1\n');
    process.exit(1);
  }

  const urls = [];
  let outputPath = './cloned_websites';

  // Parse positional arguments
  args.forEach((arg) => {
    if (arg.startsWith('http://') || arg.startsWith('https://')) {
      urls.push(arg);
    } else {
      outputPath = arg;
    }
  });

  const outputDir = path.resolve(outputPath);
  const distDir = path.join(outputDir, 'dist');
  ensureDir(distDir);

  const cwd = process.cwd();
  const framework = detectFramework(cwd);

  console.log(`\n======================================================`);
  console.log(`🚀 Masarah Cloner - Launching`);
  console.log(`Detected local framework: ${framework.toUpperCase()}`);
  console.log(`Target Output Directory: ${outputDir}`);
  console.log(`======================================================\n`);

  const domainMap = {};

  for (const urlStr of urls) {
    try {
      const urlObj = new URL(urlStr);
      const domain = urlObj.hostname;
      const protocol = urlObj.protocol;

      if (!domainMap[domain]) {
        domainMap[domain] = {
          name: domain,
          domain: domain,
          protocol: protocol,
          pages: []
        };
      }

      let pagePath = urlObj.pathname;
      if (!pagePath.endsWith('/') && !path.extname(pagePath)) {
        pagePath += '/';
      }
      domainMap[domain].pages.push(pagePath);

      const targetBaseDir = path.join(distDir, domain);
      await scrapePage(urlStr, targetBaseDir, framework);
    } catch (e) {
      console.error(`Invalid URL "${urlStr}":`, e.message);
    }
  }

  // Generate server config
  const domains = Object.values(domainMap);
  generateServerJs(domains, outputDir, framework);

  // Generate output package.json
  const outputPackageJson = {
    name: "cloned-websites",
    version: "1.0.0",
    description: `Local development server for cloned pages, configured for ${framework} framework.`,
    scripts: {
      "start": "node server.js",
      "dev": "node server.js"
    },
    dependencies: {
      "express": "^4.19.2",
      "express-http-proxy": "^2.0.0"
    }
  };
  fs.writeFileSync(
    path.join(outputDir, 'package.json'), 
    JSON.stringify(outputPackageJson, null, 2)
  );

  console.log('\n======================================================');
  console.log('🎉 Masarah Cloner: Cloning and structures set successfully!');
  console.log(`Output folder: ${outputDir}`);
  console.log('\nTo run your local server:');
  console.log(`  1. cd "${outputPath}"`);
  console.log('  2. pnpm install  (or npm install)');
  console.log('  3. npm run dev');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
