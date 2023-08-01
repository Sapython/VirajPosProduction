import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
})
export class ReasonComponent {
  reasonForm: FormGroup = new FormGroup({
    reason: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private dataProvider: DataProvider,
    private dialogRef: DialogRef,
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  async submit() {
    if (this.reasonForm.invalid) {
      alert('Invalid Form');
      return;
    }
    if (await this.dataProvider.checkPassword(this.reasonForm.value.password)) {
      this.dialogRef.close(this.reasonForm.value.reason);
    } else {
      alert('Wrong Password');
    }
  }
}
