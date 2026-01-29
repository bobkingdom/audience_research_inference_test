/**
 * Simple HTTP server to trigger tests via API
 * For Render.com Web Service deployment
 */
import { createServer } from 'http';
import { spawn } from 'child_process';

const PORT = process.env.PORT || 10000;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (url.pathname === '/run' && req.method === 'POST') {
    const module = url.searchParams.get('module') || '';
    const smoke = url.searchParams.get('smoke') === 'true';
    
    const args = ['runner.js', '--report'];
    if (module) args.push('--module', module);
    if (smoke) args.push('--smoke');

    try {
      const result = await runTests(args);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  if (url.pathname === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'Audience Research API Test Suite',
      endpoints: {
        'GET /health': 'Health check',
        'POST /run': 'Run all tests',
        'POST /run?module=health': 'Run specific module',
        'POST /run?smoke=true': 'Run smoke tests',
      },
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

function runTests(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { cwd: process.cwd() });
    let stdout = '', stderr = '';
    
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    
    child.on('close', (code) => {
      resolve({
        exitCode: code,
        stdout: stdout.split('\n').slice(-50).join('\n'),  // Last 50 lines
        stderr: stderr,
        timestamp: new Date().toISOString(),
      });
    });
    
    child.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
