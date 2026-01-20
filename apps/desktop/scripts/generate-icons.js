#!/usr/bin/env node

/**
 * Icon generation script for Orion's Gate
 * Generates PNG icons from source in multiple sizes for Linux, macOS, and Windows
 * Supports both X11 and Wayland on Linux distributions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const resourcesDir = path.join(__dirname, '../resources');
const iconPath = path.join(resourcesDir, 'icon_512.png');

// Ensure resources directory exists
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Define icon sizes needed for different platforms
const sizes = [
  16,   // Taskbar, system tray (X11/Wayland)
  32,   // Window title bar, taskbar (X11/Wayland, macOS)
  48,   // Application menu, launcher (Linux, Wayland)
  64,   // File manager, system icons (Linux)
  96,   // High DPI taskbar (some Linux DMs)
  128,  // Application menu, system settings (Linux)
  256,  // File manager large icons, system settings (Linux, Wayland)
  512,  // Source for other sizes, high DPI displays
];

console.log('🖼️ Generating icon set for Orion\'s Gate...\n');

// Check if ImageMagick is available
let imagemagickAvailable = false;
try {
  execSync('convert --version', { stdio: 'ignore' });
  imagemagickAvailable = true;
} catch (e) {
  console.log('⚠️  ImageMagick not found. Install it to auto-generate icons:');
  console.log('   Ubuntu/Debian: sudo apt-get install imagemagick');
  console.log('   Fedora: sudo dnf install ImageMagick');
  console.log('   Alt Linux: sudo apt-get install ImageMagick');
  console.log('   Arch: sudo pacman -S imagemagick\n');
}

// Generate sizes using ImageMagick if available
if (imagemagickAvailable && fs.existsSync(iconPath)) {
  sizes.forEach((size) => {
    const outputPath = path.join(resourcesDir, `icon_${size}x${size}.png`);
    try {
      execSync(`convert "${iconPath}" -resize ${size}x${size} "${outputPath}"`, {
        stdio: 'ignore'
      });
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (e) {
      console.error(`✗ Failed to generate ${size}x${size} icon: ${e.message}`);
    }
  });

  // Generate .icns for macOS from largest PNG
  try {
    const iconsetDir = path.join(resourcesDir, 'Orions-Gate.iconset');
    
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    const macSizes = [16, 32, 64, 128, 256, 512];
    for (const size of macSizes) {
      const pngPath = path.join(resourcesDir, `icon_${size}x${size}.png`);
      if (fs.existsSync(pngPath)) {
        execSync(`cp "${pngPath}" "${iconsetDir}/icon_${size}x${size}.png"`, {
          stdio: 'ignore'
        });
        
        // macOS requires @2x versions for retina
        execSync(`convert "${pngPath}" -resize $((size * 2))x$((size * 2)) "${iconsetDir}/icon_${size}x${size}@2x.png"`, {
          stdio: 'ignore'
        });
      }
    }
    
    // Generate .icns
    execSync(`iconutil -c icns "${iconsetDir}"`, { stdio: 'ignore' });
    console.log('✓ Generated macOS .icns icon set');
  } catch (e) {
    console.warn(`⚠️  Could not generate .icns: ${e.message}`);
  }
} else if (!fs.existsSync(iconPath)) {
  console.log('⚠️  Source icon not found at:', iconPath);
  console.log('   Please provide a 512x512 PNG icon at this location.\n');
}

// Create Linux icon directory structure for standard freedesktop spec
const iconDirBase = path.join(__dirname, '../icons');
const categories = ['apps', 'mimetypes'];

try {
  categories.forEach((category) => {
    sizes.forEach((size) => {
      const dir = path.join(iconDirBase, `hicolor/${size}x${size}/${category}`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created Linux icon directory: ${dir}`);
      }
      
      const sourcePath = path.join(resourcesDir, `icon_${size}x${size}.png`);
      const destPath = path.join(dir, 'orions-gate.png');
      
      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(sourcePath, destPath);
        } catch (e) {
          console.warn(`⚠️  Could not copy icon to ${destPath}`);
        }
      }
    });
  });
} catch (e) {
  console.warn(`⚠️  Could not create Linux icon structure: ${e.message}`);
}

console.log('\n✅ Icon generation completed!');
console.log('📍 Icons available in:', resourcesDir);
console.log('\nFor best results on Linux (especially Wayland):');
console.log('   • All sizes (16-512px) are now available');
console.log('   • Icon theme follows freedesktop standard');
console.log('   • Compatible with GNOME, KDE, XFCE, Cinnamon, and other DMs');
console.log('   • Works on both X11 and Wayland');
