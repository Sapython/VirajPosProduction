import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { generateAnalytics } from './analytics';

import {
validatePassword,
validateEmail,
validateName,
validatePhone,
validateImage,
validateBusiness,
validateAny,
} from './helpers';

// Set timezone for all functions
setGlobalOptions({
region: 'asia-south1',
timeoutSeconds: 60,
memory: '256MiB',
});

// Initialize Firebase Admin
if (!admin.apps.length) {
admin.initializeApp();
}

// Debug flag
const debug: boolean = true;

// Type declarations
let app: any;
let auth: any;
let firestore: Firestore;
let storage: any;
let Mailjet: any;
let mailjet: any;
let getAuth: any;
let getFirestore: any;
export var generateHashedPassword: any;
export var verifyPassword: any;

// Initialize Firestore
firestore = admin.firestore();
auth = admin.auth();
storage = admin.storage();

// upload a string of json to firebase storage

let processDate = new Date();
console.log('processDate', processDate);
let propertyList = [
  'updateBiller',
  'seeSaleSummary',
  'seeReports', //TODO: new
  'seeOrderSummary',
  'seeVrajeraCategories',
  'seeCombos',
  'seeLoyalty', // TODO: new
  'addNewMenu', // TODO: new
  'addNewLoyaltySettings', // TODO: new
  'editLoyaltySetting', // TODO: new
  'deleteLoyaltySetting', // TODO: new
  'multipleDiscounts', // TODO: new
  'seeYourCategories',
  "setPrinterSettings", //TODO: new
  'seeMainCategories',
  'reactivateBill', // TODO: new *
  'editMenu',
  'editTakeawayMenu',
  'editOnlineMenu',
  'editDineInMenu',
  'seeAllProducts',
  'addNewProduct',
  'enableDisableProducts',
  'setTaxesOnProducts',
  'editProduct',
  'canEditDetails',
  'canSetPrinter',
  'deleteProduct',
  'recommendedCategories',
  'editRecommendedCategorySettings',
  'enableDisableRecommendedProducts',
  'setTaxesOnRecommendedProducts',
  'editRecommendedProduct',
  'deleteRecommendedProduct',
  'viewCategories',
  'addViewCategory',
  'editViewCategory',
  'deleteViewCategory',
  'enableDisableViewProducts',
  'setTaxesOnViewProducts',
  'editViewProduct',
  'deleteViewProduct',
  'mainCategories',
  'addMainCategory',
  'deleteMainCategory',
  'enableDisableMainProducts',
  'setTaxesOnMainProducts',
  'editMainProduct',
  'deleteMainProduct',
  'editTaxes',
  'seeTaxes',
  'addNewTaxes',
  'deleteTaxes',
  'editTax',
  'discount',
  'seeDiscount',
  'addNewDiscounts',
  'deleteDiscounts',
  'editDiscount',
  'combos',
  'seeCombos',
  'addNewCombos',
  'deleteCombos',
  'editCombo',
  'types',
  'seeTypes',
  'addNewTypes',
  'deleteTypes',
  'editTypes',
  'addNewMenu',
  'switchMenu',
  'viewTable',
  'reArrangeGroupOrder',
  'settleFromTable',
  'addTable',
  'deleteTable',
  'addNewTakeawayToken',
  'addNewOnlineToken',
  'moveAndMergeOptions',
  'seeHistory',
  'settings',
  'about',
  'readAboutSettings',
  'changeAboutSettings',
  'businessSettings',
  'readBusinessSettings',
  'switchModes',
  'changeConfig',
  'changePrinter',
  'accountSettings',
  'readAccountSettings',
  'addAccount',
  'removeAccount',
  'paymentMethods',
  'newMethod',
  'editMethod',
  'deleteMethod',
  'advancedSettings',
  'generalSettings',
  'loyaltySettings',
  'punchKot',
  'manageKot',
  'editKot',
  'deleteKot',
  'lineDiscount',
  'lineCancel',
  'applyDiscount',
  'seePreview',
  'finalizeBill', //TODO new *
  'splitBill',
  'setNonChargeable',
  'billNote',
  'cancelBill',
  'settleBill',
  'writeCustomerInfo',
];

let defaultAccess = {
  admin: [...propertyList],
  manager: [
    'updateBiller',
    'seeSaleSummary',
    'seeReports', //TODO: new
    'seeOrderSummary',
    'seeVrajeraCategories',
    'seeCombos',
    'seeLoyalty', // TODO: new
    'addNewMenu', // TODO: new
    'addNewLoyaltySettings', // TODO: new
    'editLoyaltySetting', // TODO: new
    'deleteLoyaltySetting', // TODO: new
    'multipleDiscounts', // TODO: new
    'seeYourCategories',
    "setPrinterSettings", //TODO: new
    'seeMainCategories',
    'reactivateBill', // TODO: new *
    'finalizeBill', //TODO new *
    'editMenu',
    'editTakeawayMenu',
    'editOnlineMenu',
    'editDineInMenu',
    'seeAllProducts',
    'addNewProduct',
    'enableDisableProducts',
    'setTaxesOnProducts',
    'editProduct',
    'canEditDetails',
    'canSetPrinter',
    'deleteProduct',
    'recommendedCategories',
    'editRecommendedCategorySettings',
    'enableDisableRecommendedProducts',
    'setTaxesOnRecommendedProducts',
    'editRecommendedProduct',
    'deleteRecommendedProduct',
    'viewCategories',
    'addViewCategory',
    'editViewCategory',
    'deleteViewCategory',
    'enableDisableViewProducts',
    'setTaxesOnViewProducts',
    'editViewProduct',
    'deleteViewProduct',
    'mainCategories',
    'addMainCategory',
    'deleteMainCategory',
    'enableDisableMainProducts',
    'setTaxesOnMainProducts',
    'editMainProduct',
    'deleteMainProduct',
    'editTaxes',
    'seeTaxes',
    'addNewTaxes',
    'deleteTaxes',
    'editTax',
    'discount',
    'seeDiscount',
    'addNewDiscounts',
    'deleteDiscounts',
    'editDiscount',
    'combos',
    'seeCombos',
    'addNewCombos',
    'deleteCombos',
    'editCombo',
    'types',
    'seeTypes',
    'addNewTypes',
    'deleteTypes',
    'editTypes',
    'addNewMenu',
    'switchMenu',
    'viewTable',
    'reArrangeGroupOrder',
    'settleFromTable',
    'addTable',
    'deleteTable',
    'addNewTakeawayToken',
    'addNewOnlineToken',
    'moveAndMergeOptions',
    'seeHistory',
    'settings',
    'about',
    'readAboutSettings',
    'readBusinessSettings',
    'switchModes',
    'changeConfig',
    'changePrinter',
    'paymentMethods',
    'newMethod',
    'editMethod',
    'deleteMethod',
    'advancedSettings',
    'generalSettings',
    'loyaltySettings',
    'punchKot',
    'manageKot',
    'editKot',
    'deleteKot',
    'lineDiscount',
    'lineCancel',
    'applyDiscount',
    'seePreview',
    'splitBill',
    'setNonChargeable',
    'billNote',
    'cancelBill',
    'settleBill',
    'writeCustomerInfo',
  ],
  accountant: [
    'updateBiller',
    'seeSaleSummary',
    'seeReports', //TODO: new
    'seeOrderSummary',
    'editMenu',
    'seeVrajeraCategories',
    'seeCombos',
    'seeLoyalty', // TODO: new
    'addNewMenu', // TODO: new
    'addNewLoyaltySettings', // TODO: new
    'multipleDiscounts', // TODO: new
    'seeYourCategories',
    "setPrinterSettings", //TODO: new
    'seeMainCategories',
    'seeAllProducts',
    'enableDisableProducts',
    'setTaxesOnProducts',
    'canSetPrinter',
    'deleteProduct',
    'recommendedCategories',
    'enableDisableRecommendedProducts',
    'setTaxesOnRecommendedProducts',
    'deleteRecommendedProduct',
    'viewCategories',
    'addViewCategory',
    'editViewCategory',
    'deleteViewCategory',
    'enableDisableViewProducts',
    'setTaxesOnViewProducts',
    'editViewProduct',
    'deleteViewProduct',
    'mainCategories',
    'addMainCategory',
    'deleteMainCategory',
    'enableDisableMainProducts',
    'setTaxesOnMainProducts',
    'seeTaxes',
    'addNewTaxes',
    'editTax',
    'discount',
    'seeDiscount',
    'addNewDiscounts',
    'combos',
    'seeCombos',
    'addNewCombos',
    'types',
    'seeTypes',
    'addNewTypes',
    'deleteTypes',
    'editTypes',
    'addNewMenu',
    'switchMenu',
    'viewTable',
    'reArrangeGroupOrder',
    'settleFromTable',
    'addTable',
    'addNewTakeawayToken',
    'addNewOnlineToken',
    'moveAndMergeOptions',
    'seeHistory',
    'settings',
    'about',
    'readAboutSettings',
    'readBusinessSettings',
    'switchModes',
    'changeConfig',
    'changePrinter',
    'paymentMethods',
    'newMethod',
    'editMethod',
    'advancedSettings',
    'generalSettings',
    'loyaltySettings',
    'punchKot',
    'manageKot',
    'editKot',
    'lineDiscount',
    'lineCancel',
    'applyDiscount',
    'seePreview',
    'splitBill',
    'setNonChargeable',
    'billNote',
    'cancelBill',
    'settleBill',
    'writeCustomerInfo',
  ],
  waiter: [
    'updateBiller',
    'seeSaleSummary',
    'seeOrderSummary',
    'seeVrajeraCategories',
    'editMenu',
    'viewCategories',
    'addViewCategory',
    'editViewCategory',
    'deleteViewCategory',
    'seeYourCategories',
    "setPrinterSettings", //TODO: new
    'canSetPrinter',
    'viewTable',
    'addNewTakeawayToken',
    'addNewOnlineToken',
    'moveAndMergeOptions',
    'seeVrajeraCategories',
    'seeCombos',
    'seeYourCategories',
    'seeMainCategories',
    'about',
    'readAboutSettings',
    'readBusinessSettings',
    'changePrinter',
    'paymentMethods',
    'punchKot',
    'manageKot',
    'seePreview',
    'billNote',
    'writeCustomerInfo',
  ],
};

function initFirestore() {
	if (firestore) return;
	console.log("Loading firestore");
	let firestoreImport = require('firebase-admin/firestore');
	getFirestore = firestoreImport.getFirestore;
  	firestore = getFirestore(app);
}
function initAuth() {
  if (auth) return;
  console.log("Loading auth");
  getAuth = require('firebase-admin/auth').getAuth;
  auth = getAuth(app);
}
function initMailJet() {
	if (Mailjet) return;
	console.log("Loading mailjet");
  Mailjet = require('node-mailjet');
  mailjet = new Mailjet({
    apiKey: '135bbf04888dd455863f5e2a4d15ac2f',
    apiSecret: 'a2ae82fc0885ae701311acf96c139a3f',
  });
}
function initStorage(){
  if (storage) return;
  console.log("Loading storage");
}function privateGenerateHashedPassword(password: string, uid: string) {
  if (!generateHashedPassword)
    generateHashedPassword = require('./authHelpers').generateHashedPassword;
  return generateHashedPassword(password, uid);
}
function privateVerifyPassword(
  password: string,
  hashedPassword: string,
  uid: string,
) {
  if (!verifyPassword) verifyPassword = require('./authHelpers').verifyPassword;
  return verifyPassword(password, hashedPassword, uid);
}
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}
export const userNameAvailable = onCall(async (request) => {
    initFirestore();
    if (debug) console.log('request', request.data);
    validateName(request.data.username);
    try {
        let doc = await firestore.doc('users/' + request.data.username).get();
        if (doc.exists) {
            return { stage: 'unavailable' };
        } else {
            return { stage: 'available' };
        }
    } catch (error) {
        return { stage: 'invalid' };
    }
});

export const signUpWithUserAndPassword = onCall(async (request) => {
    initAuth();
    initFirestore();
    if (debug) console.log('request data', request.data);

    if (!request.data.username || !request.data.password) {
        throw new HttpsError('invalid-argument', 'Missing fields. Username and password are required');
    }

    try {
        validateName(request.data.username);
        validatePassword(request.data.password);
        validateEmail(request.data.email);
    } catch (error) {
        return error;
    }

    let uidDoc = await firestore.doc('users/' + request.data.username).get();
    if (uidDoc.exists) {
        throw new HttpsError('already-exists', 'Username already exists');
    }

    let additionalClaims: AdditionalClaims = {
        business: [],
        providerId: 'custom',
    };

    if (request.data.email && validateEmail(request.data.email)) {
        additionalClaims['email'] = request.data.email;
    }
    if (request.data.image && validateImage(request.data.image)) {
        additionalClaims['image'] = request.data.image;
    }
    if (request.data.phone && validatePhone(request.data.phone)) {
        additionalClaims['phone'] = request.data.phone;
    }
    if (request.data.business && validateBusiness(request.data.business)) {
        request.data.business.joiningDate = new Timestamp(
            request.data.business.joiningDate.seconds,
            request.data.business.joiningDate.nanoseconds
        );
        request.data.business.access.lastUpdated = new Timestamp(
            request.data.business.access.lastUpdated.seconds,
            request.data.business.access.lastUpdated.nanoseconds
        );
        additionalClaims['business'] = [request.data.business];
    } else {
        throw new HttpsError('invalid-argument', 'Business is required');
    }

    try {
        var hashedPassword = await privateGenerateHashedPassword(request.data.password, uidDoc.id);
    } catch (e) {
        console.log("error", e);
        return { error: 'Error generating password' };
    }

    try {
        var authReq = await auth.createCustomToken(uidDoc.id, {
            username: uidDoc.id,
            ...additionalClaims,
        });
    } catch (e) {
        console.log("error", e);
        return { error: 'Error generating custom token' };
    }

    let userCreds: any = {
        password: hashedPassword,
    };

    if (request.data.email) {
        userCreds['email'] = request.data.email;
    }
    if (request.data.phone) {
        if (!request.data.phone.startsWith('+91')) {
            request.data.phone = '+91' + request.data.phone;
        }
        userCreds['phoneNumber'] = request.data.phone;
    }

    try {
        await auth.createUser({
            uid: uidDoc.id,
            displayName: uidDoc.id,
            photoURL: request.data.image || 'https://api.dicebear.com/6.x/lorelei/svg?seed=' + uidDoc.id,
            emailVerified: false,
            disabled: false,
            ...userCreds,
        });
    } catch (error: any) {
        console.log('error', error);
        throw new HttpsError('internal', error.message || 'Error creating user');
    }

    additionalClaims['providerId'] = 'custom';

    await firestore.doc('authData/' + uidDoc.id).set({
        username: uidDoc.id,
        password: hashedPassword,
        ...additionalClaims,
    });

    await firestore.doc('users/' + uidDoc.id).set({
        username: uidDoc.id,
        ...additionalClaims,
    }, { merge: true });

    return {
        token: authReq,
        uid: uidDoc.id,
        ...additionalClaims,
        loginTime: Timestamp.now(),
    };
});

export const signInWithUserAndPassword = onCall(async (request) => {
    initAuth();
    initFirestore();
    validateName(request.data.username);
    validatePassword(request.data.password);
    
    let uidDoc = await firestore.doc('authData/' + request.data.username).get();
    if (!uidDoc.exists) {
        throw new HttpsError('not-found', 'Username not found');
    }
    
    if (await privateVerifyPassword(request.data.password, uidDoc.data()?.password, uidDoc.id)) {
        let authReq = await auth.createCustomToken(uidDoc.id, uidDoc.data());
        return { token: authReq, uid: uidDoc.id, ...uidDoc.data() };
    } else {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
});

export const resetPassword = onCall(async (request) => {
    initAuth();
    initFirestore();
    if (debug) console.log('REQUEST ', request.data);
    
    const { previousPassword, newPassword, confirmPassword, uid } = request.data;
    
    validatePassword(previousPassword);
    validatePassword(newPassword);
    validatePassword(confirmPassword);
    
    if (newPassword !== confirmPassword) {
        throw new HttpsError('invalid-argument', 'Passwords do not match');
    }
    
    let uidDoc = await firestore.doc('authData/' + uid).get();
    if (!uidDoc.exists) {
        throw new HttpsError('not-found', 'Username not found');
    }
    
    if (await privateVerifyPassword(previousPassword, uidDoc.data()?.password, uidDoc.id)) {
        const hashedPassword = await privateGenerateHashedPassword(newPassword, uidDoc.id);
        await auth.updateUser(uid, { password: newPassword });
        await firestore.doc('authData/' + uid).update({ password: hashedPassword });
        
        let additonalClaims: AdditionalClaims = {
            business: uidDoc.data()?.business,
            providerId: uidDoc.data()?.providerId,
        };
        
        let userData = {
            username: uidDoc.id,
            imageUrl: uidDoc.data()!['imageUrl'] || 'https://api.dicebear.com/6.x/lorelei/svg?seed=' + request.data.username,
            ...additonalClaims,
        };
        
        let authReq = await auth.createCustomToken(uidDoc.id);
        return { token: authReq, uid: uidDoc.id, ...userData };
    } else {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
});

export const checkPassword = onCall(async (request) => {
    initFirestore();
    let { uid, password } = request.data;
    
    validatePassword(password);
    validateName(uid);
    
    let uidDoc = await firestore.doc('authData/' + uid).get();
    if (!uidDoc.exists) {
        throw new HttpsError('not-found', 'Username not found');
    }
    
    if (await privateVerifyPassword(password, uidDoc.data()?.password, uidDoc.id)) {
        return { status: 'success', correct: true };
    } else {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
});

export const resetPasswordMail = onCall(async (request) => {
    initAuth();
    initFirestore();
    initMailJet();
    console.log('REQUEST ', request.data);
    
    validateName(request.data.username);
    
    let uidDoc = await firestore.doc('authData/' + request.data.username).get();
    if (!uidDoc.exists || !uidDoc.data()?.email) {
      throw new HttpsError('not-found', 'Username not found');
    }
    
    let generatedOtp = generateOtp();
    try {
      var user = await auth.getUserByEmail(request.data.email);
      if (!user) {
        throw new HttpsError('not-found', 'User not found');
      }
      
      let generateOtpRequest = await firestore
        .collection('otps')
        .add({ otp: generatedOtp });
        
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'create@shreeva.com',
              Name: 'Vrajera Hospitality',
            },
            To: [
              {
                Email: uidDoc.data()?.email,
                Name: request.data.username,
              },
            ],
            Subject: 'Otp for resetting the password of account.',
            TextPart: `Dear ${request.data.username}, ${generatedOtp} is the otp for resetting the password of account ${request.data.username} on Vrajera Hospitality. Please do not share this otp with anyone. This email is sent to you because of ${request.data.email} is registered as email with this account.`,
            HtmlPart: `Dear ${request.data.username}, <strong>${generatedOtp}</strong> is the otp for resetting the password of account <strong>${request.data.username}</strong> on Vrajera Hospitality. Please do not share this otp with anyone. This email is sent to you because of ${request.data.email} is registered as email with this account.`,
          },
        ],
      });
      
      return { status: 'success', authId: generateOtpRequest.id };
    } catch (error: any) {
      console.log(error);
      if (error.codePrefix === 'auth' && error.errorInfo.code == 'auth/user-not-found') {
        throw new HttpsError('not-found', 'User not found');
      }
      return { message: 'Some error occurred', error: error };
    }
});

export const verifyResetPasswordOtp = onCall(async (request) => {
    initAuth();
    initFirestore();
    
    if (!request.data.authId) {
      throw new HttpsError('invalid-argument', 'Missing fields. AuthId is required');
    }
    
    validatePassword(request.data.newPassword);
    validatePassword(request.data.confirmPassword);
    validateName(request.data.username);
    
    if (request.data.newPassword !== request.data.confirmPassword) {
      throw new HttpsError('invalid-argument', 'Passwords do not match');
    }

    let uidDoc = await firestore.doc('authData/' + request.data.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    
    let otpDoc = await firestore.collection('otps').doc(request.data.authId).get();
    if (!otpDoc.exists) {
      throw new HttpsError('not-found', 'Otp not found');
    }
    
    let correctOtp = otpDoc.data()?.otp.toString().trim();
    let userOtp = request.data.otp.toString().trim();
    if (correctOtp !== userOtp) {
      throw new HttpsError('unauthenticated', 'Otp incorrect');
    }
    
    await firestore.collection('otps').doc(request.data.authId).delete();
    
    let hashedPassword = await privateGenerateHashedPassword(
      request.data.newPassword,
      uidDoc.id,
    );
    
    await auth.updateUser(uidDoc.id, {
      password: request.data.password,
    });
    
    await firestore.doc('authData/' + uidDoc.id).update({
      password: hashedPassword,
    });
    
    return { status: 'success', message: 'Password reset successfully' };
});

export const addExistingUser = onCall(async (request) => {
    initMailJet();
    initFirestore();
    if (debug) console.log('REQUEST ', request.data);
    
    validateName(request.data.username);
    validateAny(request.data.businessId, 'string');
    validateAny(request.data.accessType, 'string'); 
    validateAny(request.data.currentUser, 'string');
    
    let uidDoc = await firestore.doc('authData/' + request.data.username).get();
    if (!uidDoc.exists) {
      throw new HttpsError('not-found', 'Username not found');
    }
    
    let businessDoc = await firestore
      .doc('business/' + request.data.businessId)
      .get();
    if (!businessDoc.exists) {
      throw new HttpsError('not-found', 'Business not found');
    }
    
    let userFound = businessDoc.data()?.users.some((user:any) => user.username === request.data.username);
    if (userFound) {
      throw new HttpsError('already-exists', 'User is already present in the business');
    }
    
    if (!uidDoc.data()?.email) {
      throw new HttpsError('invalid-argument', 'User does not have email');
    }
    
    if (request.data.accessType == 'role') {
      if (!['manager', 'waiter', 'accountant', 'admin'].includes(request.data.role)) {
        throw new HttpsError('invalid-argument', 'Invalid access level');
      }
    } else if (request.data.accessType == 'custom') {
      if (!request.data.propertiesAllowed?.length) {
        throw new HttpsError('invalid-argument', 'Invalid properties allowed');
      }
    } else {
      throw new HttpsError('invalid-argument', 'Invalid access type');
    }
    
    let generatedOtp = generateOtp();
    let data: any = {
      otp: generatedOtp,
      businessId: request.data.businessId,
      accessType: request.data.accessType,
      username: request.data.username,
      currentUser: request.data.currentUser,
    };
    
    if (request.data.accessType == 'custom') {
      data['propertiesAllowed'] = request.data.propertiesAllowed;
    } else {
      data['role'] = request.data.role;
    }
    
    try {
      let optDocument = await firestore.collection('otps').add(data);
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'create@shreeva.com',
              Name: 'Shreeva Soft-Tech Innovations',
            },
            To: [
              {
                Email: uidDoc.data()?.email,
                Name: request.data.username,
              },
            ],
            Subject: `Otp for adding your account to Vrajera Hospitality.`,
            TextPart: `Dear ${request.data.username}, ${generatedOtp} is the otp for adding your account ${request.data.username} to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
            HtmlPart: `Dear ${request.data.username}, <strong>${generatedOtp}</strong> is the otp for adding your account <strong>${request.data.username}</strong> to ${businessDoc.data()!['hotelName']}. Please do not share this otp with anyone. This email is sent to you because of ${uidDoc.data()?.email} is registered as email with this account.`,
          },
        ],
      });
      
      let maskedEmail = uidDoc.data()?.email.replace(/(.{5})(.*)(@.*)/, '$1****$3');
      
      return {
        status: 'success',
        message: `OTP sent to the email account associated with ${request.data.username} ending in ${maskedEmail}`,
        maskedEmail: maskedEmail,
        authId: optDocument.id,
      };
    } catch (error: any) {
      console.log(error);
      return { message: 'Some error occurred' };
    }
});

export const verifyOtpExistingUser = onCall(async (request) => {
    initFirestore();
    if (debug) console.log('REQUEST ', request.data);

    if (!request.data.authId) {
        throw new HttpsError('invalid-argument', 'Missing fields. AuthId is required');
    }

    let otpDoc = await firestore.collection('otps').doc(request.data.authId).get();
    if (!otpDoc.exists) {
        throw new HttpsError('not-found', 'Otp not found');
    }

    console.log('Checking OTP:', otpDoc.data()?.otp, request.data.otp);
    let correctOtp = otpDoc.data()?.otp.toString().trim();
    let userOtp = request.data.otp.toString().trim();
    let businessId = otpDoc.data()?.businessId;
    let updateUser = otpDoc.data()?.currentUser;
    let accessType = otpDoc.data()?.accessType;
    let username = otpDoc.data()?.username;

    if (username !== request.data.username) {
        throw new HttpsError('invalid-argument', 'Username does not match');
    }
    if (correctOtp !== userOtp) {
        throw new HttpsError('unauthenticated', 'Otp incorrect');
    }

    await firestore.collection('otps').doc(request.data.authId).delete();

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

    let businessDoc = (await firestore.doc('business/' + businessId).get()).data();
    await firestore.doc('business/' + businessId).update({
        users: FieldValue.arrayUnion(newUserData),
    });

    let newUserBusinessData = {
        access: newUserData,
        address: businessDoc?.address,
        businessId: businessId,
        city: businessDoc?.city,
        joiningDate: Timestamp.now(),
        name: businessDoc?.hotelName,
        state: businessDoc?.state,
    }

    await firestore.doc('users/' + username).update({
        business: FieldValue.arrayUnion(newUserBusinessData),
    });

    return { status: 'success', message: 'User approved successfully' };
});

export const authenticateAction = onCall(async (request) => {
    initFirestore();
    
    validateName(request.data.username);
    validatePassword(request.data.password);
    validateAny(request.data.businessId, 'string');
    validateAny(request.data.propertiesRequired, 'array');

    let uidDoc = await firestore.doc('authData/' + request.data.username).get();
    if (!uidDoc.exists) {
        throw new HttpsError('not-found', 'Username not found');
    }

    let businessDoc = await firestore.doc('business/' + request.data.businessId).get();
    let foundUser: any = businessDoc.data()?.users.find((user:any) => user.username === request.data.username);
    
    if (!foundUser) {
        throw new HttpsError('permission-denied', 'User is not in your business');
    }

    let authorized = await privateVerifyPassword(
        request.data.password,
        uidDoc.data()?.password,
        uidDoc.id,
    );

    let allExists;
    if (foundUser['accessType'] == 'role') {
        allExists = request.data.propertiesRequired.every((property: string) => {
            let role = foundUser['role'] as 'admin' | 'manager' | 'waiter' | 'accountant';
            return defaultAccess[role].includes(property);
        });
    } else if (foundUser['accessType'] == 'custom') {
        allExists = request.data.propertiesRequired.every((property: string) => {
            return foundUser['propertiesAllowed'].includes(property);
        });
    } else {
        throw new HttpsError('invalid-argument', 'Invalid access type');
    }

    if (authorized && allExists) {
        return { status: 'success', authorized: true };
    } else {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
});

export const analyzeAnalytics = onSchedule('every 3 hours', async (event) => {
    initFirestore();
    initStorage();
    
    let businessRef = firestore.collection('business');
    let businessDocs = await businessRef.get();
    
    businessDocs.docs.forEach(async (businessDoc) => {
        await generateAnalytics(firestore, storage, businessDoc, new Date())
    });
});

export const analyzeAnalyticsForBusiness = onCall(async (request) => {
    initFirestore();
    initStorage();
    
    validateAny(request.data.businessId, 'string');
    console.log("request.businessId", request.data.businessId);
    
    let businessRef = firestore.doc(`business/${request.data.businessId}`);
    let businessDoc = await businessRef.get();
    console.log('businessDoc.exists', businessDoc.exists);
    
    let date = new Date(request.data.date);
    
    if (businessDoc.exists) {
        let analyticsData = await generateAnalytics(firestore, storage, businessDoc, date);
        return { status: true, data: analyticsData };
    } else {
        throw new HttpsError('aborted', `Business not found for ${request.data.businessId}`);
    }
});

export const calculateLoyaltyPoint = onSchedule('every 3 hours', async (event) => {
    initFirestore();
    let businessRef = firestore.collection('business');
    let businessDocs = await businessRef.get();
    await Promise.all(businessDocs.docs.map(async (businessDoc)=>{
        let customers = await firestore.collection(`business/${businessDoc.id}/customers`).get();
        await Promise.all(customers.docs.map(async (customer)=>{
            let billsRef = await firestore.collection(`business/${businessDoc.id}/customers/${customer.id}/bills`).get();
            let bills = await Promise.all(billsRef.docs.map(async (bill)=>{
                let data = bill.data();
                let billDocument = await data.billRef.get();
                return {...billDocument.data(),id:billDocument.id};
            }));
            let totalBills = bills.length;
            let totalSales = 0;
            let totalEarnedLoyaltyPoints = 0;
            let averageBillValue = 0;
            let lastBillDate = bills[bills.length-1]?.createdDate || null;
            let lastBillAmount = bills[bills.length-1]?.billing.grandTotal || null;
            let lastBillId = bills[bills.length-1]?.id || null;
            
            let todayDate = new Date();
            bills.forEach(bill => {
                totalSales += bill.billing.grandTotal;
                if(bill.currentLoyalty.expiryDate.toDate() > todayDate && bill.currentLoyalty.receiveLoyalty){
                    totalEarnedLoyaltyPoints += bill.currentLoyalty.totalLoyaltyPoints;
                }
                totalEarnedLoyaltyPoints -= bill.currentLoyalty.totalToBeRedeemedPoints;
            });
            averageBillValue = totalSales/totalBills;
            
            await firestore.doc(`business/${businessDoc.id}/customers/${customer.id}`).update({
                totalBills,
                totalSales,
                loyaltyPoints: totalEarnedLoyaltyPoints,
                averageBillValue,
                lastBillDate,
                lastBillAmount,
                lastBillId
            });
        }));
    }));
});

export const calculateLoyaltyPointForBusiness = onCall(async (request) => {
    initFirestore();
    validateAny(request.data.businessId, 'string');
    let businessRef = firestore.doc(`business/${request.data.businessId}`);
    let businessDoc = await businessRef.get();
    
    if (!businessDoc.exists) {
        throw new HttpsError('aborted', `Business not found for ${request.data.businessId}`);
    }

    let customers = await firestore.collection(`business/${businessDoc.id}/customers`).get();
    let analyzedCustomers = await Promise.all(customers.docs.map(async (customer)=>{
        let billsRef = await firestore.collection(`business/${businessDoc.id}/customers/${customer.id}/bills`).get();
        let bills = (await Promise.all(billsRef.docs.map(async (bill)=>{
            let data = bill.data();
            let billDocument = await data.billRef.get();
            return billDocument.exists ? {...billDocument.data(),id:billDocument.id} : undefined;
        }))).filter(bill => bill);

        let totalBills = bills.length;
        let totalSales = 0;
        let totalEarnedLoyaltyPoints = 0;
        let todayDate = new Date();

        bills.forEach(bill => {
            totalSales += bill.billing.grandTotal;
            if(bill.currentLoyalty?.expiryDate?.toDate() > todayDate && bill.currentLoyalty.receiveLoyalty){
                totalEarnedLoyaltyPoints += bill.currentLoyalty.totalLoyaltyPoints;
            }
            totalEarnedLoyaltyPoints -= bill.currentLoyalty.totalToBeRedeemedPoints;
        });

        let averageBillValue = totalSales/totalBills;
        let lastBill = bills[bills.length-1];
        
        await firestore.doc(`business/${businessDoc.id}/customers/${customer.id}`).update({
            totalBills,
            totalSales,
            loyaltyPoints: totalEarnedLoyaltyPoints,
            averageBillValue,
            lastBillDate: lastBill?.createdDate || null,
            lastBillAmount: lastBill?.billing.grandTotal || null,
            lastBillId: lastBill?.id || null
        });
    }));
    return { status: true, analyzedCustomers };
});

export const createNewAccessToken = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    validateAny(request.data.username, 'string');
    validateAny(request.data.expiryPeriod, 'string');
    
    initFirestore();
    let businessRef = firestore.doc(`business/${request.data.businessId}`);
    let businessDoc = await businessRef.get();
    
    if (!businessDoc.exists) {
        throw new HttpsError('aborted', `Business not found for ${request.data.businessId}`);
    }

    let userDoc = await firestore.doc('managers/'+request.data.username).get();
    if (!userDoc.exists || userDoc.data()?.access !== 'admin') {
        throw new HttpsError('aborted', `User not found for ${request.data.username}`);
    }

    let expiry = new Date();
    switch(request.data.expiryPeriod) {
        case 'year5': expiry.setFullYear(expiry.getFullYear() + 5); break;
        case 'year3': expiry.setFullYear(expiry.getFullYear() + 3); break;
        case 'year2': expiry.setFullYear(expiry.getFullYear() + 2); break;
        case 'year1': expiry.setFullYear(expiry.getFullYear() + 1); break;
        case 'month6': expiry.setMonth(expiry.getMonth() + 6); break;
        case 'month3': expiry.setMonth(expiry.getMonth() + 3); break;
        case 'month1': expiry.setMonth(expiry.getMonth() + 1); break;
        case 'week1': expiry.setDate(expiry.getDate() + 7); break;
        case 'day1': expiry.setDate(expiry.getDate() + 1); break;
    }

    const accessCode = generateAccessCode();
    await firestore.collection('accessCode').add({
        accessCode,
        businessId: request.data.businessId,
        expiry,
        generatedAt: new Date(),
        generatedBy: request.data.username
    });
    
    await firestore.doc('business/'+request.data.businessId).update({accessCode});
    return { status: true };
});

export const checkIfAccessTokenIsValid = onCall(async (request) => {
    console.log("request", request.data);
    validateAny(request.data.businessId, 'string');
    validateAny(request.data.accessCode, 'string');
    validateAny(request.data.username, 'string');
    
    initFirestore();
    let businessRef = firestore.doc(`business/${request.data.businessId}`);
    let businessDoc = await businessRef.get();
    
    if (!businessDoc.exists) {
        throw new HttpsError('aborted', `Business not found for ${request.data.businessId}`);
    }

    let businessData = businessDoc.data();
    let userData = businessData?.users.find((user:any) => user.username === request.data.username);
    
    if (!userData) {
        throw new HttpsError('aborted', `User not found for ${request.data.username}`);
    }

    let accessCodeRef = await firestore.collection('accessCode')
        .where('accessCode', '==', request.data.accessCode)
        .where('businessId', '==', request.data.businessId)
        .get();
    
    if (accessCodeRef.empty) {
        throw new HttpsError('aborted', 'Access code not found');
    }

    let accessCodeData = accessCodeRef.docs[0].data();
    if (accessCodeData.expiry.toDate() <= new Date()) {
        throw new HttpsError('aborted', 'Access code expired');
    }

    return { status: true, validTill: accessCodeData.expiry.toDate().toISOString() };
});

export const getOrderAndKotNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let settingsDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'));
        let settingsData = settingsDoc.data()!;
        let kotTokenNumber = settingsData['kitchenTokenNo'];
        let orderTokenNumber = settingsData['orderTokenNo'];
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            kitchenTokenNo: FieldValue.increment(1),
            orderTokenNo: FieldValue.increment(1)
        });
        
        return { kotTokenNumber, orderTokenNumber };
    });
});

export const getKotTokenNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let settingsDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'));
        let kotTokenNumber = settingsDoc.data()!['kitchenTokenNo'];
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            kitchenTokenNo: FieldValue.increment(1)
        });
        
        return kotTokenNumber;
    });
});

export const getOrderNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let settingsDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'));
        let orderTokenNumber = settingsDoc.data()!['orderTokenNo'];
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            orderTokenNo: FieldValue.increment(1)
        });
        
        return orderTokenNumber;
    });
});

export const getOrderKotTakeawayTokenNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let settingsDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'));
        let settingData = settingsDoc.data()!;
        let kotTokenNumber = settingData['kitchenTokenNo'];
        let orderTokenNumber = settingData['orderTokenNo'];
        let takeawayTokenNumber = settingData['takeawayTokenNo'];
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            kitchenTokenNo: FieldValue.increment(1),
            orderTokenNo: FieldValue.increment(1),
            takeawayTokenNo: FieldValue.increment(1)
        });
        
        let date = new Date().toISOString().split('T')[0];
        transaction.set(firestore.doc('business/' + request.data.businessId + '/dailyTokens/' + date), 
            { takeawayTokenNo: FieldValue.increment(1) }, 
            { merge: true }
        );
        
        return { kotTokenNumber, orderTokenNumber, takeawayTokenNumber };
    });
});

export const getOrderKotOnlineTokenNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let settingsDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'));
        let settingData = settingsDoc.data()!;
        let kotTokenNumber = settingData['kitchenTokenNo'];
        let orderTokenNumber = settingData['orderTokenNo'];
        let onlineTokenNumber = settingData['onlineTokenNo'];
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            kitchenTokenNo: FieldValue.increment(1),
            orderTokenNo: FieldValue.increment(1),
            onlineTokenNo: FieldValue.increment(1)
        });
        
        let date = new Date().toISOString().split('T')[0];
        transaction.set(firestore.doc('business/' + request.data.businessId + '/dailyTokens/' + date), 
            { onlineTokenNo: FieldValue.increment(1) }, 
            { merge: true }
        );
        
        return { kotTokenNumber, orderTokenNumber, onlineTokenNumber };
    });
});

export const getPaymentMethodBillNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    validateAny(request.data.paymentMethodId, 'string');
    validateAny(request.data.mode, 'string');
    
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let paymentMethodDoc = await transaction.get(firestore.doc('business/' + request.data.businessId + '/paymentMethods/' + request.data.paymentMethodId));
        let paymentMethod = paymentMethodDoc.data();
        
        transaction.update(firestore.doc('business/' + request.data.businessId + '/paymentMethods/' + request.data.paymentMethodId), {
            billNo: FieldValue.increment(1)
        });
        
        if(request.data.mode == 'dineIn') {
            let date = new Date().toISOString().split('T')[0];
            transaction.set(firestore.doc('business/' + request.data.businessId + '/dailyTokens/' + date), 
                { billTokenNo: FieldValue.increment(1) }, 
                { merge: true }
            );
        }
        
        return (paymentMethod?.shortCode ? paymentMethod.shortCode + ':' : '') + paymentMethod?.billNo;
    });
});
export const getNcBillNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let kotTokenNumber = (await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'))).data()!['ncBillNo'];
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            ncBillNo: FieldValue.increment(1)
        });
        let date = new Date().toISOString().split('T')[0];
        transaction.set(firestore.doc('business/' + request.data.businessId + '/dailyTokens/' + date), 
            { ncBillTokenNo: FieldValue.increment(1) }, 
            { merge: true }
        );
        return kotTokenNumber;
    });
});

export const getNormalBillNumber = onCall(async (request) => {
    validateAny(request.data.businessId, 'string');
    initFirestore();
    return firestore.runTransaction(async (transaction) => {
        let kotTokenNumber = (await transaction.get(firestore.doc('business/' + request.data.businessId + '/settings/settings'))).data()!['billTokenNo'];
        transaction.update(firestore.doc('business/' + request.data.businessId + '/settings/settings'), {
            billTokenNo: FieldValue.increment(1)
        });
        let date = new Date().toISOString().split('T')[0];
        transaction.set(firestore.doc('business/' + request.data.businessId + '/dailyTokens/' + date), 
            { billTokenNo: FieldValue.increment(1) }, 
            { merge: true }
        );
        return kotTokenNumber;
    });
});

export const generateDailyReport = onSchedule('0 0 * * *', async (event) => {
    initFirestore();
    let businesses = await firestore.collection('business').get();
    
    businesses.docs.map(async (businessDoc) => {
        let settings = await firestore.doc(`business/${businessDoc.id}/settings/settings`).get();
        if (settings.exists) {
            let settingsData = settings.data();
            if (settingsData?.tokensResetSetting) {
                if (settingsData?.tokensResetSetting?.billNo) {
                    settingsData.billTokenNo = 1;
                }
                if (settingsData?.tokensResetSetting?.takeawayTokenNo) {
                    settingsData.takeawayTokenNo = 1;
                }
                if (settingsData?.tokensResetSetting?.onlineTokenNo) {
                    settingsData.onlineTokenNo = 1;
                }
                if (settingsData?.tokensResetSetting?.orderNo) {
                    settingsData.orderTokenNo = 1;
                }
                if (settingsData?.tokensResetSetting?.ncBillNo) {
                    settingsData.ncBillToken = 1;
                }
                if (settingsData?.tokensResetSetting?.kotNo) {
                    settingsData.kitchenTokenNo = 1;
                }
            }
            if (settingsData) {
                await firestore.doc(`business/${businessDoc.id}/settings/settings`).set(settingsData, { merge: true });
            }
        }
    });
});

function generateAccessCode() {
    return Math.random().toString(36).substring(2, 14);
}
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
    createdAt: Timestamp;
    createdAtUTC: string;
  }
  
  export interface ChannelWiseAnalyticsData {
    totalSales: number;
    netSales: number;
    totalDiscount: number;
    totalNC: number;
    totalTaxes: number;
    totalCancelled: number;
    totalCancelledBills: number;
    hourlySales: number[];
    averageHourlySales: number[];
    totalSettledBills: number;
    totalUnsettledBills: number;
    totalDiscountedBills: number;
    totalNcBills: number;
    paymentReceived: {
      [key: string]: number;
    };
    billWiseSales: {
      rangeWise:{
        lowRange: {
          bills: {
            billId: string;
            totalSales: number;
            time: Timestamp;
          }[];
          totalSales: number;
        };
        mediumRange: {
          bills: {
            billId: string;
            totalSales: number;
            time: Timestamp;
          }[];
          totalSales: number;
        };
        highRange: {
          bills: {
            billId: string;
            totalSales: number;
            time: Timestamp;
          }[];
          totalSales: number;
        }
      },
      maxBillsInRange:number;
      tableWise:{
        table:string;
        tableId:string;
        totalSales:number;
        totalBills:number;
        bills:{
          billId: string,
          time: any,
          totalSales: number,
        }[]
      }[],
      maxTables:number;
      time:{
        time:string;
        timeNumber:number;
        totalSales:number;
        totalBills:number;
        bills:{
          billId: string,
          time: any,
          totalSales: number,
        }[]
      }[]
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
      priceTopCategory:any;
      quantityTopCategory:any;
      byPriceMax:number;
      byQuantityMax:number;
    };
    suspiciousActivities: any[];
    userWiseActions: {
      userId: string;
      actions: {
        bills:any[];
        kots:any[];
        discounts: any[];
        settlements: any[];
        ncs: any[];
      };
    }[
    ];
  }