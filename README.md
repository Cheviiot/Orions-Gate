# Orion's Gate

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-2.0.0--alpha.0-orange.svg) ![Electron](https://img.shields.io/badge/Electron-40-47848F.svg) ![Node](https://img.shields.io/badge/Node-%3E%3D18-43853d.svg) ![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20Linux-5865F2.svg)

Modern desktop YouTube client built with Electron, integrated Voice Over Translation (VOT), and DPI bypass via Demergi.

[Русская версия](README.ru.md)

## ✨ Features
- VOT (Voice Over Translation) with GM-API shim and persistent storage
- Ghostery ad blocker and DPI bypass (Demergi)
- React 18 + Vite + TypeScript, Tailwind, Zustand
- Full webview sandbox and strict CSP
- Packaging for Windows (NSIS/MSI) and Linux (DEB/RPM/AppImage)

## 🚀 Quick Start

### Requirements
- Node.js 18+ (tested with 20)
- npm 10+
- Git

### Install & Develop
```bash
git clone https://github.com/Cheviiot/Orions-Gate.git
cd Orions-Gate
npm install
npm run dev
```

### Build & Package
```bash
npm run build
npm run make:win      # NSIS (Windows)
npm run make:deb      # DEB (Debian/Ubuntu)
npm run make:rpm      # RPM (Fedora/RHEL/Alt)
npm run make:appimage # AppImage (universal)
```

Artifacts: release/

### Alt Linux Support (Wayland and X11)
- PNG icons 16–512 px (hicolor theme)
- High DPI and automatic icon picking
- Works with GNOME/KDE/XFCE and others

## Project Structure
```
.
├── src/
│   ├── main/             # Electron main process
│   │   ├── index.ts      # Windows and lifecycle
│   │   ├── settings.ts   # Settings + migration
│   │   ├── dpiManager.ts # Demergi control
│   │   ├── votBridge.ts  # 8 VOT IPC handlers
│   │   └── votStorage.ts # electron-store wrapper
│   ├── preload/          # Preload bridges
│   │   ├── index.ts      # window.orion API
│   │   └── webview.ts    # VOT inject + GM-API shim
│   ├── renderer/         # React UI
│   │   ├── components/   # FAB, Settings, Search
│   │   ├── state/        # Zustand stores
│   │   ├── locales/      # i18n (en, ru)
│   │   └── App.tsx       # Root component
│   └── shared/           # Shared types and utils
│       ├── api.ts        # OrionBridge types
│       └── settings.ts   # Settings schema (Zod)
├── assets/               # VOT assets
├── resources/            # Icons/resources for packaging
├── public/               # demergi.js
├── scripts/              # Build/icon scripts
├── tests/                # Playwright E2E
├── dist/                 # Build output
└── release/              # Installers
```

## Configuration Files
- electron-builder.yml — packaging (includes VOT assets)
- tsup.config.ts — main/preload build (copies assets)
- vite.renderer.config.ts — renderer build
- playwright.config.ts — E2E
- package.json — scripts and dependencies

## VOT Integration
Orion's Gate includes Voice Over Translation by [ilyhalight](https://github.com/ilyhalight/voice-over-translation).

**How it works**
1. Auto-inject VOT on YouTube pages
2. GM-API shim inside webview preload
3. Settings stored at userData/vot-data/vot-storage.json
4. Network requests via Electron net.request (no CORS issues)
5. Webview sandbox for safety

**IPC handlers (votBridge.ts)**
- `vot:get-file`
- `vot:storage:dump/set/del/list`
- `vot:http`
- `vot:notify`
- `vot:download`

**If the VOT button is missing**
- Open DevTools for YouTube webview (Settings → DevTools → DevTools YouTube)
- Check `[VOT]` logs in console
- Expected sequence: Loaded → Preparing injection → Injecting → Loaded

## Settings
- User-Agent: Chrome Desktop/Android or custom
- DPI bypass (Demergi): mode, port, bypass list, autostart
- Ad blocker: filtering levels, stats
- Interface: language, theme, scale, transparency, animations
- Window: sizes, always-on-top, min sizes
- FAB: position, offset, size, shape, transparency, button order
- DevTools: window and YouTube webview

## Hotkeys
- Alt + Left / Alt + Right — Navigation
- Ctrl + K — Search
- Ctrl + , — Settings
- Ctrl + Shift + D — Diagnostics
- Esc — Close overlays (if enabled)

## Security
- Webview sandbox (`contextIsolation: true`, `sandbox: true`)
- Node integration disabled in renderer/webview
- Strict CSP and blocked external navigation
- IPC limited to preload bridges

## Architecture
**Main process** — windows, settings, DPI, VOT IPC, DevTools

**Preload** — `preload/index.ts` (window.orion), `preload/webview.ts` (VOT + GM-API)

**Renderer** — React 18, Zustand, i18next, Tailwind, custom Icon component

**Webview**
```
BrowserWindow
 └─ React Renderer
     └─ WebviewHost
         └─ <webview> (sandbox)
             ├─ YouTube
             └─ Webview Preload (VOT)
                 ├─ GM-API shim
                 ├─ VOT Bridge (IPC)
                 └─ VOT Userscript
```

## CI/CD
- .github/workflows/build.yml — builds: Linux (deb, AppImage), Windows (NSIS/MSI), Alt Linux (RPM)
- .github/workflows/release.yml — releases on v* tags, uploads artifacts

## Known Issues
- MaxListenersExceededWarning (ad blocker stats)
- Possible Demergi timeouts for some Google services
- SSL handshake warnings due to DPI bypass

## Contributing
- `npm run dev` for development
- `npm run typecheck` for TS errors
- Before pushing, test packaging: `npm run make:win` (or your platform)

## License
MIT License — see LICENSE.

## Credits
- VOT (Voice Over Translation) — [ilyhalight](https://github.com/ilyhalight/voice-over-translation)
- Demergi — DPI bypass
- Ghostery Adblocker — Ghostery
- Electron, React, Vite, TypeScript

## Support
Questions and ideas — open an issue on GitHub.

---
Version: 2.0.0-alpha.0 · Electron: 40.0.0 · Node: >=18 · Platforms: Windows, Linux
