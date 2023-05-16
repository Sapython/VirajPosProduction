import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../../provider/data-provider.service';

@Component({
  selector: 'app-reprint-reason',
  templateUrl: './reprint-reason.component.html',
  styleUrls: ['./reprint-reason.component.scss']
})
export class ReprintReasonComponent {
  reprintForm:FormGroup = new FormGroup({
    reason:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required),
  })
  constructor(public dialogRef:DialogRef,private dataProvider:DataProvider){}

  submit(){
    if (this.reprintForm.valid){
      const password = this.reprintForm.get('password')?.value;
      if(password == this.dataProvider.password){
        this.dialogRef.close(this.reprintForm.value)
      } else {
        alert("Incorrect Password")
      }
    }
  }
}
