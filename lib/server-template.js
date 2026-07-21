const fs = require('fs');
const path = require('path');

function generateServerJs(domains, outputDir, framework) {
  let serverCode = `const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');

const DIST_DIR = path.join(__dirname, 'dist');
`;

  domains.forEach((d, idx) => {
    serverCode += `const PORT_${d.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()} = ${3000 + idx};\n`;
  });
  serverCode += `const PORT_HUB = 8080;\n\n`;

  domains.forEach((d, idx) => {
    const constName = d.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const appName = `app_${d.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    serverCode += `// App for ${d.domain}\n`;
    serverCode += `const ${appName} = express();\n\n`;
    
    // Proxy configurations with header cleanup to hide localhost
    serverCode += `// Proxy API and config requests to the live backend\n`;
    serverCode += `${appName}.use('/api', proxy('${d.protocol}//${d.domain}', {\n`;
    serverCode += `  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {\n`;
    serverCode += `    proxyReqOpts.headers['host'] = '${d.domain}';\n`;
    serverCode += `    proxyReqOpts.headers['referer'] = '${d.protocol}//${d.domain}/';\n`;
    serverCode += `    proxyReqOpts.headers['origin'] = '${d.protocol}//${d.domain}';\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-host'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-Host'];\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-proto'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-Proto'];\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-for'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-For'];\n`;
    serverCode += `    return proxyReqOpts;\n`;
    serverCode += `  },\n`;
    serverCode += `  proxyReqPathResolver: (req) => '/api' + req.url\n`;
    serverCode += `}));\n\n`;

    serverCode += `${appName}.use('/raiz5jee8eiph0eeFooV', proxy('${d.protocol}//${d.domain}', {\n`;
    serverCode += `  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {\n`;
    serverCode += `    proxyReqOpts.headers['host'] = '${d.domain}';\n`;
    serverCode += `    proxyReqOpts.headers['referer'] = '${d.protocol}//${d.domain}/';\n`;
    serverCode += `    proxyReqOpts.headers['origin'] = '${d.protocol}//${d.domain}';\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-host'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-Host'];\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-proto'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-Proto'];\n`;
    serverCode += `    delete proxyReqOpts.headers['x-forwarded-for'];\n`;
    serverCode += `    delete proxyReqOpts.headers['X-Forwarded-For'];\n`;
    serverCode += `    return proxyReqOpts;\n`;
    serverCode += `  },\n`;
    serverCode += `  proxyReqPathResolver: (req) => '/raiz5jee8eiph0eeFooV' + req.url\n`;
    serverCode += `}));\n\n`;

    // Static Assets serving
    serverCode += `// Serve static files\n`;
    if (framework && framework !== 'vanilla') {
      serverCode += `${appName}.use(express.static(path.join(DIST_DIR, '${d.name}', 'public')));\n`;
      serverCode += `${appName}.use(express.static(path.join(DIST_DIR, '${d.name}', 'src')));\n`;
      serverCode += `${appName}.use(express.static(path.join(DIST_DIR, '${d.name}')));\n\n`;
    } else {
      serverCode += `${appName}.use(express.static(path.join(DIST_DIR, '${d.name}', 'src')));\n\n`;
    }

    // Explicit sub-pages fallback to handle nested index.html
    d.pages.forEach(p => {
      if (p !== '/' && p !== '/index.html') {
        const pageRelative = p.slice(1);
        if (framework && framework !== 'vanilla') {
          serverCode += `${appName}.get('${p}', (req, res) => {\n`;
          serverCode += `  res.sendFile(path.join(DIST_DIR, '${d.name}', '${pageRelative}', 'index.html'));\n`;
          serverCode += `});\n\n`;
        } else {
          serverCode += `${appName}.get('${p}', (req, res) => {\n`;
          serverCode += `  res.sendFile(path.join(DIST_DIR, '${d.name}', 'src', '${pageRelative}', 'index.html'));\n`;
          serverCode += `});\n\n`;
        }
      }
    });

    // Fallback client-side route
    serverCode += `// SPA route fallback\n`;
    if (framework && framework !== 'vanilla') {
      serverCode += `${appName}.use((req, res) => {\n`;
      serverCode += `  res.sendFile(path.join(DIST_DIR, '${d.name}', 'index.html'));\n`;
      serverCode += `});\n\n`;
    } else {
      serverCode += `${appName}.use((req, res) => {\n`;
      serverCode += `  res.sendFile(path.join(DIST_DIR, '${d.name}', 'src', 'index.html'));\n`;
      serverCode += `});\n\n`;
    }

    // Listen block
    serverCode += `${appName}.listen(PORT_${constName}, () => {\n`;
    serverCode += `  console.log('${d.domain} local server running at: http://localhost:' + PORT_${constName});\n`;
    serverCode += `});\n\n`;
  });

  // Hub Portal
  serverCode += `// 4. Hub Portal App (Port 8080) for easy navigation between all cloned pages
const appHub = express();

appHub.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cloned Domains Navigation Portal</title>
      <style>
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: #1e293b;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 550px;
          border: 1px solid #334155;
        }
        h1 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
          background: linear-gradient(to right, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li {
          margin-bottom: 1rem;
        }
        a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #334155;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          color: #e2e8f0;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }
        a:hover {
          background: #475569;
          transform: translateY(-2px);
          border-color: #38bdf8;
          box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.2);
        }
        .port {
          background: #0ea5e9;
          color: white;
          padding: 0.25rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Cloned Sites Navigation</h1>
        <ul>
          \${${JSON.stringify(domains)}.map((d, idx) => \`
          <li>
            <a href="http://localhost:\${3000 + idx}" target="_blank">
              <span>\${d.domain}</span>
              <span class="port">Port \${3000 + idx}</span>
            </a>
          </li>\`).join('')}
        </ul>
      </div>
    </body>
    </html>
  \`);
});

appHub.listen(PORT_HUB, () => {
  console.log('\\n[Navigation Portal] Open http://localhost:' + PORT_HUB + ' to view all cloned websites!\\n');
});
`;

  fs.writeFileSync(path.join(outputDir, 'server.js'), serverCode);
  console.log(`Generated local server config: ${path.join(outputDir, 'server.js')}`);
}

module.exports = {
  generateServerJs
};
