import { Timestamp } from '@angular/fire/firestore';
import { Device } from '../device/Device';
import { Table } from '../table/Table';
import { User } from '../user/User';

import { debounceTime, Subject } from 'rxjs';
import { CustomerInfo, UserConstructor } from '../../../types/user.structure';
import { Menu } from '../../../types/menu.structure';
import { Kot } from '../kot/Kot';
import { Product } from '../../../types/product.structure';
import { Billing, Payment } from '../../../types/payment.structure';
import { DataProvider } from '../../services/provider/data-provider.service';
import { BillConstructor, splittedBill } from '../../../types/bill.structure';
import { BillService } from '../../services/database/bill/bill.service';
import { AnalyticsService } from '../../services/database/analytics/analytics.service';

// bill imports
import { calculateBill } from './methods/calculation.bill';
import {
  firebaseUpdate,
  fromObject,
  getKotsObject,
  toObject,
  updateToFirebase,
} from './methods/update.bill';
import {
  addKot,
  clearAllKots,
  deleteKot,
  editKot,
  finalizeAndPrintKot,
  printKot,
} from './methods/kot.bill';
import {
  finalize,
  merge,
  printBill,
  setAsNonChargeable,
  setAsNormal,
  setInstruction,
  settle,
  splitBill,
} from './methods/bill.bill';
import {
  allFinalProducts,
  allProducts,
  kotWithoutFunctions,
  totalProducts,
} from './methods/getHelpers.bill';
import { cancel, lineCancelled } from './methods/cancel.bill';
import { setCustomerInfo } from './methods/customer.bill';
import { addProduct, removeProduct } from './methods/product.bill';
import { setTable } from './methods/table';
import { PrinterService } from '../../services/printing/printer/printer.service';

export class Bill implements BillConstructor {
  id: string;
  tokens: string[] = [];
  billNo?: string;
  orderNo: string | null = null;
  createdDate: Timestamp;
  kotReprints: {
    reprintReason: string;
    time: Timestamp;
    user: UserConstructor;
  }[] = [];
  billReprints: {
    reprintReason: string;
    time: Timestamp;
    user: UserConstructor;
  }[] = [];
  modifiedAllProducts: any[] = [];
  stage: 'active' | 'finalized' | 'settled' | 'cancelled';
  customerInfo: CustomerInfo;
  reactivateKotReasons: string[] = [];
  device: Device;
  optionalTax: boolean = false;
  mode: 'dineIn' | 'takeaway' | 'online';
  menu: Menu;
  kots: Kot[] = [];
  cancelledProducts: { kot: string; product: Product }[] = [];
  table: Table;
  billing: Billing;
  instruction: string;
  editKotMode: null | {
    previousKot: Product[];
    newKot: Product[];
    kot: Kot;
    kotIndex: number;
  } = null;
  user: User;
  nonChargeableDetail?: {
    reason: string;
    time: Timestamp;
    user: User;
    phone: string;
    name: string;
  };
  billingMode: 'cash' | 'card' | 'upi' | 'nonChargeable' = 'cash';
  settlement?: {
    payments: Payment[];
    time: Timestamp;
    user: User;
    additionalInfo: any;
  } = undefined;
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: User;
  };
  billSubscriptionCallerStarted: boolean = false;
  updated: Subject<boolean | void> = new Subject<boolean | void>();
  currentKot: Kot | null =
    this.kots.find((kot) => kot.stage === 'active') || null;

  constructor(
    id: string,
    table: Table,
    mode: 'dineIn' | 'takeaway' | 'online',
    billerUser: User,
    menu: Menu,
    public dataProvider: DataProvider,
    public analyticsService: AnalyticsService,
    public billService: BillService,
    public printingService: PrinterService,
    billNo?: string
  ) {
    this.optionalTax = this.dataProvider.optionalTax;
    // taxes[0].amount = Number(this.dataProvider.currentSettings.sgst)
    // taxes[1].amount = Number(this.dataProvider.currentSettings.cgst)
    this.updated.subscribe(() => {
      this.dataProvider.queueUpdate.next();
    });
    this.updated.pipe(debounceTime(10000)).subscribe(async (data) => {
      this.updateToFirebase();
    });
    this.firebaseUpdate();
    this.toObject = this.toObject.bind(this);
    this.id = id;
    this.instruction = '';
    this.createdDate = Timestamp.now();
    this.stage = 'active';
    this.mode = mode;
    this.customerInfo = {};
    this.menu = menu;
    this.table = table;
    this.user = billerUser;
    this.billNo = billNo;
    this.billing = {
      subTotal: 0,
      discount: [],
      taxes: [],
      totalTax: 0,
      grandTotal: 0,
    };
    this.updated.next();
  }

  // defnintions

  // common functions
  public calculateBill = calculateBill;

  // bill functions
  public setAsNonChargeable = setAsNonChargeable;
  public setAsNormal = setAsNormal;
  public finalize = finalize;
  public setInstruction = setInstruction;
  public printBill = printBill;
  public settle = settle;
  public merge = merge;
  public splitBill = splitBill;

  // cancel functions
  public cancel = cancel;
  public lineCancelled = lineCancelled;

  // customer functions
  public setCustomerInfo = setCustomerInfo;

  // helpers
  public allProducts = allProducts;
  public allFinalProducts = allFinalProducts;
  public kotWithoutFunctions = kotWithoutFunctions;
  public totalProducts = totalProducts;

  // kot functions
  public addKot = addKot;
  public clearAllKots = clearAllKots;
  public editKot = editKot;
  public finalizeAndPrintKot = finalizeAndPrintKot;
  public deleteKot = deleteKot;
  public printKot = printKot;

  // product functions
  public addProduct = addProduct;
  public removeProduct = removeProduct;

  // table functions
  public setTable = setTable;

  // update functions
  public firebaseUpdate = firebaseUpdate;
  public getKotsObject = getKotsObject;
  public toObject = toObject;
  public static fromObject = fromObject;
  public updateToFirebase = updateToFirebase;
}
