import { app, BrowserWindow, Notification,contextBridge,  screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as Store from 'electron-store';
import { autoUpdater, NsisUpdater } from "electron-updater"
const store = new Store();
let win: BrowserWindow = null;
const args = process.argv.slice(1),serve = args.some((val) => val === '--serve');
autoUpdater.logger = require("electron-log")
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// const updater = new NsisUpdater({
//   provider:'github',
//   owner:'swayambhu-innovations',
//   repo:'Packages',
// })
var globalReloadInterval:any;

function run_script(command, args, event, callback) {
  var child = child_process.spawn(command, args, {
    shell: true,
  });
  // You can also use a variable to save the output for when the script closes later
  child.on('error', (error) => {
    event.sender.send('printDataComplete', { stage: 'error', error, command, args });
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    //Here is the output
    data = data.toString();
  //  console.log(data);
    event.sender.send('printDataComplete', { stage: 'stderr', data, command, args });
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    // win.webContents.send('mainprocess-response', data);
    //Here is the output from the command
    data = data.toString();
  //  console.log(data);
    event.sender.send('printDataComplete', { stage: 'stdout', data, command, args });
  });

  child.on('close', (code) => {
    //Here you can get the exit code of the script
  //  console.log(`child process exited with code ${code}`);
    event.sender.send('printDataComplete', { stage: 'closed', code, command, args });
  });
  if (typeof callback === 'function') callback();
}

function printData(event, data, printer) {
//  console.log('Will Print: ', data, printer);
  var home = require("os").homedir();
  var dataPath = home + '/Documents/somefolderwhichexists/';
  if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath, { recursive: true });
  }
  fs.writeFile(dataPath+'printableData.txt', data, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  //  console.log('File Written Successfully');
    run_script(
      'RawPrint.exe',
      ['"'+printer+'"','"'+dataPath+'printableData.txt'+'"'],
      event,
      function () {
      //  console.log('Done Printing (main)');
      }
    );
  });
}

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
    autoHideMenuBar: true,
  });
  // set title to current version
  win.title = 'Viraj POS '+app.getVersion();
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  ipcMain.on("getPrinters", async (event, arg) => {
    let res = win.webContents.getPrintersAsync();
  //  console.log("Main printers", res);
    event.returnValue = await res;
  });
  ipcMain.on("printData", async (event, arg) => {
  //  console.log("GOT", arg, arg.data, arg.printer);
    let res = printData(event, arg.data, arg.printer);
  });
  ipcMain.on("saveAuth", async (event, arg) => {
    try {
    //  console.log("GOT", arg, );
      store.set('token', arg);
      event.returnValue = true;
    //  console.log("Succes saveAuth");
    } catch (error) {
      event.returnValue = false;
    //  console.log("Save auth",error);
    }
  });
  ipcMain.on("getAuth", async (event, arg) => {
    try {
      event.returnValue = store.get('token');
    //  console.log("Success getAuth", event.returnValue);
    } catch (error) {
      event.returnValue = false;
    //  console.log("Get auth",error);
    }
  })

  ipcMain.on("clearAuth", async (event, arg) => {
    try {
      event.returnValue = store.clear();
    } catch (error) {
      event.returnValue = false;
    }
  })
  // contextBridge.exposeInIsolatedWorld(1004,"electron", {autoUpdater:autoUpdater});

  autoUpdater.on('checking-for-update', () => {
    const NOTIFICATION_TITLE = 'Checking for updates.'
    const NOTIFICATION_BODY = 'Viraj is running and checking for updates in background.'
    
    new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
    }).show()
    setTimeout(() => {
      win.webContents.send('updateAvailable', { stage: 'checking-for-update',currentVersion:app.getVersion(),channel:autoUpdater.channel, allowDowngrade:autoUpdater.allowDowngrade});
    },2000)
  })
  autoUpdater.on('update-available', (info) => {
    const NOTIFICATION_TITLE = 'Update available.'
    const NOTIFICATION_BODY = 'A new version of Viraj is available.'
    
    new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
    }).show()
    if (win){
      win.webContents.send('updateAvailable', { stage: 'update-available',currentVersion:app.getVersion(), info });
    }
  })
  autoUpdater.on('update-not-available', (info) => {
    if (win){
      win.webContents.send('updateAvailable', { stage: 'update-not-available',currentVersion:app.getVersion(), info });
    }
  })
  autoUpdater.on('download-progress', (progressObj) => {
    if (win){
      win.webContents.send('updateAvailable', { stage: 'download-progress',currentVersion:app.getVersion(), progressObj });
    }
  })
  autoUpdater.on('update-downloaded', (info) => {
    const NOTIFICATION_TITLE = 'Update downloaded.'
    const NOTIFICATION_BODY = 'It will be installed the next time you restart the application.'
    
    new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
    }).show()
    if (win){
      win.webContents.send('updateAvailable', { stage: 'update-downloaded',currentVersion:app.getVersion(), info });
    }
  })
  ipcMain.on('downloadUpdate', async (event, arg) => {
    event.returnValue = await autoUpdater.downloadUpdate();
  })
  ipcMain.on("checkForUpdate", async (event, arg) => {
    try {
      event.returnValue = autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      event.returnValue = false;
    }
  })
  ipcMain.on("quitAndInstall", async (event, arg) => {
    try {
      event.returnValue = autoUpdater.quitAndInstall(false,true);
    } catch (error) {
      event.returnValue = false;
    }
  })
  if (serve) {
    const debug = require('electron-debug');
    debug();
    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
    // autoUpdater.addListener("")
    // autoUpdater.checkForUpdatesAndNotify();
  } else {
    let pathIndex = './index.html';
    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }
    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
    win.webContents.on("did-fail-load", () => {
    //  console.log("did-fail-load");
      const url = new URL(path.join('file:', __dirname, pathIndex));
      win.loadURL(url.href);
      // REDIRECT TO FIRST WEBPAGE AGAIN
    });
    setTimeout(() => {
      win.reload();
    },500)
    globalReloadInterval = setInterval(() => {
      // dialog.showErrorBox('Title', 'Running') 
      // check if the body element has anything in it
      if (win){
        win.webContents.executeJavaScript(`document.body.innerHTML`).then((result) => {
          console.log(result);
          if (!result){
            // alert("Result is null")
            win.webContents.executeJavaScript(`window.location.reload()`);
          }
        })
      }
    },500)
    win.webContents.on("did-fail-load", () => {
      // alert("Failed to load webpage.");
      const url = new URL(path.join('file:', __dirname, pathIndex));
      win.loadURL(url.href);
    });
  }
  autoUpdater.checkForUpdates();
  // if (serve) {
  //   const debug = require('electron-debug');
  //   debug();

  //   require('electron-reloader')(module);
  //   win.loadURL('http://localhost:4200');
  //   // autoUpdater.addListener("")
  //   autoUpdater.checkForUpdatesAndNotify();
  // } else {
  //   // Path when running electron executable
  //   let pathIndex = './index.html';

  //   if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
  //     // Path when running electron in local folder
  //     pathIndex = '../dist/index.html';
  //   }

  //   const url = new URL(path.join('file:', __dirname, pathIndex));
  //   win.loadURL(url.href);
    // win.webContents.on("did-fail-load", () => {
    // //  console.log("did-fail-load");
    //   const url = new URL(path.join('file:', __dirname, pathIndex));
    //   win.loadURL(url.href);
    //   // REDIRECT TO FIRST WEBPAGE AGAIN
    // });
  // }
  
  // Emitted when the window is closed.
  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('will-quit', () => {
    if (globalReloadInterval){
      clearInterval(globalReloadInterval);
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
