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
import { Product } from '../../../types/product.structure';

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
    private printingService:PrinterService,
    private dialog: Dialog,
    private analyticsService:AnalyticsService,
    private billService:BillService
  ) {}
  ngOnInit(): void {

  //  console.log('this.dataProvider.tables ', this.dataProvider.tables,this.dataProvider.currentMenu?.type,this.dataProvider.billingMode);
    if(this.dataProvider.currentMenu){
      this.dataProvider.billingMode = this.dataProvider.currentMenu.type || 'dineIn';
    }
    this.tables = this.dataProvider.tables;
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
    // this.dataProvider.tables.forEach((table)=>{
    //   this.tables.push(new Table(table.id,table.tableNo,table.name,table.maxOccupancy,table.type,this.dataProvider))
    // })
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
    if(this.dataProvider.tempProduct && this.dataProvider.currentBill){
      this.dataProvider.currentBill.addProduct(this.dataProvider.tempProduct);
      this.dataProvider.tempProduct = undefined;
    }
  }

  async addTable(groupName:string){
    let index = this.dataProvider.tables.length + 1;
    let tableName = await this.dataProvider.prompt('Enter table name',{value:groupName})
    if (!tableName) {
      return;
    }
    if (tableName.split(' ')[0] == groupName){
      if (tableName == groupName){
        let entityNo = Number(this.dataProvider.groupedTables[groupName][this.dataProvider.groupedTables[groupName].length-1].name.split(' ')[1])
        if (entityNo){
          tableName = groupName + ' ' + (entityNo+1).toString();
        }
      }
    } else {
      groupName = tableName.split(' ')[0];
    }
    // console.log('tableName ', tableName,groupName);
    let table = new Table(
      index.toString(),
      index,
      tableName,
      '4',
      'table',
      this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService
    );
    table.clearTable();
    this.dataProvider.tables.push(table);
    if(!this.dataProvider.groupedTables[groupName]){
      this.dataProvider.groupedTables[groupName] = [];
    }
    this.dataProvider.groupedTables[groupName].push(table);
  //  console.log('this.dataProvider.tables ', this.dataProvider.tables);
  }

  addToken() {
    // add a table
    // this.dataProvider.takeawayToken = this.dataProvider.takeawayToken + 1;
    console.log(
      'this.dataProvider.takeawayToken ',
      this.dataProvider.takeawayToken
    );
    this.analyticsService.addTakeawayToken();
    let table = new Table(
      this.dataProvider.takeawayToken.toString(),
      this.dataProvider.takeawayToken,
      this.dataProvider.takeawayToken.toString(),
      '1',
      'token',
      this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService
    );
    this.dataProvider.currentBill = table.occupyTable();
    this.dataProvider.currentTable = table;
    this.dataProvider.billAssigned.next();
    if(this.dataProvider.tempProduct && this.dataProvider.currentBill){
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
    this.analyticsService.addOnlineToken();
    let table = new Table(
      this.dataProvider.onlineTokenNo.toString(),
      this.dataProvider.onlineTokenNo,
      this.dataProvider.onlineTokenNo.toString(),
      '1',
      'online',
      this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService
    );
    this.dataProvider.currentBill = table.occupyTable();
    this.dataProvider.currentTable = table;
    this.dataProvider.billAssigned.next();
    if(this.dataProvider.tempProduct && this.dataProvider.currentBill){
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

  async deleteTable(table:Table){
  //  console.log("table",table);
    if (table.type == 'table'){
      if (table.status == 'occupied'){
        this.alertify.presentToast("Table is occupied");
        return;
      }
      if (await this.dataProvider.confirm("Alert! Do you want to delete it?",[1],{buttons:["No","Yes"]})){
        this.dataProvider.tables = this.dataProvider.tables.filter((t)=>{
          return t.id != table.id;
        });
        this.dataProvider.groupedTables = {};
        this.dataProvider.tables.forEach((t)=>{
          if(!this.dataProvider.groupedTables[t.name.split(' ')[0]]){
            this.dataProvider.groupedTables[t.name.split(' ')[0]] = [];
          }
          this.dataProvider.groupedTables[t.name.split(' ')[0]].push(t);
        })
      //  console.log("table.id",table.id,this.dataProvider.tables);
        await this.tableService.deleteTable(table.id);
      } else {
        this.alertify.presentToast("Table delete cancelled");
      }
    } else {
      this.alertify.presentToast("Only tables can be deleted");
    }
  }

  exchange() {
    if (this.transferTableWise.fromTable && this.transferTableWise.toTable) {
      try {
        this.transferTableWise.fromTable.exchange(
          this.transferTableWise.toTable
        );
        this.alertify.presentToast('Table exchanged successfully');
        // reset vars and switch mode
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

  changeTable(event: any, kot: Kot) {
    // add kot to selectedKotsForKotTransfer
  //  console.log('event ', event);
    if (event.checked) {
      this.selectedKotsForKotTransfer.push(kot);
    } else {
      this.selectedKotsForKotTransfer = this.selectedKotsForKotTransfer.filter(
        (k) => {
          return k.id != kot.id;
        }
      );
    }
  }

  moveSelectedKots(table: Table, event: any) {
    if (!table.bill) {
      throw new Error('Bill not found');
    }
    // get all selected productcs from selected kots from moveKotSelectedTable?.bill?.kots
    let kots: Kot[] = [];
    let products: Product[] = [];
    this.moveKotSelectedTable?.bill?.kots.forEach((kot) => {
      if (kot.allSelected) {
        kots.push(kot);
      //  console.log('Adding kot ', kot.products);
      } else {
        products.push(...kot.products.filter((p) => p.selected));
        console.log(
          'Adding products ',
          ...kot.products.filter((p) => p.selected)
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
        table.bill!.addProduct({
          ...product,
          transferred: this.moveKotSelectedTable?.id,
        });
      });
      // remove products from old table
      this.moveKotSelectedTable!.bill!.kots.forEach((kot) => {
        kot.products = kot.products.filter((p) => {
          return !p.selected;
        });
      });
    }
    this.moveKotSelectedTable!.bill?.calculateBill();
    table.bill?.calculateBill();
  }

  switchTableSize(event:any){
  //  console.log("event",event);
    localStorage.setItem('tableSize',event.value);
    this.dataProvider.currentTableSize = event.value;
  }

  switchMode(mode:any){
  //  console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    this.dataProvider.modeChanged.next(mode.value);
    if (mode.value == 'dineIn'){
    //  console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if(!this.dataProvider.dineInMenu){
        alert("No dine-in menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
      //  console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
    //  console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway'){
    //  console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if(!this.dataProvider.takeawayMenu){
        alert("No takeaway menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'takeaway';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
      //  console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
    //  console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online'){
    //  console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if(!this.dataProvider.onlineMenu){
        alert("No online menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
      //  console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
    //  console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
  }

  settleTable(table:Table,event){
    if (table.bill) {
      let dialog = this.dialog.open(SettleComponent,{data:table.bill.billing.grandTotal});
      dialog.closed.subscribe(async (result: any) => {
      //  console.log('Result', result);
        if (result && table.bill && result.settling && result.paymentMethods) {
          await table.bill.settle(result.paymentMethods,'external',result.detail || null);
        }
      });
    }
  }

  isNumber(value:any){
    return !isNaN(Number(value));
  }
}
