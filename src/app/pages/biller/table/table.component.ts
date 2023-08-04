import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { Timestamp, endBefore } from '@angular/fire/firestore';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { SettleComponent } from '../actions/settle/settle.component';
import { Table } from '../../../core/constructors/table/Table';
import { Kot } from '../../../core/constructors/kot/Kot';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { PrinterService } from '../../../core/services/printing/printer/printer.service';
import { TableService } from '../../../core/services/database/table/table.service';
import { AnalyticsService } from '../../../core/services/database/analytics/analytics.service';
import { BillService } from '../../../core/services/database/bill/bill.service';
import { CustomerService } from '../../../core/services/customer/customer.service';
import { RearrangeComponent } from './rearrange/rearrange.component';
import { firstValueFrom, last } from 'rxjs';
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { ApplicableCombo } from '../../../core/constructors/comboKot/comboKot';
import { GroupComponent } from './group/group.component';
import { MoveKotItemComponent } from './move-kot-item/move-kot-item.component';
import { MergeExchangeTableComponent } from './merge-exchange-table/merge-exchange-table.component';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  tables: Table[] = [];
  selectedKotsForKotTransfer: Kot[] = [];
  interval: any;
  moveKotMode: boolean = false;
  moveKotSelectedTable: Table | undefined;
  transferTableWise: {
    fromTable: Table | undefined;
    toTable: Table | undefined;
  } = { fromTable: undefined, toTable: undefined };
  public editBillingMode: 'dineIn' | 'takeaway' | 'online' = 'dineIn';
  constructor(
    public dialogRef: DialogRef,
    public dataProvider: DataProvider,
    private tableService: TableService,
    private alertify: AlertsAndNotificationsService,
    private printingService: PrinterService,
    private dialog: Dialog,
    private analyticsService: AnalyticsService,
    private billService: BillService,
    private customerService: CustomerService,
    private userManagementService: UserManagementService,
    private onboardingService: OnboardingService,
  ) {}

  ngOnInit(): void {
    //  console.log('this.dataProvider.tables ', this.dataProvider.tables,this.dataProvider.currentMenu?.type,this.dataProvider.billingMode);
    if (this.dataProvider.currentMenu) {
      this.dataProvider.billingMode =
        this.dataProvider.currentMenu.type || 'dineIn';
    }
    this.tables = this.dataProvider.tables;
    console.log('TABLES::', this.tables);
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.dataProvider.tables.forEach((table) => {
        if (table.status == 'occupied' && table.occupiedStart) {
          table.timeSpent = this.getTime(table.occupiedStart);
          table.minutes = Number(table.timeSpent.split(':')[0]);
        }
      });
      this.dataProvider.tokens.forEach((table) => {
        if (table.status == 'occupied' && table.occupiedStart) {
          table.timeSpent = this.getTime(table.occupiedStart);
          table.minutes = Number(table.timeSpent.split(':')[0]);
        }
      });
    }, 500);
    this.dataProvider.tables.sort((a, b) => {
      return a.tableNo - b.tableNo;
    });
    this.tableService.reOrderTable();
  }

  getTime(date: Timestamp) {
    let milliseconds = new Date().getTime() - date.toDate().getTime();
    // convert milliseconds to minutes and seconds
    let minutes = Math.floor(milliseconds / 60000);
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return minutes + ':' + (Number(seconds) < 10 ? '0' : '') + seconds;
  }

  printTable(table: Table, event: any) {
    event.stopPropagate();
  }

  openTable(table: Table, event: any) {
    this.dialogRef.close(table);
    event.stopPropagation();
    this.dataProvider.currentBill = table.occupyTable();
    this.dataProvider.currentTable = table;
    this.dataProvider.billAssigned.next();
    if (this.dataProvider.tempProduct && this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    if (
      this.dataProvider.currentPendingProduct &&
      this.dataProvider.currentBill
    ) {
      if (this.dataProvider.currentApplicableCombo) {
        this.dataProvider.currentApplicableCombo.addProduct(
          this.dataProvider.currentComboTypeCategory,
          this.dataProvider.currentPendingProduct,
        );
      } else {
        this.dataProvider.currentApplicableCombo = new ApplicableCombo(
          this.dataProvider.currentCombo,
          this.dataProvider.currentBill,
        );
        this.dataProvider.currentApplicableCombo.addProduct(
          this.dataProvider.currentComboTypeCategory,
          this.dataProvider.currentPendingProduct,
        );
        if (this.dataProvider.currentBill) {
          this.dataProvider.currentBill.addProduct(
            this.dataProvider.currentApplicableCombo,
          );
        }
      }
    }
    this.dialogRef.close();
  }

  async addTable(groupName: string) {
    console.log('group Name');
    const numberOfTablesFromAllGroups = this.dataProvider.tables.length;
    const newTableId = numberOfTablesFromAllGroups + 1;
    // find all table matching the table group name
    let tables = this.dataProvider.tables.filter((table) => {
      return table.group == groupName;
    });
    tables.sort((a, b) => a.order - b.order);
    const lastTable = tables[tables.length - 1];
    console.log('group tables ', tables);
    let rgx = /(\d+)\D*$/g;
    let mainEntityNo = rgx.exec(lastTable.name.split(' ')[lastTable.name.split(' ').length - 1])?.[1];
    let entityNo = Number(mainEntityNo);
    if (entityNo){
      console.log("Replacing ",mainEntityNo);
      var newTableName = lastTable.name.replace(mainEntityNo, '');
      entityNo = entityNo + 1;
    console.log('new table name ', tables,entityNo);
      // right strip the entity no from the last table name
      // add the new entity no to the new table name
      newTableName = newTableName + entityNo.toString();
      console.log("New Table",newTableId.toString(),
      newTableId,
      newTableName,
      groupName,
      newTableId);
    } else {
      // attach a number to the table name and add it to the table
      var newTableName = lastTable.name + ' 1';
      console.log('No ');
    }
    console.log("Added new table",mainEntityNo, newTableName);
    let table = new Table(
      newTableId.toString(),
      newTableId,
      newTableName,
      groupName,
      newTableId,
      '4',
      'table',
      this.dataProvider,
      this.analyticsService,
      this.tableService,
      this.billService,
      this.printingService,
      this.customerService,
      this.userManagementService,
    );
    console.log("table",table);
    table.clearTable();
    this.analyticsService.newTable(table, 'dine');
    this.dataProvider.tables.push(table);
    this.tableService.reOrderTable();
    
    // let tableName = await this.dataProvider.prompt('Enter table name', {
    //   value: groupName,
    // });
    // let tableName = groupName;
    // if (!tableName) {
    //   return;
    // }
    // if (tableName == groupName) {
    //   // find the last table matching the table group name
    //   let entity = this.dataProvider.tables
    //     .filter((table) => {
    //       return table.group == groupName;
    //     })
    //     .sort((a, b) => {
    //       return b.tableNo - a.tableNo;
    //     })[0];
    //   console.log('entity ', entity,this.dataProvider.tables
    //   .filter((table) => {
    //     return table.group == groupName;
    //   }),this.dataProvider.tables
    //   .filter((table) => {
    //     return table.group == groupName;
    //   })
    //   .sort((a, b) => {
    //     return a.tableNo - b.tableNo;
    //   }));

    //   let mainEntityNo =
    //     entity.name.split(' ')[entity.name.split(' ').length - 1];
    //   let rgx = /(\d+)\D*$/g;
    //   let entityNo = rgx.exec(mainEntityNo)?.[1];
    //   // additionalText is the text attached to main entity no and entityNo like tableName = groupName + mainEntity + entityNo
    //   let additionalText = mainEntityNo.replace(entityNo, '');
    //   if (Number(entityNo)) {
    //     console.log('Entity', entityNo);
    //     if (entityNo) {
    //       tableName =
    //         groupName +
    //         ' ' +
    //         additionalText +
    //         (Number(entityNo) + 1).toString();
    //     }
    //   } else {
    //     alert(
    //       'Cannot add auto table no number found in end. Please add manually',
    //     );
    //     return;
    //   }
    // }
    // // check if the any table called tableName exists in the group groupName if yes then return an alert
    // let foundTable = this.dataProvider.tables.find((table) => {
    //   return table.group == groupName && table.name == tableName;
    // });
    // console.log('tableName ', tableName,groupName);
    // if (foundTable) {
    //   alert('Table already exists');
    //   return;
    // }
    // let table = new Table(
    //   index.toString(),
    //   index,
    //   tableName,
    //   groupName,
    //   index,
    //   '4',
    //   'table',
    //   this.dataProvider,
    //   this.analyticsService,
    //   this.tableService,
    //   this.billService,
    //   this.printingService,
    //   this.customerService,
    //   this.userManagementService,
    // );
    // console.log("table",table);
    // table.clearTable();
    // this.analyticsService.newTable(table, 'dine');
    // this.dataProvider.tables.push(table);
    // this.tableService.reOrderTable();
  }

  addToken() {
    // add a table
    // this.dataProvider.takeawayToken = this.dataProvider.takeawayToken + 1;
    console.log(
      'this.dataProvider.takeawayToken ',
      this.dataProvider.takeawayToken,
    );
    this.dataProvider.takeawayToken++;
    this.analyticsService.addTakeawayToken();
    let table = new Table(
      this.dataProvider.takeawayToken.toString(),
      this.dataProvider.takeawayToken,
      this.dataProvider.takeawayToken.toString(),
      'token',
      this.dataProvider.takeawayToken,
      '1',
      'token',
      this.dataProvider,
      this.analyticsService,
      this.tableService,
      this.billService,
      this.printingService,
      this.customerService,
      this.userManagementService,
    );
    this.dataProvider.currentBill = table.occupyTable();
    this.analyticsService.newTable(table, 'takeaway');
    this.dataProvider.currentTable = table;
    this.dataProvider.billAssigned.next();
    if (this.dataProvider.tempProduct && this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    this.dialogRef.close(table);
    this.dataProvider.tokens.push(table);
  }

  addOnlineToken() {
    // console.log(
    //   'this.dataProvider.takeawayToken ',
    //   this.dataProvider.takeawayToken
    // );
    this.dataProvider.onlineTokenNo++;
    this.analyticsService.addOnlineToken();
    let table = new Table(
      this.dataProvider.onlineTokenNo.toString(),
      this.dataProvider.onlineTokenNo,
      this.dataProvider.onlineTokenNo.toString(),
      'online',
      this.dataProvider.onlineTokenNo,
      '1',
      'online',
      this.dataProvider,
      this.analyticsService,
      this.tableService,
      this.billService,
      this.printingService,
      this.customerService,
      this.userManagementService,
    );
    this.dataProvider.currentBill = table.occupyTable();
    this.dataProvider.currentTable = table;
    this.analyticsService.newTable(table, 'online');
    this.dataProvider.billAssigned.next();
    if (this.dataProvider.tempProduct && this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    this.dialogRef.close(table);
    this.dataProvider.onlineTokens.push(table);
  }

  moveKot(table: Table, event: any) {
    this.moveKotSelectedTable = table;
    //  console.log('this.moveKotSelectedTable ', this.moveKotSelectedTable, event);
  }

  async deleteTable(table: Table) {
    //  console.log("table",table);
    if (table.type == 'table') {
      if (table.status == 'occupied') {
        this.alertify.presentToast('Table is occupied');
        return;
      }
      if (
        await this.dataProvider.confirm(
          'Alert! Do you want to delete it?',
          [1],
          { buttons: ['No', 'Yes'] },
        )
      ) {
        this.dataProvider.loading = true;
        this.dataProvider.tables = this.dataProvider.tables.filter((t) => {
          return t.id != table.id;
        });
        this.tableService.reOrderTable();
        await this.tableService.deleteTable(table.id);
        this.dataProvider.loading = false;
      } else {
        this.alertify.presentToast('Table delete cancelled');
      }
    } else {
      this.alertify.presentToast('Only tables can be deleted');
    }
  }

  changeTable(event: any, kot: Kot) {
    // add kot to selectedKotsForKotTransfer
    //  console.log('event ', event);
    if (event.checked) {
      this.selectedKotsForKotTransfer.push(kot);
    } else {
      this.selectedKotsForKotTransfer = this.selectedKotsForKotTransfer.filter(
        (k) => {
          return k.id != kot.id;
        },
      );
    }
  }

  switchTableSize(event: any) {
    //  console.log("event",event);
    localStorage.setItem('tableSize', event.value);
    this.dataProvider.currentTableSize = event.value;
  }

  switchMode(mode: any) {
    console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    if (mode.value == 'dineIn') {
      // console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if (!this.dataProvider.dineInMenu) {
        alert('No dine-in menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id && menu.type =='dineIn';
      });
      console.log("this.dataProvider.dineInMenu?.id",this.dataProvider.dineInMenu?.id,this.dataProvider.currentMenu);
      if (this.dataProvider.currentMenu) {
        this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway') {
      // console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if (!this.dataProvider.takeawayMenu) {
        alert('No takeaway menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id && menu.type =='takeaway';
      });
      if (this.dataProvider.currentMenu) {
        this.dataProvider.currentMenu.type = 'takeaway';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online') {
      // console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if (!this.dataProvider.onlineMenu) {
        alert('No online menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id && menu.type =='online';
      });
      if (this.dataProvider.currentMenu) {
        this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
    console.log("Current menu updated",this.dataProvider.currentMenu);
    this.dataProvider.modeChanged.next(mode.value);
  }

  settleTable(table: Table, event) {
    if (table.bill) {
      let dialog = this.dialog.open(SettleComponent, {
        data: table.bill.billing.grandTotal,
      });
      dialog.closed.subscribe(async (result: any) => {
        //  console.log('Result', result);
        if (result && table.bill && result.settling && result.paymentMethods) {
          await table.bill.settle(
            result.paymentMethods,
            'external',
            result.detail || null,
          );
        }
      });
    }
  }

  isNumber(value: any) {
    return !isNaN(Number(value));
  }

  rearrangeTables() {
    const rearrangeDialog = this.dialog.open(RearrangeComponent);
  }

  reorderTables(tableGroups: { tables: Table[]; name: string }[]) {
    const rearrangeDialog = this.dialog.open(RearrangeComponent, {
      data: {
        listItems: tableGroups,
        mainKey: 'name',
      },
    });
    firstValueFrom(rearrangeDialog.closed)
      .then((result: any) => {
        console.log('Result', result);
        this.dataProvider.loading = true;
        this.tableService
          .setGroupOrder(result)
          .then(() => {
            this.alertify.presentToast('Tables rearranged successfully');
          })
          .catch((error) => {
            console.log('Error ', error);
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      })
      .catch((error) => {
        this.alertify.presentToast('Error rearranging tables');
        console.log('Error ', error);
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  editGroup(groupName: string) {
    const comp = this.dialog.open(GroupComponent, {
      data: { groupName },
    });
    comp.closed.subscribe((result: any) => {
      if (result && result.groupName) {
        this.dataProvider.loading = true;
        this.tableService
          .editSection(groupName, result.groupName)
          .then(() => {
            this.alertify.presentToast('Group name changed successfully');
            this.onboardingService.getTables();
          })
          .catch((error) => {
            this.alertify.presentToast('Error changing group name');
            console.log('Error ', error);
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      }
    });
  }

  addSection() {
    let comp = this.dialog.open(GroupComponent, { data: { groupName: '' } });
    comp.closed.subscribe((result: any) => {
      if (result && result.groupName) {
        let index = this.dataProvider.tables.length + 1;
        let table = new Table(
          index.toString(),
          index,
          result.groupName + ' 1',
          result.groupName,
          index,
          '4',
          'table',
          this.dataProvider,
          this.analyticsService,
          this.tableService,
          this.billService,
          this.printingService,
          this.customerService,
          this.userManagementService,
        );
        table.clearTable();
        this.analyticsService.newTable(table, 'dine');
        this.dataProvider.tables.push(table);
        this.tableService.reOrderTable();
      }
    });
  }

  async editTable(table: Table) {
    let tableName = await this.dataProvider.prompt('Enter table name', {
      value: table.name,
    });
    if (!tableName) {
      return;
    }
    if (tableName == table.name) {
      return;
    }
    // check if the any table called tableName exists in the group groupName if yes then return an alert
    let foundTable = this.dataProvider.tables.find((t) => {
      return t.group == table.group && t.name == tableName;
    });
    if (foundTable) {
      alert('Table already exists');
      return;
    }
    table.name = tableName;
    this.dataProvider.loading = true;
    this.tableService
      .updateTable(table.toObject())
      .then(() => {
        this.alertify.presentToast('Table name changed successfully');
        // console.log("table.toObject()",table.toObject(),table.toObject().id);
        // let tableIndex = this.dataProvider.tables.findIndex((t)=>{
        //   return t.id == table.id;
        // });
        // if (tableIndex){
        //   this.dataProvider.tables[tableIndex].name = tableName;
        // }
      })
      .catch((error) => {
        this.alertify.presentToast('Error changing table name');
        console.log('Error ', error);
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  async deleteSection(groupName: string) {
    this.dataProvider.loading = true;
    this.tableService
      .deleteSection(groupName)
      .then(() => {
        this.alertify.presentToast('Section deleted successfully');
        this.onboardingService.getTables();
      })
      .catch((error) => {
        this.alertify.presentToast('Error deleting section');
        console.log('Error ', error);
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  // new functions

  moveKotItem(table: Table) {
    this.moveKotSelectedTable = table;
    const dialog = this.dialog.open(MoveKotItemComponent, { data: { table } });
    dialog.closed.subscribe((res) => {
      console.log('Result move-kot-item', res);
    });
  }

  mergeExchangeTable() {
    const dialog = this.dialog.open(MergeExchangeTableComponent);
    dialog.closed.subscribe((res) => {
      console.log('Result merge-exchange', res);
    });
  }
}
