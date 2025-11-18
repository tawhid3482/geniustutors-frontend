// server.js - Custom Next.js server for cPanel Node.js Manager (Low Memory Optimized)
const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Memory optimization for shared hosting
const v8 = require('v8');
v8.setFlagsFromString('--max-old-space-size=512'); // Limit heap to 512MB

// Environment configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || process.env.NODE_PORT || '3000', 10);

// Create Next.js app instance with memory optimizations
const app = next({ 
  dev, 
  hostname, 
  port,
  // Disable features that consume too much memory
  experimental: {
    // Disable features that use WebAssembly
    serverComponentsExternalPackages: [],
    // Reduce memory usage
    optimizeCss: false,
    // Disable image optimization to save memory
    images: {
      unoptimized: true
    }
  },
  // Reduce memory usage
  compress: false,
  poweredByHeader: false
});

const handle = app.getRequestHandler();

// Memory monitoring
const logMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  console.log(`Memory Usage - RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
};

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logMemoryUsage();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logMemoryUsage();
  process.exit(1);
});

// Memory cleanup on exit
process.on('exit', () => {
  console.log('Server shutting down...');
});

app.prepare().then(() => {
  const server = express();

  // Security headers
  server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Serve static files from the public folder
  server.use('/public', express.static(path.join(__dirname, 'public')));
  
  // Serve uploads folder if it exists
  if (fs.existsSync(path.join(__dirname, 'uploads'))) {
    server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  // Health check endpoint for cPanel
  server.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      }
    });
  });

  // Handle all other requests via Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    }
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Health check: http://${hostname}:${port}/health`);
    logMemoryUsage();
  });
}).catch((err) => {
  console.error('❌ Next.js app preparation failed:', err);
  logMemoryUsage();
  process.exit(1);
});
