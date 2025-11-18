const { createServer } = require('http');
const { readFile } = require('fs/promises');
const { extname, join } = require('path');

const PORT = process.env.PORT || 3001;

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const fullPath = join(__dirname, 'out', filePath);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    const content = await readFile(fullPath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    // If file not found, serve index.html for SPA routing
    if (error.code === 'ENOENT') {
      try {
        const indexPath = join(__dirname, 'out', 'index.html');
        const content = await readFile(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } catch (indexError) {
        res.writeHead(404);
        res.end('Not Found');
      }
    } else {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Static export server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${join(__dirname, 'out')}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port:`);
    console.error(`PORT=3002 npm run serve-static`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
}); 