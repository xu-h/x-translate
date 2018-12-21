import { app, BrowserWindow, globalShortcut, clipboard, screen, ipcMain} from 'electron' // eslint-disable-line

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    // TODO 为不同屏幕尺寸设置不同比例
    // useContentSize: true,
    show: false,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { webSecurity: false },
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    // 新建窗口用于显示devtool
    // 避免出现"Uncaught (in promise) Error: Could not instantiate等错误提示
    const devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'right' });
  }

  globalShortcut.register('CmdOrCtrl+Shift+C', () => {
    const pos = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(pos);
    const winSize = {
      height: Math.ceil(display.workAreaSize.height * 0.15),
      width: Math.ceil(display.workAreaSize.width * 0.20),
    };
    mainWindow.setContentBounds({
      x: pos.x, y: pos.y, height: winSize.height, width: winSize.width,
    });

    // TODO 移动窗口位置

    const text = clipboard.readText('selection');
    // TODO 检测是否初始化完成
    console.log(`New query: ${text}`);
    mainWindow.webContents.send('query', text, winSize);
    mainWindow.show();
    // mainWindow.webContents.on('did-finish-load', () => {
    // });
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('close', () => {
  mainWindow.close();
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
