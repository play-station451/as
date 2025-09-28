const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, 
      contextIsolation: true 
    }
  });

  ipcMain.on('launch-exe', (event, exePath) => {
    exec(`"${exePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  });

  ipcMain.on('clear-site-data', (event) => {
    mainWindow.webContents.session.clearStorageData({
      storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers'],
    }).then(() => {
      console.log('Site data cleared successfully.');
      event.sender.send('site-data-cleared');
    }).catch((error) => {
      console.error('Failed to clear site data:', error);
      event.sender.send('site-data-clear-failed', error.message);
    });
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  ipcMain.on('toggle-maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
 app.commandLine.appendSwitch('ignore-certificate-errors');
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
