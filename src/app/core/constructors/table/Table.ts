import { Timestamp } from '@angular/fire/firestore';

import { debounceTime, Subject } from 'rxjs';
import { TableConstructor } from '../../../types/table.structure';
import { Bill } from '../bill';
import { DataProvider } from '../../services/provider/data-provider.service';
import { BillConstructor } from '../../../types/bill.structure';
import { AnalyticsService } from '../../services/database/analytics/analytics.service';
import { TableService } from '../../services/database/table/table.service';
import { BillService } from '../../services/database/bill/bill.service';
import { UserConstructor } from '../../../types/user.structure';
import { PrinterService } from '../../services/printing/printer/printer.service';
import { CustomerService } from '../../services/customer/customer.service';
import { UserManagementService } from '../../services/auth/user/user-management.service';

export class Table implements TableConstructor {
  id: string;
  bill: Bill | null = null;
  timeSpent: string = '';
  minutes: number = 0;
  group: string;
  maxOccupancy: string;
  billPrice: number;
  order: number;
  completed: boolean = false;
  name: string;
  occupiedStart: Timestamp;
  status: 'available' | 'occupied';
  tableNo: number|string;
  type: 'table' | 'room' | 'token' | 'online';
  updated: Subject<void> = new Subject<void>();

  updateHistory: any[] = [];
  constructor(
    id: string,
    tableNo: number|string,
    name: string,
    groupName: string,
    order: number,
    maxOccupancy: string,
    type: 'table' | 'room' | 'token' | 'online',
    private dataProvider: DataProvider,
    public analyticsService: AnalyticsService,
    public tableService: TableService,
    public billService: BillService,
    private printingService: PrinterService,
    private customerService: CustomerService,
    private userManagementService: UserManagementService,
  ) {
    this.id = id;
    this.order = order;
    this.occupiedStart = Timestamp.now();
    this.billPrice = 0;
    this.maxOccupancy = maxOccupancy;
    this.name = name;
    this.group = groupName;
    this.status = 'available';
    this.tableNo = tableNo;
    this.type = type;
    this.firebaseUpdate();
    this.updated.subscribe(() => {
      this.dataProvider.queueUpdate.next(1000);
    });
    this.updated.pipe(debounceTime(1000)).subscribe(() => {
      // this.databaseService.updateTable(this.toObject());
      this.triggerUpdate();
    });
    // this.updated.next();
  }

  triggerUpdate() {
    if (this.type == 'table') {
      this.updateTable(this.toObject());
    } else if (this.type == 'room') {
      this.updateTable(this.toObject());
    } else if (this.type == 'token') {
      // if (this.bill){
      //   if(!this.toObject().bill){
      //     alert("CORRUPTION: Token already had a bill")
      //   }
      // }
      this.updateToken(this.toObject());
    } else if (this.type == 'online') {
      this.updateOnlineToken(this.toObject());
    }
  }

  firebaseUpdate() {
    // fetch the table from the database and update the local table
    var mode: 'tables' | 'tokens' | 'onlineTokens' = 'tables';
    if (this.type == 'table') {
      mode = 'tables';
    } else if (this.type == 'token') {
      mode = 'tokens';
    } else if (this.type == 'online') {
      mode = 'onlineTokens';
    }

    this.tableService.getTable(this.id, mode).subscribe(async (res) => {
      if (res) {
        let table: TableConstructor = res as TableConstructor;
        // if(!table.bill){
        //   console.log('table changed ',table.id, table);
        // }
        this.status = res['status'] || 'available';
        this.billPrice = res['billPrice'] || 0;
        this.occupiedStart = res['occupiedStart'];
        if (!this.bill && res['bill']) {
          if (typeof table.bill == 'string') {
            let bill = await this.billService.getBill(table.bill);
            // console.log('bill.exists()', bill.exists());
            if (bill.exists()) {
              let billData = bill.data() as BillConstructor;
              // console.log('billData ', billData);
              this.id = table.id;
              this.bill = Bill.fromObject(
                billData,
                this,
                this.dataProvider,
                this.analyticsService,
                this.billService,
                this.printingService,
                this.customerService,
                this.userManagementService,
              );
              this.maxOccupancy = table.maxOccupancy;
              this.billPrice = table.billPrice;
              this.name = table.name;
              this.occupiedStart = table.occupiedStart;
              this.status = table.status;
              this.tableNo = table.tableNo;
              this.type = table.type;
            }
          }
        }
        this.status = res['status'];
        this.billPrice = res['billPrice'];
        this.occupiedStart = res['occupiedStart'];
      }
    });
  }

  updateOnlineToken(data: any) {
    this.billService.updateOnlineToken(data);
  }

  updateToken(data: any) {
    // if(!data.bill){
    //   console.log('updateToken', data);
    // }
    this.billService.updateToken(data);
  }

  updateTable(data: any) {
    this.tableService.updateTable(data);
  }

  clearTable() {
    this.bill = null;
    // reset all variables
    this.billPrice = 0;
    this.timeSpent = '';
    this.minutes = 0;
    this.status = 'available';
    if (this.type == 'token' || this.type == 'online') {
      // mark table complete
      this.completed = true;
    }
    this.triggerUpdate();
    this.updated.next();
  }

  removeBill() {
    this.bill = null;
    this.status = 'available';
    this.updated.next();
  }

  setBillPrice(billPrice: number) {
    this.billPrice = billPrice;
    this.updated.next();
  }

  static async fromObject(
    object: TableConstructor,
    dataProvider: DataProvider,
    analyticsService: AnalyticsService,
    tableService: TableService,
    billService: BillService,
    printingService: PrinterService,
    customerService: CustomerService,
    userManagementService: UserManagementService,
  ) {
    // if(typeof object.bill == 'string'){
    //   let bill = await this.databaseService.getBill(object.bill)
    //   if (bill.exists()){
    //     let billData = bill.data() as BillConstructor;
    //   //  console.log("billData ",billData);
    //     this.id = object.id;
    //     this.bill = Bill.fromObject(billData, this, this.dataProvider, this.databaseService);
    //     this.maxOccupancy = object.maxOccupancy;
    //     this.billPrice = object.billPrice;
    //     this.name = object.name;
    //     this.occupiedStart = object.occupiedStart;
    //     this.status = object.status;
    //     this.tableNo = object.tableNo;
    //     this.type = object.type;
    //   }
    // }
    let instance = new Table(
      object.id,
      object.tableNo,
      object.name,
      object.group,
      object.order,
      object.maxOccupancy,
      object.type,
      dataProvider,
      analyticsService,
      tableService,
      billService,
      printingService,
      customerService,
      userManagementService,
    );
    // console.log('object.bill', object.bill);
    if (typeof object.bill == 'string') {
      let bill = await billService.getBill(object.bill);
      // console.log('bill.exists()', bill.exists());
      if (bill.exists()) {
        let billData = bill.data() as BillConstructor;
        // console.log('billData ', billData);
        instance.id = object.id;
        instance.bill = Bill.fromObject(
          billData,
          instance,
          dataProvider,
          analyticsService,
          billService,
          printingService,
          customerService,
          userManagementService,
        );
        instance.maxOccupancy = object.maxOccupancy;
        instance.billPrice = object.billPrice;
        instance.name = object.name;
        instance.order = object.order;
        instance.occupiedStart = object.occupiedStart;
        instance.status = object.status;
        instance.tableNo = object.tableNo;
        instance.type = object.type;
        instance.completed = object.completed || false;
        instance.minutes = object.minutes || 0;
        instance.timeSpent = object.timeSpent || '';
        if (instance.bill.stage == 'settled') {
          if (instance.type == 'token') {
            instance.completed = true;
          }
          instance.clearTable();
        }
        return instance;
      } else {
        // console.log('bill does not exist', object.bill);
        // console.log('bill', bill);
        // console.log('object', object);
        // alert('bill does not exist');
        instance.order = object.order;
        instance.billPrice = object.billPrice;
        instance.occupiedStart = object.occupiedStart;
        instance.status = 'available';
        return instance;
      }
    } else if (object.bill instanceof Bill) {
      instance.order = object.order;
      instance.bill = object.bill;
      instance.maxOccupancy = object.maxOccupancy;
      instance.billPrice = object.billPrice;
      instance.name = object.name;
      instance.occupiedStart = object.occupiedStart;
      instance.status = object.status;
      instance.tableNo = object.tableNo;
      instance.type = object.type;
      instance.completed = object.completed || false;
      instance.minutes = object.minutes || 0;
      instance.timeSpent = object.timeSpent || '';
      if (instance.bill.stage == 'settled') {
        if (instance.type == 'token') {
          instance.completed = true;
        }
        instance.clearTable();
      }
      return instance;
    } else {
      instance.order = object.order;
      instance.bill = object.bill;
      instance.billPrice = object.billPrice;
      instance.occupiedStart = object.occupiedStart;
      instance.status = object.status;
      instance.status = 'available';
      instance.completed = object.completed || false;
      instance.minutes = object.minutes || 0;
      instance.timeSpent = object.timeSpent || '';
      return instance;
    }
  }

  toObject() {
    let foundTokens = this.updateHistory.filter(
      (token) => token.id == token.id,
    );
    // if(foundTokens.length>0){
    //   if (!this.bill){
    //     // check if token had any bill before
    //     let hasTokens = foundTokens.filter((token)=>token.bill);
    //     if(hasTokens.length >0){
    //       alert("Token already had a bill")
    //       // console.log("HAD TOKENS",hasTokens);
    //       return
    //     }
    //   }
    // }
    // this.updateHistory.push(this)
    return {
      id: this.id,
      bill: this.bill?.id || null,
      maxOccupancy: this.maxOccupancy,
      billPrice: this.billPrice,
      name: this.name,
      occupiedStart: this.occupiedStart,
      status: this.status,
      tableNo: this.tableNo,
      type: this.type,
      order: this.order || 0,
      completed: this.completed || false,
      minutes: this.minutes || 0,
      timeSpent: this.timeSpent || '',
      group: this.group,
    };
  }

  generateId() {
    // random alphanumeric id
    return (
      Math.random().toString(36).substr(2, 9) +
      Math.random().toString(36).substr(2, 9) +
      Math.random().toString(36).substr(2, 9)
    );
  }

  occupyTable() {
    // console.log(
    //   'this.dataProvider.tempProduct 1',
    //   this.dataProvider.tempProduct
    // );
    if (!this.dataProvider.currentMenu?.selectedMenu) {
      alert('Please select a menu first');
      return;
    }
    if (this.status === 'available') {
      if (this.dataProvider.currentUser) {
        let user: UserConstructor = {
          username: this.dataProvider.currentUser?.username,
          access: '',
        };
        var mode: 'takeaway' | 'online' | 'dineIn';
        if (this.type == 'token') {
          mode = 'takeaway';
        } else if (this.type == 'online') {
          mode = 'online';
        } else if (this.type == 'table') {
          mode = 'dineIn';
        } else if (this.type == 'room') {
          mode = 'dineIn';
        } else {
          alert('Table corrupted please contact admin');
          return;
        }
        this.bill = new Bill(
          this.generateId(),
          this,
          mode,
          user,
          this.dataProvider.currentMenu?.selectedMenu,
          this.dataProvider,
          this.analyticsService,
          this.billService,
          this.printingService,
          this.customerService,
          this.userManagementService,
        );
        this.occupiedStart = Timestamp.now();
        this.status = 'occupied';
        this.updated.next();
        return this.bill;
      } else {
        if (!this.dataProvider.currentUser) {
          console.log(
            'this.dataProvider.currentUser ',
            this.dataProvider.currentUser,
          );
          throw new Error('No user is found');
        } else {
          throw new Error('Some error occurred');
        }
      }
    } else {
      if (this.status === 'occupied' && this.bill != undefined) {
        //  console.log('Activating bill', this.bill);
        this.updated.next();
        // console.log(
        //   'this.dataProvider.tempProduct',
        //   this.dataProvider.tempProduct
        // );
        if (this.dataProvider.tempProduct) {
          // alert('Adding product to bill');
          this.bill.addProduct(this.dataProvider.tempProduct);
          this.dataProvider.tempProduct = undefined;
        }
        return this.bill;
      } else {
        if (this.dataProvider.currentUser) {
          let user: UserConstructor = {
            username: this.dataProvider.currentUser?.username,
            access: '',
          };
          var mode: 'takeaway' | 'online' | 'dineIn';
          if (this.type == 'token') {
            mode = 'takeaway';
          } else if (this.type == 'online') {
            mode = 'online';
          } else if (this.type == 'table') {
            mode = 'dineIn';
          } else if (this.type == 'room') {
            mode = 'dineIn';
          } else {
            alert('Table corrupted please contact admin');
            return;
          }
          this.bill = new Bill(
            this.generateId(),
            this,
            mode,
            user,
            this.dataProvider.currentMenu?.selectedMenu,
            this.dataProvider,
            this.analyticsService,
            this.billService,
            this.printingService,
            this.customerService,
            this.userManagementService,
          );
          this.occupiedStart = Timestamp.now();
          this.status = 'occupied';
          this.updated.next();
          return this.bill;
        } else {
          if (!this.dataProvider.currentUser) {
            console.log(
              'this.dataProvider.currentUser ',
              this.dataProvider.currentUser,
            );
            throw new Error('No user is found');
          } else {
            throw new Error('Some error occurred');
          }
        }
      }
    }
  }

  attachBill(bill: Bill,tokenNumber: number) {
    this.bill = bill;
    this.occupiedStart = Timestamp.now();
    this.status = 'occupied';
    this.billPrice = bill.billing.grandTotal;
    if (this.type == 'token' || this.type == 'online'){
      this.tableNo = structuredClone(tokenNumber);
      this.order = structuredClone(tokenNumber);
      this.name = structuredClone(tokenNumber).toString();
    }
    this.updated.next();
  }

  createNewBill(){
    let user: UserConstructor = {
      username: this.dataProvider.currentUser?.username,
      access: this.dataProvider.currentBusinessUser.accessType,
    };
    var mode: 'takeaway' | 'online' | 'dineIn';
    if (this.type == 'token') {
      mode = 'takeaway';
    } else if (this.type == 'online') {
      mode = 'online';
    } else if (this.type == 'table') {
      mode = 'dineIn';
    } else if (this.type == 'room') {
      mode = 'dineIn';
    } else {
      alert('Table corrupted please contact admin');
      return;
    }
    return new Bill(
      this.generateId(),
      this,
      mode,
      user,
      this.dataProvider.currentMenu?.selectedMenu,
      this.dataProvider,
      this.analyticsService,
      this.billService,
      this.printingService,
      this.customerService,
      this.userManagementService,
    );
  }

  async exchange(table: Table) {
    if (await this.dataProvider.confirm('Are you sure you want to exchange tables?',[1])){
      if (this.bill && table.bill) {
        let tempBill = this.bill;
        this.bill = table.bill;
        table.bill = tempBill;
        this.updated.next();
        this.triggerUpdate();
      } else {
        if (this.bill && !table.bill) {
          // shift the bill from current table to this.table
          table.bill = this.bill;
          table.occupiedStart = Timestamp.now();
          table.status = 'occupied';
          table.updated.next();
          this.bill = null;
          // empty this.table
          this.clearTable();
        } else {
          alert('Table ' + table.name + ' is not occupied');
        }
      }
      alert('Table exchanged successfully');
    }
  }

  async merge(table: Table) {
    if (await this.dataProvider.confirm('Are you sure you want to merge tables?',[1])){
      if (this.bill && table.bill) {
        this.bill.merge(table.bill);
        this.updated.next();
        this.triggerUpdate();
      } else {
        throw new Error(
          'No bill is available on table ' +
            this.tableNo +
            ' or ' +
            table.tableNo,
        );
      }
    }
  }

  deleteTable(){
    if(this.tableNo == 'new'){
      if(this.type == 'online'){
        this.tableService.deleteOnlineToken(this.id);
      } else if (this.type =='table'){
        this.tableService.deleteTable(this.id);
      } else if (this.type == 'token'){
        this.tableService.deleteToken(this.id);
      }
    }
  }
}
