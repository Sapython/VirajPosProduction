import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Dialog } from '@angular/cdk/dialog';
import { CheckPasswordComponent } from '../../check-password/check-password.component';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { AddComponent } from './add/add.component';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { Member } from '../../../../../types/user.structure';
import { UpdateComponent } from './update/update.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  checkUsernameFunction = httpsCallable(this.functions, 'userNameAvailable');
  constructor(
    public dataProvider: DataProvider,
    private functions: Functions,
    private dialog: Dialog,
    private settingsService: SettingsService,
    private alertify: AlertsAndNotificationsService,
    private menuManagementService: MenuManagementService,
  ) {}

  addAccount() {
    const dialog = this.dialog.open(AddComponent);
    dialog.disableClose = true;
    firstValueFrom(dialog.closed).then(async (res: any) => {
      if (res && res.username) {
        this.dataProvider.currentBusiness?.users.push({
          ...res,
          username: res.username,
          lastUpdated: Timestamp.now(),
          updatedBy: this.dataProvider.currentUser?.username || 'user',
        });
        try {
          await this.updateBusiness();
          this.alertify.presentToast('Account added successfully');
        } catch (error) {
          this.alertify.presentToast('Failed to add account', 'error');
        }
      } else if (res && res.cancelled) {
        this.alertify.presentToast('Account not added', 'error');
      }
    });
  }

  async updateBusiness() {
    // this.dataProvider.currentBusiness?.users.forEach((user)=>{
    // })
    for (const user of this.dataProvider.currentBusiness?.users) {
      if (user.new) {
        let res = await this.checkUsernameFunction({ username: user.username });
        if (res.data['stage'] == 'available') {
          let password = await this.dialog.open(CheckPasswordComponent);
          if (password) {
          }
        }
        // delete user.new
      }
    }
    setTimeout(() => {
      if (this.dataProvider.currentBusiness) {
        this.settingsService.updateBusiness(this.dataProvider.currentBusiness);
      }
    }, 700);
  }

  async deleteAccount(index: number) {
    if (
      await this.dataProvider.confirm(
        'Are you sure you want to delete account ?',
        [1],
      )
    ) {
      // alert("delete account")
      this.dataProvider.currentBusiness?.users.splice(index, 1);
      setTimeout(() => {
        if (this.dataProvider.currentBusiness) {
          this.settingsService.updateBusiness(
            this.dataProvider.currentBusiness,
          );
        }
      }, 700);
    }
  }

  async deleteUser(user:Member){
    if (this.dataProvider.currentBusiness && await this.dataProvider.confirm('Are you sure you want to delete account ?',[1])){
      let foundUserIndex = this.dataProvider.currentBusiness.users.findIndex((usr)=>user.username==usr.username);
      if (foundUserIndex){
        this.dataProvider.currentBusiness.users.splice(foundUserIndex,1);
        this.settingsService.updateBusiness(this.dataProvider.currentBusiness);
      }
    }
  }

  updateUser(user:Member){
    const dialog = this.dialog.open(UpdateComponent,{data:user});
    firstValueFrom(dialog.closed).then(async (res: any) => {
      if (res){
        console.log("res",res);
        let foundUserIndex = this.dataProvider.currentBusiness.users.findIndex((usr)=>user.username==usr.username);
        if (foundUserIndex){
          this.dataProvider.currentBusiness.users[foundUserIndex] = {
            ...user,
           ...res,
           lastUpdated: Timestamp.now(),
           updatedBy: this.dataProvider.currentUser?.username || 'user',
         };
         console.log("this.dataProvider.currentBusiness.users[foundUserIndex]",this.dataProvider.currentBusiness);
         this.settingsService.updateBusiness(this.dataProvider.currentBusiness);
        }
      }
    });
  }
}
