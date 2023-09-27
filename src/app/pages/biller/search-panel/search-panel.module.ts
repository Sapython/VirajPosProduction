import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from './search-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TableModule } from '../table/table.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';

@NgModule({
  declarations: [SearchPanelComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TableModule,
    MatButtonToggleModule,
    FormsModule,
    BaseComponentsModule,
  ],
  exports: [SearchPanelComponent],
})
export class SearchPanelModule {}
