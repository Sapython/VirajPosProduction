import { Component } from '@angular/core';
import { ElectronService } from './core/services';
// import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { fadeInDownOnEnterAnimation, fadeOutUpOnLeaveAnimation } from 'angular-animations';
import { DataProvider } from './provider/data-provider.service';
import { GetDataService } from './services/get-data.service';
import { PrintingService } from './services/printing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fadeInDownOnEnterAnimation(),
    fadeOutUpOnLeaveAnimation(),
  ],
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    // private translate: TranslateService,
    public dataProvider: DataProvider,
    private dataService: GetDataService,
    private printingService: PrintingService
  ) {
    // this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }
}
