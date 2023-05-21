import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '../../../base-components/dialog/dialog.component';
import { DataProvider } from '../../../provider/data-provider.service';

@Component({
  selector: 'app-non-chargeable',
  templateUrl: './non-chargeable.component.html',
  styleUrls: ['./non-chargeable.component.scss']
})
export class NonChargeableComponent {
  nonChargeableForm:FormGroup = new FormGroup({
    reason:new FormControl('',Validators.required),
    phone:new FormControl(this.dataProvider.currentBill.customerInfo.phone,[Validators.required,Validators.pattern('[0-9]{10}')]),
    name:new FormControl(this.dataProvider.currentBill.customerInfo.name,Validators.required),
    password:new FormControl('',Validators.required)
  });
  constructor(private dialogRef:DialogRef,private dataProvider:DataProvider,private dialog:Dialog){}
  submit(){
    if (this.nonChargeableForm.invalid) return;
    if(this.nonChargeableForm.value.password != this.dataProvider.password){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    this.dataProvider.currentBill.customerInfo.phone = this.nonChargeableForm.value.phone;
    this.dataProvider.currentBill.customerInfo.name = this.nonChargeableForm.value.name;
    this.dialogRef.close({...this.nonChargeableForm.value,nonChargeable:true})
  }

  cancel(){
    this.dialogRef.close();
  }
}
