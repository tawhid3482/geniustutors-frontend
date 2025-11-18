#!/usr/bin/env node

/**
 * Remove API Routes Script
 * This script removes all API routes since they can't be used with static export
 * The API logic will be moved to the Node.js backend
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️  Removing API routes for static export...\n');

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

if (fs.existsSync(apiDir)) {
  console.log('📁 Found API directory, removing...');
  
  // Remove the entire API directory
  fs.rmSync(apiDir, { recursive: true, force: true });
  console.log('✅ API routes removed successfully');
  
  console.log('\n📋 Next steps:');
  console.log('1. Ensure all API calls in your components use the backend URL');
  console.log('2. Update your backend to handle all the API endpoints');
  console.log('3. Test the build again with: npm run build:production:static');
  
} else {
  console.log('ℹ️  No API directory found, nothing to remove');
}

console.log('\n🎉 API routes removal completed!');
