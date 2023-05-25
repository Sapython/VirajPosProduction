import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopoverService {
  private state: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  getState(): Observable<boolean> {
    return this.state.asObservable();
  }

  setState(value: boolean) {
    return this.state.next(value);
  }
}
