import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import {
  getDoc,
  doc,
  Firestore,
} from '@angular/fire/firestore';
import { Functions, httpsCallableFromURL } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { AlertsAndNotificationsService } from '../../alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { ElectronService } from '../../electron/electron.service';
import { dbConfig } from '../../../../app.module';
import { RequiresPrivilegeComponent } from '../../../../shared/requires-privilege/requires-privilege.component';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  resetPasswordFunction = httpsCallableFromURL(this.functions, 'https://resetpassword-3mazqb66kq-el.a.run.app');
  resetPasswordMailFunction = httpsCallableFromURL(
    this.functions,
    'https://resetpasswordmail-3mazqb66kq-el.a.run.app',
  );
  resetPasswordWithOtpFunction = httpsCallableFromURL(
    this.functions,
    'https://verifyresetpasswordotp-3mazqb66kq-el.a.run.app',
  );
  addExistingUserFunction = httpsCallableFromURL(this.functions, 'https://addexistinguser-3mazqb66kq-el.a.run.app');
  verifyOtpExistingUserFunction = httpsCallableFromURL(
    this.functions,
    'https://verifyotpexistinguser-3mazqb66kq-el.a.run.app',
  );
  authenticateActionFunction = httpsCallableFromURL(
    this.functions,
    'https://authenticateaction-3mazqb66kq-el.a.run.app',
  );
  constructor(
    private firestore: Firestore,
    private dbService: NgxIndexedDBService,
    private auth: Auth,
    private router: Router,
    private functions: Functions,
    private alertify: AlertsAndNotificationsService,
    private dataProvider: DataProvider,
    private dialog: Dialog,
    private electronService: ElectronService,
  ) {
    // getDocs(collection(this.firestore,'business')).then((res)=>{
    //   res.docs.forEach((document)=>{
    //     let users = document.data()['users']
    //     if (users && typeof users == 'object' && users.length > 0){
    //       users = users.map((user)=>{
    //         if (user['accessType']){
    //           return user
    //         }
    //         let access = user['access'];
    //         delete user['access'];
    //         return {
    //           ...user,
    //           accessType:'role',
    //           role:access
    //         } as Member;
    //       })
    //       updateDoc(doc(this.firestore,'business',document.id),{
    //         users:users
    //       });
    //     }
    //   })
    // })
  }
  getUser(uid: string) {
    return getDoc(doc(this.firestore, 'users/' + uid));
  }

  async checkbusiness(
    userId: string,
  ): Promise<
    | false
    | { userId: string; businessId: string; access: string; email: string }
  > {
    let res: {
      userId: string;
      businessId: string;
      access: string;
      email: string;
    } = await firstValueFrom(this.dbService.getByKey('business', 1));
    if (res && res['userId']) {
      //  console.log('UserId', res);
      if (res['userId'] == userId) {
        return res;
      } else {
        this.dbService.deleteByKey('business', 1).subscribe((res) => {
          //  console.log('Deleted', res);
        });
        return false;
      }
    } else {
      return false;
    }
  }

  async logout() {
    this.dataProvider.loading = true;
    signOut(this.auth);
    // clear local storage
    this.electronService.clearAuth();
    // localStorage.clear();
    // indexedDB.deleteDatabase('Vrajera');
    let deleteRequests = Promise.all(
      dbConfig.objectStoresMeta.map(async (store) => {
        return await firstValueFrom(
          this.dbService.deleteObjectStore(store.store),
        );
      }),
    );
    //  console.log("Deleting Vrajera cache ",deleteRequests)
    this.dataProvider.loading = false;
    let url = window.location.href.split('/');
    url.pop();
    url.push('index.html');
    window.location.href = url.join('/');
    // window.location.reload();
  }

  userExists(username: string) {
    return getDoc(doc(this.firestore, 'users/' + username));
  }

  async resetPassword(
    previousPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    // validate passwords for null, less than 8 chars, must be alphanumeric, must match
    // if valid, call resetPasswordFunction
    // if invalid, return error message
    try {
      if (
        !(
          isNaN(Number(previousPassword)) &&
          isNaN(Number(newPassword)) &&
          isNaN(Number(confirmPassword))
        )
      ) {
        throw Error('Only numbers are not allowed.');
      }
      if (
        previousPassword == null ||
        newPassword == null ||
        confirmPassword == null
      ) {
        throw Error('All fields must be filled out.');
      }
      if (
        previousPassword.length < 8 ||
        newPassword.length < 8 ||
        confirmPassword.length < 8
      ) {
        throw Error('All passwords must be at least 8 characters.');
      }
      if (newPassword != confirmPassword) {
        throw Error('New password and confirm password must match.');
      }
    } catch (error) {
      throw error || Error('Invalid details.');
    }
    try {
      this.dataProvider.loading = true;
      let resetPasswordRes = await this.resetPasswordFunction({
        previousPassword,
        newPassword,
        confirmPassword,
        uid: this.dataProvider.currentUser.username,
      });
      //  console.log("resetPasswordRes",resetPasswordRes);
      if (resetPasswordRes) {
        this.alertify.presentToast('Password reset successfully.');
        this.dataProvider.loading = false;
        this.dialog.closeAll();
        this.logout();
        this.router.navigateByUrl('/login');
      }
    } catch (error) {
      this.dataProvider.loading = false;
      throw error;
    } finally {
      this.dataProvider.loading = false;
    }
  }

  sendResetPasswordMail(username: string, email: string) {
    return this.resetPasswordMailFunction({ username, email });
  }

  resetPasswordWithOtp(
    username: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
    authId: string,
  ) {
    return this.resetPasswordWithOtpFunction({
      username,
      otp: otp.toString(),
      newPassword,
      confirmPassword,
      authId,
    });
  }

  addExistingUser(username: string, accessType:'role'|'custom', access:{role?: string, propertiesAllowed?: string[]}) {
    return this.addExistingUserFunction({
      username,
      businessId: this.dataProvider.currentBusiness.businessId,
      accessType:accessType,
      currentUser: this.dataProvider.currentUser.username,
      ...access
    });
  }

  // verifyOtpExistingUser
  verifyOtpExistingUser(username: string, otp: string, authId: string) {
    return this.verifyOtpExistingUserFunction({
      username,
      otp: otp.toString(),
      authId,
    });
  }

  async authenticateAction(requiredProperties: string[]):Promise<{status:boolean,username:string}> {
    // console.log("Required props",requiredProperties);
    async function elevateAccess(){
      const dialog = this.dialog.open(RequiresPrivilegeComponent);
      dialog.disableClose = true;
      let userCredentials: any = await firstValueFrom(dialog.closed);
      // console.log('userCredentials', userCredentials);
      if (
        userCredentials &&
        userCredentials.username &&
        userCredentials.password
      ) {
        try {
          this.dataProvider.loading = true;
          let response = await this.authenticateActionFunction({
            username: userCredentials.username,
            password: userCredentials.password,
            businessId: this.dataProvider.currentBusiness.businessId,
            propertiesRequired: requiredProperties,
          });
          if (
            response.data &&
            response.data['status'] &&
            response.data['status'] == 'success'
          ) {
            this.alertify.presentToast('Access granted.');
            return {
              status:true,
              username:userCredentials.username
            };
          } else {
            this.alertify.presentToast(
              "You don't have access to this action.",
              'error',
            );
            return {
              status:false,
              username:userCredentials.username
            };
          }
        } catch (error) {
          this.alertify.presentToast(error.message, 'error');
          return {status:false,username: userCredentials.username};
        } finally {
          this.dataProvider.loading = false;
        }
      } else {
        this.alertify.presentToast(
          "You don't have access to this action.",
          'error',
        );
        return {status:false,username: userCredentials.username};
      }
    }

    if (this.dataProvider.currentBusinessUser.accessType == 'role'){
      // console.log("Local available props",this.dataProvider.defaultAccess[this.dataProvider.currentBusinessUser.role]);
      let allAllowed = requiredProperties.every((access)=>{
        if (this.dataProvider.currentBusinessUser.accessType == 'role' && this.dataProvider.defaultAccess[this.dataProvider.currentBusinessUser.role].includes(access)){
          return true;
        }
      })
      if(allAllowed){
        // console.log("Access granted.");
        return {
          status:true,
          username:this.dataProvider.currentUser.username
        };
      } else {
        // console.log("Elevation required");
        await elevateAccess.call(this);
      }
    } else if(this.dataProvider.currentBusinessUser.accessType=='custom') {
      // console.log("Local available props",this.dataProvider.currentBusinessUser.propertiesAllowed);
      let allAllowed = requiredProperties.every((access)=>{
        if (this.dataProvider.currentBusinessUser.accessType == 'custom' && this.dataProvider.currentBusinessUser.propertiesAllowed?.includes(access)){
          return true;
        }
      });
      if(allAllowed){
        // console.log("Access granted.");
        return {
          status:true,
          username:this.dataProvider.currentUser.username
        };
      } else {
        // console.log("Elevation required");
        await elevateAccess.call(this);
      }
    }
  }
}
