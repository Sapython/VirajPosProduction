import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../../types/product.structure';
import { Kot } from '../../../core/constructors/kot/Kot';

@Pipe({
  name: 'mergedProducts',
})
export class MergedProductsPipe implements PipeTransform {
  transform(value: Kot[] | undefined): Product[] {
    // return merged products
    if (!value) {
      return [];
    }
    let products: Product[] = [];
    // value.forEach((kot)=>{
    //   kot.products.forEach((product)=>{
    //     let index = products.findIndex((p)=>p.id == product.id);
    //     if(index == -1){
    //       products.push(product);
    //     }else{
    //       products[index].quantity += product.quantity;
    //     }
    //   })
    // })
    return products;
  }
}
