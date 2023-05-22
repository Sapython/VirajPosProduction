import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemComponent } from './system.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DialogModule } from '@angular/cdk/dialog';
import { ChatComponent } from './chat/chat.component';
import { BaseComponentsModule } from '../../base-components/base-components.module';
import { HistoryComponent } from './history/history.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import { ReprintReasonComponent } from './history/reprint-reason/reprint-reason.component'; 


@NgModule({
  declarations: [
    SystemComponent,
    ChatComponent,
    HistoryComponent,
    ReprintReasonComponent
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
    MatButtonModule
  ],
  exports:[
    SystemComponent
  ]
})
export class SystemModule { }
