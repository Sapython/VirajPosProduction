import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingRoutingModule } from './loading-routing.module';
import { LoadingComponent } from './loading.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SidebarModule } from '../../biller/sidebar/sidebar.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [LoadingComponent],
  imports: [
    CommonModule,
    LoadingRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    BaseComponentsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    SidebarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatExpansionModule
  ],
})
export class LoadingModule {}
