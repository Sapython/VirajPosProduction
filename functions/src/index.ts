import * as functions from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v1/https';
import {
  validatePassword,
  validateEmail,
  validateName,
  validatePhone,
  validateImage,
  validateBusiness,
  validateAny,
} from './helpers';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
var debug: boolean = true;
var admin: any;
var Mailjet;
var getAuth: any;
var mailjet: any;
let app: any;
let auth: any;
let firestore: Firestore;
let getFirestore: any;
var generateHashedPassword: any;
var verifyPassword: any;
import { generateAnalytics } from './analytics';
function initAdmin() {
  if (admin) return;
  admin = require('firebase-admin');
}
function initApp() {
  const initApp = require('firebase-admin/app');
  app = initApp.initializeApp({
    credential: admin.credential.cert(
      'fbms-shreeva-demo-firebase-adminsdk-8nk63-28663566a0.json'
    ),
  });
}
function initFirestore() {
  let firestoreImport = require('firebase-admin/firestore');
  getFirestore = firestoreImport.getFirestore;
  if (!admin) initAdmin();
  if (!app) initApp();
  if (firestore) return;
  firestore = getFirestore(app);
}
function initAuth() {
  if (!admin) initAdmin();
  if (!app) initApp();
  if (auth) return;
  getAuth = require('firebase-admin/auth').getAuth;
  auth = getAuth(app);
}
function initMailJet() {
  Mailjet = require('node-mailjet');
  mailjet = new Mailjet({
    apiKey: '135bbf04888dd455863f5e2a4d15ac2f',
    apiSecret: 'a2ae82fc0885ae701311acf96c139a3f',
  });
}
function privateGenerateHashedPassword(password: string, uid: string) {
  if (!generateHashedPassword)
    generateHashedPassword = require('./authHelpers').generateHashedPassword;
  return generateHashedPassword(password, uid);
}
function privateVerifyPassword(
  password: string,
  hashedPassword: string,
  uid: string
) {
  if (!verifyPassword) verifyPassword = require('./authHelpers').verifyPassword;
  return verifyPassword(password, hashedPassword, uid);
}
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const userNameAvailable = functions.https.onCall(
  async (request, response) => {
    initFirestore();
    if (debug) console.log('request', request);
    validateName(request.username);
    try {
      let doc = await firestore.doc('users/' + request.username).get();
      if (doc.exists) {
        return { stage: 'unavailable' };
      } else {
        return { stage: 'available' };
      }
    } catch (error) {
      return { stage: 'invalid' };
    }
  }
);

export const signUpWithUserAndPassword = functions.https.onCall(
  async (request, response) => {
    initAuth();
    initFirestore();
    if (debug) console.log('request data', request);
    // check all the types of variables used
    // validations for all the fields
    if (!request.username || !request.password) {
      throw new HttpsError(
        'invalid-argument',
        'Missing fields. Username and password are required'
      );
      // return { error: 'Missing fields' }
    }
    try {
      validateName(request.username);
      validatePassword(request.password);
      validateEmail(request.email);
    } catch (error) {
      return error;
    }
    // check if userId exists
    let uidDoc = await firestore.doc('users/' + request.username).get();
    if (uidDoc.exists) {
      throw new HttpsError('already-exists', 'Username already exists');
    }
    // check for fields {business,email (optional), image (optional), phone (optional), username}
    let additionalClaims: AdditionalClaims = {
      business: [],
      providerId: 'custom',
    };
    if (request.email && validateEmail(request.email)) {
      additionalClaims['email'] = request.email;
    }
    if (request.image && validateImage(request.image)) {
      additionalClaims['image'] = request.image;
    }
    if (request.phone && validatePhone(request.phone)) {
      additionalClaims['phone'] = request.phone;
    }
    if (request.business && validateBusiness(request.business)) {
      console.log('request.business.joiningDate', request.business.joiningDate);
      // request.business.joiningDate.nanoseconds, request.business.joiningDate.seconds
      request.business.joiningDate = new Timestamp(
        request.business.joiningDate.seconds,
        request.business.joiningDate.nanoseconds
      );
      request.business.access.lastUpdated = new Timestamp(
        request.business.access.lastUpdated.seconds,
        request.business.access.lastUpdated.nanoseconds
      );
      additionalClaims['business'] = [request.business];
    } else {
      throw new HttpsError('invalid-argument', 'Business is required');
    }
    // validations done
    //  console.log('validations done');
    // get password
    let hashedPassword = await privateGenerateHashedPassword(
      request.password,
      uidDoc.id
    );
    console.log('hashedPassword', hashedPassword);
    let authReq = await auth.createCustomToken(uidDoc.id, {
      username: uidDoc.id,
      ...additionalClaims,
    });
    let userCreds: any = {
      password: hashedPassword,
    };
    if (request.email) {
      userCreds['email'] = request.email;
    }
    if (request.phone) {
      if (!request.phone.startsWith('+91')) {
        request.phone = '+91' + request.phone;
      }
      userCreds['phoneNumber'] = request.phone;
    }
    // create user
    try {
      await auth.createUser({
        uid: uidDoc.id,
        displayName: uidDoc.id,
        photoURL:
          request.image ||
          'https://api.dicebear.com/6.x/lorelei/svg?seed=' + uidDoc.id,
        emailVerified: false,
        disabled: false,
        ...userCreds,
      });
    } catch (error) {
      return error;
    }
    if (debug) console.log('created custom token');
    if (debug) console.log('trying updating email', request.email);

    additionalClaims['providerId'] = 'custom';
    if (debug) console.log('updated custom token');
    // store username and password hash in firestore
    await firestore.doc('authData/' + uidDoc.id).set({
      username: uidDoc.id,
      password: hashedPassword,
      ...additionalClaims,
    });
    await firestore.doc('users/' + uidDoc.id).set(
      {
        username: uidDoc.id,
        ...additionalClaims,
      },
      { merge: true }
    );
    if (debug) console.log('created firestore document');
    // sign in with custom token
    return {
      token: authReq,
      uid: uidDoc.id,
      ...additionalClaims,
      loginTime: Timestamp.now(),
    };
  }
);

export const signInWithUserAndPassword = functions.https.onCall(
  async (request, response) => {
    initAuth();
    initFirestore();
    // check for fields {username,password}
    validateName(request.username);
    validatePassword(request.password);
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    if (
      await privateVerifyPassword(
        request.password,
        uidDoc.data()?.password,
        uidDoc.id
      )
    ) {
      // create custom token
      let authReq = await auth.createCustomToken(uidDoc.id, uidDoc.data());
      // sign in with custom token
      return { token: authReq, uid: uidDoc.id, ...uidDoc.data() };
    } else {
      throw new HttpsError('unauthenticated', 'Password incorrect');
    }
  }
);

export const resetPassword = functions.https.onCall(
  async (request, response) => {
    initAuth();
    initFirestore();
    if (debug) console.log('REQUEST ', request);
    const previousPassword = request.previousPassword;
    const newPassword = request.newPassword;
    const confirmPassword = request.confirmPassword;
    const uid = request.uid;
    validatePassword(previousPassword);
    validatePassword(newPassword);
    validatePassword(confirmPassword);
    if (newPassword !== confirmPassword) {
      throw new HttpsError('invalid-argument', 'Passwords do not match');
    }
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + uid).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // get password
    if (
      await privateVerifyPassword(
        previousPassword,
        uidDoc.data()?.password,
        uidDoc.id
      )
    ) {
      // set new password
      const hashedPassword = await privateGenerateHashedPassword(
        newPassword,
        uidDoc.id
      );
      // update user
      await auth.updateUser(uid, {
        password: newPassword,
      });
      // update password
      await firestore.doc('authData/' + uid).update({
        password: hashedPassword,
      });
      let additonalClaims: AdditionalClaims = {
        business: uidDoc.data()?.business,
        providerId: uidDoc.data()?.providerId,
      };
      let userData = {
        username: uidDoc.id,
        imageUrl:
          uidDoc.data()!['imageUrl'] ||
          'https://api.dicebear.com/6.x/lorelei/svg?seed=' + request.username,
        ...additonalClaims,
      };
      // create custom token
      let authReq = await auth.createCustomToken(uidDoc.id);
      // sign in with custom token
      return { token: authReq, uid: uidDoc.id, ...userData };
    } else {
      throw new HttpsError('unauthenticated', 'Password incorrect');
    }
  }
);

export const checkPassword = functions.https.onCall(
  async (request, response) => {
    initFirestore();
    let uid = request.uid;
    let password = request.password;
    //  console.log('uid', uid);
    validatePassword(password);
    validateName(uid);
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + uid).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    if (
      await privateVerifyPassword(password, uidDoc.data()?.password, uidDoc.id)
    ) {
      return { status: 'success', correct: true };
    } else {
      throw new HttpsError('unauthenticated', 'Password incorrect');
    }
  }
);

export const resetPasswordMail = functions.https.onCall(
  async (request, response) => {
    initAuth();
    initFirestore();
    initMailJet();
    console.log('REQUEST ', request);
    // validate business, username, email
    validateName(request.username);
    // check if username exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists || !uidDoc.data()?.email) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // generate otp
    let generatedOtp = generateOtp();
    try {
      var user = await auth.getUserByEmail(request.email);
      // fetch a user with the given email
      // check if the user exists
      if (!user) {
        throw new HttpsError('not-found', 'User not found');
      }
      console.log('GOT USER ', user);
      let generateOtpRequest = await firestore
        .collection('otps')
        .add({ otp: generatedOtp });
      let res = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'create@shreeva.com',
              Name: 'Viraj Hospitality',
            },
            To: [
              {
                Email: uidDoc.data()?.email,
                Name: request.username,
              },
            ],
            Subject: 'Otp for resetting the password of account.',
            TextPart: `Dear ${request.username}, ${generatedOtp} is the otp for resetting the password of account ${request.username} on Viraj Hospitality. Please do not share this otp with anyone. This email is sent to you because of ${request.email} is registered as email with this account.`,
            HtmlPart: `Dear ${request.username}, <strong>${generatedOtp}</strong> is the otp for resetting the password of account <strong>${request.username}</strong> on Viraj Hospitality. Please do not share this otp with anyone. This email is sent to you because of ${request.email} is registered as email with this account.`,
          },
        ],
      });
      console.log('Sent mail', res.body);
      return { status: 'success', authId: generateOtpRequest.id };
    } catch (error: any) {
      console.log(error);
      if (error.codePrefix === 'auth') {
        if (error.errorInfo.code == 'auth/user-not-found') {
          throw new HttpsError('not-found', 'User not found');
        }
      }
      return { message: 'Some error occurred', error: error };
    }
  }
);

export const verifyResetPasswordOtp = functions.https.onCall(
  async (request, response) => {
    initAuth();
    initFirestore();
    console.log('Request', request);
    // available params are
    // {
    //    username: 'sapython',
    //    otp: '765727',
    //    newPassword: 'shreeva@2022',
    //    confirmPassword: 'shreeva@2022',
    //    authId: 'zYYtDSX7HevaFmCM31d5'
    //  }
    // validate authId
    if (!request.authId) {
      throw new HttpsError(
        'invalid-argument',
        'Missing fields. AuthId is required'
      );
    }
    // validate passwords
    validatePassword(request.newPassword);
    validatePassword(request.confirmPassword);
    validateName(request.username);
    // check if passwords match
    if (request.newPassword !== request.confirmPassword) {
      throw new HttpsError('invalid-argument', 'Passwords do not match');
    }

    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // validate otp
    let otpDoc = await firestore.collection('otps').doc(request.authId).get();
    if (!otpDoc.exists) {
      throw new HttpsError('not-found', 'Otp not found');
    }
    console.log('Checking OTP:', otpDoc.data()?.otp, request.otp);
    let correctOtp = otpDoc.data()?.otp.toString().trim();
    let userOtp = request.otp.toString().trim();
    if (correctOtp !== userOtp) {
      throw new HttpsError('unauthenticated', 'Otp incorrect');
    }
    // delete otp
    await firestore.collection('otps').doc(request.authId).delete();
    // reset password
    let hashedPassword = await privateGenerateHashedPassword(
      request.newPassword,
      uidDoc.id
    );
    // update user
    await auth.updateUser(uidDoc.id, {
      password: request.password,
    });
    // update password
    await firestore.doc('authData/' + uidDoc.id).update({
      password: hashedPassword,
    });
    // sign in with custom token
    return { status: 'success', message: 'Password reset successfully' };
  }
);

// export const editUser = functions.https.onCall(async (request, response) => {
//   // this function will allow either admins to edit users or users to edit themselves
//   // available params are
//   let params = {

//   }
// });

export const addExistingUser = functions.https.onCall(
  async (request, response) => {
    initMailJet();
    initFirestore();
    if (debug) console.log('REQUEST ', request);
    validateName(request.username);
    validateAny(request.businessId, 'string');
    validateAny(request.accessType, 'string');
    validateAny(request.currentUser, 'string');
    // get user doc and verofy if the user exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // validate business
    let businessDoc = await firestore
      .doc('business/' + request.businessId)
      .get();
    if (!businessDoc.exists) {
      throw new HttpsError('not-found', 'Business not found');
    }
    // check if the user is already in the business
    let userFound = false;
    for (let business of uidDoc.data()?.business) {
      if (business.businessId === request.businessId) {
        userFound = true;
        break;
      }
    }
    if (userFound) {
      throw new HttpsError(
        'already-exists',
        'User is already present in the business'
      );
    }
    // check if the user has email
    if (!uidDoc.data()?.email) {
      throw new HttpsError('invalid-argument', 'User does not have email');
    }
    if (request.accessType == 'role') {
      if (
        !['manager', 'waiter', 'accountant', 'admin'].includes(
          request.accessLevel
        )
      ) {
        throw new HttpsError('invalid-argument', 'Invalid access level');
      }
    } else if (request.accessType == 'custom') {
      if (!request.propertiesAllowed || request.propertiesAllowed.length == 0) {
        throw new HttpsError('invalid-argument', 'Invalid properties allowed');
      }
    } else {
      throw new HttpsError('invalid-argument', 'Invalid access type');
    }
    // send an otp to the user email
    let generatedOtp = generateOtp();
    let data: any = {
      otp: generatedOtp,
      businessId: request.businessId,
      accessType: request.accessType,
      username: request.username,
      currentUser: request.currentUser,
    };
    if (request.accessType == 'custom') {
      data['propertiesAllowed'] = request.propertiesAllowed;
    } else {
      data['role'] = request.accessLevel;
    }
    try {
      let optDocument = await firestore.collection('otps').add(data);
      let res = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'create@shreeva.com',
              Name: 'Shreeva Soft-Tech Innovations',
            },
            To: [
              {
                Email: uidDoc.data()?.email,
                Name: request.username,
              },
            ],
            Subject: `Otp for adding your account to Viraj Hospitality.`,
            TextPart: `Dear ${
              request.username
            }, ${generatedOtp} is the otp for adding your account ${
              request.username
            } to ${
              businessDoc.data()!['hotelName']
            }. Please do not share this otp with anyone. This email is sent to you because of ${
              uidDoc.data()?.email
            } is registered as email with this account.`,
            HtmlPart: `Dear ${
              request.username
            }, <strong>${generatedOtp}</strong> is the otp for adding your account <strong>${
              request.username
            }</strong> to ${
              businessDoc.data()!['hotelName']
            }. Please do not share this otp with anyone. This email is sent to you because of ${
              uidDoc.data()?.email
            } is registered as email with this account.`,
          },
        ],
      });
      let maskedEmail = uidDoc
        .data()
        ?.email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
      console.log('Sent mail', res.body);
      return {
        status: 'success',
        message: `OTP sent to the email account associated with ${request.username} ending in ${maskedEmail}`,
        authId: optDocument.id,
      };
    } catch (error: any) {
      console.log(error);
      return { message: 'Some error occurred' };
    }
  }
);

export const verifyOtpExistingUser = functions.https.onCall(
  async (request, response) => {
    // available params are
    // {
    //    username: 'sapython',
    //    otp: '765727',
    //    businessId: 'zYYtDSX7HevaFmCM31d5'
    //  }
    // validate authId
    initFirestore();
    initAdmin();
    if (debug) console.log('REQUEST ', request);

    if (!request.authId) {
      throw new HttpsError(
        'invalid-argument',
        'Missing fields. AuthId is required'
      );
    }
    // validate otp
    let otpDoc = await firestore.collection('otps').doc(request.authId).get();
    if (!otpDoc.exists) {
      throw new HttpsError('not-found', 'Otp not found');
    }
    console.log('Checking OTP:', otpDoc.data()?.otp, request.otp);
    let correctOtp = otpDoc.data()?.otp.toString().trim();
    let userOtp = request.otp.toString().trim();
    let businessId = otpDoc.data()?.businessId;
    let updateUser = otpDoc.data()?.currentUser;
    let accessType = otpDoc.data()?.accessType;
    let username = otpDoc.data()?.username;
    if (username !== request.username) {
      throw new HttpsError('invalid-argument', 'Username does not match');
    }
    if (correctOtp !== userOtp) {
      throw new HttpsError('unauthenticated', 'Otp incorrect');
    }
    // delete otp
    await firestore.collection('otps').doc(request.authId).delete();
    // add user to business
    let newUserData: any = {
      lastUpdated: Timestamp.now(),
      updatedBy: updateUser,
      username: username,
      accessType: accessType,
    };
    if (accessType == 'role') {
      newUserData['role'] = otpDoc.data()?.role;
    } else if (accessType == 'custom') {
      newUserData['propertiesAllowed'] = otpDoc.data()?.propertiesAllowed;
    }
    await firestore.doc('business/' + businessId).update({
      users: admin.firestore.FieldValue.arrayUnion(newUserData),
    });
    // sign in with custom token
    return { status: 'success', message: 'User approved successfully' };
  }
);

export const authenticateAction = functions.https.onCall(
  async (request, response) => {
    initFirestore();
    // in this function we get username and password whe have to check of they are correct and return true else return false
    // check for fields {username,password}
    validateName(request.username);
    validatePassword(request.password);
    validateAny(request.businessId, 'string');
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // check if the user is in the business
    let businessDoc = await firestore
      .doc('business/' + request.businessId)
      .get();
    let foundUser: any = undefined;
    for (let user of businessDoc.data()?.users) {
      if (user.username === request.username) {
        foundUser = user;
        break;
      }
    }
    if (!foundUser) {
      throw new HttpsError('permission-denied', 'User is not in your business');
    }
    let authorized = await privateVerifyPassword(
      request.password,
      uidDoc.data()?.password,
      uidDoc.id
    );
    if (authorized) {
      return {
        status: 'success',
        authorized: true,
        access: foundUser['access'],
      };
    } else {
      throw new HttpsError('unauthenticated', 'Password incorrect');
    }
  }
);

export const calculateLoyaltyPoints = functions.https.onCall(
  async (request, response) => {
    initFirestore();
    // here we will get billId, businessId, userId, and then we have to set the loyalty point upon that bill.
    if (debug) console.log(request);
    const billId: string = request.billId;
    const businessId: string = request.businessId;
    const userId: string = request.userId;
    // check if the user is available in the business
    let businessData = await firestore.doc(`business/${businessId}`).get();
    if (businessData.exists && businessData.data()) {
      if (
        businessData.data()!['users'] &&
        typeof businessData.data()!['users'] == 'object'
      ) {
        let userFound = false;
        businessData.data()!['users'].forEach((user: { username: string }) => {
          if (user.username == userId) {
            userFound = true;
          }
        });
        if (!userFound) {
          throw new HttpsError(
            'aborted',
            'User not found in the current business.'
          );
        }
      } else {
        throw new HttpsError(
          'aborted',
          'No users available in th current business'
        );
      }
    } else {
      throw new HttpsError('aborted', 'Business not found.');
    }
    // fetch the bill from firestore
    const billReference = firestore.doc(
      `business/${businessId}/bills/${billId}`
    );
    const bill = await billReference.get();
    const billData = bill.data();
    if (
      bill.exists &&
      billData &&
      billData['stage'] == 'settled' &&
      billData['customerInfo']['phone']
    ) {
      const settingsRes = await firestore
        .doc(`business/${businessId}/settings/settings`)
        .get();
      let settingsData = settingsRes.data();
      if (settingsRes.exists && settingsData && settingsData['loyaltyRates']) {
        // loyaltyRates has 3 keys dineIn, takeaway, online. Check if they exists if not then use dine rate as default if dine in doesn't exists then return an error
        let totalGainedLoyaltyPoint = 0;
        let loyaltyRate = 0;
        if (!settingsData.loyaltyRates.dineIn) {
          throw new HttpsError('aborted', 'Aborted due to missing rate');
        } else if (billData.mode == 'dineIn') {
          loyaltyRate = settingsData.loyaltyRates.dineIn;
        }
        if (billData.mode == 'takeaway') {
          if (!settingsData.loyaltyRates.takeaway) {
            settingsData.loyaltyRates.takeaway =
              settingsData.loyaltyRates.dineIn;
          }
          loyaltyRate = settingsData.loyaltyRates.takeaway;
        }
        if (billData.mode == 'online') {
          if (!settingsData.loyaltyRates.online) {
            settingsData.loyaltyRates.online = settingsData.loyaltyRates.dineIn;
          }
          loyaltyRate = settingsData.loyaltyRates.online;
        }
        if (debug)
          console.log(
            'loyaltyRate',
            billData.billing.grandTotal,
            loyaltyRate,
            billData.billing.grandTotal * loyaltyRate
          );
        totalGainedLoyaltyPoint = Math.floor(
          billData.billing.grandTotal * loyaltyRate
        );
        // update bill
        try {
          await billReference.update({ totalGainedLoyaltyPoint });
          return { status: true };
        } catch (error) {
          throw new HttpsError('aborted', 'Failed to update the bill.');
        }
      } else {
        throw new HttpsError('aborted', "Business hasn't enabled loyalty");
      }
    } else {
      if (bill.exists && billData) {
        if (!billData['customerInfo']['phone']) {
          throw new HttpsError(
            'aborted',
            'The bill does not have any customer.'
          );
        } else if (billData['stage'] != 'settled') {
          throw new HttpsError('aborted', 'The bill is not settled');
        } else {
          throw new HttpsError('aborted', 'Some error occurred');
        }
      } else {
        throw new HttpsError('aborted', 'The bill is not found');
      }
    }
  }
);

// export const analyzeAnalytics = functions.pubsub.schedule('every 3 hours').onRun(async (context) => {
//   console.log('Running a task every 3 hours');
//   initFirestore();
//   let businessRef = firestore.collection('business');
//   let businessDocs = await businessRef.get();
//   let workers = businessDocs.docs.map(async (businessDoc)=>{
//     await generateAnalytics(firestore,businessDoc)
//   })
//   let res = await Promise.all(workers);
//   return res.length;
// });

export const analyzeAnalyticsForBusiness = functions.https.onCall(
  async (request, response) => {
    initFirestore();
    validateAny(request.businessId, 'string');
    let businessRef = firestore.doc(`business/${request.businessId}`);
    let businessDoc = await businessRef.get();
    console.log('businessDoc.exists', businessDoc.exists);
    if (businessDoc.exists) {
      let analyticsData = await generateAnalytics(firestore, businessDoc);
      return { status: true, data: analyticsData };
    } else {
      throw new HttpsError(
        'aborted',
        `Business not found for ${request.businessId}`
      );
    }
  }
);


export const calculateLoyaltyPoint = functions.https.onCall(
  async (request,response) => {
    initFirestore();
    validateAny(request.businessId, 'string');
    validateAny(request.userId, 'string');
    // get all customers 
  }
)
export interface AdditionalClaims {
  email?: string;
  providerId: string;
  image?: string;
  phone?: string;
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
    businessId: string;
    joiningDate: Timestamp;
    name: string;
  }[];
}

export interface AnalyticsData {
  salesChannels: {
    all: ChannelWiseAnalyticsData;
    dineIn: ChannelWiseAnalyticsData;
    takeaway: ChannelWiseAnalyticsData;
    online: ChannelWiseAnalyticsData;
  };
  customersData: {
    totalCustomers: number;
    totalCustomersByChannel: {
      dineIn: number;
      takeaway: number;
      online: number;
    };
    totalNewCustomers: number;
    totalNewCustomersByChannel: {
      dineIn: number;
      takeaway: number;
      online: number;
    };
    newCustomers: {
      name: string;
      phone: string;
      joiningDate: Timestamp;
      email?: string;
      address?: string;
      loyaltyPoint: number;
    }[];
    allCustomers: {
      name: string;
      phone: string;
      joiningDate: Timestamp;
      email?: string;
      address?: string;
      loyaltyPoint: number;
    }[];
  };
}

export interface ChannelWiseAnalyticsData {
  totalSales: number;
  netSales: number;
  totalDiscount: number;
  totalNC: number;
  totalTaxes: number;
  hourlySales: number[];
  averageHourlySales: number[];
  paymentReceived: {
    [key: string]: number;
  };
  billWiseSales: {
    lowRange: {
      bills: {
        billId: string;
        billRef: any;
        totalSales: number;
        time: Timestamp;
      }[];
      totalSales: number;
    };
    mediumRange: {
      bills: {
        billId: string;
        billRef: any;
        totalSales: number;
        time: Timestamp;
      }[];
      totalSales: number;
    };
    highRange: {
      bills: {
        billId: string;
        billRef: any;
        totalSales: number;
        time: Timestamp;
      }[];
      totalSales: number;
    };
  };
  itemWiseSales: {
    byPrice: {
      name: string;
      id: string;
      price: number;
      quantity: number;
      category: {
        name: string;
        id: string;
      };
    }[];
    byQuantity: {
      name: string;
      id: string;
      price: number;
      quantity: number;
      category: {
        name: string;
        id: string;
      };
    }[];
  };
  suspiciousActivities: {
    bills: {
      type: string;
      billId: string;
      billRef: any;
      time: Timestamp;
      price: number;
      reason: string;
      userId: string;
    }[];
    kots: {
      type: string;
      billId: string;
      billRef: any;
      kotId: string;
      time: Timestamp;
      billPrice: number;
      kot: any;
      reason: string;
      userId: string;
    }[];
    discounts: {
      type: string;
      billId: string;
      billRef: any;
      time: Timestamp;
      price: number;
      reason: string;
      userId: string;
    }[];
    users: {
      type: string;
      userId: string;
      time: Timestamp;
    }[];
  };
  userWiseActions: [
    {
      userId: string;
      userRef: any;
      actions: {
        bills: {
          billId: string;
          cost: number;
          time: Timestamp;
          table: string;
          user: {
            name: string;
            id: string;
          };
        }[];
        kots: {
          kotId: string;
          user: {
            name: string;
            id: string;
          };
          items: {
            name: string;
            id: string;
            price: number;
          }[];
          time: Timestamp;
          table: string;
          cost: number;
        }[];
        discounts: {
          billId: string;
          cost: number;
          time: Timestamp;
          table: string;
          user: {
            name: string;
            id: string;
          };
          discount: any;
        }[];
        settlements: {
          billId: string;
          cost: number;
          time: Timestamp;
          table: string;
          user: {
            name: string;
            id: string;
          };
          paymentMethods: {
            name: string;
            cost: number;
          }[];
        }[];
        ncs: {
          billId: string;
          cost: number;
          time: Timestamp;
          table: string;
          user: {
            name: string;
            id: string;
          };
          reason: string;
        }[];
      };
    }
  ];
}
