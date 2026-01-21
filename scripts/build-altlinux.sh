#!/bin/bash
#!/bin/bash
# Build RPM package for Alt Linux (orions-gate)

set -e

# Use absolute path to fpm
FPM="/usr/lib/ruby/bin/fpm"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Orion's Gate RPM Builder for Alt Linux ===${NC}"

# Check if running on Alt Linux
if [ ! -f /etc/altlinux-release ]; then
    echo -e "${RED}✗ This script is designed for Alt Linux${NC}"
    echo "Proceeding anyway..."
fi

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v npm &> /dev/null || { echo -e "${RED}✗ npm is required${NC}"; exit 1; }
[ -x "$FPM" ] || { echo -e "${RED}✗ fpm is required. Install with: sudo gem install fpm${NC}"; exit 1; }
command -v rpmbuild &> /dev/null || { echo -e "${RED}✗ rpmbuild is required. Install rpm-build package${NC}"; exit 1; }

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Get version from package.json
FULL_VERSION="1.0.0-alpha.1"
PKG_VERSION="1.0.0"
PKG_PRERELEASE="alpha.1"

# Determine release number
if [ -z "$PKG_PRERELEASE" ]; then
    PKG_RELEASE="alt1"
else
    PKG_RELEASE="alt0.$(echo "$PKG_PRERELEASE" | tr -d '.-')"
fi

echo -e "${YELLOW}Building Orion's Gate ${FULL_VERSION}${NC}"
echo "  Version: ${PKG_VERSION}"
echo "  Release: ${PKG_RELEASE}"

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf dist release build

# Install dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
npm install

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

echo -e "${YELLOW}Preparing linux-unpacked and desktop integration...${NC}"

# Build linux 'dir' target to get linux-unpacked
npx electron-builder --linux dir --config electron-builder.yml

# Prepare icons and desktop file
BUILD_DIR="$(pwd)/build"
ICON_SRC="resources/icon_512.png"
mkdir -p "${BUILD_DIR}/icons/hicolor/512x512/apps" \
                 "${BUILD_DIR}/icons/hicolor/256x256/apps" \
                 "${BUILD_DIR}/icons/hicolor/128x128/apps" \
                 "${BUILD_DIR}/icons/hicolor/64x64/apps"

if command -v convert &> /dev/null; then
    convert "${ICON_SRC}" -resize 512x512 "${BUILD_DIR}/icons/hicolor/512x512/apps/orions-gate.png"
    convert "${ICON_SRC}" -resize 256x256 "${BUILD_DIR}/icons/hicolor/256x256/apps/orions-gate.png"
    convert "${ICON_SRC}" -resize 128x128 "${BUILD_DIR}/icons/hicolor/128x128/apps/orions-gate.png"
    convert "${ICON_SRC}" -resize 64x64  "${BUILD_DIR}/icons/hicolor/64x64/apps/orions-gate.png"
else
    # Fallback: use 512px icon for all sizes
    cp "${ICON_SRC}" "${BUILD_DIR}/icons/hicolor/512x512/apps/orions-gate.png"
    cp "${ICON_SRC}" "${BUILD_DIR}/icons/hicolor/256x256/apps/orions-gate.png"
    cp "${ICON_SRC}" "${BUILD_DIR}/icons/hicolor/128x128/apps/orions-gate.png"
    cp "${ICON_SRC}" "${BUILD_DIR}/icons/hicolor/64x64/apps/orions-gate.png"
fi

cat > "${BUILD_DIR}/orions-gate.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=Orion's Gate
Comment=Modern YouTube client with DPI bypass, privacy, and VOT integration
Exec=/usr/bin/orions-gate %U
Icon=orions-gate
Terminal=false
Categories=Utility;Network;
StartupWMClass=Orions-Gate
X-AppStream-Id=io.github.cheviiot.OrionsGate.desktop
EOF

# Create CLI wrapper to place in /usr/bin
echo '#!/bin/sh' > "${BUILD_DIR}/orions-gate.sh"
# Execute the packaged linux executable (lowercase `orions-gate` as produced by electron-builder)
echo 'exec /opt/orions-gate/orions-gate --no-sandbox "$@"' >> "${BUILD_DIR}/orions-gate.sh"
chmod +x "${BUILD_DIR}/orions-gate.sh"

# Create RPM with proper installation paths and all files
echo -e "${YELLOW}Creating RPM package...${NC}"

# Prepare temporary directory for fpm to include everything
TEMP_STAGING=$(mktemp -d)
trap "rm -rf $TEMP_STAGING" EXIT

# Copy application binary and resources to staging directory
mkdir -p "${TEMP_STAGING}/opt/orions-gate"
cp -r "release/linux-unpacked"/* "${TEMP_STAGING}/opt/orions-gate/"

# Create wrapper in bin
mkdir -p "${TEMP_STAGING}/usr/bin"
cp "${BUILD_DIR}/orions-gate.sh" "${TEMP_STAGING}/usr/bin/orions-gate"

# Copy icons
mkdir -p "${TEMP_STAGING}/usr/share/icons/hicolor"
cp -r "${BUILD_DIR}/icons/hicolor/"* "${TEMP_STAGING}/usr/share/icons/hicolor/"

# Copy desktop file
mkdir -p "${TEMP_STAGING}/usr/share/applications"
cp "${BUILD_DIR}/orions-gate.desktop" "${TEMP_STAGING}/usr/share/applications/"

# Build the RPM
$FPM -s dir -t rpm -f \
    -n orions-gate \
    -v "1.0.0-alpha.1" \
    --rpm-os linux \
    --rpm-dist alt \
    --iteration "alt0.alpha1" \
    --epoch 1 \
    --description "Orion's Gate — Modern YouTube client for Linux/Windows with DPI bypass, ad blocking, privacy, and VOT integration." \
    --maintainer "Cheviiot" \
    --vendor "Cheviiot" \
    --url "https://github.com/Cheviiot/Orions-Gate" \
    --license MIT \
    --after-install "$(pwd)/scripts/postinst.sh" \
    --after-remove "$(pwd)/scripts/postrm.sh" \
    -C "${TEMP_STAGING}" \
    -p "$(pwd)/release/orions-gate-1.0.0-alpha.1-alt0.alpha1.x86_64.rpm" \
    .

# Locate resulting RPM file and report
RPM_FILE=$(ls -1 "$(pwd)/release/orions-gate-"*.rpm 2>/dev/null | tail -n 1 || true)
if [ -n "$RPM_FILE" ] && [ -f "$RPM_FILE" ]; then
    echo -e "${GREEN}✓ RPM package created successfully${NC}"
    echo -e "${GREEN}Package: $(basename "$RPM_FILE")${NC}"

    echo -e "\n${YELLOW}Package information:${NC}"
    rpm -qi "$RPM_FILE" || true

    echo -e "\n${YELLOW}Package contents:${NC}"
    rpm -ql "$RPM_FILE" | head -20
    echo "..."
else
    echo -e "${RED}✗ Failed to create RPM package${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Build completed successfully ===${NC}"
echo -e "To install (Alt Linux): ${YELLOW}sudo epm install ./release/$(basename "$RPM_FILE")${NC}"
echo -e "Or via rpm: ${YELLOW}sudo rpm -Uvh ./release/$(basename "$RPM_FILE")${NC}"