const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 320,
    height: 240,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    movable: true,
    frame: false, 
    transparent: true,
    icon: path.join(__dirname, 'assets', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");

  // Handle close button
  ipcMain.on('close-app', () => {
    win.close();
  });

  // Poll global mouse position and send relative coords to renderer (~60fps)
  // This bypasses the -webkit-app-region: drag mousemove suppression
  const mouseInterval = setInterval(() => {
    if (win.isDestroyed()) {
      clearInterval(mouseInterval);
      return;
    }
    const globalPos = screen.getCursorScreenPoint();
    const winBounds = win.getBounds();

    const relX = globalPos.x - winBounds.x;
    const relY = globalPos.y - winBounds.y;

    const inside =
      relX >= 0 && relY >= 0 &&
      relX <= winBounds.width && relY <= winBounds.height;

    win.webContents.send('mouse-position', { x: relX, y: relY, inside });
  }, 16);

  win.on('closed', () => clearInterval(mouseInterval));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});