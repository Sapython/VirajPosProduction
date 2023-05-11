import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

let win: BrowserWindow = null;
const args = process.argv.slice(1),serve = args.some((val) => val === '--serve');

function run_script(command, args, event, callback) {
  var child = child_process.spawn(command, args, {
    shell: true,
  });
  // You can also use a variable to save the output for when the script closes later
  child.on('error', (error) => {
    event.sender.send('printDataComplete', { stage: 'error', error });
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    //Here is the output
    data = data.toString();
    console.log(data);
    event.sender.send('printDataComplete', { stage: 'stderr', data });
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    // win.webContents.send('mainprocess-response', data);
    //Here is the output from the command
    data = data.toString();
    console.log(data);
    event.sender.send('printDataComplete', { stage: 'stdout', data });
  });

  child.on('close', (code) => {
    //Here you can get the exit code of the script
    console.log(`child process exited with code ${code}`);
    event.sender.send('printDataComplete', { stage: 'closed', code });
  });
  if (typeof callback === 'function') callback();
}

function printData(event, data, printer) {
  console.log('Will Print: ', data, printer);
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
    console.log('File Written Successfully');
    run_script(
      'RawPrint.exe',
      [printer,dataPath+'printableData.txt'],
      event,
      function () {
        console.log('Done Printing (main)');
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

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }
  win.webContents.on("did-fail-load", () => {
    console.log("did-fail-load");
    win.loadURL(path.join("file://", __dirname, "../dist/index.html"));
    // REDIRECT TO FIRST WEBPAGE AGAIN
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  ipcMain.on("getPrinters", async (event, arg) => {
    let res = win.webContents.getPrintersAsync();
    console.log("Main printers", res);
    event.returnValue = await res;
  });
  ipcMain.on("printData", async (event, arg) => {
    console.log("GOT", arg, arg.data, arg.printer);
    let res = printData(event, arg.data, arg.printer);
  });

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
