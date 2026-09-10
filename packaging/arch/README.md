# Zalomarchy — Arch Linux Native Package

Native Arch Linux package for **Zalo** (Zalomarchy), built directly from scratch and optimized for Arch Linux, Wayland, Hyprland, and Omarchy.

This package compiles and packages native Linux binaries into `/opt/zalomarchy/` with:
- Full SUID Sandbox setup (`chrome-sandbox` mode `4755`)
- Automatic sandbox fallback detection for custom/hardened kernels
- Native `/usr/bin/zalomarchy` launcher (and `/usr/bin/zalo` symlink) with `~/.config/zalomarchy/flags.conf` support
- Full calling and media dependencies pre-configured out of the box
- In-app update notifications that trigger updates via `pacman` / `yay` / `paru`
- Complete desktop integration (XDG applications, hicolor icons, mime handlers)

---

## Build Requirements

Before building from source, ensure the following are available:

### 1. System packages (via pacman)
```bash
sudo pacman -S --needed base-devel 7zip nodejs npm
```

### 2. Rust Toolchain (`cargo` & `rustc`)
Rust is required to build the native addons from source (`zjxl`, `zimage`, `mp4thumb`, `file-utils`, `file-utilities`).

Install Rust via pacman or the official rustup script:
```bash
sudo pacman -S cargo
```
or:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 3. MinGW GCC (`mingw-w64-gcc`) — Optional
- **Required for**: Audio & video calls (compiles `zcall-bridge/pipebridge.exe` Windows pump).
- **Optional**: If omitted, the app builds cleanly with full text chat, E2EE sync, media, and dark mode, but voice/video calls are disabled.
```bash
sudo pacman -S mingw-w64-gcc
```

---

## Installation & Build Methods

### Method 1: Quick Installer Script

```bash
git clone https://github.com/alaireselene/zalo-omarchy.git
cd zalo-omarchy
./packaging/arch/install.sh
```

Or via npm:

```bash
npm run package:arch
```

---

### Method 2: Build from Source via `makepkg` (Standard Arch workflow)

```bash
cd packaging/arch
makepkg -si
```

This will:
1. Fetch and install package dependencies
2. Extract the official macOS DMG and compile native C++ and Rust modules
3. Compile native Linux binaries using `electron-builder --linux dir`
4. Assemble and install the package with `pacman`

---

### Method 3: Build Arch Package directly with Node (`npm run build:arch`)

If you are developing or want to produce a `.pkg.tar.zst` without invoking `makepkg`:

```bash
# Setup first (downloads DMG, compiles native addons, applies patches):
npm run main:setup

# Build native Arch Linux package:
npm run build:arch
```

Output: `dist/zalomarchy-<version>-1-x86_64.pkg.tar.zst`

Install with:

```bash
sudo pacman -U dist/zalomarchy-*.pkg.tar.zst
```

---

### Method 4: Install via AUR

```bash
yay -S zalomarchy
# or
paru -S zalomarchy
```

---

## In-App Updates via Pacman

When running on Arch Linux, the update window:
1. Detects your Arch Linux installation
2. Compares your local version against the latest GitHub release
3. When an update is available, displays the update command
4. Copies the update command (`yay -S zalomarchy` or `sudo pacman -Syu`) to your clipboard and opens your terminal emulator

---

## Sandbox & Security on Arch Linux

### Chromium Sandbox Configuration

Arch Linux packages require `/opt/zalomarchy/chrome-sandbox` to have permission `4755` (setuid root).
- This package automatically sets mode `4755` on `chrome-sandbox`.
- Additionally, the launcher detects if unprivileged user namespaces are disabled (`kernel.unprivileged_userns_clone = 0`) on hardened kernels, and automatically adds `--no-sandbox` if the SUID binary is unavailable.

---

## Custom Flags

Configure custom flags in `~/.config/zalomarchy/flags.conf` (or `~/.config/zalo-flags.conf`):

```ini
# ~/.config/zalomarchy/flags.conf
# Optional custom Electron flags
```

---

## Call Dependencies (Voice & Video)

All calling and media dependencies are installed automatically as package dependencies:
- `wine`: 32-bit Wine WoW64 call bridge execution
- `gst-plugins-base`, `gst-plugins-good`, `gst-plugins-bad`, `gst-libav`: media codecs and video call pipeline
- `xorg-server-xvfb`, `xdotool`, `python-dbus`: Wayland screen sharing support
- `wl-clipboard`: Wayland clipboard image paste
