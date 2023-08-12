import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
})
export class ReasonComponent {
  constructor(
    private dataProvider: DataProvider,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public dialogData:{passwordRequired:boolean}
  ) {}

  reasonForm: FormGroup = new FormGroup({
    reason: new FormControl('', Validators.required),
    password: new FormControl('', this.dialogData.passwordRequired ?  [Validators.required] : []),
  });

  cancel() {
    this.dialogRef.close();
  }

  async submit() {
    if (this.reasonForm.invalid) {
      alert('Invalid Form');
      return;
    }
    if (!this.dialogData.passwordRequired || await this.dataProvider.checkPassword(this.reasonForm.value.password)) {
      this.dialogRef.close(this.reasonForm.value.reason);
    } else {
      alert('Wrong Password');
    }
  }
}
