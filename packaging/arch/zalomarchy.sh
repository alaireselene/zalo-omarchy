#!/usr/bin/env bash
# ==============================================================================
#  Zalomarchy - Zalo client for Wayland, Hyprland, and Omarchy
# ==============================================================================
set -e

XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
APP_DIR="/opt/zalomarchy"
BINARY="${APP_DIR}/zalomarchy"
if [ ! -f "$BINARY" ] && [ -f "${APP_DIR}/zalo" ]; then
    BINARY="${APP_DIR}/zalo"
fi
SANDBOX_BINARY="${APP_DIR}/chrome-sandbox"

# 1. Sandbox compatibility detection
SANDBOX_FLAGS=""
if [ -f /proc/sys/kernel/unprivileged_userns_clone ]; then
    USERNS_VAL="$(cat /proc/sys/kernel/unprivileged_userns_clone 2>/dev/null || echo 1)"
    if [ "$USERNS_VAL" = "0" ]; then
        if [ -f "$SANDBOX_BINARY" ] && [ ! -u "$SANDBOX_BINARY" ]; then
            SANDBOX_FLAGS="--no-sandbox --disable-setuid-sandbox"
        fi
    fi
fi

# 2. User custom flags overrides (e.g. opt-in Wayland flags)
USER_FLAGS=""
for config in \
    "/etc/zalomarchy/flags.conf" \
    "/etc/zalo/flags.conf" \
    "$XDG_CONFIG_HOME/zalomarchy/flags.conf" \
    "$XDG_CONFIG_HOME/zalomarchy-flags.conf" \
    "$XDG_CONFIG_HOME/zalo-flags.conf"; do
    if [ -f "$config" ]; then
        FILE_FLAGS="$(grep -v '^[[:space:]]*#' "$config" | tr '\n' ' ')"
        USER_FLAGS="$USER_FLAGS $FILE_FLAGS"
    fi
done

# 3. Launch with all flags and arguments (stable XWayland default on Electron 22)
exec "$BINARY" $SANDBOX_FLAGS $USER_FLAGS $ZALOMARCHY_FLAGS $ZALO_FLAGS $ELECTRON_EXTRA_FLAGS "$@"
