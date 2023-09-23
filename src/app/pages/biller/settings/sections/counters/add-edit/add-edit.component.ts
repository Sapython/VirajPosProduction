import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { BillerCounter } from '../counters.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SettingsService } from '../../../../../../core/services/database/settings/settings.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditComponent {
  counter:BillerCounter;
  mode:'edit'|'add' = 'add';

  counterForm:FormGroup = new FormGroup({
    counterName:new FormControl('',Validators.required),
  });

  constructor(public dialogRef:DialogRef, @Inject(DIALOG_DATA) public data:{mode:'edit'|'add',data:BillerCounter},private settingService:SettingsService, private dataProvider:DataProvider, private alertify:AlertsAndNotificationsService){
    if (this.data.mode === 'edit'){
      this.mode = 'edit';
      this.counter = this.data.data;
      this.counterForm.patchValue(this.counter);
    } else {
      this.mode = 'add';
    }
  }


  addCounter(){
    this.dataProvider.loading = true;
    this.settingService.addCounter(this.counterForm.value).then(()=>{
      this.alertify.presentToast('Counter Added');
      this.dialogRef.close();
    }).catch((err)=>{
      this.alertify.presentToast('Error Adding Counter');
    }).finally(()=>{
      this.dataProvider.loading = false;
    });
  }


  updateCounter(){
    this.dataProvider.loading = true;
    this.settingService.updateCounter(this.counter.id,this.counterForm.value).then(()=>{
      this.alertify.presentToast('Counter Updated');
      this.dialogRef.close();
    }).catch((err)=>{
      this.alertify.presentToast('Error Updating Counter');
    }).finally(()=>{
      this.dataProvider.loading = false;
    });
  }

}
