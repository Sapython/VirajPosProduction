import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod } from '../../../types/payment.structure';

@Pipe({
  name: 'quickSettle'
})
export class QuickSettlePipe implements PipeTransform {

  transform(value: PaymentMethod[]): PaymentMethod[] {
    return value.filter((method) => method.directSettleButton);
  }

}
