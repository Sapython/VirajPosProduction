import { Pipe, PipeTransform } from '@angular/core';
import { Table } from '../../../core/constructors/table/Table';

@Pipe({
  name: 'active'
})
export class ActivePipe implements PipeTransform {

  transform(value: Table[]): Table[] {
    return value.filter((table) => ['finalized','active'].includes(table.bill?.stage));
  }

}
