import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component } from '@angular/core';
import { TableComponent } from './table/table.component';
import { DataProvider } from '../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-biller',
  templateUrl: './biller.component.html',
  styleUrls: ['./biller.component.scss'],
})
export class BillerComponent implements AfterViewInit {
  expanded: boolean = true;
  constructor(
    private dialog: Dialog,
    public dataProvider: DataProvider,
  ) {
    this.dataProvider.openTableView.subscribe(async (open) => {
      //  console.log("this.dataProvider.currentBill.allProducts()",this.dataProvider.currentBill?.allProducts());
      if (
        this.dataProvider.currentBill &&
        this.dataProvider.currentBill.allProducts().length == 0
      ) {
        this.dataProvider.currentTable?.clearTable();
        this.dataProvider.currentBill = undefined;
        this.dataProvider.currentTable = undefined;
      } else {
        if (
          this.dataProvider.currentBill &&
          this.dataProvider.currentBill.allFinalProducts.length == 0
        ) {
          let res = await this.dataProvider.confirm(
            'Bill already started',
            [1],
            {
              description:
                'A bill is already started on this table. Press remove to remove the bill or press continue to continue with bill.',
              buttons: ['continue', 'remove'],
            },
          );
          if (res) {
            this.dataProvider.currentTable?.clearTable();
            this.dataProvider.currentBill = undefined;
            this.dataProvider.currentTable = undefined;
          }
        }
      }
      dialog.open(TableComponent);
    });
  }

  ngAfterViewInit(): void {
    // console.log("MENU LOADED",this.dataProvider.currentMenu);
    //   if(this.dataProvider.currentMenu.products.length){
    //     console.log("Menu loaded");
    //   } else {
    //     console.log("Menu not loaded");
    //   }
  }
}
