const { app, BrowserWindow, screen, ipcMain, Menu, Tray } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false, 
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Default: Click-through but forward mouse moves to detect hover
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // IPC listener to toggle mouse capture
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.setIgnoreMouseEvents(ignore, options);
  });

  // IPC handler to provide userData path to renderer
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  // IPC listener to shake window
  ipcMain.on('shake-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    const originalBounds = win.getBounds();
    const intensity = 5;
    const duration = 500;
    const interval = 50;

    let elapsed = 0;
    const shakeTimer = setInterval(() => {
      if (elapsed >= duration) {
        clearInterval(shakeTimer);
        win.setBounds(originalBounds);
        return;
      }

      const offsetX = Math.floor(Math.random() * intensity * 2) - intensity;
      const offsetY = Math.floor(Math.random() * intensity * 2) - intensity;

      win.setBounds({
        x: originalBounds.x + offsetX,
        y: originalBounds.y + offsetY,
        width: originalBounds.width,
        height: originalBounds.height
      });

      elapsed += interval;
    }, interval);
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createTray();
    }
  });
});

function createTray() {
  // Use a generic icon or a specific one if it exists
  // For now, let's look for any .png in the root or animations that could serve as icon
  const iconPath = path.join(__dirname, 'animations', 'Cat', 'CatIdle', 'CatIdle.png');
  
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Infotochi', 
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      } 
    },
    { type: 'separator' },
    { 
      label: 'Salir', 
      click: () => {
        app.isQuitting = true;
        app.quit();
      } 
    }
  ]);

  tray.setToolTip('Infotochi');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // We only quit if it's NOT just closed but explicitly quit via Tray
    if (app.isQuitting) {
      app.quit();
    }
  }
});
