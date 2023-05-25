import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmergencyComponent } from './emergency.component';
import { KotComponent } from './cards/kot/kot.component';
import { BillComponent } from './cards/bill/bill.component';
import { OrderComponent } from './cards/order/order.component';
import { TableComponent } from './cards/table/table.component';
import { ReceiveComponent } from './cards/receive/receive.component';
import { DisperseComponent } from './cards/disperse/disperse.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';



@NgModule({
  declarations: [
    EmergencyComponent,
    KotComponent,
    BillComponent,
    OrderComponent,
    TableComponent,
    ReceiveComponent,
    DisperseComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    BaseComponentsModule
  ],
  exports:[
    EmergencyComponent
  ]
})
export class EmergencyModule { }
