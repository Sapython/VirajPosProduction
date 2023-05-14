// import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";
import { getAuth } from "firebase-admin/auth";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { subtle } from 'crypto'
import { HttpsError } from "firebase-functions/v1/https";
// let serviceAccount = require('fbms-shreeva-demo-firebase-adminsdk-8nk63-28663566a0.json')
let app = initializeApp(); 

let auth = getAuth(app);
let firestore = getFirestore(app);


export const userNameAvailable = functions.https.onCall(async (request, response) => {
    console.log("request.body",request);
    if (!request.username || request.username.length < 4 || request.username.length > 20) {
        return { stage: 'invalid' };
    }
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
})

export const updateUser = functions.https.onCall(async (request, response) => {
    let data:any =  {
        displayName:request.username,
    }
    if (request.email){
        console.log("updating email");
        data.email = request.email
        data.emailVerified = false
    }
    if (request.phone) {
        if (!request.phone.startsWith('+91')) {
            request.phone = '+91' + request.phone
        }
        console.log("updating phone");
        data.phoneNumber = request.phone
    }
    data.password = request.password
    return await auth.updateUser(request.username,data)
})

export const signUpWithUserAndPassword = functions.https.onCall(async (request, response) => {
    // check all the types of variables used
    // validations for all the fields
    console.log("request data",request);
    if (typeof(request.username) !='string' || !request.username || request.username.length < 4 || request.username.length > 20) {
        throw new HttpsError('invalid-argument', 'Username must be between 4 and 20 characters');
    }
    if (typeof(request.password) !='string' || !request.password || request.password.length < 4 || request.password.length > 20) {
        throw new HttpsError('invalid-argument', 'Password must be between 8 and 20 characters');
    }
    // check if userId exists
    let uidDoc = await firestore.doc('users/' + request.username).get()
    if (uidDoc.exists) {
        throw new HttpsError('already-exists', 'Username already exists');
    }
    // check for fields {business,email (optional), image (optional), phone (optional), username}
    if (!request.username || !request.password) {
        throw new HttpsError('invalid-argument', 'Missing fields. Username and password are required');
        // return { error: 'Missing fields' }
    }
    if (!request.business) {
        // return { error: 'Missing fields' }
        throw new HttpsError('invalid-argument', 'Missing fields. Business is required');
    }
    let additonalClaims:AdditonalClaims = {business:[],providerId:'custom'}
    if (request.email) {
        if (typeof(request.email) !== 'string' || !request.email.includes('@')) {
            throw new HttpsError('invalid-argument', 'Email is invalid');
        }
        additonalClaims['email'] = request.email
    }
    if (request.image) {
        if (typeof(request.image) !== 'string' || !request.image.includes('http')) {
            throw new HttpsError('invalid-argument', 'Image url is invalid');
        }
        additonalClaims['image'] = request.image
    }
    if (request.phone) {
        if (typeof(request.phone) !== 'string' || request.phone.length !== 10) {
            throw new HttpsError('invalid-argument', 'Phone number is invalid');
        }
        additonalClaims['phone'] = request.phone
    }
    if (request.business) {
        if (typeof(request.business) !== 'object' || !request.business.access || !request.business.address || !request.business.businessId || !request.business.joiningDate || !request.business.name) {
            throw new HttpsError('invalid-argument', 'Business is invalid');
        }
        // request.business.joiningDate.nanoseconds, request.business.joiningDate.seconds
        request.business.joiningDate = new Timestamp(request.business.joiningDate.seconds, request.business.joiningDate.nanoseconds)
        request.business.access.lastUpdated = new Timestamp(request.business.access.lastUpdated.seconds, request.business.access.lastUpdated.nanoseconds)
        additonalClaims['business'] = [request.business]
    } else {
        throw new HttpsError('invalid-argument', 'Business is required');
    }
    // validations done
    console.log("validations done");
    
    // ===============

    // get password
    let password = request.password
    // generate salt
    let salt = new TextDecoder().decode(await subtle.digest("SHA-512", new TextEncoder().encode(uidDoc.id)))
    password = password + salt
    console.log("generated password salt");
    // hash password
    let hash = await subtle.digest("SHA-512", new TextEncoder().encode(password));
    console.log("generated password hash");
    // create custom token
    console.log("trying creating custom token");
    let stringHash = new TextDecoder().decode(hash)
    let authReq = await auth.createCustomToken(uidDoc.id,{
        username: uidDoc.id,
        ...additonalClaims
    })
    console.log("created custom token");
    // console.log("trying updating email",request.email);
    
    additonalClaims['providerId'] = 'custom';
    console.log("updated custom token");
    // store username and password hash in firestore
    await firestore.doc('authData/' + uidDoc.id).set({
        username: uidDoc.id,
        password: stringHash,
        ...additonalClaims
    })
    await firestore.doc('users/' + uidDoc.id).set({
        username: uidDoc.id,
        ...additonalClaims
    })
    console.log("created firestore document");
    // sign in with custom token
    return { token: authReq, uid: uidDoc.id,...additonalClaims, loginTime: Timestamp.now() }
});

export const signInWithUserAndPassword = functions.https.onCall(async (request, response) => {
    if (typeof(request.username) !='string' || !request.username || request.username.length < 4 || request.username.length > 20) {
        throw new HttpsError('invalid-argument', 'Username must be between 4 and 20 characters');
    }
    if (typeof(request.password) !='string' || !request.password || request.password.length < 4 || request.password.length > 20) {
        throw new HttpsError('invalid-argument', 'Password must be between 8 and 20 characters');
    }
    // check if userId exists
    let uidDoc = await firestore.doc('authData/' + request.username).get()
    if (!uidDoc.exists) {
        throw new HttpsError('not-found', 'Username not found');
    }
    // check for fields {username,password}
    if (!request.username || !request.password) {
        throw new HttpsError('invalid-argument', 'Missing fields. Username and password are required');
    }
    // get password
    let password = request.password
    // generate salt
    let salt = new TextDecoder().decode(await subtle.digest("SHA-512", new TextEncoder().encode(uidDoc.id)))
    password = password + salt
    // hash password
    let hash = await subtle.digest("SHA-512", new TextEncoder().encode(password));
    let stringHash = new TextDecoder().decode(hash)
    // check if password matches
    console.log("Password hashes",uidDoc.data()?.password, stringHash);
    if (stringHash !== uidDoc.data()?.password) {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
    // create custom token
    let authReq = await auth.createCustomToken(uidDoc.id, uidDoc.data())
    // sign in with custom token
    return { token: authReq, uid: uidDoc.id, ...uidDoc.data() }
})
interface AdditonalClaims {email?:string,providerId:string,image?:string,phone?:string,business:{access:{accessLevel:string,lastUpdated:Timestamp,updatedBy:string},address:string,businessId:string,joiningDate:Timestamp,name:string}[]}

