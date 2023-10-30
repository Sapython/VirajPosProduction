import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TableComponent } from './table/table.component';
import { DataProvider } from '../../core/services/provider/data-provider.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-biller',
  templateUrl: './biller.component.html',
  styleUrls: ['./biller.component.scss'],
})
export class BillerComponent implements OnDestroy {
  expanded: boolean = true;
  openTableViewSubscription:Subscription = Subscription.EMPTY;
  constructor(
    private dialog: Dialog,
    public dataProvider: DataProvider,
  ) {
    this.openTableViewSubscription = this.dataProvider.openTableView.subscribe(async (open) => {
      //  console.log("this.dataProvider.currentBill.allProducts()",this.dataProvider.currentBill?.allProducts());
      if (
        this.dataProvider.currentBill &&
        this.dataProvider.currentBill.allProducts().length == 0 && 
        this.dataProvider.currentBill.mode =='takeaway' &&
        this.dataProvider.currentBill.table.tableNo == 'new'
      ) {
        this.dataProvider.currentBill.table.deleteTable();
      }
      this.dataProvider.currentBill = undefined;
      this.dataProvider.currentTable = undefined;
      dialog.open(TableComponent);
    });
  }

  ngOnDestroy(): void {
    this.openTableViewSubscription.unsubscribe();
  }

}
