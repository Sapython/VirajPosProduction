import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Product } from '../../../../../types/product.structure';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { Kot } from '../../../../../core/constructors/kot/Kot';
import { ApplicableCombo } from '../../../../../core/constructors/comboKot/comboKot';

@Component({
  selector: 'app-edit-kot',
  templateUrl: './edit-kot.component.html',
  styleUrls: ['./edit-kot.component.scss'],
  animations: [
    zoomInOnEnterAnimation({ duration: 300 }),
    zoomOutOnLeaveAnimation({ duration: 300 }),
  ],
})
export class EditKotComponent {
  constructor(public dataProvider: DataProvider) {}
  @Input() kots: Kot[] = [];
  @Input() activeKotIndex: number = 0;
  @Output() delete = new EventEmitter<Product | ApplicableCombo>();
}
