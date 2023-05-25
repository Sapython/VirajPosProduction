import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { SlideToggleComponent } from './slide-toggle/slide-toggle.component';
import { MatRippleModule } from '@angular/material/core';
import { SlideButtonComponent } from './slide-toggle/slide-button/slide-button.component';
import { SlideButtonDirective } from './slide-toggle/slide-button.directive';
import { RoundOffPipe } from './round-off.pipe';
import { DialogComponent } from './dialog/dialog.component';
import { PromptComponent } from './prompt/prompt.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    ButtonComponent,
    IconButtonComponent,
    SlideToggleComponent,
    SlideButtonComponent,
    SlideButtonDirective,
    RoundOffPipe,
    DialogComponent,
    PromptComponent,
  ],
  imports: [
    CommonModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  exports:[
    ButtonComponent,
    IconButtonComponent,
    SlideToggleComponent,
    SlideButtonDirective,
    RoundOffPipe,
    PromptComponent
  ]
})
export class BaseComponentsModule { }
