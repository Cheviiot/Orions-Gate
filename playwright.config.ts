import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  timeout: 60_000,
  reporter: 'list',
  use: {
    headless: true
  }
});
