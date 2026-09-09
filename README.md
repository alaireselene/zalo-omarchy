# Zalo for Linux

[![Build Status](https://github.com/doandat943/zalo-for-linux/actions/workflows/build.yml/badge.svg)](https://github.com/doandat943/zalo-for-linux/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a name="english"></a>
## English

An unofficial client for the Zalo desktop messaging application on Linux, built by adapting the official client into native Linux packages (Arch Linux `.pkg.tar.zst`) and portable AppImages with integrated ZaDark.

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
| Native screenshot integration | Working | Triggers Flameshot, Spectacle, Gnome-Screenshot, etc. |
| Native file manager integration | Working | Opens files and folders in default Linux file manager. |
| Auto-launch on boot | Working | Standard XDG autostart entry. |
| SUID Sandbox (Chromium) | Working | `chrome-sandbox` configured with mode 4755; auto-fallback if userns disabled. |
| In-app updates | Working | AppImage auto-updates in place; Arch package updates via `pacman`/AUR. |
| Dynamic system theme follow | Not Working | Zalo and ZaDark do not track `prefers-color-scheme`; manual toggle only. |
| Pure native Linux call engine | Limitation | VNG does not provide a Linux `ZaloCall` binary; Wine runtime is required. |

### Installation

#### Arch Linux (Native Package)

This repository provides native Arch Linux packaging built directly from source (no AppImage extraction, no FUSE dependency at runtime).

##### 1. Build and install from source (`makepkg`)

```bash
git clone https://github.com/doandat943/zalo-for-linux.git
cd zalo-for-linux/packaging/arch
makepkg -si
```

Or run the bundled installer:

```bash
./packaging/arch/install.sh
```

##### 2. Build `.pkg.tar.zst` with Node

```bash
npm run main:setup
npm run build:arch
sudo pacman -U dist/zalo-for-linux-*.pkg.tar.zst
```

##### 3. AUR

```bash
yay -S zalo-for-linux
# or
paru -S zalo-for-linux
```

#### In-App Updates on Arch Linux

When installed via pacman, the built-in update dialog detects Arch Linux and provides a 1-click update command (`yay -S zalo-for-linux` or `sudo pacman -Syu`) and terminal launcher instead of attempting an AppImage file replacement.

#### AppImage

Pre-built AppImages are available under [Releases](https://github.com/doandat943/zalo-for-linux/releases):

- **Standard (`Zalo-...-ZaDark.AppImage`)**: Prompts to download portable Wine (~96MB) on first launch if calling dependencies are missing.
- **Full (`Zalo-...-Full.AppImage`)**: Pre-bundles portable Wine runtime (~430MB); calling works immediately with zero extra downloads.

Use [Gear Lever](https://github.com/mijorus/gearlever) for desktop integration:

```bash
flatpak run it.mijorus.gearlever --integrate Zalo-*.AppImage
```

### Call Dependencies (Arch Linux)

For audio and video calls via `zcall-bridge`:

```bash
# Audio calls (speaker + microphone):
sudo pacman -S --needed wine lib32-glibc lib32-libx11 lib32-libxext \
  lib32-freetype2 lib32-mesa lib32-libpulse lib32-alsa-lib lib32-zlib

# Video calls & webcam:
sudo pacman -S --needed lib32-gstreamer lib32-gst-plugins-base \
  lib32-gst-plugins-good lib32-libv4l v4l-utils

# Recommended H.264 video decoding:
sudo pacman -S --needed lib32-gst-libav

# Wayland screen-sharing bridge:
sudo pacman -S --needed xorg-server-xvfb xdotool python-dbus \
  gst-plugins-base gst-plugins-bad
```

### Configuration & Flags

Custom Electron flags can be configured in `~/.config/zalo-flags.conf` (or `/etc/zalo/flags.conf`):

```ini
# ~/.config/zalo-flags.conf
--ozone-platform-hint=auto
--enable-features=WaylandWindowDecorations
--enable-wayland-ime
```

The launcher script automatically passes `--no-sandbox` if unprivileged user namespaces are disabled (`kernel.unprivileged_userns_clone = 0`) and the SUID sandbox is not configured, preventing crash-on-launch.

### Building from Source (Generic Linux)

Prerequisites:
- Linux x86_64
- Node.js >= 18 and npm
- 7zip (`7z` from `7zip` package)
- Rust toolchain (`cargo`, `rustc`): can be installed via the official script (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`) or `sudo pacman -S cargo`
- C/C++ compiler (`gcc`, `g++`, `base-devel`)
- MinGW GCC (`i686-w64-mingw32-gcc`): **optional**, only needed if compiling the Wine voice/video call bridge (`pipebridge.exe`)
```bash
# Clone repository and submodules
git clone https://github.com/doandat943/zalo-for-linux.git
cd zalo-for-linux
git submodule update --init --recursive

# Install dependencies and build
npm ci
npm run main
```

Built packages are written to `dist/`.

---

<a name="tiếng-việt"></a>
## Tiếng Việt

Bản dựng không chính thức của ứng dụng Zalo trên hệ điều hành Linux, được đóng gói thành gói cài đặt gốc cho Arch Linux (`.pkg.tar.zst`) và bản portable AppImage tích hợp sẵn giao diện tối ZaDark.

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
| Công cụ chụp màn hình | Hoạt động | Gọi các công cụ Linux native: Flameshot, Spectacle, Gnome-Screenshot... |
| Tích hợp trình quản lý tệp | Hoạt động | Mở tệp và thư mục đã tải trong trình quản lý tệp mặc định của hệ thống. |
| Tự khởi động cùng hệ thống | Hoạt động | Đăng ký mục XDG autostart chuẩn. |
| SUID Sandbox (Chromium) | Hoạt động | `chrome-sandbox` phân quyền mode 4755; tự fallback nếu userns bị tắt. |
| Cập nhật trong ứng dụng | Hoạt động | AppImage cập nhật tự động; bản Arch cập nhật qua `pacman`/AUR. |
| Tự động đổi giao diện theo hệ thống | Chưa hỗ trợ | Zalo và ZaDark chưa hỗ trợ `prefers-color-scheme`; cần chỉnh thủ công. |
| Engine gọi thuần native Linux | Giới hạn | VNG chỉ phát hành `ZaloCall` cho Windows/macOS; bắt buộc dùng Wine. |

### Cài đặt

#### Arch Linux (Gói Native)

Dự án hỗ trợ đóng gói native cho Arch Linux từ mã nguồn (không chạy qua AppImage, không phụ thuộc FUSE khi chạy).

##### 1. Build và cài đặt từ mã nguồn (`makepkg`)

```bash
git clone https://github.com/doandat943/zalo-for-linux.git
cd zalo-for-linux/packaging/arch
makepkg -si
```

Hoặc dùng script cài nhanh:

```bash
./packaging/arch/install.sh
```

##### 2. Build gói `.pkg.tar.zst` bằng Node

```bash
npm run main:setup
npm run build:arch
sudo pacman -U dist/zalo-for-linux-*.pkg.tar.zst
```

##### 3. Cài qua AUR

```bash
yay -S zalo-for-linux
# hoặc
paru -S zalo-for-linux
```

#### Cập nhật ứng dụng trên Arch Linux

Khi chạy bản cài qua pacman, cửa sổ kiểm tra cập nhật tích hợp sẽ nhận diện hệ thống Arch Linux và cung cấp lệnh cập nhật (`yay -S zalo-for-linux` hoặc `sudo pacman -Syu`) kèm chức năng sao chép và mở terminal tự động, không ghi đè file AppImage vào hệ thống.

#### AppImage

Tải bản phát hành sẵn tại mục [Releases](https://github.com/doandat943/zalo-for-linux/releases):

- **Bản tiêu chuẩn (`Zalo-...-ZaDark.AppImage`)**: Dung lượng ~260MB. Lần đầu gọi điện sẽ hiện hộp thoại tải portable Wine (~96MB).
- **Bản Full (`Zalo-...-Full.AppImage`)**: Dung lượng ~430MB. Đi kèm sẵn portable Wine bên trong, gọi điện được ngay không cần tải thêm.

Khuyến nghị tích hợp vào hệ thống bằng [Gear Lever](https://github.com/mijorus/gearlever):

```bash
flatpak run it.mijorus.gearlever --integrate Zalo-*.AppImage
```

### Thư viện hỗ trợ cuộc gọi (Arch Linux)

Cần thiết để tính năng gọi thoại và video qua `zcall-bridge` hoạt động ổn định:

```bash
# Gọi thoại (loa + mic):
sudo pacman -S --needed wine lib32-glibc lib32-libx11 lib32-libxext \
  lib32-freetype2 lib32-mesa lib32-libpulse lib32-alsa-lib lib32-zlib

# Video call & camera:
sudo pacman -S --needed lib32-gstreamer lib32-gst-plugins-base \
  lib32-gst-plugins-good lib32-libv4l v4l-utils

# Giải mã video H.264:
sudo pacman -S --needed lib32-gst-libav

# Chia sẻ màn hình trên Wayland:
sudo pacman -S --needed xorg-server-xvfb xdotool python-dbus \
  gst-plugins-base gst-plugins-bad
```

### Cấu hình cờ khởi chạy

Có thể đặt các cờ Electron trong `~/.config/zalo-flags.conf` (hoặc `/etc/zalo/flags.conf`):

```ini
# ~/.config/zalo-flags.conf
--ozone-platform-hint=auto
--enable-features=WaylandWindowDecorations
--enable-wayland-ime
```

Script khởi chạy tự động thêm `--no-sandbox` khi phát hiện kernel tắt user namespace (`kernel.unprivileged_userns_clone = 0`) và binary SUID sandbox không có quyền, tránh lỗi crash khi mở app.

### Build từ mã nguồn (Linux chung)

Yêu cầu:
- Linux x86_64
- Node.js >= 18 và npm
- 7zip (`7z` từ gói `7zip`)
- Rust toolchain (`cargo`, `rustc`): cài qua script chính thức (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`) hoặc qua pacman (`sudo pacman -S cargo`)
- Trình biên dịch C/C++ (`gcc`, `g++`, `base-devel`)
- MinGW GCC (`i686-w64-mingw32-gcc`): **tùy chọn**, chỉ cần khi muốn biên dịch cầu nối gọi điện Wine (`pipebridge.exe`)
```bash
git clone https://github.com/doandat943/zalo-for-linux.git
cd zalo-for-linux
git submodule update --init --recursive

npm ci
npm run main
```

File sau khi build nằm trong thư mục `dist/`.

---

## License & Acknowledgments

- Licensed under the [MIT License](LICENSE).
- Zalo is a trademark of VNG Corporation. This project is an independent community effort and is not affiliated with VNG Corporation.
- Thanks to [realdtn2/zalo-linux-2026](https://github.com/realdtn2/zalo-linux-2026) for the initial packaging approach and native addon solutions.
- ZaDark is developed by [Quaric](https://zadark.com) under MPL-2.0.
