import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
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
import { firstValueFrom, last, min } from 'rxjs';
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { ApplicableCombo } from '../../../core/constructors/comboKot/comboKot';
import { GroupComponent } from './group/group.component';
import { MoveKotItemComponent } from './move-kot-item/move-kot-item.component';
import { MergeExchangeTableComponent } from './merge-exchange-table/merge-exchange-table.component';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  tables: Table[] = [];
  activatedSortedTakeawayTokens: Table[] = [];
  onHoldSortedTakeawayTokens: Table[] = [];
  activatedSortedOnlineTokens: Table[] = [];
  onHoldSortedOnlineTokens: Table[] = [];
  selectedKotsForKotTransfer: Kot[] = [];
  interval: any;
  editMode: boolean = false;
  moveKotMode: boolean = false;
  moveKotSelectedTable: Table | undefined;
  transferTableWise: {
    fromTable: Table | undefined;
    toTable: Table | undefined;
  } = { fromTable: undefined, toTable: undefined };
  public editBillingMode: 'dineIn' | 'takeaway' | 'online' = 'dineIn';
  public bulkSettleEnabled: boolean = false;
  selectedTablesForBulkSettle: string[] = [];
  tobeMergedTotal: number = 0;
  holdedItemsVisible:boolean =false;
  public bulkSettleEnabledOnline: boolean = false;
  selectedTablesForBulkSettleOnline: string[] = [];
  tobeMergedTotalOnline: number = 0;
  holdedItemsVisibleOnline:boolean =false;
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
          let timeTaken = this.getTime(table.occupiedStart);
          table.timeSpent = timeTaken.time;
          table.minutes = timeTaken.minutes;
        }
      });
      this.dataProvider.tokens.forEach((table) => {
        if (table.status == 'occupied' && table.occupiedStart) {
          let timeTaken = this.getTime(table.occupiedStart);
          table.timeSpent = timeTaken.time;
          table.minutes = timeTaken.minutes;
        }
      });
    }, 500);
    this.dataProvider.tables.sort((a, b) => {
      return Number(a.tableNo) - Number(b.tableNo);
    });
    this.tableService.reOrderTable();
    this.instantiateTables();
    this.dataProvider.tablesUpdated.subscribe(() => {
      this.instantiateTables();
    })
  }

  instantiateTables(){
    this.activatedSortedTakeawayTokens = this.dataProvider.tokens.filter(
      (table) => {
        return ['finalized','active'].includes(table.bill?.stage);
      },
    ).sort((a, b) => {
      return Number(a.tableNo) - Number(b.tableNo);
    });
    this.onHoldSortedTakeawayTokens = this.dataProvider.tokens.filter(
      (table) => {
        return table.bill?.stage == 'hold';
      },
    ).sort((a, b) => {
      return Number(a.tableNo) - Number(b.tableNo);
    });

    this.activatedSortedOnlineTokens = this.dataProvider.onlineTokens.filter(
      (table) => {
        return ['finalized','active'].includes(table.bill?.stage);
      },
    ).sort((a, b) => {
      return Number(a.tableNo) - Number(b.tableNo);
    });

    this.onHoldSortedOnlineTokens = this.dataProvider.onlineTokens.filter(
      (table) => {
        return table.bill?.stage == 'hold';
      },
    ).sort((a, b) => {
      return Number(a.tableNo) - Number(b.tableNo);
    });
  }

  getTime(date: Timestamp) {
    let milliseconds = new Date().getTime() - date.toDate().getTime();
    // convert milliseconds to minutes and seconds
    let hours = milliseconds / 3600000;
    let minutes = ((milliseconds % 3600000) / 60000).toFixed(0);
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    let allMinutes = milliseconds / 60000;
    if (Number(minutes) < 10) {
      minutes = '0' + minutes;
    }
    if (Number(seconds) < 10) {
      seconds = '0' + seconds;
    }
    if (hours < 1) {
      return {
        time: minutes + ':' + seconds,
        minutes: allMinutes,
      };
    }
    return {
      time: hours.toFixed(0) + ':' + minutes + ':' + seconds,
      minutes: allMinutes,
    };
  }

  printTable(table: Table, event: any) {
    event.stopPropagate();
  }

  openTable(table: Table, event: any) {
    this.dialogRef.close(table);
    event.stopPropagation();
    this.dataProvider.currentTable = table;
    if (table.bill) {
      this.dataProvider.currentBill = table.bill;
      let activeKot = this.dataProvider.currentBill.kots.find(
        (kot) => kot.stage == 'active',
      );
      if (activeKot) {
        this.dataProvider.kotViewVisible = false;
      }
    } else {
      this.dataProvider.currentBill =
        this.dataProvider.currentTable.createNewBill();
    }
    if (this.dataProvider.tempProduct) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    this.dataProvider.currentApplicableCombo = undefined;
    this.dataProvider.currentPendingProduct = undefined;
    // if (this.dataProvider.currentPendingProduct) {
    //   if (this.dataProvider.currentApplicableCombo) {
    //     this.dataProvider.currentApplicableCombo.addProduct(
    //       this.dataProvider.currentComboTypeCategory,
    //       this.dataProvider.currentPendingProduct,
    //     );
    //   } else {
    //     this.dataProvider.currentApplicableCombo = new ApplicableCombo(
    //       this.dataProvider.currentCombo,
    //       this.dataProvider.currentBill,
    //     );
    //     this.dataProvider.currentApplicableCombo.addProduct(
    //       this.dataProvider.currentComboTypeCategory,
    //       this.dataProvider.currentPendingProduct,
    //     );
    //     if (this.dataProvider.currentBill) {
    //       this.dataProvider.currentBill.addProduct(
    //         this.dataProvider.currentApplicableCombo,
    //       );
    //     }
    //   }
    // }
    this.dataProvider.billAssigned.next();
    this.dialogRef.close();
  }

  async addTable(groupName: string) {
    console.log('group Name');
    let sortedTables = this.dataProvider.tables.sort((a, b) => {
      return Number(b.id) - Number(a.id);
    });
    const numberOfTablesFromAllGroups = Number(sortedTables[0].id);
    const newTableId = numberOfTablesFromAllGroups + 1;
    // find all table matching the table group name
    let tables = this.dataProvider.tables.filter((table) => {
      return table.group == groupName;
    });
    tables.sort((a, b) => a.order - b.order);
    const lastTable = tables[tables.length - 1];
    console.log('group tables ', tables);
    let rgx = /(\d+)\D*$/g;
    let mainEntityNo = rgx.exec(
      lastTable.name.split(' ')[lastTable.name.split(' ').length - 1],
    )?.[1];
    let entityNo = Number(mainEntityNo);
    if (entityNo) {
      console.log('Replacing ', mainEntityNo);
      var newTableName = lastTable.name.replace(mainEntityNo, '');
      entityNo = entityNo + 1;
      console.log('new table name ', tables, entityNo);
      // right strip the entity no from the last table name
      // add the new entity no to the new table name
      newTableName = newTableName + entityNo.toString();
      console.log(
        'New Table',
        newTableId.toString(),
        newTableId,
        newTableName,
        groupName,
        newTableId,
      );
    } else {
      // attach a number to the table name and add it to the table
      var newTableName = lastTable.name + ' 1';
      console.log('No ');
    }
    console.log('Added new table', mainEntityNo, newTableName);
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
    console.log('table', table);
    table.clearTable();
    this.analyticsService.newTable(table, 'dine');
    this.dataProvider.tables.push(table);
    this.tableService.reOrderTable();
  }

  async addToken() {
    let table = new Table(
      this.generateRandomId(),
      'new',
      'new',
      'token',
      0,
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
    this.dataProvider.currentBill = table.createNewBill();
    this.analyticsService.newTable(table, 'takeaway');
    this.dataProvider.currentTable = table;
    if (this.dataProvider.tempProduct && this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    this.dataProvider.billAssigned.next();
    this.dialogRef.close(table);
    this.dataProvider.currentApplicableCombo = undefined;
    this.dataProvider.currentPendingProduct = undefined;
  }

  async addOnlineToken() {
    let table = new Table(
      this.generateRandomId(),
      'new',
      'new',
      'online',
      0,
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
    this.dataProvider.currentBill = table.createNewBill();
    this.analyticsService.newTable(table, 'online');
    this.dataProvider.currentTable = table;
    if (this.dataProvider.tempProduct && this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
    this.dataProvider.billAssigned.next();
    this.dialogRef.close(table);
    this.dataProvider.currentApplicableCombo = undefined;
    this.dataProvider.currentPendingProduct = undefined;
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
    console.log('event', event);
    localStorage.setItem('tableSize', event);
    this.dataProvider.currentTableSize = event;
  }

  switchMode(mode: any) {
    // console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    if (mode.value == 'dineIn') {
      localStorage.setItem('billingMode', 'dineIn');
      // console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if (!this.dataProvider.dineInMenu) {
        alert('No dine-in menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return (
          menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id &&
          menu.type == 'dineIn'
        );
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway') {
      localStorage.setItem('billingMode', 'takeaway');
      // console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if (!this.dataProvider.takeawayMenu) {
        alert('No takeaway menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return (
          menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id &&
          menu.type == 'takeaway'
        );
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'takeaway';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online') {
      localStorage.setItem('billingMode', 'online');
      // console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if (!this.dataProvider.onlineMenu) {
        alert('No online menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return (
          menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id &&
          menu.type == 'online'
        );
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
    this.dataProvider.clearSearchField.next();
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
            true,
            null,
            true
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
    if (
      await this.dataProvider.confirm('Are you sure you want to delete ?', [1])
    ) {
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
  }

  // new functions

  moveKotItem(table: Table) {
    this.moveKotSelectedTable = table;
    const dialog = this.dialog.open(MoveKotItemComponent, { data: { table } });
    dialog.closed.subscribe((res) => {
      console.log('Result move-kot-item', res);
      this.moveKotMode = false;
    });
  }

  mergeExchangeTable() {
    const dialog = this.dialog.open(MergeExchangeTableComponent);
    dialog.closed.subscribe((res) => {
      console.log('Result merge-exchange', res);
    });
  }

  async bulkSettle() {
    let bills = [];
    let buttons = ['Cancel',...this.dataProvider.paymentMethods.map((method) => {
      return method.name;
    })];
    console.log("buttons",buttons);
    // this.dataProvider.confirm('Which method would you like to settle ?',[1],{buttons:['No','Yes']}).then((result)=>{
    const dialog = this.dialog.open(DialogComponent, {
      panelClass: 'customDialog',
      data: {
        title: 'Which method would you like to settle ?',
        description:
          'Please select a payment method for settling all the bills that you have selected.',
        buttons,
        primary: Array(buttons.length - 1)
          .fill(0)
          .map((_, i) => i + 1),
      },
    });
    let result:any = await firstValueFrom(dialog.closed);
    console.log("Result",result);
    if((result -1 ) >= 0){
      let method = this.dataProvider.paymentMethods[result -1];
      if (method){
        this.dataProvider.loading = true;
        for (const tableId of this.selectedTablesForBulkSettle) {
          let table = this.dataProvider.tokens.find((t) => t.id == tableId);
          if (table && table.bill) {
            let billNo = await table.bill.settle(
              [{
                paymentMethod:method.name,
                amount:table.bill.billing.grandTotal,
              }],
              'external',
              null,
              true,
              method,
              true,
              true
            );
            console.log("billNo",billNo);
          }
        }
        this.dataProvider.loading = false;
        this.bulkSettleEnabled = false;
        this.selectedTablesForBulkSettle = [];
      } else {
        this.alertify.presentToast("Method is unavailable");
        this.dataProvider.loading = false;
      }
    }
  }

  async bulkCancel(){
    let bills = [];
    let buttons = ['Cancel',...this.dataProvider.paymentMethods.map((method) => {
      return method.name;
    })];
    console.log("buttons",buttons);
    // this.dataProvider.confirm('Which method would you like to settle ?',[1],{buttons:['No','Yes']}).then((result)=>{
    const dialog = this.dialog.open(DialogComponent, {
      panelClass: 'customDialog',
      data: {
        title: 'Are you sure you want to cancel these bills ?',
        description:
          'All of the selected bills will be cancelled.',
        buttons:['Back','Confirm'],
        primary: [1],
      },
    });
    let result:any = await firstValueFrom(dialog.closed);
    console.log("Result",result);
    if(result ==1){
      let method = this.dataProvider.paymentMethods[result -1];
      if (method){
        this.dataProvider.loading = true;
        for (const tableId of this.selectedTablesForBulkSettle) {
          let table = this.dataProvider.tokens.find((t) => t.id == tableId);
          if (table && table.bill) {
            await table.bill.cancel('Bulk Cancel','1234567890',table,true);
          }
        }
        this.dataProvider.loading = false;
        this.bulkSettleEnabled = false;
        this.selectedTablesForBulkSettle = [];
      } else {
        this.alertify.presentToast("Method is unavailable");
        this.dataProvider.loading = false;
      }
    }
  }

  async bulkSettleOnline() {
    let bills = [];
    let buttons = ['Cancel',...this.dataProvider.paymentMethods.map((method) => {
      return method.name;
    })];
    console.log("buttons",buttons);
    // this.dataProvider.confirm('Which method would you like to settle ?',[1],{buttons:['No','Yes']}).then((result)=>{
    const dialog = this.dialog.open(DialogComponent, {
      panelClass: 'customDialog',
      data: {
        title: 'Which method would you like to settle ?',
        description:
          'Please select a payment method for settling all the bills that you have selected.',
        buttons,
        primary: Array(buttons.length - 1)
          .fill(0)
          .map((_, i) => i + 1),
      },
    });
    let result:any = await firstValueFrom(dialog.closed);
    console.log("Result",result);
    if((result -1 ) >= 0){
      let method = this.dataProvider.paymentMethods[result -1];
      if (method){
        this.dataProvider.loading = true;
        for (const tableId of this.selectedTablesForBulkSettleOnline) {
          let table = this.dataProvider.onlineTokens.find((t) => t.id == tableId);
          if (table && table.bill) {
            let billNo = await table.bill.settle(
              [{
                paymentMethod:method.name,
                amount:table.bill.billing.grandTotal,
              }],
              'external',
              null,
              true,
              method,
              true,
              true
            );
            console.log("billNo",billNo);
          }
        }
        this.dataProvider.loading = false;
        this.bulkSettleEnabledOnline = false;
        this.selectedTablesForBulkSettleOnline = [];
      } else {
        this.alertify.presentToast("Method is unavailable");
        this.dataProvider.loading = false;
      }
    }
  }

  async bulkCancelOnline(){
    let bills = [];
    let buttons = ['Cancel',...this.dataProvider.paymentMethods.map((method) => {
      return method.name;
    })];
    console.log("buttons",buttons);
    // this.dataProvider.confirm('Which method would you like to settle ?',[1],{buttons:['No','Yes']}).then((result)=>{
    const dialog = this.dialog.open(DialogComponent, {
      panelClass: 'customDialog',
      data: {
        title: 'Are you sure you want to cancel these bills ?',
        description:
          'All of the selected bills will be cancelled.',
        buttons:['Back','Confirm'],
        primary: [1],
      },
    });
    let result:any = await firstValueFrom(dialog.closed);
    console.log("Result",result);
    if(result ==1){
      let method = this.dataProvider.paymentMethods[result -1];
      if (method){
        this.dataProvider.loading = true;
        for (const tableId of this.selectedTablesForBulkSettle) {
          let table = this.dataProvider.onlineTokens.find((t) => t.id == tableId);
          if (table && table.bill) {
            await table.bill.cancel('Bulk Cancel','1234567890',table,true);
          }
        }
        this.dataProvider.loading = false;
        this.bulkSettleEnabledOnline = false;
        this.selectedTablesForBulkSettleOnline = [];
      } else {
        this.alertify.presentToast("Method is unavailable");
        this.dataProvider.loading = false;
      }
    }
  }

  selectToken(table, event) {
    if (this.moveKotMode) {
      this.moveKotItem(table);
    } else {
      if (this.bulkSettleEnabled) {
        if (this.selectedTablesForBulkSettle.includes(table.id)) {
          this.selectedTablesForBulkSettle =
            this.selectedTablesForBulkSettle.filter((t) => t != table.id);
        } else {
          this.selectedTablesForBulkSettle.push(table.id);
        }
        this.tobeMergedTotal = this.calculateGrandTotal();
        console.log(
          'this.selectedTablesForBulkSettle',
          this.selectedTablesForBulkSettle,
        );
      } else {
        this.openTable(table, event);
      }
    }
  }
  selectTokenOnline(table, event) {
    if (this.moveKotMode) {
      this.moveKotItem(table);
    } else {
      if (this.bulkSettleEnabledOnline) {
        if (this.selectedTablesForBulkSettleOnline.includes(table.id)) {
          this.selectedTablesForBulkSettleOnline =
            this.selectedTablesForBulkSettleOnline.filter((t) => t != table.id);
        } else {
          this.selectedTablesForBulkSettleOnline.push(table.id);
        }
        this.tobeMergedTotalOnline = this.calculateGrandTotal();
        console.log(
          'this.selectedTablesForBulkSettle',
          this.selectedTablesForBulkSettleOnline,
        );
      } else {
        this.openTable(table, event);
      }
    }
  }

  calculateGrandTotal() {
    let total = 0;
    this.selectedTablesForBulkSettle.forEach((tableId) => {
      let table = this.dataProvider.tokens.find((t) => t.id == tableId);
      if (table && table.bill) {
        total = total + table.bill.billing.grandTotal;
      }
    });
    return total;
  }

  generateRandomId(){
    // random id alnum
    let length = 10;
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
      }
    return result;
  }

  selectAllTables(){
    this.selectedTablesForBulkSettle = [];
    console.log("this.dataProvider.tokens.filter((table)=>table.bill.stage == 'hold')",this.dataProvider.tokens.filter((table)=>table.bill?.stage == 'hold'));

    this.dataProvider.tokens.filter((table)=>table.bill?.stage == 'hold').forEach((table)=>{
      this.selectedTablesForBulkSettle.push(table.id);
    });
    this.tobeMergedTotal = this.calculateGrandTotal();
  }
  selectAllTablesOnline(){
    this.selectedTablesForBulkSettleOnline = [];
    console.log("this.dataProvider.tokens.filter((table)=>table.bill.stage == 'hold')",this.dataProvider.onlineTokens.filter((table)=>table.bill?.stage == 'hold'));

    this.dataProvider.onlineTokens.filter((table)=>table.bill?.stage == 'hold').forEach((table)=>{
      this.selectedTablesForBulkSettleOnline.push(table.id);
    });
    this.tobeMergedTotalOnline = this.calculateGrandTotal();
  }
}
