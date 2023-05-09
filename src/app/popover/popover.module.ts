import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverDirective } from './popover.directive';
import { PopoverContainerComponent } from './popover-container/popover-container.component';
import { PopoverService } from './popover.service';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';



@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [PopoverDirective, PopoverContainerComponent],
  exports: [PopoverDirective, PopoverContainerComponent],
  providers: [Overlay, PopoverService]
})
export class PopoverModule { }
