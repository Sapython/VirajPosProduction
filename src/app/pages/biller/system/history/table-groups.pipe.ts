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
        let index = acc.findIndex((group) => group.table.id == bill.table.id);
        if (index == -1) {
          acc.push({ table: {name:bill.table.name,id:bill.table.id}, bills: [bill] });
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
