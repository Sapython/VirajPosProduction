import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  Category,
  ComboCategory,
} from '../../../../../types/category.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
})
export class CategoryCardComponent implements OnInit, AfterViewInit {
  @Input() category: Category | ComboCategory | undefined;
  @Input() full: boolean = false;
  @Input() active: boolean = false;
  @Input() hiddenIconVisible: boolean = false;
  @Input() hidden: boolean = false;
  @Input() customLength:number=0;
  @Output() vclick:EventEmitter<any> = new EventEmitter<any>();
  length: number = 0;
  @ViewChild('button') button:ElementRef;
  constructor(public dataProvider: DataProvider) {}
  ngOnInit(): void {
    // console.log("this.category?.products",this.category);
    if (this.category && this.category['products']) {
      this.category as Category;
      this.category['products'].forEach((product) => {
        if (product.visible) {
          this.length += 1;
        }
      });
    } else if (this.category && this.category['combos']) {
      // console.log("this.category['combos']",this.category['combos']);
      this.length = this.category['combos'].length;
    }
  }

  


  filterVisible(products: Product[]) {
    if (!products) return [];
    return products.filter((product) => product.visible || this.full);
  }

  ngAfterViewInit(): void {
    var hammertime = new Hammer(this.button.nativeElement,{
      recognizers:[
        [Hammer.Pan,{direction:Hammer.DIRECTION_ALL}]
      ]
    });
    hammertime.on('panend', (ev)=>{
      console.log("ev.delta",ev.deltaY,ev.deltaX)
      if ((ev.deltaY > 150 || ev.deltaX > 150) && ev.deltaTime < 1000) {
        this.vclick.emit();
      }
    });
  }
}
