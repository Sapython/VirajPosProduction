import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, contextBridge } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';
import { ReplaySubject, Subject, firstValueFrom } from 'rxjs';
import { DataProvider } from '../provider/data-provider.service';
const updateStages = [
  'checking-for-update',
  'update-available',
  'update-not-available',
  'download-progress',
  'update-downloaded',
  'installing',
];
@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  contextBridge: typeof contextBridge;
  fs: typeof fs;
  softwareUpdateSubject: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private dialog: Dialog,
    private dataProvider: DataProvider,
  ) {
    // setTimeout(()=>{
    //   this.softwareUpdateSubject.next({
    //     stage:"update-available",
    //     info:{
    //       releaseDate:'2023-07-09T15:15:44.776Z',
    //       releaseName:'1.5.85',
    //       releaseNotes:'Test Release Notes',
    //       version:'1.5.85'
    //     }
    //   });
    // },4000)
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
        //  console.log(`stdout:\n${stdout}`);
      });

      this.ipcRenderer.on('updateAvailable', (event, args) => {
        // console.log('Update Service: ', args);
        this.softwareUpdateSubject.next(args);
        // send filtered args to this.dataProvider.softwareUpdateFilteredSubject
        // filtering is done in increasing order of priority taken from updateStages
        // if updateStages.indexOf(args.stage) > updateStages.indexOf(this.currentUpdateStage) then send to this.dataProvider.softwareUpdateFilteredSubject and update this.currentUpdateStage
        // if updateStages.indexOf(args.stage) < updateStages.indexOf(this.currentUpdateStage) then ignore
        // if updateStages.indexOf(args.stage) == updateStages.indexOf(this.currentUpdateStage) then send to this.dataProvider.softwareUpdateFilteredSubject
        // if updateStages.indexOf(args.stage) == updateStages.indexOf(this.currentUpdateStage) == updateStages.length-1 then send to this.dataProvider.softwareUpdateFilteredSubject

        if (
          updateStages.indexOf(args.stage) >
          updateStages.indexOf(this.dataProvider.currentUpdateStage)
        ) {
          this.dataProvider.currentUpdateStage = args.stage;
          this.dataProvider.softwareUpdateFilteredSubject.next(args);
        }
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

  getPrinters() {
    if (!this.isElectron) return ['Fake Test Printer 1','Fake Test Printer 2','Fake Test Printer 3'];
    return this.ipcRenderer.sendSync('getPrinters').map((printer: any) => {
      return printer.name;
    });
  }

  async printData(data: any, printer: string) {
    // console.log("Printing data",data,"to printer:",printer);
    
    if (!data || !printer) {
      const dialog = this.dialog.open(DialogComponent, {
        data: { title: 'Error', description: 'No Data or Printer Selected' },
      });
      await firstValueFrom(dialog.closed)
      return;
    }
    if (!this.ipcRenderer) {
      const dialog = this.dialog.open(DialogComponent, {
        data: { title: 'Error', description: 'No Printer Found',buttons:['Ok'],primary:[0] },
      });
      let noPrinterFound = await firstValueFrom(dialog.closed);
      return;
    }
    //  console.log("STAGE 3 => Will Print: ", data, printer);
    this.ipcRenderer.send('printData', { data, printer });
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });
    this.ipcRenderer.on('printDataComplete', (event, data) => {
      //  console.log("Done Printing", data);
      promiseResolve(data);
    });
    return promise;
  }

  setAuth(token: string) {
    if (!this.isElectron) return;
    this.ipcRenderer.sendSync('saveAuth', token);
  }

  clearAuth() {
    if (!this.isElectron) return;
    this.ipcRenderer.sendSync('clearAuth');
  }

  getAuth() {
    if (!this.isElectron) return;
    return this.ipcRenderer.sendSync('getAuth');
  }

  checkForUpdate() {
    if (!this.isElectron) return;
    return this.ipcRenderer.sendSync('checkForUpdate');
  }

  downloadUpdate() {
    if (!this.isElectron) return;
    return this.ipcRenderer.sendSync('downloadUpdate');
  }

  installNow() {
    if (!this.isElectron) return;
    return this.ipcRenderer.sendSync('quitAndInstall');
  }
}
