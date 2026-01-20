import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig(({ watch }) => ({
  entry: {
    main: 'src/main/index.ts',
    preload: 'src/preload/index.ts',
    webviewPreload: 'src/preload/webview.ts'
  },
  outDir: 'dist',
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  clean: false,
  dts: false,
  minify: !watch,
  shims: false,
  external: ['electron'],
  treeshake: false,
  onSuccess: async () => {
    // Copy demergi.js to dist
    const src = path.join(__dirname, 'src/main/demergi.js');
    const dest = path.join(__dirname, 'dist/demergi.js');
    fs.copyFileSync(src, dest);
    console.log('Copied demergi.js to dist/');

    // Copy VOT assets to dist
    const votSrc = path.join(__dirname, 'assets/vot');
    const votDest = path.join(__dirname, 'dist/assets/vot');
    
    if (fs.existsSync(votSrc)) {
      fs.mkdirSync(votDest, { recursive: true });
      const files = fs.readdirSync(votSrc);
      for (const file of files) {
        fs.copyFileSync(
          path.join(votSrc, file),
          path.join(votDest, file)
        );
      }
      console.log('Copied VOT assets to dist/assets/vot/');
    }

    // Copy icon assets for packaging
    const resourcesSrc = path.join(__dirname, 'resources');
    const resourcesDest = path.join(__dirname, 'dist/resources');
    
    if (fs.existsSync(resourcesSrc)) {
      fs.mkdirSync(resourcesDest, { recursive: true });
      const files = fs.readdirSync(resourcesSrc);
      for (const file of files) {
        const srcPath = path.join(resourcesSrc, file);
        const stat = fs.statSync(srcPath);
        if (stat.isFile()) {
          fs.copyFileSync(srcPath, path.join(resourcesDest, file));
        }
      }
      console.log(`Copied ${files.length} icon files to dist/resources/`);
    }
  }
}));
