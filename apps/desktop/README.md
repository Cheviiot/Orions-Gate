# Orion's Gate

Modern YouTube client built with Electron, featuring DPI bypass, advanced ad blocking, Voice Over Translation, and enhanced privacy.

## Features

🚀 **DPI Bypass**
- Integrated Demergi proxy for unrestricted access
- Automatic proxy configuration and management
- Direct mode fallback for regions without restrictions

🛡️ **Advanced Ad Blocking**
- Ghostery Adblocker with cosmetic filtering
- Blocks ads, trackers, and unwanted content
- Real-time statistics and control
- Three strength levels: ads only, ads+tracking, full lists

🎙️ **Voice Over Translation (VOT)**
- Integrated VOT userscript by ilyhalight
- Real-time video translation and dubbing
- Support for multiple languages
- Automatic locale detection
- Persistent settings with electron-store

🎨 **Modern Interface**
- Clean, YouTube-inspired design
- Floating Action Button (FAB) with 6 quick controls:
  - Home, Back, Forward, Refresh, Search, Settings
- Overlay-based settings and navigation
- Dark/Light theme support with auto-detection
- Customizable UI scale and backdrop opacity
- Localized interface (English + Russian)

🔒 **Privacy & Security**
- Secured webview with isolated context
- No telemetry or tracking
- Local settings storage
- Sandboxed webview for YouTube content
- IPC-based secure communication

🛠️ **Developer Tools**
- Manual DevTools access for main window and webview
- Debug logging for troubleshooting
- Chrome DevTools integration

## Tech Stack

- **Electron 40** — Cross-platform desktop framework
- **Vite 5** — Fast development and optimized builds
- **React 18** — UI components and rendering
- **TypeScript 5** — Type safety and better DX
- **Tailwind CSS 3** — Utility-first styling
- **Zustand 4** — State management
- **i18next** — Internationalization
- **electron-store** — Persistent settings storage
- **Ghostery Adblocker** — Network-level ad blocking

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts:
- Vite dev server (renderer) on `http://localhost:5173`
- tsup in watch mode (main/preload)
- Electron with auto-reload via electronmon

### Build

```bash
npm run build
```

Creates production bundles in `dist/` folder:
- `dist/main.js` - Main process
- `dist/preload.js` - Main preload bridge
- `dist/webviewPreload.js` - YouTube webview preload (with VOT)
- `dist/renderer/` - React UI bundle
- `dist/assets/vot/` - VOT userscript assets

To run the built app:
```bash
npm start
```

## Icon Generation (Linux, macOS, Windows)

For correct icon display on all platforms, especially on Alt Linux (X11 and Wayland):

```bash
npm run generate-icons
```

Or use the setup script:
```bash
# Linux/macOS
bash scripts/setup-icons.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\setup-icons.ps1
```

**What gets generated:**
- PNG icons in 16, 32, 48, 64, 96, 128, 256, 512 pixel sizes
- Freedesktop directory structure for Linux
- X11 and Wayland support (especially important for Alt Linux)
- All sizes for correct display in different contexts

**Requirements:**
- ImageMagick (automatic installation on first run)
- Node.js 18+

## Packaging

Build installers for your platform:

**Windows**
```bash
npm run make:win
```
Creates NSIS installer (~106 MB with VOT assets)

**Linux (Debian/Ubuntu)**
```bash
npm run make:deb
```

**Linux (Fedora/Alt/RHEL)**
```bash
npm run make:rpm
```

**Linux (AppImage)**
```bash
npm run make:appimage
```

All artifacts are saved in the `release/` directory.

### Alt Linux Support (Wayland and X11)

Special optimization for Alt Linux with full support for both Wayland and X11:

- ✅ PNG icons in all 8 sizes (16-512px)
- ✅ Freedesktop directory structure (hicolor theme)
- ✅ High DPI support
- ✅ Compatibility with all window managers (GNOME, KDE, XFCE, etc.)

Icons are automatically selected by the system depending on context (taskbar, app menu, file manager, etc.).

All artifacts are saved in the `release/` directory.

### Alt Linux Support (Wayland and X11)

Special optimization for Alt Linux with full support for both Wayland and X11:

- ✅ PNG icons in all 8 sizes (16-512px)
- ✅ Freedesktop directory structure (hicolor theme)
- ✅ High DPI support
- ✅ Compatibility with all window managers (GNOME, KDE, XFCE, etc.)

Icons are automatically selected by the system depending on context (taskbar, app menu, file manager, etc.).

## Testing

Install Playwright (one-time setup):
```bash
npm run playwright:install
```

Run smoke tests:
```bash
npm run test:smoke
```

Tests verify that the FAB is visible and clickable in the built application.

## Project Structure

```
apps/desktop/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main entry, window management
│   │   ├── settings.ts # Settings persistence & migration
│   │   ├── dpiManager.ts # Demergi proxy management
│   │   ├── votBridge.ts # VOT IPC handlers (8 handlers)
│   │   └── votStorage.ts # VOT electron-store wrapper
│   ├── preload/        # Preload scripts (bridges)
│   │   ├── index.ts    # Main preload bridge
│   │   └── webview.ts  # YouTube webview preload with VOT injection
│   ├── renderer/       # React UI
│   │   ├── components/ # UI components
│   │   │   ├── Overlay/ # FAB, Settings, Search overlays
│   │   │   ├── WebviewHost.tsx # YouTube webview container
│   │   │   └── Icon.tsx # Icon system (Lucide + Material)
│   │   ├── state/      # Zustand stores
│   │   ├── locales/    # i18n translations (en, ru)
│   │   └── App.tsx     # Main app component
│   └── shared/         # Shared types and utilities
│       ├── api.ts      # OrionBridge type definitions
│       └── settings.ts # Settings schema with Zod validation
├── assets/
│   └── vot/           # VOT userscript assets
│       ├── vot.user.js           # VOT userscript (527 KB)
│       ├── hls.light.min.js      # HLS.js library (261 KB)
│       └── gm-addstyle-polyfill.js # GM_addStyle polyfill
├── resources/          # Static assets for packaging
│   ├── icon.ico       # Windows icon
│   └── icon.png       # Linux icon
├── public/             # Public assets
│   └── demergi.js     # Demergi DPI bypass proxy
└── tests/              # Playwright E2E tests
```

## Configuration Files

- `electron-builder.yml` — Packaging configuration (includes VOT assets)
- `tsup.config.ts` — Main/preload build config (copies VOT assets)
- `vite.renderer.config.ts` — Renderer build config
- `playwright.config.ts` — E2E test configuration
- `package.json` — Dependencies and scripts

## VOT (Voice Over Translation) Integration

Orion's Gate includes integrated Voice Over Translation by [ilyhalight](https://github.com/ilyhalight/voice-over-translation):

### How It Works

1. **Auto-Injection**: VOT automatically loads on YouTube pages
2. **GM-API Shim**: Full Greasemonkey API compatibility implemented via IPC bridge
3. **Persistent Storage**: Settings stored in `userData/vot-data/vot-storage.json`
4. **Network Requests**: Bypass CORS via Electron net.request
5. **Sandboxed**: VOT runs in isolated webview context for security

### IPC Handlers

8 IPC handlers in `votBridge.ts`:
- `vot:get-file` - Load VOT assets from disk
- `vot:storage:dump/set/del/list` - Settings persistence
- `vot:http` - HTTP requests without CORS
- `vot:notify` - System notifications
- `vot:download` - File downloads

### Troubleshooting VOT

If VOT button doesn't appear:
1. Open DevTools for YouTube webview (Settings → DevTools → DevTools YouTube)
2. Check console for `[VOT]` logs
3. Expected logs sequence:
   ```
   [WEBVIEW PRELOAD] Loaded
   [VOT] Preparing injection...
   [VOT] Injecting into YouTube
   [VOT] Loaded dependency: hls.light.min.js
   [VOT] Loaded dependency: gm-addstyle-polyfill.js
   [VOT] Loaded successfully
   ```

## Settings & Configuration

Settings stored in `userData/orion-settings.json` with automatic migration:

### 1. User-Agent
- Default (Chrome 131 on Windows 10)
- Chrome Desktop, Chrome Android
- Custom UA with reload on change

### 2. DPI Bypass (Demergi)
- Mode: off / demergi
- Port (default: 8080)
- Bypass list for direct connections
- Auto-start on app launch

### 3. Adblocker
- Enable/disable
- Strength: ads / ads+tracking / full
- Cosmetic filtering (CSS injection)
- Real-time statistics panel

### 4. Interface
- Language: en / ru
- Theme: dark / light / auto
- Scale: 90% / 100% / 110% / 125%
- Backdrop opacity (0-40%)
- Animations, hotkeys, auto-close behavior
- Icon set: Lucide / Material Symbols

### 5. Window
- Width, height, start state (last/maximized/normal)
- Always on top, resizable
- Min width/height

### 6. FAB (Floating Action Button)
- Position: right-bottom / left-bottom
- Padding: 8-32px
- Size: S / M / L
- Shape: circle / rounded
- Opacity: 60-100%
- Hover-to-open, tooltips
- **Button order**: Reorderable 6-button panel (home, back, forward, refresh, search, settings)

### 7. DevTools
- **DevTools Window** — Opens main window DevTools
- **DevTools YouTube** — Opens webview DevTools (for VOT debugging)
- Manual access via settings panel

## Keyboard Shortcuts

- `Alt + ←` — Back
- `Alt + →` — Forward
- `Ctrl + K` — Search
- `Ctrl + ,` — Settings
- `Ctrl + Shift + D` — Toggle Diagnostics
- `Esc` — Close overlays (if enabled in settings)

## Security

- Webview runs in isolated context with `contextIsolation: true`
- Node integration disabled in renderer and webview
- Sandbox enabled for webview (`sandbox: true`)
- Secure IPC communication via preload bridges
- Content Security Policy enabled
- External navigation blocked by default
- VOT file loading via IPC (no Node.js APIs in webview)

## Architecture

### Main Process
- Window management, lifecycle, menu
- Settings persistence with migration support
- DPI bypass (Demergi) management
- Adblocker integration (Ghostery)
- VOT IPC bridge with 8 handlers
- DevTools control

### Preload Scripts
- **Main Preload** (`preload/index.ts`): Exposes `window.orion` API to renderer
- **Webview Preload** (`preload/webview.ts`): VOT injection with GM-API shim

### Renderer Process
- React 18 with TypeScript
- Zustand for state management (settings, overlay)
- i18next for localization
- Tailwind CSS for styling
- Custom Icon component with Lucide/Material support

### Webview Architecture
```
Main Window (Electron BrowserWindow)
  └─ React Renderer
      └─ WebviewHost Component
          └─ <webview> tag (sandboxed)
              ├─ YouTube content
              └─ Webview Preload (VOT)
                  ├─ GM-API Shim (inline)
                  ├─ VOT Bridge (IPC)
                  └─ VOT Userscript (injected)
```

## CI/CD

### Build Workflow
`.github/workflows/build.yml` builds for multiple platforms:
- Linux: deb + AppImage
- Windows: NSIS + MSI
- Alt Linux: RPM

### Release Workflow
`.github/workflows/release.yml` creates GitHub releases:
- Triggered by version tags (v*)
- Automatically uploads all platform artifacts
- Creates non-draft release with auto-generated notes

## Known Issues

- `MaxListenersExceededWarning` in console (harmless, adblocker stats)
- Demergi proxy timeouts on some Google services (doesn't affect YouTube)
- SSL handshake errors in console (DPI bypass side effect, non-critical)

## Contributing

This project is in active development. Contributions are welcome!

### Development Tips
- Use `npm run dev` for hot-reload development
- Check TypeScript errors with `npm run typecheck`
- Test packaging before pushing: `npm run make:win` (or your platform)
- Follow existing code style and structure

## License

MIT License — See LICENSE file for details.

## Credits

- **VOT (Voice Over Translation)** by [ilyhalight](https://github.com/ilyhalight/voice-over-translation)
- **Demergi** DPI bypass proxy
- **Ghostery Adblocker** by Ghostery
- **Electron** framework
- **React**, **Vite**, **TypeScript** ecosystems

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Version**: 2.0.0-alpha.0  
**Electron**: 40.0.0  
**Node**: >=18  
**Platform**: Windows, Linux

