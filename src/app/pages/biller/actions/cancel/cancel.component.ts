import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
})
export class CancelComponent {
  cancelForm: FormGroup = new FormGroup({
    customer: new FormControl(
      this.dataProvider.currentBill.customerInfo.name,
      Validators.required,
    ),
    reason: new FormControl('', Validators.required),
    phone: new FormControl(
      this.dataProvider.currentBill.customerInfo.phone,
      Validators.required,
    ),
    password: new FormControl('', Validators.required),
  });
  constructor(
    private dialogRef: DialogRef,
    private dataProvider: DataProvider,
    private dialog: Dialog,
  ) {}

  close() {
    this.dialogRef.close();
  }

  async cancelBill() {
    if (
      !(await this.dataProvider.checkPassword(this.cancelForm.value.password))
    ) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'Invalid Password',
          description: 'Please enter the correct password to continue.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      return;
    }
    this.dataProvider.currentBill.customerInfo.phone =
      this.cancelForm.value.phone;
    this.dataProvider.currentBill.customerInfo.name =
      this.cancelForm.value.customer;
    this.dialogRef.close(this.cancelForm.value);
  }

  moveFocus(event, elm) {
    //  console.log(event);
    if (event.keyCode == 13) {
      elm.focus();
    }
  }
}
