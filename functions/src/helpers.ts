import { subtle } from 'crypto';
import { HttpsError } from 'firebase-functions/v1/https';

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export async function validateAny(value:any,type:'string'|'number'|'boolean'|'object'|'array',keys?:string[]){
    if(typeof value !== type){
        throw new HttpsError(
            'invalid-argument',
            'Invalid value'
        );
    }
    if(keys && keys.length > 0 && typeof value === 'object'){
        for(let key of keys){
            if(!value[key]){
                throw new HttpsError(
                    'invalid-argument',
                    'Invalid value missing '+key
                );
            }
        }
    }
    return true;
}

export async function generateHashedPassword(password: string,uid:string) {
  // generate salt
  let salt = new TextDecoder().decode(
    await subtle.digest('SHA-512', new TextEncoder().encode(uid))
  );
  password = password + salt;
  let hash = await subtle.digest('SHA-512', new TextEncoder().encode(password));
  let stringHash = new TextDecoder().decode(hash);
  return stringHash;
}

export async function verifyPassword(
    password: string,
    hashedPassword: string,
    uid:string
    ) {
    let salt = new TextDecoder().decode(
        await subtle.digest('SHA-512', new TextEncoder().encode(uid))
    );
    password = password + salt;
    let hash = await subtle.digest('SHA-512', new TextEncoder().encode(password));
    let stringHash = new TextDecoder().decode(hash);
    if (stringHash === hashedPassword){
        return true;
    } else {
        throw new HttpsError('unauthenticated', 'Password incorrect');
    }
}

export function validatePassword(password: string) {
    if (
      typeof password != 'string' ||
      !password ||
      password.length < 4 ||
      password.length > 20
    ) {
        throw new HttpsError(
            'invalid-argument',
            'Password must be between 8 and 20 characters'
        );
    }
    return true;
}

export function validateEmail(email: string) {
    if (
        typeof email != 'string' ||
        !email ||
        email.length < 6 ||
        email.length > 30
    ) {
        throw new HttpsError(
            'invalid-argument',
            'Invalid email address'
        );
    }
    return true;
}

export function validateName(name: string) {
    if (
        typeof name != 'string' ||
        !name ||
        name.length < 3 ||
        name.length > 20
    ) {
        throw new HttpsError(
            'invalid-argument',
            'Name must be between 3 and 20 characters'
        );
    }
    return true;
}

export function validatePhone(phone: string) {
    if (
        typeof phone != 'string' ||
        !phone ||
        phone.length != 10
    ) {
        throw new HttpsError(
            'invalid-argument',
            'Invalid phone number'
        );
    }
    return true;
}

export function validateImage(image: string) {
    if (
        typeof image !== 'string' ||
        !image.includes('http')
    ) {
        throw new HttpsError(
            'invalid-argument',
            'Invalid image url'
        );
    }
    return true;
}

export function validateBusiness(business:any){
    if(typeof business !== 'object' ||
    !business.access ||
    !business.address ||
    !business.businessId ||
    !business.joiningDate ||
    !business.name){
        throw new HttpsError(
            'invalid-argument',
            'Invalid business object'
        );
    }
    return true;
}