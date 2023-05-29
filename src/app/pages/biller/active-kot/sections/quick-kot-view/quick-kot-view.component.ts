import { Component, Input } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-quick-kot-view',
  templateUrl: './quick-kot-view.component.html',
  styleUrls: ['./quick-kot-view.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class QuickKotViewComponent {
  constructor(public dataProvider:DataProvider) {}
  @Input() kotNoColors:any[] = [];

  isHalf(product:Product) {
    if (product) {
      for (const tag of product.tags) {
        if (tag.name.toLocaleLowerCase() == 'half') {
          return true;
        }
      }
    } else {
      return false;
    }
  }
}
