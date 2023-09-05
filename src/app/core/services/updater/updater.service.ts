import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdaterService {
  recalculateBill:Subject<void> = new Subject<void>();
  constructor() { }
}
