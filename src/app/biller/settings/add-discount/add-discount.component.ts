import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../provider/data-provider.service';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent {
  discountForm:FormGroup = new FormGroup({
    name:new FormControl(null,Validators.required),
    value:new FormControl(null,Validators.required),
    type:new FormControl(null,Validators.required),
    minimumAmount:new FormControl(),
    minimumProducts:new FormControl(),
    maximumDiscount:new FormControl(),
    menus:new FormControl(null,Validators.required),
    accessLevels:new FormControl(null,Validators.required),
  })

  accessLevels:string[] = [
    "manager",
    "waiter",
    "accountant",
    "admin"
  ]

  constructor(public dataProvider:DataProvider,public dialogRef:DialogRef){}

}
