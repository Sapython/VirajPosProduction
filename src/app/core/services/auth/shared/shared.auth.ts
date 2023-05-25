import { signInWithCustomToken } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

export function setupDevice() {
  // check if there is a device in indexedDB if yes then return it else create a new one and return it
  firstValueFrom(this.dbService.getAll('device'))
    .then((data: any) => {
      console.log('success', data);
      if (data && data.length > 0) {
        console.log('Device found', data);
        this.dataProvider.currentDevice = {
          id: data[0].deviceId,
          lastLogin: Timestamp.now(),
        };
      } else {
        let id = this.generateDeviceId().toString();
        firstValueFrom(
          this.dbService.add('device', {
            deviceId: id,
          })
        ).catch((err) => {
          console.log('Error', err);
          let id = this.generateDeviceId().toString();
        });
        this.dataProvider.currentDevice = {
          id: id,
          lastLogin: Timestamp.now(),
        };
      }
    })
    .catch((err) => {
      console.log('Error', err);
    });
}
export function generateDeviceId() {
  return Math.floor(Math.random() * 100000000000000000);
}

export function loginWithCustomToken(token: string) {
  window.localStorage.setItem('signInToken', token);
  this.electronService.setAuth(token);
  return signInWithCustomToken(this.auth, token);
}
