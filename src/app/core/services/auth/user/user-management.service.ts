import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { getDoc, doc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private firestore:Firestore,private dbService: NgxIndexedDBService,private auth: Auth,private router: Router) { }
  getUser(uid: string) {
    return getDoc(doc(this.firestore, 'users/' + uid));
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

  logout() {
    signOut(this.auth);
    // clear local storage
    localStorage.clear();
    indexedDB.deleteDatabase('Viraj');
    this.router.navigateByUrl('/login');
  }


  userExists(username: string) {
    return getDoc(doc(this.firestore, 'users/' + username));
  }
}
