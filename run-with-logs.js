#!/usr/bin/env node

// Simple script to run the app and capture extension logs
const { spawn } = require('child_process');
const path = require('path');

const distMain = path.join(__dirname, 'dist', 'main.js');

console.log('[test-runner] Starting app:', distMain);

const app = spawn('node', [distMain], {
  stdio: ['ignore', 'pipe', 'pipe'],
  timeout: 10000 // Run for 10 seconds then exit
});

const extensionLogs = [];
const allLogs = [];

app.stdout.on('data', (data) => {
  const output = data.toString();
  allLogs.push(output);
  if (output.includes('[extensions]')) {
    extensionLogs.push(output);
    console.log(output);
  }
});

app.stderr.on('data', (data) => {
  const output = data.toString();
  allLogs.push(output);
  if (output.includes('[extensions]')) {
    extensionLogs.push(output);
    console.log('[stderr]', output);
  }
});

setTimeout(() => {
  console.log('\n=== Extension Logs Summary ===');
  console.log(`Total logs: ${allLogs.length}`);
  console.log(`Extension logs: ${extensionLogs.length}`);
  console.log('\nAll extension-related output:');
  extensionLogs.forEach(log => console.log(log));
  
  app.kill();
  process.exit(0);
}, 10000);
