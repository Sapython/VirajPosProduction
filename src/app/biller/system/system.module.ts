import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemComponent } from './system.component';
import { MatIconModule } from '@angular/material/icon';
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


@NgModule({
  declarations: [
    SystemComponent,
    ChatComponent,
    HistoryComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
    BaseComponentsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatExpansionModule
  ],
  exports:[
    SystemComponent
  ]
})
export class SystemModule { }
