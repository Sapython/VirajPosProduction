import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  constructor(private firestore: Firestore) {}

  upgrade(data: any) {
    return addDoc(collection(this.firestore, 'upgradeRequests'), data);
  }
}
