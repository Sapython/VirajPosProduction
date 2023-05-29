import { Component, EventEmitter, Output } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Product } from '../../../../../types/product.structure';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';

@Component({
  selector: 'app-edit-kot',
  templateUrl: './edit-kot.component.html',
  styleUrls: ['./edit-kot.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class EditKotComponent {
  constructor(public dataProvider:DataProvider){}
  @Output() delete = new EventEmitter<Product>();
}
