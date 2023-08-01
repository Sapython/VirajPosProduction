import { Pipe, PipeTransform } from '@angular/core';
import { ExtendedBillConstructor } from './history.component';

@Pipe({
  name: 'dateGroup',
})
export class DateGroupPipe implements PipeTransform {
  transform(
    bills: ExtendedBillConstructor[],
  ): { date: Date; bills: ExtendedBillConstructor[] }[] {
    let groups = bills.reduce(
      (acc, bill) => {
        let index = acc.findIndex((group) => {
          let billDate = new Date(bill.createdDate.toDate());
          let groupDate = new Date(group.date);
          return (
            billDate.getDate() == groupDate.getDate() &&
            billDate.getMonth() == groupDate.getMonth() &&
            billDate.getFullYear() == groupDate.getFullYear()
          );
        });
        if (index == -1) {
          acc.push({ date: bill.createdDate.toDate(), bills: [bill] });
        } else {
          acc[index].bills.push(bill);
        }
        return acc;
      },
      [] as { date: Date; bills: ExtendedBillConstructor[] }[],
    );
    return groups;
  }
}
