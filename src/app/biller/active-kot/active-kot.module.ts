import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveKotComponent } from './active-kot.component';
import { KotItemComponent } from './kot-item/kot-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponentsModule } from 'src/app/base-components/base-components.module';
import { MergedProductsPipe } from './merged-products.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { LineDiscountComponent } from './kot-item/line-discount/line-discount.component';
import { LineCancelComponent } from './kot-item/line-cancel/line-cancel.component'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    ActiveKotComponent,
    KotItemComponent,
    MergedProductsPipe,
    LineDiscountComponent,
    LineCancelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    BaseComponentsModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports:[
    ActiveKotComponent,
    KotItemComponent
  ]
})
export class ActiveKotModule { }
