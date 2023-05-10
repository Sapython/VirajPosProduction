import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame,contextBridge } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../../../base-components/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  contextBridge: typeof contextBridge;
  fs: typeof fs;

  constructor(private dialog:Dialog) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.contextBridge = window.require('electron').contextBridge;

      this.fs = window.require('fs');

      this.childProcess = window.require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  getPrinters(){
    if (!this.isElectron) return;
    return this.ipcRenderer.sendSync("getPrinters").map((printer:any)=>{printer.name});
  }

  printData(data:any, printer:string) {
    if (!data || !printer){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Error',description:'No Data or Printer Selected'}});
      console.log("STAGE 1 => Will Print: ", data, printer);
      return;
    }
    console.log("STAGE 3 => Will Print: ", data, printer);
    this.ipcRenderer.send("printData", { data, printer });
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });
    this.ipcRenderer.on("printDataComplete", (event, data) => {
      console.log("Done Printing", data);
      promiseResolve(data);
    });
    return promise;
  }

}
