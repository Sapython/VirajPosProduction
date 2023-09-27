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



@NgModule({
  declarations: [
    ButtonComponent,
    IconButtonComponent,
    SlideToggleComponent,
    SlideButtonComponent,
    SlideButtonDirective,
    RoundOffPipe,
    DialogComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule
  ],
  exports:[
    ButtonComponent,
    IconButtonComponent,
    SlideToggleComponent,
    SlideButtonDirective,
    RoundOffPipe
  ]
})
export class BaseComponentsModule { }
