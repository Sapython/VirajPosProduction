import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/base-components/dialog/dialog.component';
import { DataProvider } from 'src/app/provider/data-provider.service';

@Component({
  selector: 'app-non-chargeable',
  templateUrl: './non-chargeable.component.html',
  styleUrls: ['./non-chargeable.component.scss']
})
export class NonChargeableComponent {
  nonChargeableForm:FormGroup = new FormGroup({
    reason:new FormControl('',Validators.required),
    phone:new FormControl('',[Validators.required,Validators.pattern('[0-9]{10}')]),
    name:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required)
  });
  constructor(private dialogRef:MatDialogRef<NonChargeableComponent>,private dataProvider:DataProvider,private dialog:Dialog){}
  submit(){
    if (this.nonChargeableForm.invalid) return;
    if(this.nonChargeableForm.value.password != this.dataProvider.password){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    this.dialogRef.close({...this.nonChargeableForm.value,nonChargeable:true})
  }
}
