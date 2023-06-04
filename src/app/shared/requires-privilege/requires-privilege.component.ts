import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-requires-privilege',
  templateUrl: './requires-privilege.component.html',
  styleUrls: ['./requires-privilege.component.scss']
})
export class RequiresPrivilegeComponent {
  loginForm:FormGroup = new FormGroup({
    username:new FormControl('',Validators.required),
    password:new FormControl('',[Validators.required,Validators.minLength(6)]),
  })
  constructor(public dialogRef:DialogRef,private alertify:AlertsAndNotificationsService){
  }

  submit(){
    if(this.loginForm.invalid){
      this.alertify.presentToast('Invalid Credentials')
    } else {
      this.dialogRef.close(this.loginForm.value)
    }
  }
}
