import { subtle } from 'crypto';
import { HttpsError } from 'firebase-functions/v1/https';
export async function generateHashedPassword(password: string, uid: string) {
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
  uid: string
) {
  let salt = new TextDecoder().decode(
    await subtle.digest('SHA-512', new TextEncoder().encode(uid))
  );
  password = password + salt;
  let hash = await subtle.digest('SHA-512', new TextEncoder().encode(password));
  let stringHash = new TextDecoder().decode(hash);
  if (stringHash === hashedPassword) {
    return true;
  } else {
    throw new HttpsError('unauthenticated', 'Password incorrect');
  }
}
