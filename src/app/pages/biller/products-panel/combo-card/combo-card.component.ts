import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Combo } from '../../../../types/combo.structure';

@Component({
  selector: 'app-combo-card',
  templateUrl: './combo-card.component.html',
  styleUrls: ['./combo-card.component.scss']
})
export class ComboCardComponent {
  @Input() combo:Combo;
  @Output() open:EventEmitter<Combo> = new EventEmitter<Combo>();
}
