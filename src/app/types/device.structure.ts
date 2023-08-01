import { Timestamp } from '@angular/fire/firestore';

export interface DeviceConstructor {
  id: string;
  lastLogin: Timestamp;
}
