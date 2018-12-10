import { app, BrowserWindow, globalShortcut, clipboard, screen} from 'electron' // eslint-disable-line

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
  globalShortcut.register('CmdOrCtrl+Shift+C', () => {
    const pos = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(pos);
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      // TODO 为不同屏幕尺寸设置不同比例
      height: Math.ceil(display.workAreaSize.height * 0.1),
      width: Math.ceil(display.workAreaSize.width * 0.2),
      y: pos.y,
      x: pos.x,
      // useContentSize: true,
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

    const text = clipboard.readText('selection');
    // TODO 检测是否初始化完成
    mainWindow.webContents.send('query', text);
    console.log(`New query: ${text}`);
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('query', text);
    });

    console.log(display.workAreaSize.height * 0.1);
    console.log(mainWindow.getBounds());
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
