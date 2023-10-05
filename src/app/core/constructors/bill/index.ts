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
import { BillConstructor, billLoyalty, PrintableBill } from '../../../types/bill.structure';
import { BillService } from '../../services/database/bill/bill.service';
import { AnalyticsService } from '../../services/database/analytics/analytics.service';

// bill imports
import { anyComboCanBeDiscounted, calculateBill } from './methods/calculation.bill';
import {
  firebaseUpdate,
  fromObject,
  getKotsObject,
  toObject,
  updateToFirebase,
} from './methods/update.bill';
import {
  addKot,
  checkCanPrintKot,
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
} from './methods/bill.bill';
import {
  allFinalProducts,
  allProducts,
  getPrintableBill,
  kotWithoutFunctions,
  totalProducts,
} from './methods/getHelpers.bill';
import { cancel, deleteBill, lineCancelled } from './methods/cancel.bill';
import { setCustomerInfo } from './methods/customer.bill';
import { addProduct, removeProduct } from './methods/product.bill';
import { setTable } from './methods/table';
import { PrinterService } from '../../services/printing/printer/printer.service';
import { PrintableKot } from '../../../types/kot.structure';
import { CustomerService } from '../../services/customer/customer.service';
import { UserManagementService } from '../../services/auth/user/user-management.service';
import { ApplicableCombo } from '../comboKot/comboKot';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { ModeConfig } from '../menu/menu';
import { calculateLoyalty } from './methods/loyalty.bill';


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
  billSplits: PrintableBill[] = [];
  modifiedAllProducts: any[] = [];
  stage: 'active' | 'finalized' | 'settled' | 'cancelled' | 'hold';
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
    previousKot: (Product | ApplicableCombo)[];
    newKot: (Product | ApplicableCombo)[];
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
    elevatedUser?:string;
  };
  billingMode: 'cash' | 'card' | 'upi' | 'nonChargeable' = 'cash';
  settlementElevatedUser:string;
  settlement?: {
    payments: Payment[];
    time: Timestamp;
    user: User;
    additionalInfo: any;
    elevatedUser?:string;
  } = undefined;
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: User;
  };
  currentLoyalty:billLoyalty;
  currentModeConfig: ModeConfig | undefined;
  availableDiscounts: CodeBaseDiscount[] = [];
  printableBillData: PrintableBill | null = null;
  billSubscriptionCallerStarted: boolean = false;
  updated: Subject<boolean | void> = new Subject<boolean | void>();
  currentKot: Kot | null =
    this.kots.find((kot) => kot.stage === 'active') || null;
  billUpdated: Subject<boolean | void> = new Subject<boolean | void>();
  canPrintKot: boolean = false;
  canBeDiscounted: boolean = true;
  appliedCharges:{
    serviceCharge:number,
    tip:number,
    deliveryCharge:number,
    containerCharge:number,
  } = {
    serviceCharge:0,
    tip:0,
    deliveryCharge:0,
    containerCharge:0,
  }
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
    public customerService: CustomerService,
    public userManagementService: UserManagementService,
    billNo?: string,
  ) {
    this.optionalTax = this.dataProvider.optionalTax;
    // taxes[0].amount = Number(this.dataProvider.currentSettings.sgst)
    // taxes[1].amount = Number(this.dataProvider.currentSettings.cgst)
    this.updated.subscribe(() => {
      this.dataProvider.queueUpdate.next(1000);
      //  console.log("this.printableBillData",this.printableBillData);
    });
    this.updated.pipe(debounceTime(300)).subscribe(async (data) => {
      if (!data && this.eligibleForUpdate()) {
        this.updateToFirebase();
        this.updateTableData()
      }
    });
    this.toObject = this.toObject.bind(this);
    this.id = id;
    this.currentLoyalty= {
      loyaltySettingId: '',
      totalLoyaltyCost: 0,
      totalLoyaltyPoints: 0,
      totalToBeRedeemedPoints: 0,
      totalToBeRedeemedCost: 0,
      receiveLoyalty: false,
      redeemLoyalty: false,
    }
    this.instruction = '';
    // this.createdDate = Timestamp.fromDate(new Date("2023-10-01T12:07:50.735Z"));
    this.createdDate = Timestamp.fromDate(new Date());
    // console.log("CREATED DATE",this.createdDate.toDate());
    this.stage = 'active';
    this.mode = mode;
    this.customerInfo = {};
    this.menu = menu;
    this.dataProvider.menus.forEach((menu) => {
      if (menu.selectedMenuId === this.menu.id) {
        this.currentModeConfig = menu;
      }
    });
    this.table = table;
    this.user = billerUser;
    this.billNo = billNo;
    this.billing = {
      subTotal: 0,
      postDiscountSubTotal:0,
      postChargesSubTotal:0,
      discount: [],
      taxes: [],
      totalTax: 0,
      grandTotal: 0,
    };
    this.availableDiscounts =
      this.dataProvider.menus.find(
        (menu) => menu.selectedMenu.id === this.menu.id,
      )?.discounts || [];
    this.updated.next();
    this.firebaseUpdate();
    window.document.addEventListener('updateBill', (data)=>{
      this.calculateBill();
      // console.log("data",data['detail']['comboId']);
      if (this.allProducts().some(product=>product.id===data['detail']['comboId'])) {
        // console.log("Updating bill");
        this.updated.next();
      }
    });
  }

  // definitions

  // common functions
  public calculateBill = calculateBill;
  public calculateLoyalty = calculateLoyalty;
  public eligibleForUpdate(){
    // return true if there is atleast 1 finalize kot else false
    return this.kots.some(kot=>kot.stage==='finalized')
  }

  // bill functions
  public setAsNonChargeable = setAsNonChargeable;
  public setAsNormal = setAsNormal;
  public finalize = finalize;
  public setInstruction = setInstruction;
  public printBill = printBill;
  public settle = settle;
  public merge = merge;

  // cancel functions
  public cancel = cancel;
  public lineCancelled = lineCancelled;
  public deleteBill = deleteBill;

  // customer functions
  public setCustomerInfo = setCustomerInfo;

  // helpers
  public get allProducts() {
    return allProducts;
  }

  public get allFinalProducts(): (Product|ApplicableCombo)[] {
    return allFinalProducts.call(this);
  }

  public get kotWithoutFunctions() {
    // set {return kotWithoutFunctions} as getter function
    return kotWithoutFunctions.call(this);
  }

  public get totalProducts(): number {
    return totalProducts.call(this);
  }

  public getPrintableBillData(
    products: (Product | ApplicableCombo)[],
  ): PrintableBill {
    return getPrintableBill.call(this, products, this.dataProvider);
  }

  // kot functions
  public addKot = addKot;
  public clearAllKots = clearAllKots;
  public editKot = editKot;
  public finalizeAndPrintKot = finalizeAndPrintKot;
  public deleteKot = deleteKot;
  public printKot = printKot;
  public checkCanPrintKot = checkCanPrintKot;
  public anyComboCanBeDiscounted = anyComboCanBeDiscounted;

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
  public updateTableData(){
    this.table.billPrice = this.billing.grandTotal;
    this.table.updated.next();
  }
}
