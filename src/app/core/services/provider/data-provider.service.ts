import { Dialog } from '@angular/cdk/dialog';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ReplaySubject, Subject, debounceTime, firstValueFrom } from 'rxjs';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';
import { PromptComponent } from '../../../shared/base-components/prompt/prompt.component';
import {
  Category,
  ViewCategory,
  RootCategory,
} from '../../../types/category.structure';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { Tax } from '../../../types/tax.structure';
import {
  UserRecord,
  BusinessRecord,
  userState,
  CustomerInfo,
} from '../../../types/user.structure';
import { Bill } from '../../constructors/bill';
import { Device } from '../../constructors/device/Device';
import { ModeConfig } from '../../constructors/menu/menu';
import { Product } from '../../../types/product.structure';
import { Menu } from '../../../types/menu.structure';
import { Table } from '../../constructors/table/Table';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { updateRequest } from '../../../types/loader.structure';
import { Timestamp } from '@angular/fire/firestore';
import { optionalPromptParam } from '../../../types/prompt.strcuture';
import { CheckingPasswordComponent } from '../../../shared/checking-password/checking-password.component';
import {
  Combo,
  ComboCategoryCategorized,
} from '../../../types/combo.structure';
import { ApplicableCombo } from '../../constructors/comboKot/comboKot';

@Injectable({
  providedIn: 'root',
})
export class DataProvider {
  constructor(
    private dialog: Dialog,
    private functions: Functions,
  ) {
    // read viewSettings from localStorage every 2 seconds
    let tableSize = localStorage.getItem('tableSize');
    if(tableSize){
      this.currentTableSize = tableSize as any;
    }
    this.clientWidth.next(window.innerWidth);
    this.clientHeight.next(window.innerHeight);
    setInterval(() => {
      this.smartMode = (
        localStorage.getItem('viewSettings')
          ? JSON.parse(localStorage.getItem('viewSettings')!)
          : { smartView: false }
      ).smartView;
    }, 2000);
    window.alert = (message: string) => {
      this.confirm('Alert', [0], {
        description: message,
        buttons: ['ok'],
        primary: [0],
      });
    };
    window.addEventListener('resize', () => {
      this.clientWidth.next(window.innerWidth);
      this.clientHeight.next(window.innerHeight);
    });
    window.addEventListener('online', () => {
      this.backOnline.next(true);
      setTimeout(() => {
        this.offline = false;
      }, 1000);
    });
    window.addEventListener('offline', () => {
      this.offline = true;
    });
    this.queueUpdate.subscribe((updateTime) => [
      this.updateRequests.push({
        currentTime: Timestamp.now(),
        totalUpdateTimeMs: updateTime + 500,
      }),
    ]);

    // window.onbeforeunload = () => "STOP!! Data is being updated. Please wait. Or you may corrupt it.";
    setInterval(() => {
      this.updating = !this.isTimeElapsed();
      if (this.updating) {
        window.onbeforeunload = () =>
          'STOP!! Data is being updated. Please wait. Or you may corrupt it.';
      } else {
        window.onbeforeunload = () => null;
      }
      this.billerPrinter = localStorage.getItem('billerPrinter')
    }, 500);
    this.productPanelState.subscribe((state) => {
      this.productPanelStateValue = state;
    });
  }

  private passwordCheck = httpsCallable(this.functions, 'checkPassword');

  // smart vars
  public chatInnerHtml: Node | undefined;
  public chatCustomWidget: any;

  // constants
  // public password: string = '123456';
  public accessLevels: string[] = ['manager', 'waiter', 'accountant', 'admin'];

  // recommendationConfig
  highCostConfig: { min: number; max: number } = { min: 0, max: 0 };
  lowCostConfig: { min: number; max: number } = { min: 0, max: 0 };
  highRangeConfig: { min: number; max: number } = { min: 0, max: 0 };
  lowRangeConfig: { min: number; max: number } = { min: 0, max: 0 };
  mostSellingConfig: { min: number; max: number } = { min: 0, max: 0 };
  newDishesConfig: { min: any; max: any } = { min: 0, max: 0 };

  // counters
  public sale: number = 0;
  public billToken: number = 0;
  public orderTokenNo: number = 0;
  public ncBillToken: number = 0;
  public kotToken: number = 0;
  public takeawayToken: number = 0;
  public onlineTokenNo: number = 0;
  public dineInSales: number = 0;
  public takeawaySales: number = 0;
  public onlineSales: number = 0;
  public nonChargeableSales: number = 0;
  public tableTimeOutTime: number = 45;
  public billNoSuffix: string = '';
  public optionalTax: boolean = false;
  public printBillAfterSettle: boolean = false;
  public printBillAfterFinalize: boolean = false;
  public confirmBeforePrint: boolean = false;
  public currentSettings: any;
  public customBillNote: string = '';
  public todaySales: any = {};
  public multipleDiscount: boolean = false;
  public editKotTime: number = 1;
  public kotEditable: boolean = false;
  public kotRePrintable: boolean = false;
  public sweetsMode:boolean = false;
  public billerPrinter:string = '';

  public newMenuLoaded:boolean = false;

  public dailyTokens:{
    billTokenNo:number,
    orderTokenNo:number;
    ncBillTokenNo:number;
    takeawayTokenNo:number;
    onlineTokenNo:number;
    kitchenTokenNo:number;
  } = {
    billTokenNo:0,
    orderTokenNo:0,
    ncBillTokenNo:0,
    takeawayTokenNo:0,
    onlineTokenNo:0,
    kitchenTokenNo:0
  };

  // public access
  public menus: ModeConfig[] = [];
  public products: Product[] = [];
  public categories: Category[] = [];
  public viewCategories: ViewCategory[] = [];
  public rootCategories: RootCategory[] = [];
  public recommendedCategories: ViewCategory[] = [];
  public currentUser: UserRecord | undefined;
  public currentFirebaseUser: User | undefined;
  public activeModes: [boolean, boolean, boolean] = [false, false, false];
  public allMenus: ReplaySubject<Menu[]> = new ReplaySubject<Menu[]>(1);
  public currentMenu: ModeConfig | undefined;
  public tempProduct: Product | undefined;
  public currentTableSize: 'large' | 'medium' | 'small' = 'large';
  public dineInMenu: Menu | undefined;
  public takeawayMenu: Menu | undefined;
  public onlineMenu: Menu | undefined;
  public tables: Table[] = [];
  public groupedTables: { tables: Table[]; name: string }[] = [];
  public validTill: Date = new Date();
  public tokens: Table[] = [];
  public onlineTokens: Table[] = [];
  public customers: CustomerInfo[] = [];
  public customerDatabaseVersion: string = '';
  public customersUpdated: Subject<void> = new Subject<void>();
  public loyaltyEnabled: boolean = false;
  public loyaltyOnDineIn: boolean = false;
  public loyaltyOnDelivery: boolean = false;
  public loyaltyOnTakeaway: boolean = false;
  public loyaltyOnOnline: boolean = false;
  public differentLoyaltyRate: boolean = false;
  public tableOrders: any = undefined;
  public groupOrders: string[] = [];
  public loyaltyRates: {
    dineIn: number;
    dineInExpiry: number;
    takeaway: number;
    takeawayExpiry: number;
    online: number;
    onlineExpiry: number;
  } = {
    dineIn: 0,
    dineInExpiry: 0,
    takeaway: 0,
    takeawayExpiry: 0,
    online: 0,
    onlineExpiry: 0,
  };

  // combo statuses
  public currentCombo: Combo | undefined;
  public currentComboTypeCategory: ComboCategoryCategorized | undefined;
  public currentApplicableCombo: ApplicableCombo | undefined;
  public currentPendingProduct: Product | undefined;
  // statuses
  public billingMode: 'dineIn' | 'takeaway' | 'online' = 'dineIn';
  public isAuthStateAvaliable: boolean = false;
  public loggedIn: boolean = false;
  public kotViewVisible: boolean = false;
  public allProducts: boolean = false;
  public currentTable: Table | undefined;
  public currentDevice: Device | undefined;
  public currentBill: Bill | undefined;
  public showTableOnBillAction: boolean = false;
  public moreActions: boolean = false;
  public manageKot: boolean = false;
  public manageKotChanged: Subject<boolean> = new Subject<boolean>();
  public totalSales: number = 0;
  public clientWidth: ReplaySubject<number> = new ReplaySubject(1);
  public clientHeight: ReplaySubject<number> = new ReplaySubject(1);
  public menusUpdated: Subject<string> = new Subject<string>();

  public get currentBusinessUser() {
    if (this.currentBusiness && this.currentUser) {
      return this.currentBusiness.users.find((user) => {
        return user.username == this.currentUser?.username;
      })
    } else {
      return undefined;
    }
  }
  public smartMode: boolean = (localStorage.getItem('viewSettings')
    ? JSON.parse(localStorage.getItem('viewSettings')!)
    : { smartView: false }
  ).smartView;
  public touchMode: boolean = (localStorage.getItem('viewSettings')
    ? JSON.parse(localStorage.getItem('viewSettings')!)
    : { touchMode: false }
  ).touchMode;
  public loading: boolean = false;

  public cachedMethods:any[] = [];

  // triggers
  public closeAllPanel: Subject<boolean> = new Subject<boolean>();
  public menuProducts: Subject<Category> = new Subject<Category>();
  public currentAuthState: Subject<User> = new Subject<User>();
  public selectProduct: Subject<any> = new Subject<any>();
  public selectTable: Subject<Table> = new Subject<Table>();
  public openTableView: Subject<boolean> = new Subject<boolean>();
  public billAssigned: Subject<void> = new Subject<void>();
  public searchResults: Subject<any[] | false> = new Subject<any[] | false>();
  public clearSearchField: Subject<void> = new Subject<void>();
  public productsLoaded: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public billUpdated: Subject<void> = new Subject<void>();
  public settingsChanged: Subject<any> = new Subject<any>();
  public comboSelected: Subject<Combo[]> = new Subject<Combo[]>();
  public productPanelState: ReplaySubject<'products' | 'combos'> =
  new ReplaySubject<'products' | 'combos'>(1);
  public productPanelStateValue: 'products' | 'combos' = 'products';
  public primaryOutletId: string = '';
  public customCharges:{
    dineIn:('delivery'|'tip'|'container'|'service')[],
    takeaway:('delivery'|'tip'|'container'|'service')[],
    online:('delivery'|'tip'|'container'|'service')[],
  } = {
    dineIn:[],
    takeaway:[],
    online:[],
  }
  public offline: boolean = false;
  public updating: boolean = false;
  public backOnline: Subject<boolean> = new Subject<boolean>();
  public queueUpdate: Subject<number> = new Subject<number>();
  public updateRequests: updateRequest[] = [];
  // public globalUpdateState:'checking-for-update'|'not-available'|'update-available'|'download-progress'|'update-downloaded' = 'checking-for-update';
  public softwareUpdateFilteredSubject: ReplaySubject<any> =
    new ReplaySubject<any>(1);
  public currentUpdateStage:
    | 'checking-for-update'
    | 'update-not-available'
    | 'update-available'
    | 'download-progress'
    | 'update-downloaded'
    | 'installing' = 'checking-for-update';
  public currentUpdateProgress: number = 0;

  public isTimeElapsed(): boolean {
    return (
      this.updateRequests.filter((request) => {
        // get current time in systemTime
        // get totalElapsed time => systemTime - request.currentTime
        // if totalElapsed time > request.totalUpdateTimeMs
        // return true

        // else return false
        let systemTime = Timestamp.now();
        let totalElapsed =
          systemTime.toMillis() - request.currentTime.toMillis();
        if (totalElapsed > request.totalUpdateTimeMs) {
          return false;
        } else {
          return true;
        }
      }).length == 0
    );
  }

  public get currentAccessLevel() {
    if (this.currentBusiness) {
      let user = this.currentBusiness.users.find((user) => {
        return user.username == this.currentUser?.username;
      });
      if (user) {
        return user.accessType == 'custom' ? user.accessType : user.role;
      } else {
        return 'waiter';
      }
    } else {
      return 'waiter';
    }
  }

  public getAccess(property: string | string[]) {
    if (this.currentBusiness && this.currentUser) {
      let user = this.currentBusiness.users.find((user) => {
        return user.username == this.currentUser?.username;
      });
      if (user) {
        if (Array.isArray(property)) {
          if (property.every((prop) => this.propertyList.includes(prop))) {
            if (user.accessType == 'role') {
              // check if every property is included in this.defaultAccess[user.role]
              if (
                property.every(
                  (prop) =>
                    user.accessType == 'role' &&
                    this.defaultAccess[user.role].includes(prop),
                )
              ) {
                return true;
              } else {
                return false;
              }
            } else if (user.accessType == 'custom') {
              // check if every property is included in user.propertiesAllowed
              if (
                property.every(
                  (prop) =>
                    user.accessType == 'custom' &&
                    user.propertiesAllowed.includes(prop),
                )
              ) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            // throw new Error('Invalid properties '+property.join(', '));
            return false;
          }
        } else {
          if (this.propertyList.includes(property)) {
            if (user.accessType == 'role') {
              // check if every property is included in this.defaultAccess[user.role]
              if (
                user.accessType == 'role' &&
                this.defaultAccess[user.role].includes(property)
              ) {
                return true;
              } else {
                return false;
              }
            } else if (user.accessType == 'custom') {
              // check if every property is included in user.propertiesAllowed
              if (
                user.accessType == 'custom' &&
                user.propertiesAllowed.includes(property)
              ) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            // throw new Error('Invalid property '+property);
            return false;
          }
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public async prompt(
    title: string,
    params?: optionalPromptParam,
  ): Promise<string | null> {
    const dialog = this.dialog.open(PromptComponent, {
      panelClass: 'customDialog',
      data: {
        title: title,
        ...params,
      },
    });
    let res = await firstValueFrom(dialog.closed);
    if (typeof res == 'string') {
      return res;
    } else {
      return null;
    }
  }

  public async confirm(
    title: string,
    correct: number[],
    params?: { description?: string; buttons?: string[]; primary?: number[] },
  ) {
    const dialog = this.dialog.open(DialogComponent, {
      panelClass: 'customDialog',
      data: {
        title: title,
        ...params,
      },
    });
    let res = await firstValueFrom(dialog.closed);
    //  console.log("responded",res);
    if (typeof res == 'number') {
      if (correct.includes(res)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public async checkPassword(password: string) {
    this.loading = true;
    const dialog = this.dialog.open(CheckingPasswordComponent, {
      hasBackdrop: false,
      panelClass: 'passwordAlert',
    });
    dialog.disableClose = true;
    try {
      let res = await this.passwordCheck({
        password: password,
        uid: this.currentUser.username,
      });
      if (res.data['correct']) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      dialog.close();
      this.loading = false;
    }
  }

  // onboarding vars
  public userSubject: Subject<userState> = new Subject<userState>();
  public menuLoadSubject: ReplaySubject<any> = new ReplaySubject<any>(3);
  public modeChanged: Subject<void> = new Subject<void>();
  public currentBusiness: BusinessRecord | undefined;
  public businessId: string = '';

  // access management
  propertyList = [
    'updateBiller',
    'seeSaleSummary',
    'seeReports', //TODO: new
    'seeOrderSummary',
    'seeVrajeraCategories',
    'seeCombos',
    'seeLoyalty', // TODO: new
    'addNewMenu', // TODO: new
    'addNewLoyaltySettings', // TODO: new
    'editLoyaltySetting', // TODO: new
    'deleteLoyaltySetting', // TODO: new
    'multipleDiscounts', // TODO: new
    'seeYourCategories',
    "setPrinterSettings", //TODO: new
    'seeMainCategories',
    'reactivateBill', // TODO: new *
    'editMenu',
    'editTakeawayMenu',
    'editOnlineMenu',
    'editDineInMenu',
    'seeAllProducts',
    'addNewProduct',
    'enableDisableProducts',
    'setTaxesOnProducts',
    'editProduct',
    'canEditDetails',
    'canSetPrinter',
    'deleteProduct',
    'recommendedCategories',
    'editRecommendedCategorySettings',
    'enableDisableRecommendedProducts',
    'setTaxesOnRecommendedProducts',
    'editRecommendedProduct',
    'deleteRecommendedProduct',
    'viewCategories',
    'addViewCategory',
    'editViewCategory',
    'deleteViewCategory',
    'enableDisableViewProducts',
    'setTaxesOnViewProducts',
    'editViewProduct',
    'deleteViewProduct',
    'mainCategories',
    'addMainCategory',
    'deleteMainCategory',
    'enableDisableMainProducts',
    'setTaxesOnMainProducts',
    'editMainProduct',
    'deleteMainProduct',
    'editTaxes',
    'seeTaxes',
    'addNewTaxes',
    'deleteTaxes',
    'editTax',
    'discount',
    'seeDiscount',
    'addNewDiscounts',
    'deleteDiscounts',
    'editDiscount',
    'combos',
    'seeCombos',
    'addNewCombos',
    'deleteCombos',
    'editCombo',
    'types',
    'seeTypes',
    'addNewTypes',
    'deleteTypes',
    'editTypes',
    'addNewMenu',
    'switchMenu',
    'viewTable',
    'reArrangeGroupOrder',
    'settleFromTable',
    'addTable',
    'deleteTable',
    'addNewTakeawayToken',
    'addNewOnlineToken',
    'moveAndMergeOptions',
    'seeHistory',
    'settings',
    'about',
    'readAboutSettings',
    'changeAboutSettings',
    'businessSettings',
    'readBusinessSettings',
    'switchModes',
    'changeConfig',
    'changePrinter',
    'accountSettings',
    'readAccountSettings',
    'addAccount',
    'removeAccount',
    'paymentMethods',
    'newMethod',
    'editMethod',
    'deleteMethod',
    'advancedSettings',
    'generalSettings',
    'loyaltySettings',
    'punchKot',
    'manageKot',
    'editKot',
    'deleteKot',
    'lineDiscount',
    'lineCancel',
    'applyDiscount',
    'seePreview',
    'finalizeBill', //TODO new *
    'splitBill',
    'setNonChargeable',
    'billNote',
    'cancelBill',
    'settleBill',
    'writeCustomerInfo',
  ];

  defaultAccess = {
    admin: [...this.propertyList],
    manager: [
      'updateBiller',
      'seeSaleSummary',
      'seeReports', //TODO: new
      'seeOrderSummary',
      'seeVrajeraCategories',
      'seeCombos',
      'seeLoyalty', // TODO: new
      'addNewMenu', // TODO: new
      'addNewLoyaltySettings', // TODO: new
      'editLoyaltySetting', // TODO: new
      'deleteLoyaltySetting', // TODO: new
      'multipleDiscounts', // TODO: new
      'seeYourCategories',
      "setPrinterSettings", //TODO: new
      'seeMainCategories',
      'reactivateBill', // TODO: new *
      'finalizeBill', //TODO new *
      'editMenu',
      'editTakeawayMenu',
      'editOnlineMenu',
      'editDineInMenu',
      'seeAllProducts',
      'addNewProduct',
      'enableDisableProducts',
      'setTaxesOnProducts',
      'editProduct',
      'canEditDetails',
      'canSetPrinter',
      'deleteProduct',
      'recommendedCategories',
      'editRecommendedCategorySettings',
      'enableDisableRecommendedProducts',
      'setTaxesOnRecommendedProducts',
      'editRecommendedProduct',
      'deleteRecommendedProduct',
      'viewCategories',
      'addViewCategory',
      'editViewCategory',
      'deleteViewCategory',
      'enableDisableViewProducts',
      'setTaxesOnViewProducts',
      'editViewProduct',
      'deleteViewProduct',
      'mainCategories',
      'addMainCategory',
      'deleteMainCategory',
      'enableDisableMainProducts',
      'setTaxesOnMainProducts',
      'editMainProduct',
      'deleteMainProduct',
      'editTaxes',
      'seeTaxes',
      'addNewTaxes',
      'deleteTaxes',
      'editTax',
      'discount',
      'seeDiscount',
      'addNewDiscounts',
      'deleteDiscounts',
      'editDiscount',
      'combos',
      'seeCombos',
      'addNewCombos',
      'deleteCombos',
      'editCombo',
      'types',
      'seeTypes',
      'addNewTypes',
      'deleteTypes',
      'editTypes',
      'addNewMenu',
      'switchMenu',
      'viewTable',
      'reArrangeGroupOrder',
      'settleFromTable',
      'addTable',
      'deleteTable',
      'addNewTakeawayToken',
      'addNewOnlineToken',
      'moveAndMergeOptions',
      'seeHistory',
      'settings',
      'about',
      'readAboutSettings',
      'readBusinessSettings',
      'switchModes',
      'changeConfig',
      'changePrinter',
      'paymentMethods',
      'newMethod',
      'editMethod',
      'deleteMethod',
      'advancedSettings',
      'generalSettings',
      'loyaltySettings',
      'punchKot',
      'manageKot',
      'editKot',
      'deleteKot',
      'lineDiscount',
      'lineCancel',
      'applyDiscount',
      'seePreview',
      'splitBill',
      'setNonChargeable',
      'billNote',
      'cancelBill',
      'settleBill',
      'writeCustomerInfo',
    ],
    accountant: [
      'updateBiller',
      'seeSaleSummary',
      'seeReports', //TODO: new
      'seeOrderSummary',
      'editMenu',
      'seeVrajeraCategories',
      'seeCombos',
      'seeLoyalty', // TODO: new
      'addNewMenu', // TODO: new
      'addNewLoyaltySettings', // TODO: new
      'multipleDiscounts', // TODO: new
      'seeYourCategories',
      "setPrinterSettings", //TODO: new
      'seeMainCategories',
      'seeAllProducts',
      'enableDisableProducts',
      'setTaxesOnProducts',
      'canSetPrinter',
      'deleteProduct',
      'recommendedCategories',
      'enableDisableRecommendedProducts',
      'setTaxesOnRecommendedProducts',
      'deleteRecommendedProduct',
      'viewCategories',
      'addViewCategory',
      'editViewCategory',
      'deleteViewCategory',
      'enableDisableViewProducts',
      'setTaxesOnViewProducts',
      'editViewProduct',
      'deleteViewProduct',
      'mainCategories',
      'addMainCategory',
      'deleteMainCategory',
      'enableDisableMainProducts',
      'setTaxesOnMainProducts',
      'seeTaxes',
      'addNewTaxes',
      'editTax',
      'discount',
      'seeDiscount',
      'addNewDiscounts',
      'combos',
      'seeCombos',
      'addNewCombos',
      'types',
      'seeTypes',
      'addNewTypes',
      'deleteTypes',
      'editTypes',
      'addNewMenu',
      'switchMenu',
      'viewTable',
      'reArrangeGroupOrder',
      'settleFromTable',
      'addTable',
      'addNewTakeawayToken',
      'addNewOnlineToken',
      'moveAndMergeOptions',
      'seeHistory',
      'settings',
      'about',
      'readAboutSettings',
      'readBusinessSettings',
      'switchModes',
      'changeConfig',
      'changePrinter',
      'paymentMethods',
      'newMethod',
      'editMethod',
      'advancedSettings',
      'generalSettings',
      'loyaltySettings',
      'punchKot',
      'manageKot',
      'editKot',
      'lineDiscount',
      'lineCancel',
      'applyDiscount',
      'seePreview',
      'splitBill',
      'setNonChargeable',
      'billNote',
      'cancelBill',
      'settleBill',
      'writeCustomerInfo',
    ],
    waiter: [
      'updateBiller',
      'seeSaleSummary',
      'seeOrderSummary',
      'seeVrajeraCategories',
      'editMenu',
      'viewCategories',
      'addViewCategory',
      'editViewCategory',
      'deleteViewCategory',
      'seeYourCategories',
      "setPrinterSettings", //TODO: new
      'canSetPrinter',
      'viewTable',
      'addNewTakeawayToken',
      'addNewOnlineToken',
      'moveAndMergeOptions',
      'seeVrajeraCategories',
      'seeCombos',
      'seeYourCategories',
      'seeMainCategories',
      'about',
      'readAboutSettings',
      'readBusinessSettings',
      'changePrinter',
      'paymentMethods',
      'punchKot',
      'manageKot',
      'seePreview',
      'billNote',
      'writeCustomerInfo',
    ],
  };
}
