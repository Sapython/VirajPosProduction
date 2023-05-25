import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared/guards/auth-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/auth/loading/loading.module').then((m) => m.LoadingModule),
      data:{
        animation:'isLeft'
      }
  },
  {
    path: 'biller',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/biller/biller.module').then((m) => m.BillerModule),
      data:{
        animation:'isRight'
      }
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
