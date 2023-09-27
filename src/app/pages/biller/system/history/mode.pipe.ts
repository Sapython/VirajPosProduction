import { Pipe, PipeTransform } from '@angular/core';
import { ExtendedBillConstructor } from './history.component';

@Pipe({
  name: 'mode',
})
export class ModePipe implements PipeTransform {
  transform(
    bills: ExtendedBillConstructor[],
    args: 'online' | 'dineIn' | 'takeaway' | 'all',
  ): ExtendedBillConstructor[] {
    if (args == 'all') return bills;
    return bills.filter((bill) => bill.mode == args);
  }
}
