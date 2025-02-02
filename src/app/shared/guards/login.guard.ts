import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataProvider } from '../../core/services/provider/data-provider.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard  {
  constructor(private dataProvider: DataProvider) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return !this.dataProvider.loggedIn;
  }
}
