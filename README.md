
# Orion's Gate

![Orion's Gate Banner](https://raw.githubusercontent.com/Cheviiot/Orions-Gate/main/resources/banner.png)

> **Modern YouTube client for Linux/Windows with DPI bypass, ad blocking, privacy, and beautiful overlay UI.**

---

## ✨ Features

- **VOT (Voice Over Translation)** — automatic YouTube voiceover translation (integrated userscript)
- **DPI bypass** (Demergi built-in, optional)
- **Adblock** (Ghostery engine, cosmetic filters)
- **Modern overlay UI** (React + Tailwind)
- **Multi-language**: English, Russian, German, French
- **Themes**: YouTube Dark/Light, Auto
- **Hotkeys**: Alt+←/→, Ctrl+K, Ctrl+,
- **Portable**: No installer required (AppImage, RPM, DEB, NSIS)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Build for production
npm run build

# 4. Start packaged app
npm start
```

---

## 🛠️ Building Installers

- **Windows (NSIS):**
  ```bash
  npm run make:win
  ```
- **Linux (DEB):**
  ```bash
  npm run make:deb
  ```
- **Linux (RPM):**
  ```bash
  npm run make:rpm
  ```
- **Linux (AppImage):**
  ```bash
  npm run make:appimage
  ```
- **ALT Linux (native RPM):**
  ```bash
  bash scripts/build-altlinux.sh
  ```

All installers and artifacts are placed in the `release/` directory. The binary is always named `orions-gate`, desktop integration uses `orions-gate.desktop`, and icons are installed as `orions-gate` in hicolor theme.

---

## 🌐 Localization

- Interface: English, Russian, German, French
- Add your translation: `src/renderer/locales/<lang>/translation.json`

---

## 🧩 Tech Stack

- **Electron 40+**
- **React 18 + TypeScript 5**
- **Vite, TailwindCSS, Zustand, i18next**
- **Ghostery Adblocker**
- **Demergi DPI bypass**

---

## 🤝 Contributing

Pull requests and issues are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT. See [LICENSE](LICENSE).

---


## Project Structure
```
src/
    main/         # Electron main process
    preload/      # Preload scripts (window.orion, VOT)
    renderer/     # React UI, components, localization
        components/ # FAB, Settings, Search, Overlay
        state/      # Zustand stores
        locales/    # i18n (en, ru, de, fr)
        App.tsx     # Root component
    shared/       # Shared types and utils
        api.ts      # OrionBridge types
        settings.ts # Settings schema (Zod)
assets/         # VOT assets
resources/      # Icons/resources for packaging
public/         # demergi.js
scripts/        # Build/icon scripts
tests/          # Playwright E2E
dist/           # Build output
release/        # Installers
```

## Configuration Files
- `electron-builder.yml` — multi-platform packaging (Windows, Linux, Alt Linux)
  - VOT assets included in ASAR bundle
  - Disabled auto-updates and publishing
- `tsup.config.ts` — main/preload build, copies VOT assets
- `vite.renderer.config.ts` — renderer build
- `playwright.config.ts` — E2E tests
- `package.json` — build scripts and dependencies
- `.github/workflows/build.yml` — CI/CD matrix builds (Windows, Linux deb/AppImage, Fedora RPM, Alt Linux RPM)

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
**GitHub Actions** (`.github/workflows/build.yml`)
- **Windows**: NSIS + MSI installers
- **Linux deb/AppImage**: Ubuntu latest (standard Linux packages)
- **Fedora RPM**: Fedora 43 container with electron-builder and FPM
- **Alt Linux RPM**: Alt Linux Sisyphus container with rpmbuild/gear/hasher
  - Non-root builder user (security policy)
  - elfutils, perl for proper RPM generation
  - Auto-updates disabled (no GitHub token required)

**Release workflow** (`.github/workflows/release.yml`)
- Triggered on `v*` tags
- Uploads artifacts to GitHub Releases
- Matrix strategy for all platforms

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
- [VOT (Voice Over Translation)](https://github.com/ilyhalight/voice-over-translation) — by ilyhalight
- [Demergi](https://github.com/ValdikSS/demergi) — DPI bypass
- [Ghostery Adblocker](https://www.ghostery.com/) — by Ghostery
- [Electron](https://www.electronjs.org/), [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)

## Support
Questions and ideas — open an issue on GitHub.

---
Version: 2.0.0-alpha.0 · Electron: 40.0.0 · Node: >=18 · Platforms: Windows, Linux
