import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-method',
  templateUrl: './add-method.component.html',
  styleUrls: ['./add-method.component.scss']
})
export class AddMethodComponent implements OnInit {
  paymentMethodForm:FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    detail: new FormControl('', [Validators.required]),
  })
  constructor(private dialog:DialogRef,@Inject(DIALOG_DATA) private data:any){}
  ngOnInit(): void {
    if(this.data.mode == 'edit'){
      this.paymentMethodForm.patchValue(this.data.setting)
    }
  }
  submit(){
    if(this.paymentMethodForm.valid){
      this.dialog.close(this.paymentMethodForm.value)
    }
  }

  cancel(){
    this.dialog.close()
  }
}
