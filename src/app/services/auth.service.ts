import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithCredential, signInWithCustomToken, signOut, User, UserCredential } from '@angular/fire/auth';
import { arrayUnion, collection, Firestore, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { doc, getDoc, Timestamp } from '@firebase/firestore';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, take } from 'rxjs';
import { Device } from "../biller/Device";
import { DataProvider } from '../provider/data-provider.service';
import { BusinessRecord, UserBusiness, UserRecord } from '../structures/user.structure';
import { AlertsAndNotificationsService } from './alerts-and-notification/alerts-and-notifications.service';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  localUserId: string = '';
  localUserData: UserRecord | undefined;
  constructor(
    private auth: Auth,
    private dataProvider: DataProvider,
    private dbService: NgxIndexedDBService,
    private fs: Firestore,
    private router:Router,
    private alertify: AlertsAndNotificationsService,
    private electronService:ElectronService
  ) {
    this.setupDevice()
    firstValueFrom(this.dbService.getByKey('business', 1)).then(
      (localData: any) => {
        if (localData && localData['userId']) {
          localData = localData as {
            userId: string;
            businessId: string;
            access: string;
            email: string;
          };
          this.localUserId = localData.userId;
          // console.log('Local login found', localData);
          this.getUser(localData.userId).then((user) => {
            this.localUserData = user.data() as UserRecord;
            this.dataProvider.currentUser = user.data() as UserRecord;
          });
        } else {
          console.log('Local login not found');
        }
      }
    ).catch((err)=>{
      console.log("Local login error",err);
    });
    onAuthStateChanged(this.auth, async (user) => {
      this.dataProvider.isAuthStateAvaliable = false;
      // console.log('this.localUserId', this.localUserId);
      if (user) {
        window.localStorage.setItem('signInToken',await user.getIdToken())
        if (user.uid == this.localUserId && this.localUserData) {
          this.dataProvider.loggedIn = true;
          this.dataProvider.currentFirebaseUser = user;
          this.dataProvider.userSubject.next({
            status: true,
            stage:1,
            code:'localUserFound',
            message: 'User found from local storage',
            user:this.localUserData
          })
          this.dataProvider.isAuthStateAvaliable = true;
        } else {
          this.getUser(user.uid).then((userData) => {
            // this.dataProvider.currentUser = user.data() as UserRecord;
            this.dataProvider.loggedIn = true;
            // console.log('User found', userData.data());
            if (userData.exists() && userData.data()) {
              this.dataProvider.userSubject.next({
                status: true,
                stage:2,
                code:'onlineUserFound',
                message: 'User found from server',
                user:userData.data() as UserRecord
              })
              this.dataProvider.currentUser = userData.data() as UserRecord;
              this.addCurrentUserOnLocal(userData.data() as UserRecord);
              this.dataProvider.isAuthStateAvaliable = true;
            } else {
              this.alertify.presentToast('User not found');
              this.dataProvider.userSubject.next({
                status: false,
                stage:2,
                code:'noUserRecord',
                message: 'User does not exists on server',
              })
              this.dataProvider.isAuthStateAvaliable = true;
              // this.signUpUser(user);
              // signOut(this.auth);
              // signUp the user
            }
          }).catch((err)=>{
            console.log("Getting current user Error",err);
          });
        }
        // console.log('Auth state found', user);
        // this.checkbusiness('1').then((deviceLoginStatus)=>{
        //   console.log("deviceLoginStatus",deviceLoginStatus);
        //   if (deviceLoginStatus){
        //     console.log("Local login found");
        //   } else {

        //     console.log("Local login not found");
        //   }
        // })
      } else {
        console.log('No auth state found, 9452',this.electronService.getAuth());
        let token = this.electronService.getAuth();
        if (token){
          this.dataProvider.loading = true;
          try {
            this.signInWithCustomToken(token);
          } catch (error) {
            this.alertify.presentToast("Error when signing in with token");
          } finally {
            this.dataProvider.loading = false;
          }
        }
        // alert("No user");
        // if (window.localStorage.getItem('signInToken')){
        //   // alert("Has local user");
        //   try{
            // await signInWithCustomToken(this.auth,window.localStorage.getItem('signInToken'));
        //   } catch (e){
            // console.log("LOCAL SIGN IN ERROR",e);
            // alert("Error when signing local")
        //   }
        // }
        this.dataProvider.isAuthStateAvaliable = true;
        this.dataProvider.loggedIn = false;
        this.dataProvider.currentUser = undefined;
        this.dataProvider.userSubject.next({
          status: false,
          stage:0,
          code:'noUser',
          message: 'User not found',
        })
        console.log('No auth state found');
      }
    });
  }

  setupDevice() {
    // check if there is a device in indexedDB if yes then return it else create a new one and return it
    firstValueFrom(this.dbService.getAll('device')).then(
      (data: any) => {
        console.log('success', data);
        if (data && data.length > 0) {
          console.log('Device found', data);
          this.dataProvider.currentDevice = {
            id: data[0].deviceId,
            lastLogin: Timestamp.now(),
          };
        } else {
          let id = this.generateDeviceId().toString();
          firstValueFrom(
            this.dbService.add('device', {
              deviceId: id,
            })
          ).catch((err) => {
            console.log('Error', err);
            let id = this.generateDeviceId().toString();
          });
          this.dataProvider.currentDevice = {
            id: id,
            lastLogin: Timestamp.now(),
          };
        }
      }
    ).catch((err)=>{
      console.log("Error",err);
    });

  }

  generateDeviceId(){
    return Math.floor(Math.random()*100000000000000000);
  }

  getUser(uid: string) {
    return getDoc(doc(this.fs, 'users/' + uid));
  }

  signInWithCustomToken(token: string) {
    window.localStorage.setItem('signInToken',token)
    this.electronService.setAuth(token);
    return signInWithCustomToken(this.auth,token)
  }

  addCurrentUserOnLocal(user: UserRecord) {
    // this.dbService
    //   .add('business', {
    //     userId: user.userId,
    //     businessId: user.business[0],
    //     access: user.business[0].access.accessLevel,
    //     email: user.email,
    //   })
    //   .subscribe((res) => {
    //     console.log('Added for local login', res);
    //   });
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

  logout(){
    signOut(this.auth);
    // clear local storage
    localStorage.clear();
    indexedDB.deleteDatabase('Viraj')
    this.router.navigateByUrl('/login');
  }

  loginWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async createAccount(email: string, password: string,business:BusinessRecord) {
    let res = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.signUpUser(res.user,business);
    return res;
  }

  addBusinessAccount(user: UserCredential, userBusiness: UserBusiness) {
    return updateDoc(doc(this.fs, 'users/' + user.user.uid), {
      business: arrayUnion(userBusiness),
    })
  }

  userExists(email: string) {
    return getDocs(query(collection(this.fs, 'users'), where('email', '==', email)));
  }

  signUpUser(user:User,business:BusinessRecord){
    let userRecord:UserRecord = {
      business:[{
        access:{
          accessLevel:'admin',
          lastUpdated:Timestamp.now(),
          updatedBy:'controller'
        },
        address:business.address,
        name:business.hotelName,
        businessId:business.businessId,
        joiningDate:Timestamp.now()
      }],
      email:user.email || '',
      image:user.photoURL || '',
      name:user.displayName || '',
      lastLogin:Timestamp.now(),
      username:user.uid
    }
    return setDoc(doc(this.fs,'users/'+user.uid),userRecord)
  }
}
