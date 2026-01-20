#!/usr/bin/env node

/**
 * Test script to verify Orion Userscripts extension loading
 * Run: node test-extension-load.js
 */

const path = require('path');
const fs = require('fs');

const __dirname = process.cwd();
const isDev = true; // Simulate dev mode

console.log('=== Orion Userscripts Extension Load Test ===\n');
console.log('Current directory (__dirname):', __dirname);

// Calculate paths as main/index.ts does
let extensionPath;

if (isDev) {
  // __dirname = project root (when running from project)
  // For dev, extensions are at ./extensions/orion-userscripts
  extensionPath = path.join(__dirname, 'extensions/orion-userscripts');
} else {
  // Production: use resourcesPath
  extensionPath = path.join('/path/to/resources', 'extensions/orion-userscripts');
}

console.log('isDev:', isDev);
console.log('Expected extension path:', extensionPath);
console.log('');

// Check if it exists
const extensionExists = fs.existsSync(extensionPath);
console.log('✓ Extension directory exists:', extensionExists);

if (extensionExists) {
  const files = fs.readdirSync(extensionPath);
  console.log('✓ Files in extension directory:', files);
  
  const manifestPath = path.join(extensionPath, 'manifest.json');
  const manifestExists = fs.existsSync(manifestPath);
  console.log('✓ manifest.json exists:', manifestExists);
  
  if (manifestExists) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('✓ Extension name:', manifest.name);
    console.log('✓ Extension version:', manifest.version);
  }
  
  const contentRunnerPath = path.join(extensionPath, 'content/runner.js');
  const contentRunnerExists = fs.existsSync(contentRunnerPath);
  console.log('✓ content/runner.js exists:', contentRunnerExists);
  
  const optionsPath = path.join(extensionPath, 'options/options.html');
  const optionsExists = fs.existsSync(optionsPath);
  console.log('✓ options/options.html exists:', optionsExists);
} else {
  console.log('✗ Extension directory NOT found!');
  console.log('');
  console.log('Expected path:', extensionPath);
  console.log('Please check that extensions/orion-userscripts/ exists in your project root');
}

console.log('');
console.log('=== Test Complete ===');
