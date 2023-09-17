import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogModule } from '@angular/cdk/dialog';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RearrangeComponent } from './rearrange/rearrange.component';
import { MatSelectModule } from '@angular/material/select';
import { GroupComponent } from './group/group.component';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MoveKotItemComponent } from './move-kot-item/move-kot-item.component';
import { MergeExchangeTableComponent } from './merge-exchange-table/merge-exchange-table.component';
import { SortedPipe } from './sorted.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ActivePipe } from './active.pipe';
import { HoldedPipe } from './holded.pipe'; 

@NgModule({
  declarations: [
    TableComponent,
    RearrangeComponent,
    GroupComponent,
    MoveKotItemComponent,
    MergeExchangeTableComponent,
    SortedPipe,
    ActivePipe,
    HoldedPipe,
  ],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    BaseComponentsModule,
    MatIconModule,
    MatRippleModule,
    FormsModule,
    MatTabsModule,
    MatCheckboxModule,
    DialogModule,
    DragDropModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    ScrollingModule,
  ],
})
export class TableModule {}
