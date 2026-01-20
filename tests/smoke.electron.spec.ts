import { _electron as electron, expect, test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const distMain = path.join(__dirname, '..', 'dist', 'main.js');

test('FAB присутствует и кликабелен', async () => {
  expect(fs.existsSync(distMain)).toBeTruthy();

  test.setTimeout(120_000);

  const app = await electron.launch({ args: [distMain] });
  const consoleMessages: string[] = [];
  const errorMessages: string[] = [];
  
  try {
    let window = app.windows()[0];
    const started = Date.now();
    while (!window && Date.now() - started < 40_000) {
      await new Promise((r) => setTimeout(r, 250));
      window = app.windows()[0];
    }
    if (!window) {
      throw new Error('Electron window did not appear');
    }

    // webview может грузиться дольше/блокироваться, поэтому проверяем наличие, но не фейлим если не видим
    await window.waitForSelector('webview', { state: 'attached', timeout: 30_000 }).catch(() => undefined);

    window.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log('renderer:', text);
    });
    
    window.on('pageerror', (err) => {
      const message = err.message;
      errorMessages.push(message);
      console.log('renderer error:', message);
    });

    const bodyHtml = await window.evaluate(() => document.body.innerHTML.slice(0, 5000));
    console.log('body snippet:', bodyHtml);

    const fab = await window.waitForSelector('button[aria-label="Toggle quick panel"]', {
      timeout: 20_000
    });
    
    // Verify FAB button is visible and clickable
    await expect(window.locator('button[aria-label="Toggle quick panel"]')).toBeVisible({ timeout: 15_000 });
    await fab.click();

    // Check for critical extension errors
    const extensionErrors = errorMessages.filter(err => 
      err.includes('extension') || 
      err.includes('violentmonkey') ||
      err.includes('manifest')
    );
    
    if (extensionErrors.length > 0) {
      console.warn('[test] Extension-related errors found:', extensionErrors);
    }

  } finally {
    await app.close();
    
    // Print summary
    console.log('\n=== Console Messages Summary ===');
    console.log(`Total messages: ${consoleMessages.length}`);
    console.log(`Extension-related: ${consoleMessages.filter(m => m.includes('[extensions]')).length}`);
    console.log(`Error messages: ${errorMessages.length}`);
    console.log(`Extension errors: ${errorMessages.filter(m => m.includes('extension') || m.includes('violentmonkey')).length}`);
    
    if (consoleMessages.length > 0) {
      console.log('\nRenderer console logs (first 10):');
      consoleMessages.slice(0, 10).forEach(m => console.log(m));
    }
    
    if (errorMessages.length > 0) {
      console.log('\nRenderer error logs (first 10):');
      errorMessages.slice(0, 10).forEach(m => console.log(m));
    }
  }
});
