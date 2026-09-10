# Zalomarchy — Zalo client for Linux (Arch Linux Native Package)

[![Build Status](https://github.com/alaireselene/zalo-omarchy/actions/workflows/build.yml/badge.svg)](https://github.com/alaireselene/zalo-omarchy/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a name="english"></a>
## English

An unofficial native Arch Linux package (`.pkg.tar.zst`) for the **Zalo** desktop messaging client (branded **Zalomarchy**), built from source with integrated ZaDark dark mode, calling bridge, and Linux optimizations for Wayland, Hyprland, and Omarchy.

### Feature Status

| Feature | Status | Notes |
|---|---|---|
| Text messaging & E2EE chat sync | Working | Native C++ `db-cross-v4` module handles backup and key decryption. |
| Media, files & link history | Working | Fully functional via native database driver. |
| Message reactions | Working | Fully functional. |
| Audio & video calling | Working | Uses `zcall-bridge` via Wine named-pipe proxy (`ZaloCall.exe`). |
| Screen sharing (X11) | Working | Native X11 capture. |
| Screen sharing (Wayland) | Working | Via `screenbridge` (XDG desktop portal + Xvfb + `streamproxy.so`). |
| Clipboard image paste (`Ctrl+V`) | Working | Wayland (`wl-clipboard`), X11 (`xclip`), or Electron fallback. |
| Native window frame & title bar | Working | Standard minimize, maximize, and close buttons. |
| System tray & unread badge | Working | Tray menu, unread counter badge on launcher dock. |
| Dark mode (ZaDark) | Working | Integrated dark theme, custom fonts, blur, privacy mode. |
| Userscripts manager | Working | Tampermonkey-compatible userscript support in Settings. |
| Screenshot integration | Working | Triggers Omarchy native screenshot (`omarchy screenshot`). |
| Native file manager integration | Working | Opens files and folders in default Linux file manager. |
| Auto-launch on boot | Working | Standard XDG autostart entry. |
| SUID Sandbox (Chromium) | Working | `chrome-sandbox` configured with mode 4755; auto-fallback if userns disabled. |
| In-app updates | Working | Notifies when updates are available and launches `pacman` / `yay` / `paru`. |
| Dynamic system theme follow | Not Working | Zalo and ZaDark do not track `prefers-color-scheme`; manual toggle only. |
| Pure native Linux call engine | Limitation | VNG does not provide a Linux `ZaloCall` binary; Wine runtime is required. |

### Installation

#### Method 1: Install from GitHub Releases (Recommended)

##### Direct install via pacman:
```bash
sudo pacman -U https://github.com/alaireselene/zalo-omarchy/releases/latest/download/zalomarchy-26.8.20-1-x86_64.pkg.tar.zst
```

##### Or download latest release and install:
```bash
LATEST_URL=$(curl -s https://api.github.com/repos/alaireselene/zalo-omarchy/releases/latest | grep "browser_download_url.*pkg.tar.zst" | cut -d '"' -f 4)
curl -L -o /tmp/zalomarchy.pkg.tar.zst "$LATEST_URL"
sudo pacman -U /tmp/zalomarchy.pkg.tar.zst
```

---

#### Method 2: Build from Source via `makepkg`

```bash
git clone https://github.com/alaireselene/zalo-omarchy.git
cd zalo-omarchy/packaging/arch
makepkg -si
```

Or run the bundled installer:

```bash
./packaging/arch/install.sh
```

---

#### Method 3: Build `.pkg.tar.zst` with Node

```bash
# Setup dependencies and extract app
npm ci
npm run main:setup

# Build native package
npm run build:arch

# Install generated package
sudo pacman -U dist/zalomarchy-*.pkg.tar.zst
```

---

### In-App Updates via Pacman

When installed via pacman, the built-in update dialog detects Arch Linux and provides an update command (`yay -S zalomarchy` or `sudo pacman -Syu`) and terminal launcher.

---

### Call Dependencies (Voice & Video)

Dependencies are automatically included in the package:
`wine`, `gst-plugins-base`, `gst-plugins-good`, `gst-plugins-bad`, `gst-libav`, `xorg-server-xvfb`, `xdotool`, `python-dbus`, `wl-clipboard`.

---

### Configuration & Custom Flags

Custom Electron flags can be configured in `~/.config/zalomarchy/flags.conf` (or `~/.config/zalo-flags.conf`):

```ini
# ~/.config/zalomarchy/flags.conf
# Optional custom flags
```

The launcher script automatically passes `--no-sandbox` if unprivileged user namespaces are disabled (`kernel.unprivileged_userns_clone = 0`) and the SUID sandbox is not configured, preventing crash-on-launch.

---

### Building from Source (Prerequisites)

- Linux x86_64
- Node.js >= 18 and npm
- 7zip (`sudo pacman -S 7zip`)
- Base development tools (`sudo pacman -S base-devel`)
- Rust toolchain (`cargo`, `rustc`): install via official script (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`) or `sudo pacman -S cargo`
- MinGW GCC (`i686-w64-mingw32-gcc`): **optional**, only needed if compiling the Wine voice/video call bridge (`pipebridge.exe`)

```bash
git clone https://github.com/alaireselene/zalo-omarchy.git
cd zalo-omarchy
git submodule update --init --recursive

npm ci
npm run main:setup
npm run build:arch
```

Built package is written to `dist/zalomarchy-<version>-1-x86_64.pkg.tar.zst`.

---

<a name="tiếng-việt"></a>
## Tiếng Việt

Gói cài đặt gốc cho Arch Linux (`.pkg.tar.zst`) của ứng dụng **Zalo** (thương hiệu **Zalomarchy**), được build trực tiếp từ mã nguồn với giao diện tối ZaDark và các tinh chỉnh tối ưu cho hệ điều hành Linux (Wayland, Hyprland, Omarchy).

### Bảng trạng thái tính năng

| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Nhắn tin văn bản & đồng bộ E2EE | Hoạt động | Module C++ `db-cross-v4` giải mã dữ liệu mã hóa đầu cuối. |
| Xem ảnh, video, file, link đã gửi | Hoạt động | Đầy đủ dữ liệu nhờ driver cơ sở dữ liệu native. |
| Thả cảm xúc tin nhắn | Hoạt động | Đầy đủ. |
| Gọi thoại & gọi video | Hoạt động | Dùng `zcall-bridge` qua Wine socket translation (`ZaloCall.exe`). |
| Chia sẻ màn hình (X11) | Hoạt động | Chụp màn hình native qua X11. |
| Chia sẻ màn hình (Wayland) | Hoạt động | Qua `screenbridge` (XDG portal + Xvfb + `streamproxy.so`). |
| Dán ảnh từ clipboard (`Ctrl+V`) | Hoạt động | Hỗ trợ Wayland (`wl-clipboard`), X11 (`xclip`), hoặc Electron fallback. |
| Khung cửa sổ & thanh tiêu đề | Hoạt động | Đầy đủ nút thu nhỏ, phóng to, đóng cửa sổ. |
| Khay hệ thống & badge tin nhắn | Hoạt động | Menu khay hệ thống, đếm số tin chưa đọc trên thanh tác vụ. |
| Giao diện tối (ZaDark) | Hoạt động | Dark mode tối ưu, tùy biến font chữ, làm mờ chống nhìn trộm. |
| Trình quản lý Userscripts | Hoạt động | Hỗ trợ userscript chuẩn Tampermonkey trong phần Cài đặt. |
| Công cụ chụp màn hình | Hoạt động | Gọi trực tiếp công cụ chụp màn hình native của Omarchy (`omarchy screenshot`). |
| Tích hợp trình quản lý tệp | Hoạt động | Mở tệp và thư mục đã tải trong trình quản lý tệp mặc định của hệ thống. |
| Tự khởi động cùng hệ thống | Hoạt động | Đăng ký mục XDG autostart chuẩn. |
| SUID Sandbox (Chromium) | Hoạt động | `chrome-sandbox` phân quyền mode 4755; tự fallback nếu userns bị tắt. |
| Cập nhật trong ứng dụng | Hoạt động | Thông báo khi có bản mới và hỗ trợ cập nhật qua `pacman` / `yay` / `paru`. |
| Tự động đổi giao diện theo hệ thống | Chưa hỗ trợ | Zalo và ZaDark chưa hỗ trợ `prefers-color-scheme`; cần chỉnh thủ công. |
| Engine gọi thuần native Linux | Giới hạn | VNG chỉ phát hành `ZaloCall` cho Windows/macOS; bắt buộc dùng Wine. |

### Cài đặt

#### Cách 1: Cài đặt từ GitHub Releases (Khuyến nghị)

##### Cài trực tiếp qua pacman:
```bash
sudo pacman -U https://github.com/alaireselene/zalo-omarchy/releases/latest/download/zalomarchy-26.8.20-1-x86_64.pkg.tar.zst
```

##### Hoặc tải về máy và cài đặt:
```bash
LATEST_URL=$(curl -s https://api.github.com/repos/alaireselene/zalo-omarchy/releases/latest | grep "browser_download_url.*pkg.tar.zst" | cut -d '"' -f 4)
curl -L -o /tmp/zalomarchy.pkg.tar.zst "$LATEST_URL"
sudo pacman -U /tmp/zalomarchy.pkg.tar.zst
```

---

#### Cách 2: Build từ mã nguồn qua `makepkg`

```bash
git clone https://github.com/alaireselene/zalo-omarchy.git
cd zalo-omarchy/packaging/arch
makepkg -si
```

Hoặc dùng script cài nhanh:

```bash
./packaging/arch/install.sh
```

---

#### Cách 3: Build gói `.pkg.tar.zst` bằng Node

```bash
npm ci
npm run main:setup
npm run build:arch
sudo pacman -U dist/zalomarchy-*.pkg.tar.zst
```

---

### Cập nhật ứng dụng trên Arch Linux

Khi chạy bản cài qua pacman, thông báo cập nhật sẽ cung cấp lệnh cập nhật (`yay -S zalomarchy` hoặc `sudo pacman -Syu`).

---

### Thư viện hỗ trợ cuộc gọi (Voice & Video)

Gói Arch đã tích hợp sẵn đầy đủ các dependency bắt buộc:
`wine`, `gst-plugins-base`, `gst-plugins-good`, `gst-plugins-bad`, `gst-libav`, `xorg-server-xvfb`, `xdotool`, `python-dbus`, `wl-clipboard`.

---

### Cấu hình cờ khởi chạy

Có thể đặt các cờ tùy chỉnh trong `~/.config/zalomarchy/flags.conf` (hoặc `~/.config/zalo-flags.conf`):

```ini
# ~/.config/zalomarchy/flags.conf
# Cờ Electron tùy chọn
```

---

### Build từ mã nguồn (Yêu cầu)

- Linux x86_64
- Node.js >= 18 và npm
- 7zip (`sudo pacman -S 7zip`)
- Base development tools (`sudo pacman -S base-devel`)
- Rust toolchain (`cargo`, `rustc`): cài qua script chính thức hoặc `sudo pacman -S cargo`
- MinGW GCC (`i686-w64-mingw32-gcc`): **tùy chọn**, chỉ cần khi muốn biên dịch cầu nối gọi điện Wine (`pipebridge.exe`)

```bash
git clone https://github.com/alaireselene/zalo-omarchy.git
cd zalo-omarchy
git submodule update --init --recursive

npm ci
npm run main:setup
npm run build:arch
```

File gói hoàn chỉnh nằm tại `dist/zalomarchy-<version>-1-x86_64.pkg.tar.zst`.

---

## License & Acknowledgments

- Licensed under the [MIT License](LICENSE).
- Zalo is a trademark of VNG Corporation. This project is an independent community effort and is not affiliated with VNG Corporation.
- Thanks to [realdtn2/zalo-linux-2026](https://github.com/realdtn2/zalo-linux-2026) for the native addon solutions.
- ZaDark is developed by [Quaric](https://zadark.com) under MPL-2.0.
