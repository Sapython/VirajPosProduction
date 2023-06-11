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

@NgModule({
  declarations: [TableComponent, RearrangeComponent],
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
  ],
})
export class TableModule {}
