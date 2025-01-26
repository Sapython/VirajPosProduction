import { Injectable } from '@angular/core';
import { Functions, httpsCallableFromURL } from '@angular/fire/functions';
import {
  Auth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { ElectronService } from '../../electron/electron.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  signInWithUserAndPasswordFunction = httpsCallableFromURL(
    this.functions,
    'https://signinwithuserandpassword-3mazqb66kq-el.a.run.app',
  );
  constructor(
    private functions: Functions,
    private auth: Auth,
    private electronService: ElectronService,
  ) {}

  async signInWithUserAndPassword(username: string, password: string,dontLogin:boolean=false) {
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
    let signInRequest = await this.signInWithUserAndPasswordFunction({
      username,
      password,
    });
    if (dontLogin){
      return
    }
    return this.loginWithCustomToken(signInRequest.data['token']);
    //  console.log("signInRequest",signInRequest);
  }

  loginWithCustomToken(token: string) {
    window.localStorage.setItem('signInToken', token);
    this.electronService.setAuth(token);
    return signInWithCustomToken(this.auth, token);
  }
  

  loginWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signInWithCustomToken(token: string) {
    window.localStorage.setItem('signInToken', token);
    this.electronService.setAuth(token);
    return signInWithCustomToken(this.auth, token);
  }
}
