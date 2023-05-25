import { Timestamp } from '@angular/fire/firestore';
import { DeviceConstructor } from '../../../types/device.structure';


export class Device implements DeviceConstructor {
  id: string;
  lastLogin: Timestamp;
  constructor(id: string) {
    this.id = id;
    this.lastLogin = Timestamp.now();
  }
}
