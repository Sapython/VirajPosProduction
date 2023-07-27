import { Pipe, PipeTransform } from '@angular/core';
import { CodeBaseDiscount, DirectPercentDiscount, DirectFlatDiscount } from '../../../../../../../types/discount.structure';

@Pipe({
  name: 'discountedBills'
})
export class DiscountedBillsPipe implements PipeTransform {

  transform(discounts: (CodeBaseDiscount | DirectPercentDiscount | DirectFlatDiscount)[]): number {
    let totalDiscount = 0;
    discounts.forEach((discount)=>{
      totalDiscount += discount.totalAppliedDiscount;
    });
    return totalDiscount;
  }

}
