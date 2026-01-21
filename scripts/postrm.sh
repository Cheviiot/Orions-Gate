#!/bin/bash
# Post-removal script for Orion's Gate RPM package

set -e

echo "Cleaning up Orion's Gate..."

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache /usr/share/icons/hicolor || true
fi

echo "Uninstall complete!"

exit 0
