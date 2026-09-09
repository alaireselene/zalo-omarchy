/**
 * scripts/build-arch.js
 *
 * Builds a native Arch Linux package (.pkg.tar.zst) from scratch.
 * - Compiles via `electron-builder --linux dir` (raw native ELF binaries, no AppImage/FUSE)
 * - Configures SUID chrome-sandbox (chmod 4755) for Chromium sandboxing on Linux
 * - Packages with desktop entry, launcher wrapper, and icons into a pacman-compatible .pkg.tar.zst
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

const BASE_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(BASE_DIR, 'app');
const DIST_DIR = path.join(BASE_DIR, 'dist');
const UNPACKED_DIR = path.join(DIST_DIR, 'linux-unpacked');
const TEMP_PKG_DIR = path.join(BASE_DIR, 'temp', 'arch-pkg');

async function main() {
  try {
    logger.step('ARCH LINUX NATIVE BUILD');

    // 1. Verify build environment & tools
    const tools = ['bsdtar', 'zstd'];
    for (const tool of tools) {
      try {
        execSync(`command -v ${tool}`, { stdio: 'ignore' });
      } catch (_) {
        throw new Error(`Required tool '${tool}' is missing. Install with: sudo pacman -S ${tool}`);
      }
    }

    // 2. Check if app is prepared, run setup if requested
    const packageJsonBakPath = path.join(APP_DIR, 'package.json.bak');
    if (!fs.existsSync(packageJsonBakPath)) {
      if (process.env.SETUP === 'true') {
        logger.info('Preparing app directory from DMG...');
        execSync('node scripts/main.js', { stdio: 'inherit', env: { ...process.env, SETUP: 'true', BUILD: 'false' } });
      } else {
        throw new Error('App directory not prepared. Run "npm run main:setup" first, or run with SETUP=true');
      }
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonBakPath, 'utf8'));
    const ZALO_VERSION = packageJson.version;
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: BASE_DIR }).trim();
    logger.info(`Building Arch package for Zalo ${ZALO_VERSION} (commit ${commitHash})...`);

    // 3. Compile unpacked Linux directory
    logger.info('Compiling native Linux binaries via electron-builder (target: dir)...');
    execSync(`npx electron-builder --linux dir -c.extraMetadata.version=${ZALO_VERSION} --publish=never`, {
      cwd: BASE_DIR,
      stdio: 'inherit'
    });

    if (!fs.existsSync(UNPACKED_DIR)) {
      throw new Error(`Compiled directory not found at: ${UNPACKED_DIR}`);
    }

    // 4. Assemble package root
    logger.info('Assembling Arch package file structure...');
    if (fs.existsSync(TEMP_PKG_DIR)) {
      fs.rmSync(TEMP_PKG_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_PKG_DIR, { recursive: true });

    // /opt/zalo-for-linux
    const optDir = path.join(TEMP_PKG_DIR, 'opt', 'zalo-for-linux');
    fs.cpSync(UNPACKED_DIR, optDir, { recursive: true });
    // SUID Sandbox permissions: chmod 4755 for chrome-sandbox
    const chromeSandbox = path.join(optDir, 'chrome-sandbox');
    if (fs.existsSync(chromeSandbox)) {
      try {
        fs.chmodSync(chromeSandbox, 0o4755);
        logger.dim('Set SUID permission (4755) on chrome-sandbox');
      } catch (e) {
        logger.warn('Could not set SUID bit on chrome-sandbox (requires root or fakeroot)');
      }
    }

    const zaloBin = path.join(optDir, 'zalo');
    if (fs.existsSync(zaloBin)) {
      fs.chmodSync(zaloBin, 0o755);
    }

    // /usr/bin/zalo launcher script
    const binDir = path.join(TEMP_PKG_DIR, 'usr', 'bin');
    fs.mkdirSync(binDir, { recursive: true });
    const launcherSrc = path.join(BASE_DIR, 'packaging', 'arch', 'zalo.sh');
    const launcherDest = path.join(binDir, 'zalo');
    fs.copyFileSync(launcherSrc, launcherDest);
    fs.chmodSync(launcherDest, 0o755);

    // /usr/share/applications/zalo.desktop
    const appsDir = path.join(TEMP_PKG_DIR, 'usr', 'share', 'applications');
    fs.mkdirSync(appsDir, { recursive: true });
    fs.copyFileSync(
      path.join(BASE_DIR, 'packaging', 'arch', 'zalo.desktop'),
      path.join(appsDir, 'zalo.desktop')
    );

    // /usr/share/icons/hicolor and pixmaps
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    for (const size of iconSizes) {
      const candidateIcons = [
        path.join(optDir, 'resources', 'app', 'pc-dist', `favicon-${size}x${size}.png`),
        path.join(APP_DIR, 'pc-dist', `favicon-${size}x${size}.png`),
        path.join(BASE_DIR, 'app', 'pc-dist', `favicon-${size}x${size}.png`)
      ];
      const iconSrc = candidateIcons.find(p => fs.existsSync(p));
      if (iconSrc) {
        const destDir = path.join(TEMP_PKG_DIR, 'usr', 'share', 'icons', 'hicolor', `${size}x${size}`, 'apps');
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(iconSrc, path.join(destDir, 'zalo.png'));
      }
    }

    const icon512 = path.join(APP_DIR, 'pc-dist', 'favicon-512x512.png');
    if (fs.existsSync(icon512)) {
      const pixmapsDir = path.join(TEMP_PKG_DIR, 'usr', 'share', 'pixmaps');
      fs.mkdirSync(pixmapsDir, { recursive: true });
      fs.copyFileSync(icon512, path.join(pixmapsDir, 'zalo.png'));
    }

    // License
    const licenseDir = path.join(TEMP_PKG_DIR, 'usr', 'share', 'licenses', 'zalo-for-linux');
    fs.mkdirSync(licenseDir, { recursive: true });
    fs.copyFileSync(path.join(BASE_DIR, 'LICENSE'), path.join(licenseDir, 'LICENSE'));

    // 5. Generate .PKGINFO
    logger.info('Writing Arch .PKGINFO metadata...');
    const buildDate = Math.floor(Date.now() / 1000);
    let installedSize = 627814512;
    try {
      const duOutput = execSync(`du -sb "${TEMP_PKG_DIR}"`, { encoding: 'utf8' }).trim();
      installedSize = parseInt(duOutput.split('\t')[0], 10) || installedSize;
    } catch (_) {}

    const pkgInfoContent = [
      '# Generated by zalo-for-linux build-arch.js',
      'pkgname = zalo-for-linux',
      'pkgbase = zalo-for-linux',
      `pkgver = ${ZALO_VERSION}-1`,
      'pkgdesc = Unofficial Zalo desktop client for Linux with ZaDark integration (native Arch package)',
      'url = https://github.com/alaireselene/zalo-omarchy',
      `builddate = ${buildDate}`,
      'packager = Zalo for Linux Builder',
      `size = ${installedSize}`,
      'arch = x86_64',
      'license = MIT',
      'depend = atk',
      'depend = cairo',
      'depend = cups',
      'depend = glibc',
      'depend = gtk3',
      'depend = libdrm',
      'depend = libxcomposite',
      'depend = libxdamage',
      'depend = libxext',
      'depend = libxfixes',
      'depend = libxkbcommon',
      'depend = libxrandr',
      'depend = libxshmfence',
      'depend = mesa',
      'depend = nss',
      'depend = pango',
      'depend = zlib',
      'optdepend = wl-clipboard: Paste images from clipboard on Wayland',
      'optdepend = xclip: Paste images from clipboard on X11',
      'optdepend = wine: Voice/Video call engine support (runs 32-bit ZaloCall via Wine WoW64)',
      'optdepend = wine-mono: Mono runtime for Wine',
      'optdepend = gst-plugins-base: GStreamer base plugins for video calling',
      'optdepend = gst-plugins-good: GStreamer good plugins (video decoders/sinks)',
      'optdepend = gst-plugins-bad: GStreamer bad plugins for video and Wayland screen capture',
      'optdepend = gst-libav: H.264 video codec decoding for video calls',
      'optdepend = v4l-utils: Camera format adjustment utility (fix inverted/green camera)',
      'optdepend = xorg-server-xvfb: Headless X11 server for Wayland screen-sharing bridge',
      'optdepend = xdotool: Window geometry helper for Wayland screen sharing',
      'optdepend = python-dbus: Python D-Bus binding for XDG portal screen capture',
      'optdepend = flameshot: Screenshot tool integration',
      'optdepend = spectacle: Screenshot tool integration (KDE Plasma)',
      'optdepend = gnome-screenshot: Screenshot tool integration (GNOME)',
      'provides = zalo',
      'provides = zalo-for-linux',
      'conflict = zalo',
      'conflict = zalo-for-linux',
      'conflict = zalo-for-linux-bin',
      'conflict = zalo-bin',
      ''
    ].join('\n');

    fs.writeFileSync(path.join(TEMP_PKG_DIR, '.PKGINFO'), pkgInfoContent, 'utf8');

    // Copy .INSTALL scriptlet
    const installScriptletSrc = path.join(BASE_DIR, 'packaging', 'arch', 'zalo-for-linux.install');
    if (fs.existsSync(installScriptletSrc)) {
      fs.copyFileSync(installScriptletSrc, path.join(TEMP_PKG_DIR, '.INSTALL'));
    }

    // 6. Compress into .pkg.tar.zst
    const pkgName = `zalo-for-linux-${ZALO_VERSION}-1-x86_64.pkg.tar.zst`;
    const pkgPath = path.join(DIST_DIR, pkgName);

    logger.info(`Compressing into ${pkgName} (zstd level 19)...`);
    execSync(
      `bsdtar --uid 0 --gid 0 -cf - .PKGINFO .INSTALL opt usr | zstd -c -T0 -19 > "${pkgPath}"`,
      { cwd: TEMP_PKG_DIR, stdio: 'inherit' }
    );
    fs.rmSync(TEMP_PKG_DIR, { recursive: true, force: true });

    const stats = fs.statSync(pkgPath);
    const sizeMb = (stats.size / 1024 / 1024).toFixed(2);
    logger.success(`Successfully built Arch package: ${pkgName} (${sizeMb} MB)`);
    logger.info(`Install with: sudo pacman -U dist/${pkgName}`);

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `pkg_file=${pkgPath}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `pkg_name=${pkgName}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `zalo_version=${ZALO_VERSION}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `build=true\n`);
    }
  } catch (error) {
    logger.error('Arch build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
