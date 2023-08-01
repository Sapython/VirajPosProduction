import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithCustomToken } from '@angular/fire/auth';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { Functions } from '@angular/fire/functions';
import { DataProvider } from '../provider/data-provider.service';
import { UserRecord } from '../../../types/user.structure';
import { AlertsAndNotificationsService } from '../alerts-and-notification/alerts-and-notifications.service';
import { ElectronService } from '../electron/electron.service';
import {
  generateDeviceId,
  setupDevice,
} from './shared/shared.auth';
import { UserManagementService } from './user/user-management.service';
import { LoginService } from './login/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  localUserId: string = '';
  localUserData: UserRecord | undefined;

  constructor(
    public auth: Auth,
    private dataProvider: DataProvider,
    private dbService: NgxIndexedDBService,
    private alertify: AlertsAndNotificationsService,
    public electronService: ElectronService,
    private functions: Functions,
    private userManagement: UserManagementService,
    private loginService: LoginService,
  ) {
    this.setupDevice();
    firstValueFrom(this.dbService.getByKey('business', 1))
      .then((localData: any) => {
        if (localData && localData['userId']) {
          localData = localData as {
            userId: string;
            businessId: string;
            access: string;
            email: string;
          };
          this.localUserId = localData.userId;
          this.userManagement.getUser(localData.userId).then((user) => {
            this.localUserData = user.data() as UserRecord;
            this.dataProvider.currentUser = user.data() as UserRecord;
          });
        } else {
          // console.log('Local login not found');
        }
      })
      .catch((err) => {
        //  console.log('Local login error', err);
      });
    onAuthStateChanged(this.auth, async (user) => {
      this.dataProvider.isAuthStateAvaliable = false;
      // console.log('this.localUserId', this.localUserId);
      if (user) {
        window.localStorage.setItem('signInToken', await user.getIdToken());
        if (user.uid == this.localUserId && this.localUserData) {
          this.dataProvider.loggedIn = true;
          this.dataProvider.currentFirebaseUser = user;
          this.dataProvider.userSubject.next({
            status: true,
            stage: 1,
            code: 'localUserFound',
            message: 'User found from local storage',
            user: this.localUserData,
          });
          this.dataProvider.isAuthStateAvaliable = true;
        } else {
          this.userManagement
            .getUser(user.uid)
            .then((userData) => {
              // this.dataProvider.currentUser = user.data() as UserRecord;
              this.dataProvider.loggedIn = true;
              // console.log('User found', userData.data());
              if (userData.exists() && userData.data()) {
                this.dataProvider.userSubject.next({
                  status: true,
                  stage: 2,
                  code: 'onlineUserFound',
                  message: 'User found from server',
                  user: userData.data() as UserRecord,
                });
                this.dataProvider.currentUser = userData.data() as UserRecord;
                this.dataProvider.isAuthStateAvaliable = true;
              } else {
                this.alertify.presentToast('User not found');
                this.dataProvider.userSubject.next({
                  status: false,
                  stage: 2,
                  code: 'noUserRecord',
                  message: 'User does not exists on server',
                });
                this.dataProvider.isAuthStateAvaliable = true;
              }
            })
            .catch((err) => {
              //  console.log('Getting current user Error', err);
            });
        }
      } else {
        console.log(
          'No auth state found, 9452',
          this.electronService.getAuth(),
        );
        let token = this.electronService.getAuth();
        if (token) {
          this.dataProvider.loading = true;
          try {
            await this.loginService.signInWithCustomToken(token);
          } catch (error) {
            this.alertify.presentToast('Error when signing in with token');
          } finally {
            this.dataProvider.loading = false;
          }
        }
        this.dataProvider.isAuthStateAvaliable = true;
        this.dataProvider.loggedIn = false;
        this.dataProvider.currentUser = undefined;
        this.dataProvider.userSubject.next({
          status: false,
          stage: 0,
          code: 'noUser',
          message: 'User not found',
        });
        //  console.log('No auth state found');
      }
    });
  }

  loginWithCustomToken(token: string) {
    window.localStorage.setItem('signInToken', token);
    this.electronService.setAuth(token);
    return signInWithCustomToken(this.auth, token);
  }

  private setupDevice = setupDevice;
  private generateDeviceId = generateDeviceId;
}
