#!/bin/bash
# Post-installation script for Orion's Gate RPM package

set -e

echo "Setting up Orion's Gate application..."

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache /usr/share/icons/hicolor || true
fi

# Set proper permissions
if [ -d /opt/orions-gate ]; then
    # Ensure readable dirs/files and executables
    chmod -R u+rwX,go+rX /opt/orions-gate || true
    # Main binary
    if [ -f /opt/orions-gate/Orions-Gate ]; then
        chmod +x /opt/orions-gate/Orions-Gate || true
    fi
    # Chrome sandbox - enable if present (optional)
    if [ -f /opt/orions-gate/chrome-sandbox ]; then
        chmod 4755 /opt/orions-gate/chrome-sandbox || true
    fi
fi

# CLI wrapper
if [ -f /usr/bin/orions-gate ]; then
    chmod +x /usr/bin/orions-gate || true
fi

echo "Installation complete!"
echo "You can now run 'orions-gate' from your terminal or application menu."

exit 0
