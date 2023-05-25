import { Bill } from '..';
import { Table } from '../../table/Table';

export function setTable(this: Bill, table: Table) {
  this.table = table;
  this.updated.next();
}
