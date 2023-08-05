import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { CodeBaseDiscount } from '../../../../../types/discount.structure';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss'],
})
export class AddDiscountComponent implements OnInit {
  discountForm: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    value: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
    minimumAmount: new FormControl(),
    minimumProducts: new FormControl(),
    maximumDiscount: new FormControl(),
    accessLevels: new FormControl(null, Validators.required),
  });

  accessLevels: string[] = ['manager', 'waiter', 'accountant', 'admin'];

  constructor(
    public dataProvider: DataProvider,
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    private data: { mode: 'add' | 'edit'; discount?: CodeBaseDiscount },
  ) {}

  ngOnInit(): void {
    if (this.data.mode == 'edit') {
      this.discountForm.patchValue(this.data.discount);
    }
  }
}
