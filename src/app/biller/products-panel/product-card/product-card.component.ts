import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() productName: string = '';
  @Input() price: number = 0;
  @Input() smaller: boolean = false;
  @Input() category: string = '';
  @Input() veg: boolean = true;
}
