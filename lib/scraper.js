const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanFilename(filepath) {
  const urlObj = new URL('http://temp.org/' + filepath.replace(/\\/g, '/'));
  return urlObj.pathname.slice(1);
}

function getDestPath(urlPath, targetBaseDir, framework) {
  const cleanPath = cleanFilename(urlPath.startsWith('/') ? urlPath.slice(1) : urlPath);
  
  if (framework === 'vanilla' || !framework) {
    return path.join(targetBaseDir, 'src', cleanPath);
  }
  
  if (cleanPath.endsWith('.html')) {
    return path.join(targetBaseDir, cleanPath);
  }
  
  const ext = path.extname(cleanPath).toLowerCase();
  if (ext === '.js' || ext === '.css') {
    return path.join(targetBaseDir, 'src', cleanPath);
  } else {
    return path.join(targetBaseDir, 'public', cleanPath);
  }
}

async function downloadResource(url, dest, refererUrl = '') {
  try {
    ensureDir(path.dirname(dest));
    const urlObj = new URL(url);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': urlObj.origin
    };
    if (refererUrl) {
      headers['Referer'] = refererUrl;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Failed to download: ${url} - Status: ${res.status}`);
      return false;
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Downloaded: ${url} -> ${dest}`);
    return true;
  } catch (e) {
    console.error(`Error downloading ${url}:`, e.message);
    return false;
  }
}

async function processCSS(cssUrl, cssFilePath, targetBaseDir, framework) {
  try {
    let cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
    let match;
    const downloads = [];

    while ((match = urlRegex.exec(cssContent)) !== null) {
      const resourcePath = match[1];
      if (resourcePath.startsWith('data:') || resourcePath.startsWith('http://') || resourcePath.startsWith('https://')) {
        continue;
      }

      const absoluteResourceUrl = new URL(resourcePath, cssUrl).toString();
      const urlObj = new URL(cssUrl);
      const cssRelativeDir = path.dirname(urlObj.pathname);
      const targetRelPath = path.join(cssRelativeDir, resourcePath).replace(/\\/g, '/');
      
      const destPath = getDestPath(targetRelPath, targetBaseDir, framework);
      
      const cleanRelPath = path.relative(path.dirname(cssFilePath), destPath).replace(/\\/g, '/');
      cssContent = cssContent.replace(resourcePath, cleanRelPath);

      downloads.push({ url: absoluteResourceUrl, dest: destPath });
    }

    fs.writeFileSync(cssFilePath, cssContent);

    for (const item of downloads) {
      await downloadResource(item.url, item.dest, cssUrl);
    }
  } catch (e) {
    console.error(`Error parsing CSS ${cssFilePath}:`, e.message);
  }
}

async function scanAndDownloadReactChunks(jsFilePath, targetBaseDir, framework, pageUrl) {
  if (!fs.existsSync(jsFilePath)) return;
  const jsContent = fs.readFileSync(jsFilePath, 'utf8');
  const chunkPaths = new Set();
  
  const absoluteChunkRegex = /"assets\/(js|css)\/[a-zA-Z0-9_\-\.]+\.(js|css)"/g;
  let match;
  while ((match = absoluteChunkRegex.exec(jsContent)) !== null) {
    const chunkPath = match[0].slice(1, -1);
    chunkPaths.add(chunkPath);
  }

  const relativeImportRegex = /import\(\s*['"]\.\/([a-zA-Z0-9_\-\.]+\.(js|css))['"]\s*\)/g;
  while ((match = relativeImportRegex.exec(jsContent)) !== null) {
    const filename = match[1];
    const chunkPath = `assets/js/${filename}`;
    chunkPaths.add(chunkPath);
  }

  if (chunkPaths.size === 0) return;
  console.log(`Found ${chunkPaths.size} dynamic chunk references inside JS.`);

  const baseUrl = 'https://assets.wlai.vip/';
  for (const chunk of chunkPaths) {
    const chunkUrl = baseUrl + chunk;
    const destPath = getDestPath(chunk, targetBaseDir, framework);
    const success = await downloadResource(chunkUrl, destPath, pageUrl);
    if (success && destPath.endsWith('.css')) {
      await processCSS(chunkUrl, destPath, targetBaseDir, framework);
    }
  }
}

async function scrapePage(targetUrl, targetBaseDir, framework) {
  console.log(`\n========================================`);
  console.log(`Processing Target: ${targetUrl} [Framework: ${framework || 'none'}]`);
  console.log(`========================================`);

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      console.error(`Failed to fetch page ${targetUrl} - Status: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const urlObj = new URL(targetUrl);

    const assets = [];
    const jsFiles = [];

    function registerAsset(originalUrl, attrName, element) {
      if (!originalUrl) return;
      if (originalUrl.startsWith('data:')) return;

      const absoluteUrl = new URL(originalUrl, targetUrl).toString();
      const assetUrlObj = new URL(absoluteUrl);

      let relPath = assetUrlObj.pathname;
      if (relPath.endsWith('/')) {
        relPath += 'index.html';
      }
      
      const destPath = getDestPath(relPath, targetBaseDir, framework);

      const pageRelPath = urlObj.pathname.endsWith('/') ? urlObj.pathname + 'index.html' : urlObj.pathname;
      const pageDestPath = getDestPath(pageRelPath, targetBaseDir, framework);
      
      const localRelPath = path.relative(path.dirname(pageDestPath), destPath).replace(/\\/g, '/');

      element.attr(attrName, localRelPath);
      assets.push({ url: absoluteUrl, dest: destPath });
      
      if (attrName === 'src' && element.is('script')) {
        jsFiles.push(destPath);
      }
    }

    $('link[rel="stylesheet"]').each((i, el) => {
      registerAsset($(el).attr('href'), 'href', $(el));
    });

    $('link[rel="modulepreload"]').each((i, el) => {
      registerAsset($(el).attr('href'), 'href', $(el));
    });

    $('script[src]').each((i, el) => {
      registerAsset($(el).attr('src'), 'src', $(el));
    });

    $('img[src]').each((i, el) => {
      registerAsset($(el).attr('src'), 'src', $(el));
    });

    $('link[rel*="icon"]').each((i, el) => {
      registerAsset($(el).attr('href'), 'href', $(el));
    });

    $('video[src]').each((i, el) => {
      registerAsset($(el).attr('src'), 'src', $(el));
    });
    $('video[poster]').each((i, el) => {
      registerAsset($(el).attr('poster'), 'poster', $(el));
    });
    $('audio[src]').each((i, el) => {
      registerAsset($(el).attr('src'), 'src', $(el));
    });
    $('source[src]').each((i, el) => {
      registerAsset($(el).attr('src'), 'src', $(el));
    });

    console.log(`Found ${assets.length} assets to download...`);
    
    for (const asset of assets) {
      const success = await downloadResource(asset.url, asset.dest, targetUrl);
      if (success) {
        if (asset.dest.endsWith('.css')) {
          await processCSS(asset.url, asset.dest, targetBaseDir, framework);
        }
      }
    }

    for (const jsFile of jsFiles) {
      await scanAndDownloadReactChunks(jsFile, targetBaseDir, framework, targetUrl);
    }

    // Dynamic JSON content downloading to ensure self-contained offline execution
    const apiEndpoints = [
      '/api/status',
      '/api/home_page_content',
      '/api/notice',
      '/api/notice/i18n'
    ];
    console.log(`Downloading dynamic JSON API assets to ensure self-contained content on disk...`);
    for (const apiPath of apiEndpoints) {
      const apiUrl = `${urlObj.origin}${apiPath}`;
      // Clean path to name (e.g. /api/notice/i18n -> api/notice_i18n.json)
      const cleanPath = apiPath.slice(1).replace(/\//g, '_') + '.json';
      const destPath = path.join(targetBaseDir, cleanPath);
      await downloadResource(apiUrl, destPath, targetUrl);
    }

    const pageRelPath = urlObj.pathname.endsWith('/') ? urlObj.pathname + 'index.html' : urlObj.pathname;
    const finalHtmlPath = getDestPath(pageRelPath, targetBaseDir, framework);
    
    ensureDir(path.dirname(finalHtmlPath));
    fs.writeFileSync(finalHtmlPath, $.html());
    console.log(`Saved HTML: ${finalHtmlPath}`);

  } catch (e) {
    console.error(`Failed to scrape page ${targetUrl}:`, e.message);
  }
}

module.exports = {
  scrapePage,
  ensureDir
};
