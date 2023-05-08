import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsComponent } from './actions.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CancelComponent } from './cancel/cancel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SettleComponent } from './settle/settle.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { NonChargeableComponent } from './non-chargeable/non-chargeable.component';
import { BaseComponentsModule } from 'src/app/base-components/base-components.module';
import { ActiveKotModule } from '../active-kot/active-kot.module';
import { SplitBillComponent } from './split-bill/split-bill.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogModule } from '@angular/cdk/dialog';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    ActionsComponent,
    CancelComponent,
    SettleComponent,
    AddDiscountComponent,
    NonChargeableComponent,
    SplitBillComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    BaseComponentsModule,
    MatDialogModule,
    ActiveKotModule,
    MatCheckboxModule,
    DialogModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  exports:[
    ActionsComponent
  ]
})
export class ActionsModule { }
