import { NgModule } from '@angular/core';
import { BillerComponent } from './biller.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: BillerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillerRoutingModule {}
