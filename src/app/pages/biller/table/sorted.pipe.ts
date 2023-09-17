import { Pipe, PipeTransform } from '@angular/core';
import { Table } from '../../../core/constructors/table/Table';

@Pipe({
  name: 'sorted'
})
export class SortedPipe implements PipeTransform {

  transform(value: Table[]): Table[] {
    // sort by table id
    return value.sort((a, b) => b.tableNo - a.tableNo);
  }

}
