import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { zoomOutOnLeaveAnimation, shakeOnEnterAnimation } from 'angular-animations';
import { DialogComponent } from '../../../../../shared/base-components/dialog/dialog.component';
import { Product } from '../../../../../types/product.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-line-cancel',
  templateUrl: './line-cancel.component.html',
  styleUrls: ['./line-cancel.component.scss'],
  animations:[zoomOutOnLeaveAnimation(),
    shakeOnEnterAnimation({duration:500})]
})
export class LineCancelComponent {
  value:number = 0;
  cancelForm:FormGroup = new FormGroup({
    customerName:new FormControl('',Validators.required),
    reason:new FormControl('',Validators.required),
    phone:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required),
    
  })
  constructor(@Inject(DIALOG_DATA) public product:Product,public dialogRef:DialogRef,private dialog:Dialog,private dataProvider:DataProvider){}
  submit(type:'made'|'unmade'){
    if (this.cancelForm.value.password == this.dataProvider.password){
      this.dialogRef.close({type,...this.cancelForm.value})
    } else {
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Wrong Password',description:'Please enter the correct password to continue.'}})
    }
  }
}
