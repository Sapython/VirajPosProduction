import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
  setDoc,
  getDoc,
  Firestore,
} from '@angular/fire/firestore';
import { Functions, httpsCallableFromURL } from '@angular/fire/functions';
import {
  BusinessRecord,
  UserBusiness,
  UserRecord,
  AdditonalClaims,
} from '../../../../types/user.structure';
import { DataProvider } from '../../provider/data-provider.service';
import { LoginService } from '../login/login.service';

var debug = true;

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  // updateUserFactors = httpsCallableFromURL(
  //   this.functions,
  //   'updateUser'
  // );
  signUpWithUserAndPasswordFunction = httpsCallableFromURL(
    this.functions,
    'https://signupwithuserandpassword-3mazqb66kq-el.a.run.app',
  );

  constructor(
    private functions: Functions,
    private auth: Auth,
    private firestore: Firestore,
    private dataProvider: DataProvider,
    private loginService: LoginService,
  ) {}

  async createAccount(
    email: string,
    password: string,
    business: BusinessRecord,
  ) {
    let res = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.signUpUser(res.user, business);
    return res;
  }

  addBusinessAccount(userCred: UserCredential, userBusiness: UserBusiness) {
    return updateDoc(doc(this.firestore, 'users/' + userCred.user.uid), {
      business: arrayUnion(userBusiness),
    });
  }

  signUpUser(user: User, business: BusinessRecord) {
    let userRecord: UserRecord = {
      business: [
        {
          access: {
            accessType:'role',
            role: 'admin',
            lastUpdated: Timestamp.now(),
            updatedBy: 'controller',
          },
          address: business.address,
          city:business.city,
          state:business.state,
          name: business.hotelName,
          businessId: business.businessId,
          joiningDate: Timestamp.now(),
        },
      ],
      lastLogin: Timestamp.now(),
      username: user.uid,
      email: user.email,
    };
    return setDoc(doc(this.firestore, 'users/' + user.uid), userRecord);
  }

  async signUpWithUserAndPassword(
    username: string,
    password: string,
    params: {
      business: {
        access:
          | {
              accessType: 'role';
              role: string;
              lastUpdated: Timestamp;
              updatedBy: string;
            }
          | {
              accessType: 'custom';
              propertiesAllowed: string[];
              lastUpdated: Timestamp;
              updatedBy: string;
            };
        address: string;
        state:any;
        city:string;
        businessId: string;
        joiningDate: Timestamp;
        name: string;
      };
      email: string;
      phone?: string;
      image?: string;
      noSignIn?: boolean;
    },
  ) {
    this.dataProvider.loading = true;
    try {
      if (
        typeof username != 'string' ||
        !username ||
        username.length < 4 ||
        username.length > 20
      ) {
        throw new Error('Username must be between 4 and 20 characters');
      }
      if (
        typeof password != 'string' ||
        !password ||
        password.length < 4 ||
        password.length > 20
      ) {
        throw new Error('Password must be between 8 and 20 characters');
      }
      // check if userId exists
      let uidDoc = await getDoc(doc(this.firestore, 'users/' + username));
      if (uidDoc.exists()) {
        throw new Error('Username already exists');
      }
      // check for fields {business,email (optional), image (optional), phone (optional), username}
      if (!username || !password) {
        throw new Error('Missing fields. Username and password are required');
        // return { error: 'Missing fields' }
      }
      if (!params.business) {
        // return { error: 'Missing fields' }
        throw new Error('Missing fields. Business is required');
      }
      let additonalClaims: AdditonalClaims = {
        business: [],
        providerId: 'custom',
      };
      if (params.email) {
        if (typeof params.email !== 'string' || !params.email.includes('@')) {
          throw new Error('Email is invalid');
        }
        additonalClaims['email'] = params.email;
      }
      if (params.image) {
        if (
          typeof params.image !== 'string' ||
          !params.image.includes('http')
        ) {
          throw new Error('Image url is invalid');
        }
        additonalClaims['image'] = params.image;
      }
      if (params.phone) {
        if (typeof params.phone !== 'string' || params.phone.length !== 10) {
          throw new Error('Phone number is invalid');
        }
        additonalClaims['phone'] = params.phone;
      }
      if (params.business) {
        if (
          typeof params.business !== 'object' ||
          !params.business.access ||
          !params.business.address ||
          !params.business.businessId ||
          !params.business.joiningDate ||
          !params.business.name
        ) {
          throw new Error('Business is invalid');
        }
        additonalClaims['business'] = [params.business];
      } else {
        throw new Error('Business is required');
      }
      // create user
      let data = {
        username,
        password,
        email: params.email,
        phone: params.phone,
        image: params.image,
        business: params.business,
        providerId: 'custom',
      };
      let signUpRequest = await this.signUpWithUserAndPasswordFunction(data);
      if (signUpRequest.data['token']) {
        if (params.noSignIn) {
          return data;
        } else {
          let newSignupData = await this.loginService.signInWithCustomToken(
            signUpRequest.data['token'],
          );
          if (debug) console.log('newSignupData', newSignupData);
          return newSignupData;
        }
      } else {
        if (signUpRequest.data['error']) {
          throw new Error(signUpRequest.data['error']);
        } else {
          throw new Error('Something went wrong');
        }
      }
    } catch (error) {
      //  console.log(error);
      throw error;
    } finally {
      this.dataProvider.loading = false;
    }
  }
}
