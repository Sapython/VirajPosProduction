import { Component, Input } from '@angular/core';
import { Combo } from '../../../../types/combo.structure';
import { ApplicableCombo } from '../../../../core/constructors/comboKot/comboKot';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';

@Component({
  selector: 'app-combo-item',
  templateUrl: './combo-item.component.html',
  styleUrls: ['./combo-item.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class ComboItemComponent {
  @Input() combo:ApplicableCombo;
  @Input() activeKotIndex:number = 0;
}
