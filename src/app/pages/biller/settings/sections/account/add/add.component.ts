import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { SignupService } from '../../../../../../core/services/auth/signup/signup.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent {
  stage: 'available' | 'checking' | 'unavailable' | 'invalid' | undefined;
  previousUsername: string | undefined;
  checkUsernameFunction = httpsCallable(this.functions, 'userNameAvailable');
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  constructor(
    private functions: Functions,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProvider,
    private authService: SignupService
  ) {
    this.loginForm.valueChanges.pipe(debounceTime(600)).subscribe((res) => {
      if (this.previousUsername == res.username) {
        return;
      }
      this.previousUsername = res.username;
      this.stage = 'checking';
      this.checkUsernameFunction({ username: res.username })
        .then((res) => {
        //  console.log(res);
          if (res.data) {
            this.stage = res.data['stage'];
            if (this.stage == 'available') {
              this.addPasswordControl();
            }
          } else {
            this.stage = 'invalid';
          }
        })
        .catch((err) => {
          this.stage = 'invalid';
        });
    });
  }

  addPasswordControl() {
    // check if the controls are already added
    if (
      this.loginForm.contains('password') &&
      this.loginForm.contains('confirmPassword')
    ) {
      return;
    }
    this.loginForm.addControl(
      'password',
      new FormControl('', [Validators.required])
    );
    this.loginForm.addControl(
      'confirmPassword',
      new FormControl('', [Validators.required])
    );
    this.loginForm.addControl(
      'accessLevel',
      new FormControl('', [Validators.required])
    );
  }

  async submit() {
    if (this.loginForm.invalid) {
      this.alertify.presentToast('Please fill all the fields');
      return;
    }
    if (this.loginForm.value.password != this.loginForm.value.confirmPassword) {
      this.alertify.presentToast('Passwords do not match');
      return;
    }
    if (this.stage == 'invalid') {
      this.alertify.presentToast('Username is invalid');
      return;
    }
    if (this.stage == 'unavailable') {
      this.alertify.presentToast('Username is not available');
      this.dialogRef.close({ username: this.loginForm.value.username });
    } else if (this.stage == 'available') {
      if (
        await this.dataProvider.confirm(
          'Are you sure you want to add this account ?',
          [1]
        )
      ) {
        let accounteRes = await this.authService.signUpWithUserAndPassword(
          this.loginForm.value.username,
          this.loginForm.value.password,
          {
            business: {
              access: {
                accessLevel: this.loginForm.value.accessLevel,
                lastUpdated: Timestamp.now(),
                updatedBy: this.dataProvider.currentUser.username,
              },
              address: this.dataProvider.currentBusiness.address,
              businessId: this.dataProvider.currentBusiness.businessId,
              joiningDate: Timestamp.now(),
              name: this.dataProvider.currentBusiness.hotelName,
            },
            noSignIn: true,
          }
        );
        if (accounteRes['username']) {
          let resolvedUser = accounteRes as { username: string };
          return this.dialogRef.close({
            username: resolvedUser.username,
            access: this.loginForm.value.accessLevel,
          });
        } else {
          return this.alertify.presentToast('Something went wrong');
        }
      } else {
        this.dialogRef.close();
      }
    } else {
      this.alertify.presentToast('Something went wrong');
    }
  }

  async cancel() {
    if (
      await this.dataProvider.confirm('Are you sure you want to cancel ?', [1])
    ) {
      this.dialogRef.close();
    }
  }
}
