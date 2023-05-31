import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { shakeOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-reprint-reason',
  templateUrl: './reprint-reason.component.html',
  styleUrls: ['./reprint-reason.component.scss'],
  animations:[
    zoomOutOnLeaveAnimation(),
    shakeOnEnterAnimation({duration:500})
  ]
})
export class ReprintReasonComponent {
  reprintForm:FormGroup = new FormGroup({
    reason:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required),
  })
  constructor(public dialogRef:DialogRef,private dataProvider:DataProvider){}

  async submit(){
    if (this.reprintForm.valid){
      const password = this.reprintForm.get('password')?.value;
      if((await this.dataProvider.checkPassword(password))){
        this.dialogRef.close(this.reprintForm.value)
      } else {
        alert("Incorrect Password")
      }
    }
  }
}
