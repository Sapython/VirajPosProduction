import { Component, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import {
  fadeInDownOnEnterAnimation,
  fadeOutUpOnLeaveAnimation,
} from 'angular-animations';
import { DataProvider } from './core/services/provider/data-provider.service';
import { AuthService } from './core/services/auth/auth.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ElectronService } from './core/services/electron/electron.service';
import { PrinterService } from './core/services/printing/printer/printer.service';
import {loadFont} from './fontLoader'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeInDownOnEnterAnimation(), fadeOutUpOnLeaveAnimation()],
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    public dataProvider: DataProvider,
    private authService: AuthService,
    private indexedDbService: NgxIndexedDBService,
    private printingService:PrinterService
  ) {
    loadFont();
  }
}
