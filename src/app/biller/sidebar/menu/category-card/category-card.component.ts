import { Component, Input } from '@angular/core';
import { Product } from 'src/app/biller/constructors';
import { DataProvider } from 'src/app/provider/data-provider.service';
import { Category, RootCategory } from 'src/app/structures/general.structure';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent {
  @Input() category:Category|undefined;
  @Input() full:boolean = false;
  length:number = 0;
  constructor(public dataProvider:DataProvider){
    // console.log("this.category?.products",this.category?.products);
    this.category?.products.forEach((product)=>{
      if(product.visible){
        this.length += product.quantity;
      }
    })
  }

  filterVisible(products:Product[]){
    return products.filter((product)=>product.visible || this.full);
  }

  
}
