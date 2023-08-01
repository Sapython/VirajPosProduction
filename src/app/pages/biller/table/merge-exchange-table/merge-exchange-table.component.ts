import { Component } from '@angular/core';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { Table } from '../../../../core/constructors/table/Table';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DialogRef } from '@angular/cdk/dialog';
import { TableService } from '../../../../core/services/database/table/table.service';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-merge-exchange-table',
  templateUrl: './merge-exchange-table.component.html',
  styleUrls: ['./merge-exchange-table.component.scss'],
})
export class MergeExchangeTableComponent {
  moveKotMode: boolean = false;
  transferTableWise: {
    fromTable: Table | undefined;
    toTable: Table | undefined;
  } = { fromTable: undefined, toTable: undefined };
  moveKotSelectedTable: Table | undefined;
  constructor(
    public dataProvider: DataProvider,
    private alertify: AlertsAndNotificationsService,
    public dialogRef: DialogRef,
    private tableService: TableService,
  ) {}

  isNumber(value: any) {
    return !isNaN(Number(value));
  }

  exchange() {
    if (this.transferTableWise.fromTable && this.transferTableWise.toTable) {
      try {
        this.transferTableWise.fromTable.exchange(
          this.transferTableWise.toTable,
        );
        this.alertify.presentToast('Table exchanged successfully');
        // reset vars and switch mode
        this.tableService.addTableActivity({
          time: serverTimestamp(),
          from: this.transferTableWise.fromTable.toObject(),
          to: this.transferTableWise.toTable.toObject(),
          type: 'exchange',
        });
        this.transferTableWise = { fromTable: undefined, toTable: undefined };
        this.moveKotMode = false;
        this.moveKotSelectedTable = undefined;
      } catch (error: any) {
        this.alertify.presentToast(error);
      }
    }
  }

  merge() {
    if (this.transferTableWise.fromTable && this.transferTableWise.toTable) {
      try {
        this.transferTableWise.fromTable.merge(this.transferTableWise.toTable);
        this.tableService.addTableActivity({
          time: serverTimestamp(),
          from: this.transferTableWise.fromTable.toObject(),
          to: this.transferTableWise.toTable.toObject(),
          type: 'merge',
        });
        this.alertify.presentToast('Table merged successfully');
        // reset vars and switch mode
        this.transferTableWise = { fromTable: undefined, toTable: undefined };
        this.moveKotMode = false;
        this.moveKotSelectedTable = undefined;
      } catch (error: any) {
        this.alertify.presentToast(error);
      }
    }
  }

  cancel() {
    this.transferTableWise = { fromTable: undefined, toTable: undefined };
    this.moveKotMode = false;
    this.moveKotSelectedTable = undefined;
  }
}
