import { Component } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { fadeInDownOnEnterAnimation, fadeOutUpOnLeaveAnimation } from 'angular-animations';
import { DataProvider } from './core/services/provider/data-provider.service';
import { AuthService } from './core/services/auth/auth.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ElectronService } from './core/services/electron/electron.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations:[
    fadeInDownOnEnterAnimation(),
    fadeOutUpOnLeaveAnimation(),
  ]
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    public dataProvider: DataProvider,
    private authService:AuthService,
    private indexedDbService:NgxIndexedDBService
  ) {
    indexedDbService.getAll('config').subscribe((res)=>{
      // console.log('112 got config',res);
    },(err)=>{
      // console.log('112 got config error',err);
    })
    indexedDbService.add('config',{id:1,config:APP_CONFIG}).subscribe((res)=>{
      // console.log('112 config success',res);
    },(err)=>{
      // console.log('112 config error',err);
    });
    // console.log('EscPosEncoder', EscPosEncoder);
  }

}

