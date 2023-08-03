import { Component, Inject } from '@angular/core';
import { Table } from '../../../../core/constructors/table/Table';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { ApplicableCombo } from '../../../../core/constructors/comboKot/comboKot';
import { Kot } from '../../../../core/constructors/kot/Kot';
import { Product } from '../../../../types/product.structure';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TableService } from '../../../../core/services/database/table/table.service';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-move-kot-item',
  templateUrl: './move-kot-item.component.html',
  styleUrls: ['./move-kot-item.component.scss'],
})
export class MoveKotItemComponent {
  moveKotSelectedTable: Table | undefined;
  tables: Table[] = [];
  moveKotMode: boolean = false;
  constructor(
    public dataProvider: DataProvider,
    @Inject(DIALOG_DATA) data: any,
    public dialogRef: DialogRef,
    private tableService: TableService,
  ) {
    this.moveKotSelectedTable = data.table;
    this.tables = this.dataProvider.tables.filter(
      (table) => table.id != this.moveKotSelectedTable?.id,
    );
  }

  moveSelectedKots(table: Table, event: any) {
    if (!table.bill) {
      table.occupyTable();
    }
    // get all selected productcs from selected kots from moveKotSelectedTable?.bill?.kots
    let kots: Kot[] = [];
    let products: (Product | ApplicableCombo)[] = [];
    this.moveKotSelectedTable?.bill?.kots.forEach((kot) => {
      if (kot.allSelected) {
        kots.push(kot);
        //  console.log('Adding kot ', kot.products);
      } else {
        products.push(...kot.products.filter((p) => p.selected));
        console.log(
          'Adding products ',
          ...kot.products.filter((p) => p.selected),
        );
      }
    });
    //  console.log('kots ', kots);
    //  console.log('products ', products);
    // now shift the kots to the new table and add products to a new kot
    if (kots.length > 0) {
      kots.forEach((kot) => {
        table.bill!.kots.push(kot);
        table.bill!.tokens.push(kot.id);
        // remove kot from old table
        this.moveKotSelectedTable!.bill!.kots =
          this.moveKotSelectedTable!.bill!.kots.filter((k) => {
            return k.id != kot.id;
          });
      });
    }
    if (products.length > 0) {
      products.forEach((product) => {
        product.transferred = this.moveKotSelectedTable?.id;
        table.bill!.addProduct(product);
      });
      // remove products from old table
      this.moveKotSelectedTable!.bill!.kots.forEach((kot) => {
        kot.products = kot.products.filter((p) => {
          return !p.selected;
        });
      });
    }
    this.tableService.addTableActivity({
      type: 'move',
      from: this.moveKotSelectedTable.toObject(),
      to: table.toObject(),
      items: products,
      time: serverTimestamp(),
    });
    this.moveKotSelectedTable!.bill?.calculateBill();
    table.bill?.calculateBill();
  }

  isNumber(value: any) {
    return !isNaN(Number(value));
  }
}
