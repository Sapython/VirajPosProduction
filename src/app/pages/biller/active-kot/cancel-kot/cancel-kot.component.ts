import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-cancel-kot',
  templateUrl: './cancel-kot.component.html',
  styleUrls: ['./cancel-kot.component.scss']
})
export class CancelKOtComponent {
  mode:'unmade'|'made'='made';
  reasonForm:FormGroup = new FormGroup({
    reason:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required)
  });

  constructor(private dataProvider:DataProvider,private dialogRef:DialogRef){}

  cancel(){
    this.dialogRef.close()
  }

  async submit(){
    if (this.reasonForm.invalid){
      alert('Invalid Form')
      return
    }
    if ((await this.dataProvider.checkPassword(this.reasonForm.value.password))){
      this.dialogRef.close({...this.reasonForm.value,mode:this.mode})
    } else {
      alert('Wrong Password')
    }
  }
}
