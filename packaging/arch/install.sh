#!/usr/bin/env bash
# ==============================================================================
#  Zalomarchy - Arch Linux Quick Installer
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "   Zalomarchy - Arch Linux Installer"
echo "=========================================="
echo ""

# Verify Arch Linux
if [ ! -f /etc/arch-release ] && ! command -v pacman >/dev/null 2>&1; then
    echo "Error: This installer is intended for Arch Linux and Arch-based distributions (Manjaro, EndeavourOS, etc.)."
    exit 1
fi

# Check for makepkg
if ! command -v makepkg >/dev/null 2>&1; then
    echo "makepkg not found! Installing base-devel..."
    sudo pacman -S --needed base-devel
fi

echo "Building and installing Zalomarchy..."
echo "Source: ${SCRIPT_DIR}/PKGBUILD"
echo ""

cd "${SCRIPT_DIR}"

# Build and install package (-s sync dependencies, -i install package, -c clean up)
makepkg -sic --noconfirm "$@"

echo ""
echo "=========================================="
echo "   Zalomarchy installed successfully!"
echo "=========================================="
echo ""
echo "Launch Zalomarchy from your application menu or run:"
echo "   $ zalomarchy (or zalo)"
echo ""
echo "Optional Features & Settings:"
echo "   - Custom flags: ~/.config/zalomarchy/flags.conf"
echo ""
