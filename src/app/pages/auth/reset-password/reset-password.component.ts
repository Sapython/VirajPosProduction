import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DialogRef } from '@angular/cdk/dialog';
import { DataProvider } from '../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup = new FormGroup({
    previousPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });
  constructor(
    private userManagementService: UserManagementService,
    private alertify: AlertsAndNotificationsService,
    private dialogRef: DialogRef,
    private dataProvider: DataProvider,
  ) {}
  async resetPassword() {
    if (
      await this.dataProvider.confirm(
        'Are you sure you want to reset password?',
        [1],
        { buttons: ['No', 'Yes'] },
      )
    ) {
      this.userManagementService
        .resetPassword(
          this.resetPasswordForm.value.previousPassword,
          this.resetPasswordForm.value.newPassword,
          this.resetPasswordForm.value.confirmPassword,
        )
        .then(() => {
          this.resetPasswordForm.reset();
        })
        .catch((err) => {
          //  console.log(err);
          this.alertify.presentToast(
            err.message || err || 'Some error occurred while resetting password',
          );
        });
    }
  }

  async cancel() {
    if (
      await this.dataProvider.confirm('Are you sure you want to cancel?', [1], {
        buttons: ['No', 'Yes'],
      })
    ) {
      this.resetPasswordForm.reset();
      this.dialogRef.close();
    }
  }
}
