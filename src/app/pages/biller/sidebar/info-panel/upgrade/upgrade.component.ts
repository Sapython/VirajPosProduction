import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { SystemService } from '../../../../../core/services/database/system/system.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent {
  form:FormGroup = new FormGroup({
    customerName: new FormControl('',Validators.required),
    reason: new FormControl('',Validators.required),
    referralCode: new FormControl('',Validators.required),
    mobileNumber: new FormControl('',Validators.required),
  });
  constructor(private systemService:SystemService,private dialogRef:DialogRef,private alertify:AlertsAndNotificationsService,private dataProvider:DataProvider) {}
  cancel(){
    this.form.reset();
    this.dialogRef.close();
  }
  submit(){
    console.log(this.form.value);
    this.dataProvider.loading = true;
    this.systemService.upgrade(this.form.value).then((data)=>{
      this.alertify.presentToast("Upgrade request sent successfully");
      this.cancel();
    }).catch((err)=>{
      this.alertify.presentToast("Upgrade request failed");
    }).finally(()=>{
      this.dataProvider.loading = false;
    })
  }
}
