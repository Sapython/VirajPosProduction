import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-set-charges',
  templateUrl: './set-charges.component.html',
  styleUrls: ['./set-charges.component.scss']
})
export class SetChargesComponent {
  chargesForm:FormGroup = new FormGroup({
    deliveryCharge:new FormControl(0),
    tip:new FormControl(0),
    serviceCharge:new FormControl(0),
    containerCharge:new FormControl(0),
  })
  constructor(public dialogRef:DialogRef,public dataProvider:DataProvider){}
}
