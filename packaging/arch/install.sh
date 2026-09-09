#!/usr/bin/env bash
# ==============================================================================
#  Zalo for Linux - Arch Linux Quick Installer
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "   Zalo for Linux - Arch Linux Installer"
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

# Ask about Wine for voice/video calling
if ! command -v wine >/dev/null 2>&1; then
    echo ""
    echo "Voice & Video calls require Wine and GStreamer plugins."
    echo "(Note: If you skip this, text messaging and E2EE chat work out of the box)."
    echo ""
    read -rp "Do you want to install Wine & GStreamer via pacman now? [y/N] " install_wine
    if [[ "$install_wine" =~ ^[Yy]$ ]]; then
        sudo pacman -S --needed wine wine-mono gst-plugins-base gst-plugins-good gst-plugins-bad gst-libav
    fi
    echo ""
fi

echo "Building and installing Zalo for Linux..."
echo "Source: ${SCRIPT_DIR}/PKGBUILD"
echo ""

cd "${SCRIPT_DIR}"

# Build and install package (-s sync dependencies, -i install package, -c clean up)
makepkg -sic --noconfirm "$@"

echo ""
echo "=========================================="
echo "   Zalo for Linux installed successfully!"
echo "=========================================="
echo ""
echo "Launch Zalo from your application menu or run:"
echo "   $ zalo"
echo ""
echo "Optional Features & Settings:"
echo "   - Wayland / Custom flags: ~/.config/zalo-flags.conf"
echo "     Example for native Wayland: echo '--ozone-platform-hint=auto' >> ~/.config/zalo-flags.conf"
echo "   - Clipboard image paste: sudo pacman -S wl-clipboard (Wayland) or xclip (X11)"
echo "   - Wayland screen share bridge: sudo pacman -S xorg-server-xvfb xdotool python-dbus gst-plugins-base gst-plugins-bad"
echo ""
