# Scripts Directory

Helper scripts for Orion's Gate development and packaging.

## CI/CD Workflows

Automated builds are configured in `.github/workflows/`:

### build.yml
Triggered on: push to main, pull requests, manual workflow_dispatch

**Jobs:**
- **Linux (deb + AppImage)** - Ubuntu latest
- **Windows (NSIS + MSI)** - Windows latest
- **Alt Linux (RPM)** - Alt Linux P11 container

Each job:
1. Installs system dependencies
2. Sets up Node.js 20
3. Generates icons (`npm run generate-icons`)
4. Builds application (`npm run build`)
5. Packages for target platform
6. Uploads artifacts (30-day retention)

### release.yml
Triggered on: git tags matching v*

**Jobs:**
1. **build-all** - Builds Linux & Windows in parallel
2. **build-altlinux** - Builds RPM in Alt Linux container
3. **create-release** - Waits for builds, creates GitHub release with all artifacts

**Retention:** 90 days for release artifacts

## Icon Generation

### `generate-icons.js`
Automatically generates PNG icons in all required sizes (16-512px) for Linux, macOS, and Windows.

**Usage:**
```bash
npm run generate-icons
```

**Features:**
- Detects if ImageMagick is installed
- Generates PNG icons from source image
- Creates macOS ICNS format
- Sets up freedesktop directory structure for Linux
- Provides helpful error messages if dependencies are missing

**Requirements:**
- ImageMagick (convert command)
- Node.js 18+
- Source icon file: `resources/icon_512.png` or higher

### `setup-icons.sh` (Linux/macOS)
Automated setup script that installs dependencies and generates icons.

**Usage:**
```bash
bash scripts/setup-icons.sh
```

**Features:**
- Detects Linux distribution (Ubuntu, Debian, Fedora, Alt Linux, Arch, etc.)
- Auto-installs ImageMagick if needed
- Runs icon generation
- Provides next steps

**Supported Distributions:**
- Ubuntu/Debian
- Fedora/RHEL/CentOS
- Alt Linux (P10, P11, Sisyphus)
- Arch/Manjaro
- macOS (via Homebrew)

### `setup-icons.ps1` (Windows)
Automated setup script for Windows (PowerShell).

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-icons.ps1
```

**Features:**
- Checks for ImageMagick installation
- Provides installation instructions
- Runs icon generation
- Shows next steps

## Project Structure

```
scripts/
├── generate-icons.js    # Main icon generation (cross-platform)
├── setup-icons.sh       # Linux/macOS setup helper
├── setup-icons.ps1      # Windows setup helper
└── README.md           # This file
```

## Icon System Overview

### Icon Sizes Generated
- **16x16** - System tray, taskbar (small)
- **32x32** - Window title bar, taskbar
- **48x48** - Application menu, launchers
- **64x64** - File manager icons
- **96x96** - High DPI taskbar icons
- **128x128** - Application menu (large), settings
- **256x256** - File manager large icons
- **512x512** - High DPI displays, source for other sizes

### Platform-Specific Formats

**Windows:**
- Format: ICO (16-256px embedded)
- Location: `resources/icon.ico`

**macOS:**
- Format: ICNS
- Location: `resources/icon.icns`
- Includes Retina (@2x) variants

**Linux (X11 and Wayland):**
- Format: PNG (individual files)
- Location: `resources/icon_*x*.png`
- Also: `icons/hicolor/*/apps/orions-gate.png` (freedesktop standard)

## Troubleshooting

### ImageMagick not found
**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# Fedora
sudo dnf install ImageMagick

# Alt Linux
sudo apt-get install ImageMagick

# Arch
sudo pacman -S imagemagick
```

**macOS:**
```bash
brew install imagemagick
```

**Windows:**
Visit: https://imagemagick.org/script/download.php#windows

### Icons not appearing on Alt Linux
1. Ensure all 8 PNG sizes are generated
2. Check `icons/hicolor/` directory structure
3. Verify `.desktop` file has correct `Icon=` field
4. Rebuild icon cache (if available):
   ```bash
   xdg-icon-resource forceupdate --theme hicolor
   ```

### Build fails during packaging
- Run `npm run generate-icons` again
- Check that all PNG files exist in `resources/`
- Verify permissions: `chmod 644 resources/icon_*.png`

## Development Tips

1. **Always regenerate icons** after updating the source image:
   ```bash
   npm run generate-icons
   ```

2. **Test icon display** before releasing:
   ```bash
   npm run dev
   # Check if icon appears in taskbar, app menu, etc.
   ```

3. **Verify all platforms** work correctly:
   ```bash
   npm run make:deb    # Linux Debian
   npm run make:rpm    # Linux RPM
   npm run make:win    # Windows
   ```

4. **Check freedesktop compliance**:
   - Icon file format: PNG (preferred on Linux)
   - Directory structure: `hicolor/SIZE/apps/NAME.png`
   - Naming: Lowercase, no spaces, no special characters

## References

- [Freedesktop Icon Theme Spec](https://specifications.freedesktop.org/icon-theme-spec/latest/)
- [XDG Desktop Entry Spec](https://specifications.freedesktop.org/desktop-entry-spec/latest/)
- [Electron Builder Documentation](https://www.electron.build/)
- [ImageMagick Documentation](https://imagemagick.org/Usage/basics/)
- [Alt Linux Wiki](https://wiki.altlinux.org/)
