import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { SignupService } from '../../../../../../core/services/auth/signup/signup.service';
import { Timestamp } from '@angular/fire/firestore';
import { UserManagementService } from '../../../../../../core/services/auth/user/user-management.service';
import { AccessGroup, SelectPropertiesComponent } from '../select-properties/select-properties.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent {
  stage: 'available' | 'checking' | 'unavailable' | 'invalid' | undefined;
  onboardingStage: 'registration' | 'otp' = 'registration';
  previousUsername: string | undefined;
  authOtpVerificationId: string | undefined;
  maskedEmailInvitee: string | undefined;
  checkUsernameFunction = httpsCallable(this.functions, 'userNameAvailable');
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    accessType: new FormControl('', [Validators.required]),
    accessLevel: new FormControl(''),
    propertiesAllowed: new FormControl(''),
  });
  otpForm: FormGroup = new FormGroup({
    otp: new FormControl('', [Validators.required]),
  });
  constructor(
    private functions: Functions,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProvider,
    private authService: SignupService,
    private userManagement: UserManagementService,
    private dialog:Dialog
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
            } else if (this.stage == 'unavailable') {
              // this.addPasswordControl();
              // remove all the controls
              this.loginForm.removeControl('password');
              this.loginForm.removeControl('confirmPassword');
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
      'email',
      new FormControl('', [Validators.required, Validators.email]),
    );
    this.loginForm.addControl(
      'password',
      new FormControl('', [Validators.required]),
    );
    this.loginForm.addControl(
      'confirmPassword',
      new FormControl('', [Validators.required]),
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
    if (this.loginForm.invalid) return;
    // check the type and then check if either role or properties are set
    if (this.loginForm.value.accessType == 'role' && !this.loginForm.value.accessLevel) return;
    if (this.loginForm.value.accessType == 'custom' && !this.loginForm.value.propertiesAllowed) return;
    if (this.stage == 'unavailable') {
      if (
        await this.dataProvider.confirm(
          'This username is already present',
          [1],
          {
            description:
              'This username is already present. Are you sure you want to invite him. He will be able to access the account once he accepts the invitation',
            buttons: ['Cancel', 'Invite'],
          },
        )
      ) {
        this.dataProvider.loading = true;
        this.userManagement
          .addExistingUser(
            this.loginForm.value.username,
            this.loginForm.value.accessType,
            {
              role: this.loginForm.value.accessLevel,
              propertiesAllowed: this.loginForm.value.propertiesAllowed,
            }
          )
          .then((res) => {
            console.log(res);
            if (res.data['status'] == 'success' && res.data['authId']) {
              this.authOtpVerificationId = res.data['authId'];
              this.onboardingStage = 'otp';
              this.maskedEmailInvitee = res.data['maskedEmail']
              this.alertify.presentToast(res.data['message']);
            } else {
              this.alertify.presentToast('Something went wrong');
            }
          })
          .catch((err) => {
            console.log(err);
            this.alertify.presentToast(err.message);
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      } else {
        this.alertify.presentToast('Invitation Cancelled');
        // this.dialogRef.close()
      }
    } else if (this.stage == 'available') {
      if (
        await this.dataProvider.confirm(
          'Are you sure you want to add this account ?',
          [1],
        )
      ) {
        if(this.loginForm.value.accessType == 'role'){
          var access:any = {
            accessType: 'role',
            role:this.loginForm.value.accessLevel
          }
        } else {
          var access:any = {
            accessType: 'custom',
            propertiesAllowed:this.loginForm.value.propertiesAllowed
          }
        }
        let accountRes = await this.authService.signUpWithUserAndPassword(
          this.loginForm.value.username,
          this.loginForm.value.password,
          {
            business: {
              access: {
                ...access,
                lastUpdated: Timestamp.now(),
                updatedBy: this.dataProvider.currentUser.username,
              },
              address: this.dataProvider.currentBusiness.address,
              businessId: this.dataProvider.currentBusiness.businessId,
              joiningDate: Timestamp.now(),
              name: this.dataProvider.currentBusiness.hotelName,
            },
            email: this.loginForm.value.email,
            noSignIn: true,
          },
        );
        if (accountRes['username']) {
          let resolvedUser = accountRes as { username: string };
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
      this.dialogRef.close({ cancelled: true });
    }
  }

  verifyOtp() {
    this.dataProvider.loading = true;
    this.userManagement
      .verifyOtpExistingUser(
        this.loginForm.value.username,
        this.otpForm.value.otp,
        this.authOtpVerificationId,
      )
      .then((res) => {
        console.log(res);
        if (res.data['status'] == 'success') {
          this.alertify.presentToast('User added successfully');
          this.dialogRef.close();
        }
      })
      .catch((err) => {
        this.alertify.presentToast(err.message);
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  selectProperties(){
    const dialog = this.dialog.open(SelectPropertiesComponent,{data:this.loginForm.value.propertiesAllowed});
    dialog.closed.subscribe((data)=>{
      console.log("Received data from prop selector",data);
      if (data) this.loginForm.patchValue({propertiesAllowed:data});
    });
  }
}
