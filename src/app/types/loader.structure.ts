import { Timestamp } from '@angular/fire/firestore';

export interface updateRequest {
  // update request with current time passed as global variable and total update time in ms
  currentTime: Timestamp;
  totalUpdateTimeMs: number;
}
