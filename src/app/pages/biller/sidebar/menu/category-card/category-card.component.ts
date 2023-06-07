import { Component, Input } from '@angular/core';
import { Category } from '../../../../../types/category.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent {
  @Input() category:Category|undefined;
  @Input() full:boolean = false;
  @Input() active:boolean = false;
  length:number = 0;
  constructor(public dataProvider:DataProvider){
    // console.log("this.category?.products",this.category?.products);
    if (this.category?.products){
      this.category?.products.forEach((product)=>{
        if(product.visible){
          this.length += product.quantity;
        }
      })
    }
  }

  filterVisible(products:Product[]){
    if (!products) return [];
    return products.filter((product)=>product.visible || this.full);
  }

  
}
