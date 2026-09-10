/**
 * plugins/screenshot/index.js
 *
 * Screenshot plugin for Zalomarchy.
 * Delegates exclusively to Omarchy's native screenshot engine (omarchy screenshot).
 */

'use strict';

const { exec } = require('child_process');

let _mainWindow = null;
let _ipcMain    = null;

function register({ ipcMain }) {
  _ipcMain = ipcMain;

  const originalHandle = ipcMain.handle.bind(ipcMain);
  ipcMain.handle = function (channel, handler) {
    if (channel === 'screen-capture') {
      const wrappedHandler = async (event, ...args) => {
        const opts = args[0];
        const hideWindow = opts && opts.captureMode === false;

        // Hide window for "screenshot without Zalo window" mode
        if (hideWindow && _mainWindow && !_mainWindow.isDestroyed()) {
          _mainWindow.hide();
        }

        try {
          await _triggerScreenshot();
        } catch (e) {
          console.error('[Screenshot Plugin]', e.message);
        }

        // Restore window
        if (hideWindow && _mainWindow && !_mainWindow.isDestroyed()) {
          if (_mainWindow.isMinimized()) _mainWindow.restore();
          _mainWindow.show();
          _mainWindow.focus();
          _mainWindow.moveTop();
          if (!_mainWindow.webContents.isDestroyed()) {
            _mainWindow.webContents.send('show-from-tray');
          }
        }

        return true;
      };
      return originalHandle(channel, wrappedHandler);
    }
    return originalHandle(channel, handler);
  };
}

function _triggerScreenshot() {
  return new Promise((resolve) => {
    // Omarchy native screenshot: interactive smart region/window selection,
    // automatically copied to clipboard via wl-copy and saved to Pictures.
    exec('omarchy screenshot', (err) => {
      if (err) {
        console.error('[Screenshot Plugin] omarchy screenshot error:', err.message);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

function setMainWindow(win) {
  _mainWindow = win;
}

module.exports = { register, setMainWindow };
