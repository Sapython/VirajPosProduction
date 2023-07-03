import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-tax',
  templateUrl: './add-tax.component.html',
  styleUrls: ['./add-tax.component.scss']
})
export class AddTaxComponent implements OnInit {
  taxForm:FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    cost: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    mode: new FormControl('', [Validators.required]),
  })
  constructor(private dialog:DialogRef,@Inject(DIALOG_DATA) public data:{mode:'add'|'edit',setting:any}){}
  ngOnInit(): void {
    if(this.data.mode == 'edit'){
    //  console.log(this.data.setting);
      this.taxForm.patchValue(this.data.setting)
    }
  }
  submit(){
    if(this.taxForm.valid){
      this.dialog.close(this.taxForm.value)
    }
  }

  cancel(){
    this.dialog.close()
  }
}
