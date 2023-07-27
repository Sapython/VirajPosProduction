import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Kot } from '../../../../../core/constructors/kot/Kot';
import { Product } from '../../../../../types/product.structure';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { ApplicableCombo } from '../../../../../core/constructors/comboKot/comboKot';

@Component({
  selector: 'app-normal-kot',
  templateUrl: './normal-kot.component.html',
  styleUrls: ['./normal-kot.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class NormalKotComponent {
  @Input() kots:Kot[] = [];
  @Input() activeKotIndex:number = 0;
  @Output() delete = new EventEmitter<Product|ApplicableCombo>();
}
