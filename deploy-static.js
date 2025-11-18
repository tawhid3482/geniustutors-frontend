#!/usr/bin/env node

/**
 * Static Export Deployment Script
 * This script handles the static export build and deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting static export deployment...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if Next.js is installed
if (!fs.existsSync('node_modules/next')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Build the static export
console.log('🔨 Building static export...');
try {
  execSync('npm run build:production:static', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if the out directory was created
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: out directory not found after build. Build may have failed.');
  process.exit(1);
}

console.log('\n✅ Static export build completed successfully!');
console.log(`📁 Static files are located in: ${outDir}`);

// Display deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('============================');
console.log('1. Upload the contents of the "out" folder to your web server');
console.log('2. Ensure your Node.js backend is running and accessible');
console.log('3. Configure CORS on your backend to allow requests from your frontend domain');
console.log('4. Set the NEXT_PUBLIC_API_BASE_URL environment variable to your backend URL');
console.log('\n🌐 For local testing, you can run: npm run start:static');
console.log('🚀 For production deployment, upload the "out" folder to your web server');

// Check if serve package is available for local testing
try {
  require.resolve('serve');
  console.log('\n💡 Tip: You can test the static build locally with: npm run start:static');
} catch (error) {
  console.log('\n💡 Tip: Install serve package for local testing: npm install -g serve');
}

console.log('\n🎉 Static export deployment script completed!');
