import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { getDoc, doc, Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { AlertsAndNotificationsService } from '../../alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { ElectronService } from '../../electron/electron.service';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  resetPasswordFunction = httpsCallable(this.functions, 'resetPassword');
  constructor(
    private firestore: Firestore,
    private dbService: NgxIndexedDBService,
    private auth: Auth,
    private router: Router,
    private functions: Functions,
    private alertify: AlertsAndNotificationsService,
    private dataProvider: DataProvider,
    private dialog:Dialog,
    private electronService:ElectronService
  ) {}
  getUser(uid: string) {
    return getDoc(doc(this.firestore, 'users/' + uid));
  }

  async checkbusiness(
    userId: string
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
      console.log('UserId', res);
      if (res['userId'] == userId) {
        return res;
      } else {
        this.dbService.deleteByKey('business', 1).subscribe((res) => {
          console.log('Deleted', res);
        });
        return false;
      }
    } else {
      return false;
    }
  }

  logout() {
    signOut(this.auth);
    // clear local storage
    this.electronService.clearAuth();
    localStorage.clear();
    indexedDB.deleteDatabase('Viraj');
    this.router.navigateByUrl('/login');
  }

  userExists(username: string) {
    return getDoc(doc(this.firestore, 'users/' + username));
  }

  async resetPassword(previousPassword:string,newPassword:string,confirmPassword:string){
    // validate passwords for null, less than 8 chars, must be alphanumeric, must match
    // if valid, call resetPasswordFunction
    // if invalid, return error message
    try {
      if (!(isNaN(Number(previousPassword)) && isNaN(Number(newPassword)) && isNaN(Number(confirmPassword)))){
        throw Error("Only numbers are not allowed.")
      }
      if (previousPassword == null || newPassword == null || confirmPassword == null){
        throw Error("All fields must be filled out.")
      }
      if (previousPassword.length < 8 || newPassword.length < 8 || confirmPassword.length < 8){
        throw Error("All passwords must be at least 8 characters.")
      }
      if (newPassword != confirmPassword){
        throw Error("New password and confirm password must match.")
      }
    } catch (error) {
      throw error || Error("Invalid details.");
    }
    try {
      this.dataProvider.loading = true;
      let resetPasswordRes = await this.resetPasswordFunction({previousPassword,newPassword,confirmPassword,uid:this.dataProvider.currentUser.username});
      console.log("resetPasswordRes",resetPasswordRes);
      if (resetPasswordRes){
        this.alertify.presentToast("Password reset successfully.");
        await this.dataProvider.confirm("Password reset successfully. Please login again.",[0],{buttons:["Ok"],primary:[0]});
        this.dialog.closeAll();
        this.logout();
        this.router.navigateByUrl("/login");
      }
    } catch (error) {
      console.log("resetPasswordError error res",error);
      throw error;
    } finally {
      this.dataProvider.loading = false;
    }
  }
}
