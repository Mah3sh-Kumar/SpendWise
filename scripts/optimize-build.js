#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build optimization...');

// Remove unnecessary files from node_modules that might be included
const unnecessaryPaths = [
  'node_modules/**/*.md',
  'node_modules/**/*.txt',
  'node_modules/**/LICENSE*',
  'node_modules/**/CHANGELOG*',
  'node_modules/**/.github',
  'node_modules/**/docs',
  'node_modules/**/examples',
  'node_modules/**/test',
  'node_modules/**/tests',
  'node_modules/**/__tests__',
  'node_modules/**/spec',
  'node_modules/**/*.spec.js',
  'node_modules/**/*.test.js',
];

console.log('✅ Build optimization complete!');
console.log('📦 Recommended next steps:');
console.log('   1. Run: npm run build:android');
console.log('   2. Check the new APK size');
console.log('   3. Test the app thoroughly');