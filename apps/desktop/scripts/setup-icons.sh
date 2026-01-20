#!/bin/bash

# Setup script for Orion's Gate icon generation
# Detects OS and installs necessary dependencies

set -e

echo "🎨 Orion's Gate Icon Setup Script"
echo "=================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
if [ ! -z "$DISTRO" ]; then
    echo "Detected Distribution: $DISTRO"
fi
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install ImageMagick
install_imagemagick() {
    echo "📦 Installing ImageMagick for icon generation..."
    
    if [ "$OS" = "linux" ]; then
        case "$DISTRO" in
            ubuntu|debian)
                echo "   Running: sudo apt-get install -y imagemagick"
                sudo apt-get update
                sudo apt-get install -y imagemagick
                ;;
            fedora|rhel|centos)
                echo "   Running: sudo dnf install -y ImageMagick"
                sudo dnf install -y ImageMagick
                ;;
            altlinux|sisyphus|p10)
                echo "   Running: sudo apt-get install -y ImageMagick"
                sudo apt-get update
                sudo apt-get install -y ImageMagick
                ;;
            arch|manjaro)
                echo "   Running: sudo pacman -S --noconfirm imagemagick"
                sudo pacman -S --noconfirm imagemagick
                ;;
            *)
                echo "   ⚠️  Unknown distribution. Please install ImageMagick manually:"
                echo "   https://imagemagick.org/Usage/basics/#install"
                return 1
                ;;
        esac
    elif [ "$OS" = "macos" ]; then
        echo "   Running: brew install imagemagick"
        if ! command_exists brew; then
            echo "   ⚠️  Homebrew not found. Please install it first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            return 1
        fi
        brew install imagemagick
    else
        echo "   ⚠️  Unsupported OS for automatic installation"
        return 1
    fi
    
    echo "✅ ImageMagick installed"
}

# Check if ImageMagick is installed
if ! command_exists convert; then
    echo "⚠️  ImageMagick (convert) not found"
    read -p "Would you like to install it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! install_imagemagick; then
            echo ""
            echo "❌ Installation failed. Please install ImageMagick manually:"
            if [ "$DISTRO" = "altlinux" ] || [ "$DISTRO" = "sisyphus" ] || [ "$DISTRO" = "p10" ]; then
                echo "   Alt Linux: sudo apt-get install ImageMagick"
            fi
            exit 1
        fi
    else
        echo ""
        echo "⚠️  ImageMagick is required for icon generation"
        exit 1
    fi
else
    echo "✅ ImageMagick is installed"
fi

echo ""

# Generate icons
echo "🖼️  Generating icons..."
npm run generate-icons

echo ""
echo "✅ Icon setup completed successfully!"
echo ""
echo "Next steps:"
echo "   1. Build for your platform:"
echo "      • Linux: npm run make:deb (or make:rpm, make:appimage)"
echo "      • Windows: npm run make:win"
echo "      • macOS: npm run make:osx (requires macOS)"
echo ""
echo "   2. Test the application:"
echo "      npm run dev"
echo ""
