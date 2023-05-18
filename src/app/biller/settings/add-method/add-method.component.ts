import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-method',
  templateUrl: './add-method.component.html',
  styleUrls: ['./add-method.component.scss']
})
export class AddMethodComponent {
  paymentMethodForm:FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    detail: new FormControl('', [Validators.required]),
  })
  constructor(private dialog:DialogRef){}
  submit(){
    if(this.paymentMethodForm.valid){
      this.dialog.close(this.paymentMethodForm.value)
    } else {
      this.dialog.close()
    }
  }

  cancel(){
    this.dialog.close()
  }
}
