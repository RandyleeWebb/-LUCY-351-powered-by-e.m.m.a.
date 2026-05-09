const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
let serverProcess = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    title: "Enhanced Lucy Mind",
  });

  if (isDev) {
    // In development mode, point to the Vite dev server
    // We assume the Vite server is running on port 3000
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, start the bundled node server
    serverProcess = spawn(process.execPath, [path.join(__dirname, '../dist/server.js')], {
      env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
    });

    serverProcess.stdout.on('data', (data) => console.log(`Server: ${data}`));
    serverProcess.stderr.on('data', (data) => console.error(`Server Error: ${data}`));

    // Wait a brief moment for the server to bind the port, then load the URL
        setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 1500);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
