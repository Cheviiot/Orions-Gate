# Orion's Gate

Modern YouTube client built with Electron, featuring DPI bypass, advanced ad blocking, Voice Over Translation, and enhanced privacy.

**Repository**: [github.com/Cheviiot/Orions-Gate](https://github.com/Cheviiot/Orions-Gate)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (tested with Node.js 20)
- **npm 10+**
- **Git**

### Installation & Development

```bash
# Clone repository
git clone https://github.com/Cheviiot/Orions-Gate.git
cd Orions-Gate/apps/desktop

# Install dependencies
npm install

# Start development with hot-reload
npm run dev
```

The application will open automatically with live reload for both main process and renderer.

### Build for Production

```bash
# Build binaries
npm run build

# Create installers/packages for your platform
npm run make:win      # Windows (NSIS installer)
npm run make:deb      # Linux DEB package
npm run make:rpm      # Linux RPM package
npm run make:appimage # Linux AppImage
```

Artifacts will be in `apps/desktop/release/` directory.

---

## 📋 Features

### 🌐 DPI Bypass
- Integrated Demergi proxy for unrestricted access
- Automatic proxy configuration and management
- Direct mode fallback for regions without restrictions

### 🛡️ Advanced Ad Blocking
- Ghostery Adblocker with cosmetic filtering
- Blocks ads, trackers, and unwanted content
- Real-time statistics and control
- Three strength levels: ads only, ads+tracking, full lists

### 🎙️ Voice Over Translation (VOT)
- Integrated VOT userscript by ilyhalight
- Real-time video translation and dubbing
- Support for multiple languages
- Automatic locale detection
- Persistent settings with electron-store

### 🎨 Modern Interface
- Clean, YouTube-inspired design
- Floating Action Button (FAB) with 6 quick controls
- Overlay-based settings and navigation
- Dark/Light theme with auto-detection
- Customizable UI scale and backdrop opacity
- Localized interface (English + Russian)

### 🔒 Privacy & Security
- Secured webview with isolated context
- No telemetry or tracking
- Local settings storage
- Sandboxed webview for YouTube content
- IPC-based secure communication

### 🛠️ Developer Tools
- Manual DevTools access for main window and webview
- Debug logging for troubleshooting
- Chrome DevTools integration

---

## 📁 Project Structure

```
Orions-Gate/
├── apps/
│   └── desktop/                    # Main Electron application
│       ├── src/
│       │   ├── main/              # Electron main process
│       │   ├── preload/           # Preload scripts (bridges)
│       │   ├── renderer/          # React UI components
│       │   └── shared/            # Shared types and utilities
│       ├── assets/
│       │   └── vot/              # VOT userscript assets
│       ├── resources/             # Static resources for packaging
│       ├── public/                # Public assets
│       ├── tests/                 # Playwright E2E tests
│       ├── scripts/               # Build and utility scripts
│       │   ├── generate-icons.js
│       │   ├── setup-icons.sh
│       │   ├── setup-icons.ps1
│       │   └── validate-icons.js
│       ├── README.md              # English documentation
│       ├── README.ru.md           # Russian documentation
│       ├── package.json           # Dependencies and scripts
│       ├── electron-builder.yml   # Packaging configuration
│       ├── tsup.config.ts         # Build configuration
│       ├── vite.renderer.config.ts # Renderer build
│       └── playwright.config.ts   # Test configuration
└── .github/
    └── workflows/                 # GitHub Actions CI/CD
        ├── build.yml             # Multi-platform builds
        └── release.yml           # Release automation
```

---

## 🔧 Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Electron** | 40.0 | Cross-platform desktop framework |
| **React** | 18 | UI components and rendering |
| **TypeScript** | 5 | Type safety and better DX |
| **Vite** | 5 | Fast development and optimized builds |
| **Tailwind CSS** | 3 | Utility-first styling |
| **Zustand** | 4 | State management |
| **i18next** | - | Internationalization |
| **electron-store** | - | Persistent settings storage |
| **Ghostery Adblocker** | 2.13 | Network-level ad blocking |

---

## 📖 Documentation

- **[apps/desktop/README.md](apps/desktop/README.md)** — Detailed setup and feature documentation (English)
- **[apps/desktop/README.ru.md](apps/desktop/README.ru.md)** — Russian documentation
- **[apps/desktop/scripts/README.md](apps/desktop/scripts/README.md)** — Build scripts and CI/CD information
- **[apps/desktop/BUILD_DEPENDENCIES.md](apps/desktop/BUILD_DEPENDENCIES.md)** — Complete dependency guide for all platforms

---

## 🚀 Development Workflow

### Daily Development

```bash
# Development with auto-reload
npm run dev

# In another terminal, check TypeScript errors
npm run typecheck
```

### Before Committing

```bash
# Generate/validate icons
npm run generate-icons
npm run validate-icons

# Build to ensure no errors
npm run build

# Run tests
npm run test:smoke
```

### Creating a Release

1. Update version in `apps/desktop/package.json`
2. Commit changes and push to main
3. Create git tag:
   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```
4. GitHub Actions automatically:
   - Builds for Windows, Linux, and Alt Linux
   - Creates GitHub Release with all artifacts
   - Generates release notes

---

## 🛠️ Icon Generation

For correct display on all platforms (especially Alt Linux with X11 and Wayland):

```bash
npm run generate-icons
```

Or use the automatic setup:
```bash
# Linux/macOS
bash scripts/setup-icons.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\setup-icons.ps1
```

**Generated artifacts:**
- PNG icons (16, 32, 48, 64, 96, 128, 256, 512px)
- Freedesktop directory structure for Linux
- X11 and Wayland support
- All necessary formats for cross-platform display

**Requirements:**
- ImageMagick (auto-installed by setup scripts)
- Node.js 18+

---

## 🧪 Testing

### Smoke Tests (Playwright)

```bash
# One-time setup
npm run playwright:install

# Run tests
npm run test:smoke
```

Tests verify FAB visibility and clickability in built application.

---

## 📦 Packaging

### Windows
```bash
npm run make:win
```
Creates NSIS installer (~106 MB with VOT assets)

### Linux (Debian/Ubuntu)
```bash
npm run make:deb
```

### Linux (Fedora/RHEL/Alt Linux)
```bash
npm run make:rpm
```

### Linux (AppImage - universal)
```bash
npm run make:appimage
```

All packages are created in `apps/desktop/release/` directory.

---

## 🔄 CI/CD Pipeline

### Build Workflow (`.github/workflows/build.yml`)
Triggered on: push to main, pull requests, manual workflow_dispatch

**Builds for:**
- Linux (DEB + AppImage) on ubuntu-latest
- Windows (NSIS + MSI) on windows-latest
- Alt Linux (RPM) on ghcr.io/altlinux/base:p11 container

Each build installs system dependencies, generates icons, and uploads artifacts (30-day retention).

### Release Workflow (`.github/workflows/release.yml`)
Triggered on: git tags matching v*

**Three-stage pipeline:**
1. **build-all** — Parallel Linux & Windows builds
2. **build-altlinux** — Dedicated Alt Linux RPM builder
3. **create-release** — Creates GitHub Release with all artifacts (90-day retention)

---

## 🌍 Platform Support

| Platform | Format | Status | CI/CD |
|----------|--------|--------|-------|
| **Windows 10+** | NSIS, MSI | ✅ Tested | Windows Runner |
| **Ubuntu 20.04+** | DEB, AppImage | ✅ Tested | Ubuntu Runner |
| **Debian 11+** | DEB, AppImage | ✅ Tested | Ubuntu Runner |
| **Fedora 36+** | AppImage | ✅ AppImage | Ubuntu Runner |
| **Alt Linux P10/P11** | RPM | ✅ Tested | Docker Container |
| **Alt Linux Sisyphus** | RPM | ✅ Tested | Docker Container |
| **CentOS 8+** | AppImage | ✅ AppImage | Ubuntu Runner |
| **Arch Linux** | AppImage | ✅ AppImage | Ubuntu Runner |
| **macOS** | (not packaged) | ⏳ Future | - |

---

## 🔐 Security

- **Webview Isolation**: contextIsolation enabled, Node.js disabled
- **Sandbox**: All webview content sandboxed
- **IPC Security**: Preload-based secure bridges for main↔renderer communication
- **No Telemetry**: Zero tracking, all data stored locally
- **Content Security Policy**: Enabled by default
- **VOT Sandboxing**: Userscript runs in isolated webview context

---

## 📝 Settings

Settings are stored in `userData/orion-settings.json` and include:

1. **User-Agent** — Select or customize browser identification
2. **DPI Bypass** — Enable/disable Demergi proxy with port configuration
3. **Adblocker** — Configure Ghostery strength and filtering
4. **Interface** — Language, theme, scale, animation preferences
5. **Window** — Size, position, always-on-top, resizing behavior
6. **FAB** — Floating button position, size, shape, opacity, button order
7. **DevTools** — Manual DevTools access for debugging

All settings migrate automatically when app is updated.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + ←` | Back |
| `Alt + →` | Forward |
| `Ctrl + K` | Search |
| `Ctrl + ,` | Settings |
| `Ctrl + Shift + D` | Toggle Diagnostics |
| `Esc` | Close overlays |

---

## 📊 Performance

| Component | Size | Status |
|-----------|------|--------|
| dist/main.js | 17.76 KB | ✅ |
| dist/preload.js | 8.55 KB | ✅ |
| dist/webviewPreload.js | 6.85 KB | ✅ |
| dist/renderer/assets/index.js | 305.60 KB | ✅ (89.09 KB gzipped) |
| Built installer (Windows) | ~106 MB | ✅ |

---

## 🆘 Troubleshooting

### VOT not showing translation button?
1. Open Settings → DevTools → DevTools YouTube
2. Check console for `[VOT]` logs
3. Expected log sequence:
   ```
   [WEBVIEW PRELOAD] Loaded
   [VOT] Preparing injection...
   [VOT] Injecting into YouTube
   [VOT] Loaded dependency: hls.light.min.js
   [VOT] Loaded dependency: gm-addstyle-polyfill.js
   [VOT] Loaded successfully
   ```

### Build fails on Alt Linux?
- Check [BUILD_DEPENDENCIES.md](apps/desktop/BUILD_DEPENDENCIES.md) for exact packages
- Use Docker: `podman run -it ghcr.io/altlinux/base:p11 bash` to test locally
- Verify Node.js 20: `node --version`

### Icons not showing correctly?
```bash
npm run validate-icons
npm run generate-icons
npm run build
```

### Windows Defender warnings?
- This is normal for unsigned binaries
- NSIS installer is safe to install
- Consider code signing for production releases

---

## 📚 Dependencies

See [BUILD_DEPENDENCIES.md](apps/desktop/BUILD_DEPENDENCIES.md) for complete platform-specific dependency lists.

### Quick Setup

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential python3 make gcc g++ libx11-dev libxext-dev libxkbfile-dev libappindicator3-dev fonts-liberation xdg-utils imagemagick
```

**Alt Linux:**
```bash
sudo apt-get install build-essential python3 make gcc gcc-c++ libx11-dev libXext-dev libxkbfile-dev libappindicator3-dev fonts-liberation xdg-utils imagemagick rpm-build rpmdevtools
```

**Windows:**
- Visual Studio Build Tools with C++ support
- Python 3.10+
- Node.js 18+ (includes npm)

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Development Tips
- Use `npm run dev` for hot-reload development
- Run `npm run typecheck` to catch TypeScript errors
- Test packaging before pushing: `npm run make:win` (or your platform)
- Follow existing code style and structure

---

## 📄 License

MIT License — See [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **[VOT (Voice Over Translation)](https://github.com/ilyhalight/voice-over-translation)** by ilyhalight — Real-time YouTube translation
- **[Demergi](https://demergi.com/)** — DPI bypass technology
- **[Ghostery Adblocker](https://www.ghostery.com/)** — Privacy-focused ad blocking
- **[Electron](https://www.electronjs.org/)** — Desktop framework
- **[React](https://react.dev/)**, **[Vite](https://vitejs.dev/)**, **[TypeScript](https://www.typescriptlang.org/)** — Core technologies

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Cheviiot/Orions-Gate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Cheviiot/Orions-Gate/discussions)
- **Security**: Please report security issues privately

---

## 📈 Project Status

| Milestone | Status | Notes |
|-----------|--------|-------|
| Core Electron app | ✅ Complete | All core features stable |
| VOT Integration | ✅ Complete | 8 IPC handlers, full GM-API support |
| Ad Blocking | ✅ Complete | Ghostery integration working |
| DPI Bypass | ✅ Complete | Demergi proxy integrated |
| Windows Builds | ✅ Complete | NSIS installer (106 MB) |
| Linux Builds | ✅ Complete | DEB, RPM, AppImage support |
| Alt Linux Support | ✅ Complete | RPM with X11 & Wayland |
| CI/CD Automation | ✅ Complete | Multi-platform matrix builds |
| macOS Support | ⏳ Planned | Build configuration ready |
| Code Signing | ⏳ Future | For production releases |

---

**Version**: 2.0.0-alpha.0  
**Last Updated**: January 2026  
**Node.js**: >=18  
**Platforms**: Windows, Linux, Alt Linux

---

**Made with ❤️ by Orion's Gate Team**
