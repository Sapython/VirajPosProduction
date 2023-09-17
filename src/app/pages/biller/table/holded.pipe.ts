import { Pipe, PipeTransform } from '@angular/core';
import { Table } from '../../../core/constructors/table/Table';

@Pipe({
  name: 'holded'
})
export class HoldedPipe implements PipeTransform {

  transform(tables:Table[]): Table[] {
    return tables.filter((table) => table.bill?.stage === 'hold');
  }

}
