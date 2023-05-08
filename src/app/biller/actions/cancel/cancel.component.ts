import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/base-components/dialog/dialog.component';
import { DataProvider } from 'src/app/provider/data-provider.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent {
  cancelForm:FormGroup = new FormGroup({
    customer: new FormControl('',Validators.required),
    reason: new FormControl('',Validators.required),
    phone: new FormControl('',Validators.required),
    password: new FormControl('',Validators.required),
  })
  constructor(private dialogRef:MatDialogRef<CancelComponent>,private dataProvider:DataProvider,private dialog:Dialog){}

  close(){
    this.dialogRef.close()
  }

  cancelBill(){
    if(this.cancelForm.value.password != this.dataProvider.password){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    this.dialogRef.close(this.cancelForm.value)
  }
}
