import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemComponent } from './system.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DialogModule } from '@angular/cdk/dialog';
import { ChatComponent } from './chat/chat.component';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import { HistoryComponent } from './history/history.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReprintReasonComponent } from './history/reprint-reason/reprint-reason.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActiveKotModule } from '../active-kot/active-kot.module';
import { TableGroupsPipe } from './history/table-groups.pipe';
import { DateGroupPipe } from './history/date-group.pipe';
import { ModePipe } from './history/mode.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    SystemComponent,
    ChatComponent,
    HistoryComponent,
    ReprintReasonComponent,
    TableGroupsPipe,
    DateGroupPipe,
    ModePipe,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    DialogModule,
    BaseComponentsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatExpansionModule,
    MatButtonModule,
    MatTabsModule,
    MatSlideToggleModule,
    ActiveKotModule,
    MatMenuModule,
    MatTooltipModule
  ],
  exports: [SystemComponent],
})
export class SystemModule {}
