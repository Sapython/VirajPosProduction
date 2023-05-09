import { Dialog } from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatComponent } from './chat/chat.component';
import { DataProvider } from '../../provider/data-provider.service';
import { HistoryComponent } from './history/history.component';
import { slideInDownOnEnterAnimation, slideOutUpOnLeaveAnimation } from 'angular-animations';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../../helpers/confirm-dialog/confirm-dialog.component';
import { DialogComponent } from '../../base-components/dialog/dialog.component';
declare var jivo_api:any;
@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
  animations:[
    slideInDownOnEnterAnimation(),
    slideOutUpOnLeaveAnimation()
  ]
})
export class SystemComponent {
  @Input() businessName: string = this.dataProvider.currentBusiness?.hotelName || '';
  @Input() currentUser: string = this.dataProvider.currentUser?.email || '';
  @Input() accessLevel: string = this.dataProvider.currentAccessLevel;
  @Output() logout: EventEmitter<any> = new EventEmitter<any>();
  @Output() support: EventEmitter<any> = new EventEmitter<any>();
  @Output() settings: EventEmitter<any> = new EventEmitter<any>();
  @Output() lock: EventEmitter<any> = new EventEmitter<any>();
  constructor(private dialog:Dialog,public dataProvider:DataProvider,private authService:AuthService){
  }

  logOut(){
    const confirmDialog = this.dialog.open(DialogComponent,{data:{title:'Logout',message:'Are you sure you want to logout?'}});
    confirmDialog.closed.subscribe(result=>{
      console.log(result);
      if(result){
        this.authService.logout();
      }
    })
  }

  openHistory(){
    const dialog = this.dialog.open(HistoryComponent)
  }

  openSettings(){
    const dialog = this.dialog.open(SettingsComponent);
  }

  openChat(){
    // const dialog = this.dialog.open(ChatComponent)
    jivo_api.open()
  }
}
