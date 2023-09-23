import { Component, Inject, OnInit } from '@angular/core';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { DIALOG_DATA, Dialog } from '@angular/cdk/dialog';
import { AddEditComponent } from './add-edit/add-edit.component';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit {
  loading:boolean = false;

  constructor(private settingService:SettingsService, private alertify:AlertsAndNotificationsService, public dataProvider:DataProvider, private dialog:Dialog) {
  }

  ngOnInit(): void {
  }

  addCounter(){
    let dialog = this.dialog.open(AddEditComponent,{data:{mode:'add',data:null}});
  }

  editCounter(counter:BillerCounter){
    let dialog = this.dialog.open(AddEditComponent,{data:{mode:'edit',data:counter}});
  }

  deleteCounter(counter:BillerCounter){
    this.dataProvider.loading = true;
    this.settingService.deleteCounter(counter.id).then(()=>{
      this.alertify.presentToast('Counter Deleted');
    }).catch((err)=>{
      this.alertify.presentToast('Error Deleting Counter');
    }).finally(()=>{
      this.dataProvider.loading = false;
    });
  }

}
export interface BillerCounter {
  id?:string;
  counterName:string;
  creationDate:Timestamp;
  updateDate:Timestamp;
  locked:boolean;
}