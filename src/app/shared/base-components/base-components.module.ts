import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { MatRippleModule } from '@angular/material/core';
import { RoundOffPipe } from './round-off.pipe';
import { DialogComponent } from './dialog/dialog.component';
import { PromptComponent } from './prompt/prompt.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HelperComponent } from './helper/helper.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

@NgModule({
  declarations: [
    ButtonComponent,
    IconButtonComponent,
    RoundOffPipe,
    DialogComponent,
    PromptComponent,
    HelperComponent,
  ],
  imports: [
    CommonModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    BrowserModule
  ],
  exports: [
    ButtonComponent,
    IconButtonComponent,
    RoundOffPipe,
    PromptComponent,
    HelperComponent
  ],
})
export class BaseComponentsModule {}
