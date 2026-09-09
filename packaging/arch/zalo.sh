#!/usr/bin/env bash
# ==============================================================================
#  Zalo for Linux - Arch Linux Launcher Script
# ==============================================================================
# Supports:
#   - Automatic sandbox compatibility detection (unprivileged userns vs SUID sandbox)
#   - Custom flags via ~/.config/zalo-flags.conf or /etc/zalo/flags.conf
#   - Environment variables ZALO_FLAGS and ELECTRON_EXTRA_FLAGS
# ==============================================================================

set -e

XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
APP_DIR="/opt/zalo-for-linux"
BINARY="${APP_DIR}/zalo"
SANDBOX_BINARY="${APP_DIR}/chrome-sandbox"

# 1. Check sandbox compatibility on Arch Linux:
# If unprivileged user namespaces are disabled and chrome-sandbox does not have SUID bit (4755),
# Chromium will crash on launch with a fatal sandbox error.
SANDBOX_FLAGS=""
if [ -f /proc/sys/kernel/unprivileged_userns_clone ]; then
    USERNS_VAL="$(cat /proc/sys/kernel/unprivileged_userns_clone 2>/dev/null || echo 1)"
    if [ "$USERNS_VAL" = "0" ]; then
        # Check if SUID bit is set
        if [ -f "$SANDBOX_BINARY" ] && [ ! -u "$SANDBOX_BINARY" ]; then
            SANDBOX_FLAGS="--no-sandbox --disable-setuid-sandbox"
        fi
    fi
fi

# 2. Collect flags from config files
FLAGS=""
for config in "/etc/zalo/flags.conf" "$XDG_CONFIG_HOME/zalo-flags.conf"; do
    if [ -f "$config" ]; then
        FILE_FLAGS="$(grep -v '^[[:space:]]*#' "$config" | tr '\n' ' ')"
        FLAGS="$FLAGS $FILE_FLAGS"
    fi
done

# 3. Launch with all flags and arguments
exec "$BINARY" $SANDBOX_FLAGS $FLAGS $ZALO_FLAGS $ELECTRON_EXTRA_FLAGS "$@"
