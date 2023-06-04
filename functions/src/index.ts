import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions';
const Mailjet = require('node-mailjet');
import { getAuth } from 'firebase-admin/auth';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
// import { subtle, verify } from 'crypto';
import { HttpsError } from 'firebase-functions/v1/https';

var debug: boolean = true;

import {
  generateOtp,
  validatePassword,
  generateHashedPassword,
  verifyPassword,
  validateEmail,
  validateName,
  validatePhone,
  validateImage,
  validateBusiness,
  validateAny,
} from './helpers';

const mailjet = new Mailjet({
  apiKey: '135bbf04888dd455863f5e2a4d15ac2f',
  apiSecret: 'a2ae82fc0885ae701311acf96c139a3f',
});

let app = initializeApp({
  credential: admin.credential.cert(
    'fbms-shreeva-demo-firebase-adminsdk-8nk63-28663566a0.json'
  ),
});

let auth = getAuth(app);
let firestore = getFirestore(app);

export const userNameAvailable = functions.https.onCall(
  async (request, response) => {
    if (debug) console.log('request', request);
    validateName(request.username)
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
    validateName(request.username)
    validatePassword(request.password)
    validateEmail(request.email)
    // check if userId exists
    let uidDoc = await firestore.doc('users/' + request.username).get();
    if (uidDoc.exists) {
      throw new HttpsError('already-exists', 'Username already exists');
    }
    // check for fields {business,email (optional), image (optional), phone (optional), username}
    let additonalClaims: AdditonalClaims = {
      business: [],
      providerId: 'custom',
    };
    if (request.email && validateEmail(request.email)) {
      additonalClaims['email'] = request.email;
    }
    if (request.image && validateImage(request.image)) {
      additonalClaims['image'] = request.image;
    }
    if (request.phone && validatePhone(request.phone)) {
      additonalClaims['phone'] = request.phone;
    }
    if (request.business && validateBusiness(request.business)) {
      // request.business.joiningDate.nanoseconds, request.business.joiningDate.seconds
      request.business.joiningDate = new Timestamp(
        request.business.joiningDate.seconds,
        request.business.joiningDate.nanoseconds
      );
      request.business.access.lastUpdated = new Timestamp(
        request.business.access.lastUpdated.seconds,
        request.business.access.lastUpdated.nanoseconds
      );
      additonalClaims['business'] = [request.business];
    } else {
      throw new HttpsError('invalid-argument', 'Business is required');
    }
    // validations done
    //  console.log('validations done');
    // get password
    let hashedPassword = generateHashedPassword(request.password, uidDoc.id);
    console.log("hashedPassword",hashedPassword);
    let authReq = await auth.createCustomToken(uidDoc.id, {
      username: uidDoc.id,
      ...additonalClaims,
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
    auth.createUser({
      uid: uidDoc.id,
      displayName: uidDoc.id,
      photoURL:
        request.image ||
        'https://api.dicebear.com/6.x/lorelei/svg?seed=' + uidDoc.id,
      emailVerified: false,
      disabled: false,
      ...userCreds,
    });
    if (debug) console.log('created custom token');
    if (debug) console.log('trying updating email', request.email);

    additonalClaims['providerId'] = 'custom';
    if (debug) console.log('updated custom token');
    // store username and password hash in firestore
    await firestore.doc('authData/' + uidDoc.id).set({
      username: uidDoc.id,
      password: hashedPassword,
      ...additonalClaims,
    });
    await firestore.doc('users/' + uidDoc.id).set({
      username: uidDoc.id,
      ...additonalClaims,
    });
    if (debug) console.log('created firestore document');
    // sign in with custom token
    return {
      token: authReq,
      uid: uidDoc.id,
      ...additonalClaims,
      loginTime: Timestamp.now(),
    };
  }
);

export const signInWithUserAndPassword = functions.https.onCall(
  async (request, response) => {
    // check for fields {username,password}
    validateName(request.username);
    validatePassword(request.password);
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    verifyPassword(request.password, uidDoc.data()?.password, uidDoc.id);
    // create custom token
    let authReq = await auth.createCustomToken(uidDoc.id, uidDoc.data());
    // sign in with custom token
    return { token: authReq, uid: uidDoc.id, ...uidDoc.data() };
  }
);

export const resetPassword = functions.https.onCall(
  async (request, response) => {
    if(debug) console.log('REQUEST ', request);
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
    verifyPassword(previousPassword, uidDoc.data()?.password, uidDoc.id);
    // set new password
    const hashedPassword = generateHashedPassword(newPassword, uidDoc.id);
    // update user
    await auth.updateUser(uid, {
      password: newPassword,
    });
    // update password
    await firestore.doc('authData/' + uid).update({
      password: hashedPassword,
    });
    let additonalClaims: AdditonalClaims = {
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
  }
);

export const checkPassword = functions.https.onCall(
  async (request, response) => {
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
    if (await verifyPassword(password, uidDoc.data()?.password, uidDoc.id)) {
      return { status: 'success', correct: true };
    } else {
      throw new HttpsError('unauthenticated', 'Password incorrect');
    }
  }
);

export const resetPasswordMail = functions.https.onCall(
  async (request, response) => {
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
    let hashedPassword = generateHashedPassword(request.newPassword, uidDoc.id);
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

export const addExistingUser = functions.https.onCall(
  async (request, response) => {
    if(debug) console.log('REQUEST ', request);
    validateName(request.username);
    validateAny(request.businessId,'string');
    validateAny(request.accessLevel,'string');
    validateAny(request.currentUser,'string');
    // get user doc and verofy if the user exists
    let uidDoc = await firestore.doc('authData/' + request.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    // validate business
    let businessDoc = await firestore.doc('business/' + request.businessId).get();
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
    // return "rest"
    // send an otp to the user email
    let generatedOtp = generateOtp();
    try {
      let generateOtpRequest = await firestore
        .collection('otps')
        .add({ 
          otp: generatedOtp, 
          accessLevel:request.accessLevel,
          businessId:request.businessId,
          username:request.username,
          currentUser:request.currentUser
        });
      if(debug) console.log("MESSAGE",{
        From: {
          Email: 'create@shreeva.com',
          Name: 'Viraj Hospitality',
        },
        To: {
          Email: uidDoc.data()?.email,
          Name: request.username,
        },
        Subject: `Otp for adding your account to Viraj Hospitality.`,
        TextPart: `Dear ${request.username}, ${generatedOtp} is the otp for adding your account ${request.username} to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
        HtmlPart: `Dear ${request.username}, <strong>${generatedOtp}</strong> is the otp for adding your account <strong>${request.username}</strong> to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
      });
      
      let res = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'create@shreeva.com',
              Name: 'Viraj Hospitality',
            },
            To: {
              Email: uidDoc.data()?.email,
              Name: request.username,
            },
            Subject: `Otp for adding your account to Viraj Hospitality.`,
            TextPart: `Dear ${request.username}, ${generatedOtp} is the otp for adding your account ${request.username} to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
            HtmlPart: `Dear ${request.username}, <strong>${generatedOtp}</strong> is the otp for adding your account <strong>${request.username}</strong> to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
          },
        ],
      });
      console.log('Sent mail', res.body);
      return { status: 'success', authId: generateOtpRequest.id };
    } catch (error: any) {
      return { message: 'Some error occurred', error: error };
    }
  }
)

export const verifyOtpExistingUser = functions.https.onCall(async (request, response) => {
  // available params are
  // {
  //    username: 'sapython',
  //    otp: '765727',
  //    businessId: 'zYYtDSX7HevaFmCM31d5'
  //  }
  // validate authId
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
  let accessLevel = otpDoc.data()?.accessLevel;
  let businessId = otpDoc.data()?.businessId;
  let updateUser = otpDoc.data()?.currentUser;
  let username = otpDoc.data()?.username;
  if(username !== request.username){
    throw new HttpsError('invalid-argument', 'Username does not match');
  }
  if (correctOtp !== userOtp) {
    throw new HttpsError('unauthenticated', 'Otp incorrect');
  }
  // delete otp
  await firestore.collection('otps').doc(request.authId).delete();
  // add user to business
  await firestore.doc('business/' + businessId).update({
    users: admin.firestore.FieldValue.arrayUnion({
      access:accessLevel,
      lastUpdated:Timestamp.now(),
      updatedBy:updateUser,
      username:username
    })
  });
  // sign in with custom token
  return { status: 'success', message: 'User approved successfully' };
})

// export const resetPasswordByAdmin = functions.https.onCall(
//   async (request, response) => {
//     // here we will receive
//     // username of admin
//     // password of admin
//     // username of user
//     // new password of user
//     // confirm password of user
//     // first we will have to do password validation, then user validation for both admin and user
//     // then we have to get all of the business of the admin user which is inside authData document it has business array we can fetch all the business one by one and then on every business we can check users array if in any one of them the user is found then it's valid if it's not found in anyone of them then it's invalid
//     // then we have to update the password of the user
//     // then we have to send the mail to the user that his password has been changed
//     // then we have to send the mail to the admin that the password of the user has been changed

//     // validate passwords
//     validatePassword(request.newPassword);
//     validatePassword(request.confirmPassword);
//     validatePassword(request.adminPassword);
//     validateName(request.username);
//     validateName(request.adminUsername);
//     // check if passwords match
//     if (request.newPassword !== request.confirmPassword) {
//       throw new HttpsError('invalid-argument', 'Passwords do not match');
//     }
//     // check if admin exists
//     let adminUidDoc = await firestore
//       .doc('authData/' + request.adminUsername)
//       .get();
//     if (!adminUidDoc.exists) {
//       throw new HttpsError('not-found', 'Admin Username not found');
//     }
//     // check if user exists
//     let userUidDoc = await firestore
//       .doc('authData/' + request.userUsername)
//       .get();
//     if (!userUidDoc.exists) {
//       throw new HttpsError('not-found', 'Admin Username not found');
//     }
//     // check if admin password is correct
//     verifyPassword(
//       request.adminPassword,
//       adminUidDoc.data()?.password,
//       adminUidDoc.id
//     );
//     // check if user is in admin's business
//     let business = adminUidDoc.data()?.business;
    
//     if (!userFound) {
//       throw new HttpsError(
//         'permission-denied',
//         'User is not in your business'
//       );
//     } else {
//       // reset password
//       let hashedPassword = generateHashedPassword(
//         request.newPassword,
//         userUidDoc.id
//       );
//       // update user
//       await auth.updateUser(userUidDoc.id, {
//         password: request.password,
//       });
//       // update password
//       await firestore.doc('authData/' + userUidDoc.id).update({
//         password: hashedPassword,
//       });
//       // sign in with custom token
//       return { status: 'success', message: 'Password reset successfully' };
//     }
//   }
// );

// deprecated
export const updateUser = functions.https.onCall(async (request, response) => {
  let data: any = {
    displayName: request.username,
    photoURL:
      request.image ||
      'https://api.dicebear.com/6.x/lorelei/svg?seed=' + request.username,
  };
  if (request.email) {
    //  console.log('updating email');
    data.email = request.email;
    data.emailVerified = false;
  }
  if (request.phone) {
    if (!request.phone.startsWith('+91')) {
      request.phone = '+91' + request.phone;
    }
    //  console.log('updating phone');
    data.phoneNumber = request.phone;
  }
  data.password = request.password;
  return await auth.updateUser(request.username, data);
});
interface AdditonalClaims {
  email?: string;
  providerId: string;
  image?: string;
  phone?: string;
  business: {
    access: { accessLevel: string; lastUpdated: Timestamp; updatedBy: string };
    address: string;
    businessId: string;
    joiningDate: Timestamp;
    name: string;
  }[];
}
