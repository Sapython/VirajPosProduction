import { Pipe, PipeTransform } from '@angular/core';
import { BillConstructor } from '../../../../types/bill.structure';
import { ExtendedBillConstructor } from './history.component';

@Pipe({
  name: 'tableGroups',
})
export class TableGroupsPipe implements PipeTransform {
  transform(
    bills: ExtendedBillConstructor[],
  ): {
    table: { id: string; name: string };
    bills: ExtendedBillConstructor[];
  }[] {
    let groups = bills.reduce(
      (acc, bill) => {
        let index = acc.findIndex((group) => group.table == bill.table);
        if (index == -1) {
          acc.push({ table: bill.table, bills: [bill] });
        } else {
          acc[index].bills.push(bill);
        }
        return acc;
      },
      [] as {
        table: { id: string; name: string };
        bills: ExtendedBillConstructor[];
      }[],
    );
    return groups;
  }
}
