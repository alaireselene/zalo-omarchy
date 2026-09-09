# Zalo for Linux — Arch Linux Native Package

Native Arch Linux package for **Zalo for Linux**, built directly from scratch and optimized for Arch Linux.

This package compiles and packages native Linux binaries into `/opt/zalo-for-linux/` with:
- Full SUID Sandbox setup (`chrome-sandbox` mode `4755`)
- Automatic sandbox fallback detection for custom/hardened kernels
- Native `/usr/bin/zalo` launcher with `~/.config/zalo-flags.conf` support (Wayland, IME, GPU flags)
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
Rust is required to build the 5 native addons from source (`zjxl`, `zimage`, `mp4thumb`, `file-utils`, `file-utilities`).

You can install Rust using **either** method:
- **Official script (Recommended)**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source "$HOME/.cargo/env"
  ```
- **Or via pacman**:
  ```bash
  sudo pacman -S cargo
  ```
The build scripts and `PKGBUILD` automatically check both `$PATH` and `~/.cargo/bin`.

### 3. MinGW GCC (`mingw-w64-gcc`) — Optional
- **Required for**: Audio & video calls (compiles `zcall-bridge/pipebridge.exe` Windows pump).
- **Optional**: If omitted, the app builds cleanly with full text chat, E2EE sync, media, and dark mode, but voice/video calls are disabled.
```bash
sudo pacman -S mingw-w64-gcc
```

---

## Installation & Build Methods

### Method 1: Build from Source via `makepkg` (Standard Arch workflow)

```bash
cd packaging/arch
makepkg -si
```

This will:
1. Fetch build dependencies
2. Check for `cargo` in PATH / `~/.cargo/bin`
3. Extract the official macOS DMG and compile native C++ and Rust modules
4. Compile native Linux binaries using `electron-builder --linux dir`
5. Assemble and install the package with `pacman`

---

### Method 2: Quick Installer Script

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

### Method 3: Build Arch Package directly with Node (`npm run build:arch`)

If you are developing or want to produce a `.pkg.tar.zst` without invoking `makepkg`:

```bash
# Setup first (downloads DMG, compiles native addons, applies patches):
npm run main:setup

# Build native Arch Linux package:
npm run build:arch
```

Output: `dist/zalo-for-linux-<version>-1-x86_64.pkg.tar.zst`

Install with:

```bash
sudo pacman -U dist/zalo-for-linux-*.pkg.tar.zst
```

---

### Method 4: Install via AUR

```bash
yay -S zalo-for-linux
# or
paru -S zalo-for-linux
```

---

## In-App Updates via Pacman

When running on Arch Linux, the built-in Zalux version window (`Ctrl+Shift+I` or sidebar icon):
1. Detects your Arch Linux installation
2. Compares your local version against the latest GitHub release
3. When an update is available, displays **"Cập nhật (yay/pacman)"** and provides the command
4. Copies the update command (`yay -S zalo-for-linux` or `sudo pacman -Syu`) to your clipboard and opens your terminal emulator

---

## Sandbox & Security on Arch Linux

### Chromium Sandbox Configuration

Arch Linux packages require `/opt/zalo-for-linux/chrome-sandbox` to have permission `4755` (setuid root).
- This package automatically sets mode `4755` on `chrome-sandbox`.
- Additionally, `/usr/bin/zalo` detects if unprivileged user namespaces are disabled (`kernel.unprivileged_userns_clone = 0`) on hardened kernels, and automatically adds `--no-sandbox` if the SUID binary is unavailable.

---

## Custom Flags & Native Wayland

Configure custom flags in `~/.config/zalo-flags.conf` (or `/etc/zalo/flags.conf`):

```ini
# ~/.config/zalo-flags.conf
--ozone-platform-hint=auto
--enable-features=WaylandWindowDecorations
--enable-wayland-ime
```

---

## Calling & Audio/Video Dependencies (Arch Linux)

```bash
# Audio calls (speaker + mic):
sudo pacman -S --needed wine lib32-glibc lib32-libx11 lib32-libxext \
  lib32-freetype2 lib32-mesa lib32-libpulse lib32-alsa-lib lib32-zlib

# Video calls & webcam:
sudo pacman -S --needed lib32-gstreamer lib32-gst-plugins-base \
  lib32-gst-plugins-good lib32-libv4l v4l-utils

# Recommended H.264 video decoding:
sudo pacman -S --needed lib32-gst-libav

# Wayland Screen Sharing bridge:
sudo pacman -S --needed xorg-server-xvfb xdotool python-dbus \
  gst-plugins-base gst-plugins-bad
```
