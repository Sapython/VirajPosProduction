import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillerComponent } from './biller.component';

const routes: Routes = [{ path: '', component: BillerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillerRoutingModule { }
