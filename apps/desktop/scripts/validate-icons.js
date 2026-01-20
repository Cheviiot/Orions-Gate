#!/usr/bin/env node

/**
 * Icon validation script for Orion's Gate
 * Verifies all required icon files are present before building
 */

const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '../resources');
const requiredSizes = [16, 32, 48, 64, 96, 128, 256, 512];
const warnings = [];
const errors = [];

console.log('🔍 Validating icon setup...\n');

// Check resources directory
if (!fs.existsSync(resourcesDir)) {
  errors.push(`Resources directory not found: ${resourcesDir}`);
} else {
  console.log('✅ Resources directory found');
}

// Check Windows icon
const windowsIcon = path.join(resourcesDir, 'icon.ico');
if (fs.existsSync(windowsIcon)) {
  const stats = fs.statSync(windowsIcon);
  console.log(`✅ Windows icon: icon.ico (${Math.round(stats.size / 1024)}KB)`);
} else {
  warnings.push('Windows icon not found: icon.ico (required for Windows builds)');
}

// Check macOS icon
const macosIcon = path.join(resourcesDir, 'icon.icns');
if (fs.existsSync(macosIcon)) {
  const stats = fs.statSync(macosIcon);
  console.log(`✅ macOS icon: icon.icns (${Math.round(stats.size / 1024)}KB)`);
} else {
  warnings.push('macOS icon not found: icon.icns (required for macOS builds)');
}

// Check PNG icons for Linux
console.log('\n📦 PNG Icon Sizes:');
let pngCount = 0;
requiredSizes.forEach((size) => {
  const pngPath = path.join(resourcesDir, `icon_${size}x${size}.png`);
  if (fs.existsSync(pngPath)) {
    const stats = fs.statSync(pngPath);
    console.log(`   ✅ ${size}x${size}: ${Math.round(stats.size / 1024)}KB`);
    pngCount++;
  } else {
    errors.push(`Missing PNG icon: icon_${size}x${size}.png`);
  }
});

if (pngCount > 0) {
  console.log(`\n   Found ${pngCount}/${requiredSizes.length} PNG sizes`);
  if (pngCount < requiredSizes.length) {
    warnings.push(`Only ${pngCount}/${requiredSizes.length} PNG sizes found (all 8 recommended for best compatibility)`);
  }
}

// Check freedesktop structure
console.log('\n🎨 Freedesktop Structure:');
const iconsDir = path.join(__dirname, '../icons/hicolor');
if (fs.existsSync(iconsDir)) {
  const dirs = fs.readdirSync(iconsDir);
  console.log(`   ✅ Found ${dirs.length} size directories in hicolor theme`);
} else {
  console.log('   ℹ️  Freedesktop directory structure not yet created (will be generated)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  errors.forEach((err) => console.log(`   • ${err}`));
  console.log('\n⚠️  Icon generation is required before building!');
  console.log('   Run: npm run generate-icons\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach((warn) => console.log(`   • ${warn}`));
  console.log('\n   Consider running: npm run generate-icons\n');
  process.exit(0);
} else {
  console.log('\n✅ All icons are properly configured!\n');
  process.exit(0);
}
