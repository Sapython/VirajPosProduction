import { Injectable } from '@angular/core';
import { DataProvider } from '../provider/data-provider.service';
import {
  Firestore,
  collection,
  collectionChanges,
  collectionData,
  doc,
  docData,
  getDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Subject, firstValueFrom } from 'rxjs';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { TableConstructor } from '../../../types/table.structure';
import { Tax } from '../../../types/tax.structure';
import {
  BusinessRecord,
  CustomerInfo,
  Member,
} from '../../../types/user.structure';
import { AlertsAndNotificationsService } from '../alerts-and-notification/alerts-and-notifications.service';
import { AuthService } from '../auth/auth.service';
import { MenuManagementService } from '../database/menuManagement/menu-management.service';
import { Dialog } from '@angular/cdk/dialog';
import { PrinterService } from '../printing/printer/printer.service';
import { UserManagementService } from '../auth/user/user-management.service';
import { ModeConfig } from '../../constructors/menu/menu';
import { SettingsService } from '../database/settings/settings.service';
import { Menu } from '../../../types/menu.structure';
import { Table } from '../../constructors/table/Table';
import { ProductsService } from '../database/products/products.service';
import { AnalyticsService } from '../database/analytics/analytics.service';
import { TableService } from '../database/table/table.service';
import { BillService } from '../database/bill/bill.service';
import { CustomerService } from '../customer/customer.service';
import { Router } from '@angular/router';
import { Functions, httpsCallable } from '@angular/fire/functions';

var debug: boolean = true;
@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  previousValidity:boolean = false;
  noUserExists: boolean = false;
  message: string = '';
  stage:
    | 'noUser'
    | 'userExists'
    | 'multipleBusiness'
    | 'businessError'
    | 'onboardingStep1'
    | 'onboardingStep2'
    | 'onboardingStep3'
    | 'virajReady'
    | 'virajGettingReady'
    | 'resetPasswordStage1'
    | 'resetPasswordStage2'
    | 'resetPasswordStage3'
    | 'resetPasswordStage4'
    | 'validityExpired'
    | 'errorOccured' = 'noUser';
  loadingSteps: Subject<string> = new Subject<string>();
  private checkIfAccessTokenIsValidFunction = httpsCallable(this.functions,'checkIfAccessTokenIsValid');
  constructor(
    private dataProvider: DataProvider,
    private firestore: Firestore,
    private alertify: AlertsAndNotificationsService,
    private menuManagementService: MenuManagementService,
    private dialog: Dialog,
    private customerService: CustomerService,
    private printingService: PrinterService,
    private productService: ProductsService,
    private userService: UserManagementService,
    private settingsService: SettingsService,
    private analyticsService: AnalyticsService,
    private tableService: TableService,
    private billService: BillService,
    private userManagementService: UserManagementService,
    private router: Router,
    private functions:Functions
  ) {
    console.log('Onboarding Service Initialized');
    this.loadingSteps.next('Checking User');
    // fetchTimeout('https://firestore.googleapis.com/',{method:'GET'},2000).then((res)=>{
    //   console.log("IP",res);
    // }).catch((err)=>{
    //   console.log("IP error",err);
    //   this.dataProvider.
    // })
    if (this.dataProvider.offline) {
      console.log('Offline Mode');
    }
    this.dataProvider.userSubject.subscribe((data) => {
      if (debug) console.log('Checked user', data);
      this.stage = 'virajGettingReady';
      if (data.status) {
        this.loadingSteps.next('User Found');
        // remove duplicates from data.user.business by checking their businessId
        data.user.business = data.user.business.filter(
          (business, index, self) =>
            index ===
            self.findIndex((t) => t.businessId === business.businessId),
        );
        if (data.user.business.length > 1) {
          this.loadingSteps.next('User Found with multiple businesses');
          let localRead = localStorage.getItem('businessId');
          if (localRead) {
            this.loadBusiness(localRead);
          }
          this.stage = 'multipleBusiness';
        } else if (data.user.business.length == 1) {
          this.loadingSteps.next('User Found with a business');
          this.loadBusiness(data.user.business[0].businessId);
        } else {
          this.loadingSteps.next('User Found with no business');
          const dialog = this.dialog.open(DialogComponent, {
            data: {
              title: 'No Business Found',
              description:
                'No business found for this user. Please onboard on viraj to continue. For now we will log you out.',
            },
          });
          dialog.closed.subscribe(() => {
            this.userService.logout();
          });
        }
      } else {
        this.message = data.message;
        this.stage = 'noUser';
        this.alertify.presentToast(this.message, 'error');
      }
    });
  }

  loadBusiness(businessId: string) {
    if (debug) console.log('Loading business', businessId);
    docData(doc(this.firestore, 'business', businessId),{idField:'id'}).subscribe(async (business) => {
      if (business) {
        this.loadingSteps.next('Checking validity of business');
        if (!business['accessCode']){
          this.previousValidity = false;
          this.stage = 'validityExpired';
          this.message = 'Validity Has Expired';
          this.alertify.presentToast(this.message, 'error');
          alert("Validity of your biller is expired please contact support to renew your validity.");
          this.checkAndRefresh();
          this.dataProvider.loading = false;
          return;
        } else {
          try{
            let res = await this.checkValidity(business.id,business['accessCode']);
            if (!res || !res.data || !res.data['status']){
              this.dataProvider.validTill = new Date(res.data['validTill']);
              console.log("this.dataProvider.validTill",this.dataProvider.validTill);
              this.stage = 'validityExpired';
              this.message = 'Validity Has Expired';
              this.alertify.presentToast(this.message, 'error');
              this.previousValidity = false;
              alert("Validity of your biller is expired please contact support to renew your validity.");
              this.checkAndRefresh();
              this.dataProvider.loading = false;
              return
            }
          } catch (err){
            this.stage = 'validityExpired';
            this.message = 'Validity Has Expired';
            this.alertify.presentToast(this.message, 'error');
            this.checkAndRefresh();
            this.previousValidity = false;
            return
          }
        }
        var businessRecord = business as BusinessRecord;
        if (businessRecord) {
          this.dataProvider.currentBusiness = businessRecord as BusinessRecord;
          this.dataProvider.currentBusiness.billerPrinter =
            localStorage.getItem('billerPrinter');
        }
        // this.stage = 'expiredAccess'
        // console.log('business.data()', business.data());
        this.dataProvider.currentBusiness = {
          ...business,
          businessId: business.id,
        } as BusinessRecord;
        this.dataProvider.businessId = business.id;
        if(!this.router.url.includes('biller')){
          this.stage = 'userExists';
          this.loadingSteps.next('Loaded user details.');
          this.startViraj(this.dataProvider.currentBusiness);
        }
      } else {
        this.stage = 'businessError';
        this.message = 'Business Not Found';
        this.alertify.presentToast(this.message, 'error');
      }
    });
  }

  checkAndRefresh(){
    // check the current url if the path is biller then refresh the page
    if (this.router.url.includes('biller')){
      let url = window.location.href.split('/');
      url.pop();
      url.push('index.html');
      window.location.href = url.join('/');
    }
  }

  startViraj(business: BusinessRecord) {
    if (debug) console.log('Starting Viraj', business);
    firstValueFrom(this.dataProvider.settingsChanged).then(async (setting) => {
      // console.log(setting);
      this.dataProvider.businessId = business.businessId;
      this.loadingSteps.next('Loading Settings');
      if (setting.modes.filter((mode: boolean) => mode).length >= 1) {
        this.loadingSteps.next('Checking available modes');
        if (setting.dineInMenu || setting.takeawayMenu || setting.onlineMenu) {
          let menus = await this.menuManagementService.getMenus();
          this.dataProvider.allMenus = [];
          menus.docs.forEach((menu) => {
            this.dataProvider.allMenus.push({
              ...menu.data(),
              id: menu.id,
            } as Menu);
          });
          // get whatever menu is available in currentMenu and set it to currentMenu
          let menuInits = [];
          this.dataProvider.menus = [];
          if (setting.takeawayMenu) {
            setting.takeawayMenu =
              this.dataProvider.allMenus.find(
                (menu) => menu.id == setting.takeawayMenu.id,
              ) || setting.takeawayMenu;
            let inst = new ModeConfig(
              'Takeaway',
              'takeaway',
              setting.takeawayMenu,
              setting.takeawayMenu.id,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            menuInits.push('takeaway');
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Takeaway Menu');
          }
          if (setting.onlineMenu) {
            setting.onlineMenu =
              this.dataProvider.allMenus.find(
                (menu) => menu.id == setting.onlineMenu.id,
              ) || setting.onlineMenu;
            let inst = new ModeConfig(
              'Online',
              'online',
              setting.onlineMenu,
              setting.onlineMenu.id,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            menuInits.push('online');
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Online Menu');
          }
          if (setting.dineInMenu) {
            setting.dineInMenu =
              this.dataProvider.allMenus.find(
                (menu) => menu.id == setting.dineInMenu.id,
              ) || setting.dineInMenu;
            let inst = new ModeConfig(
              'Dine In',
              'dineIn',
              setting.dineInMenu,
              setting.dineInMenu.id,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            menuInits.push('dineIn');
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Dine In Menu');
          }
          console.log(
            'menus.docs.map',
            menus.docs.map((doc) => {
              return {
                ...doc.data(),
                id: doc.id,
                selectedLoyaltyId: doc.data()['selectedLoyaltyId']
                  ? doc.data()['selectedLoyaltyId']
                  : null,
              } as Menu;
            }),
          );
          // console.log("loaded discounts",this.dataProvider.discounts);
          let verifiedMenus = [];
          this.loadingSteps.next('Waiting for menus to load');
          let menuSubscription = this.dataProvider.menuLoadSubject.subscribe(
            async (menu) => {
              // console.log("Loaded",menu,menuInits,verifiedMenus);
              verifiedMenus.push(menu.type);
              // check if all menus are loaded
              if (verifiedMenus.length == menuInits.length) {
                this.loadingSteps.next('All menus loaded');
                // set current menu in order of dineIn, takeaway, online
                let currentMenu = this.dataProvider.menus.find(
                  (menu) =>
                    (menu.type == 'dineIn' && setting.modes[0]) ||
                    (this.dataProvider.menus.find(
                      (menu) => menu.type == 'takeaway',
                    ) &&
                      setting.modes[1]) ||
                    (this.dataProvider.menus.find(
                      (menu) => menu.type == 'online',
                    ) &&
                      setting.modes[2]),
                );
                // console.log("currentMenu",currentMenu);
                if (currentMenu) {
                  this.dataProvider.menuLoadSubject.next(currentMenu);
                } else {
                  this.loadingSteps.next('No menus found');
                  this.alertify.presentToast('No menus found', 'error');
                  this.stage = 'onboardingStep3';
                  return;
                }
                this.dataProvider.currentMenu = currentMenu;
                this.dataProvider.products =
                  this.dataProvider.currentMenu.products;
                if (setting.modes[0]) {
                  await this.getTables();
                  this.loadingSteps.next('All tables loaded');
                }
                if (setting.modes[1]) {
                  await this.getTokens();
                  this.loadingSteps.next('All tokens loaded');
                }
                if (setting.modes[2]) {
                  await this.getOnlineTokens();
                  this.loadingSteps.next('All online tokens loaded');
                }
                this.dataProvider.showTableOnBillAction = JSON.parse(
                  localStorage.getItem('showTable') || 'false',
                );
                // console.log("Loading table size");
                let tempSize = localStorage.getItem('tableSize');
                if (
                  tempSize == 'large' ||
                  tempSize == 'medium' ||
                  tempSize == 'small'
                ) {
                  this.dataProvider.currentTableSize = tempSize;
                } else {
                  this.dataProvider.currentTableSize = 'large';
                }
                // console.log('Loaded table size');
                menuSubscription.unsubscribe();
                this.loadingSteps.next('Setup Completed');
                this.message = 'Viraj is ready to use.';
                this.dataProvider.loading = false;
                this.stage = 'virajReady';
                this.router.navigate(['biller']);
              }
            },
          );
        } else {
          this.stage = 'onboardingStep3';
        }
      } else {
        this.loadingSteps.next('No modes enabled');
        this.alertify.presentToast('Please enable atleast one mode', 'error');
      }
    });
    // // console.log('business/' + business.businessId, '/settings/settings');
    // docData(doc(this.firestore, 'business', business.businessId), {
    //   idField: 'businessId',
    // }).subscribe(async (businessRecord) => {
    //   if (!businessRecord['accessCode']){
    //     this.router.navigate(['login']);
    //     this.stage = 'validityExpired';
    //     this.message = 'Validity Has Expired';
    //     this.alertify.presentToast(this.message, 'error');
    //     alert("Validity of your biller is expired please contact support to renew your validity.");
    //     return;
    //   } else {
    //     let res = await this.checkValidity(businessRecord.businessId,businessRecord['accessCode']);
    //     console.log("Validity",res);
    //     this.dataProvider.validTill = new Date(res.data['validTill']);
    //     console.log("this.dataProvider.validTill",this.dataProvider.validTill);
    //     if (!res || !res.data || !res.data['status']){
    //       this.router.navigate(['login']);
    //       this.stage = 'validityExpired';
    //       this.message = 'Validity Has Expired';
    //       this.alertify.presentToast(this.message, 'error');
    //       alert("Validity of your biller is expired please contact support to renew your validity.");
    //       return
    //     }
    //   }
      
    //   // console.log("Business Changed",res);
    // });
    let date = new Date().toISOString().split('T')[0];
    docData(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/sales/' + date,
      ),
    ).subscribe((res) => {
      // console.log("Sales Changed",res);
      if (res) {
        this.dataProvider.todaySales = res;
      }
    });
    docData(
      doc(
        this.firestore,
        'business',
        business.businessId,
        'settings',
        'settings',
      ),
    ).subscribe((res) => {
      // console.log("Settings Changed",res);
      if (res) {
        this.dataProvider.currentSettings = res;
        this.dataProvider.billToken = res['billTokenNo'];
        this.dataProvider.kotToken = res['kitchenTokenNo'];
        this.dataProvider.ncBillToken = res['ncBillTokenNo'] || 0;
        this.dataProvider.customBillNote = res['customBillNote'] || '';
        this.dataProvider.tableTimeOutTime = res['tableTimeOutTime'] || 45;
        this.dataProvider.billNoSuffix = res['billNoSuffix'] || '';
        this.dataProvider.optionalTax = res['optionalTax'] || false;
        this.dataProvider.printBillAfterSettle =
          res['printBillAfterSettle'] || false;
        this.dataProvider.printBillAfterFinalize =
          res['printBillAfterFinalize'] || false;
        this.dataProvider.takeawayToken = res['takeawayTokenNo'] || 0;
        this.dataProvider.editKotTime = res['editKotTime'] || 0;
        this.dataProvider.kotEditable = res['kotEditable'] || false;
        this.dataProvider.onlineTokenNo = res['onlineTokenNo'] || 0;
        this.dataProvider.orderTokenNo = res['orderTokenNo'] || 0;
        this.dataProvider.kotRePrintable = res['kotRePrintable'] || false;
        // this.dataProvider.password = res['password'];
        this.dataProvider.multipleDiscount = res['multipleDiscount'] || false;
        this.dataProvider.activeModes = res['modes'];
        this.dataProvider.dineInMenu = res['dineInMenu'];
        this.dataProvider.takeawayMenu = res['takeawayMenu'];
        this.dataProvider.onlineMenu = res['onlineMenu'];
        this.dataProvider.dineInSales = res['dineInSales'];
        this.dataProvider.takeawaySales = res['takeawaySales'];
        this.dataProvider.onlineSales = res['onlineSales'];
        this.dataProvider.nonChargeableSales = res['nonChargeableSales'];
        this.dataProvider.loyaltyEnabled = res['loyaltyEnabled'];
        this.dataProvider.loyaltyOnDineIn = res['loyaltyOnDineIn'];
        this.dataProvider.loyaltyOnTakeaway = res['loyaltyOnTakeaway'];
        this.dataProvider.loyaltyOnOnline = res['loyaltyOnOnline'];
        this.dataProvider.differentLoyaltyRate = res['differentLoyaltyRate'];
        this.dataProvider.loyaltyRates = {
          dineIn: 0,
          dineInExpiry: 0,
          takeaway: 0,
          takeawayExpiry: 0,
          online: 0,
          onlineExpiry: 0,
        };
        if (res['loyaltyRates']) {
          this.dataProvider.loyaltyRates.dineIn =
            res['loyaltyRates']['dineIn'] || 0;
          this.dataProvider.loyaltyRates.takeaway =
            res['loyaltyRates']['takeaway'] || 0;
          this.dataProvider.loyaltyRates.online =
            res['loyaltyRates']['online'] || 0;
        }
        this.dataProvider.settingsChanged.next(res);
        this.dataProvider.tableOrders = res['tableOrders'] || undefined;
        this.tableService.reOrderTable();
      }
    });
    docData(
      doc(
        this.firestore,
        'business',
        business.businessId,
        'customer',
        'customerConfig',
      ),
    ).subscribe((res) => {
      if (res) {
        this.dataProvider.customerDatabaseVersion = res['customerDbVersion'];
      }
    });
    collectionData(
      collection(
        this.firestore,
        'business/' + business.businessId + '/customers',
      ),
      { idField: 'id' },
    ).subscribe((res) => {
      if (res) {
        this.dataProvider.customers = res as CustomerInfo[];
      }
    });
  }

  async getTables() {
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
      ),
    );
    if (res.docs.length > 0) {
      let tables = res.docs.map(async (doc) => {
        let table = { ...doc.data(), id: doc.id } as TableConstructor;
        return await Table.fromObject(
          table,
          this.dataProvider,
          this.analyticsService,
          this.tableService,
          this.billService,
          this.printingService,
          this.customerService,
          this.userManagementService,
        );
      });
      let formedTable = await Promise.all(tables);
      this.dataProvider.tables = formedTable;
      // create a grouping by name in format {name:string, tables:Table[]} where name is name.split(' ')[0]
      // group table by their first split string like group
      this.tableService.reOrderTable();
    } else {
      if (this.dataProvider.tables.length == 0 && res.docs.length == 0) {
        this.dataProvider.tables = [];
      }
    }
  }

  async getTokens() {
    let res = await getDocs(
      query(
        collection(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/tokens',
        ),
        where('completed', '==', false),
        where('id', 'not-in', [
          this.dataProvider.tokens.map((token) => token.id),
        ]),
      ),
    );
    let tables = res.docs.map(async (doc) => {
      let table = { ...doc.data(), id: doc.id } as TableConstructor;
      let tableClass = await Table.fromObject(
        table,
        this.dataProvider,
        this.analyticsService,
        this.tableService,
        this.billService,
        this.printingService,
        this.customerService,
        this.userManagementService,
      );
      // if(table.bill){
      //   if(!tableClass.bill){
      //     alert("Corrupted table")
      //   }
      // }
      return tableClass;
    });
    let formedTable = await Promise.all(tables);
    formedTable.sort((a, b) => {
      return a.tableNo - b.tableNo;
    });
    if (this.dataProvider.tokens.length == 0) {
      this.dataProvider.tokens = formedTable;
    } else {
      formedTable.forEach((token) => {
        this.dataProvider.tokens.push(token);
      });
      this.dataProvider.tokens.sort((a, b) => {
        return a.tableNo - b.tableNo;
      });
    }
    let changes = collectionChanges(
      query(
        collection(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/tokens',
        ),
      ),
    );
    changes.subscribe(async (res) => {
      // console.log("TOKENCHANGE",res);
      res.forEach(async (change) => {
        if (change.type == 'added') {
          let newTable = {
            ...change.doc.data(),
            id: change.doc.id,
          } as TableConstructor;
          let table = await Table.fromObject(
            newTable,
            this.dataProvider,
            this.analyticsService,
            this.tableService,
            this.billService,
            this.printingService,
            this.customerService,
            this.userManagementService,
          );
          let isTokenAlreadyPresent = this.dataProvider.tokens.find(
            (token) => token.id == table.id,
          );
          if (!isTokenAlreadyPresent) {
            this.dataProvider.tokens.push(table);
          }
        }
        // if (change.type == 'modified'){
        //   let tableId = change.doc.id;
        //   let newTable = change.doc.data();
        //   let table = this.dataProvider.tokens.find((token)=>token.id==tableId);
        //   console.log("TABLE CHANGED",table,JSON.stringify(table.bill.stage),newTable);
        //   console.log("CONDITION CHECKED",!(!table),!(!table.id),(table.bill == null || table.bill.stage == 'settled' || table.bill.stage == 'cancelled'));
        //   if(table && table.id && (table.bill == null || table.bill.stage == 'settled' || table.bill.stage == 'cancelled')){
        //     console.log("PASSED TO CLEAR TABLE",table);
        //     if(newTable.bill == null){
        //       console.log("CLEARING TABLE",table);
        //       table.clearTable();
        //     }
        //   }
        // }
      });
    });
    // res.then(async (res)=>{

    // })
  }

  async getOnlineTokens() {
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/onlineTokens',
      ),
    );
    let tables = res.docs.map(async (doc) => {
      let table = { ...doc.data(), id: doc.id } as TableConstructor;
      let tableClass = await Table.fromObject(
        table,
        this.dataProvider,
        this.analyticsService,
        this.tableService,
        this.billService,
        this.printingService,
        this.customerService,
        this.userManagementService,
      );
      return tableClass;
    });
    let formedTable = await Promise.all(tables);
    formedTable.sort((a, b) => {
      return a.tableNo - b.tableNo;
    });
    this.dataProvider.onlineTokens = formedTable;
    let changes = collectionChanges(
      query(
        collection(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/onlineTokens',
        ),
        where('completed', '==', false),
      ),
    );
    changes.subscribe(async (res) => {
      // console.log("TOKENCHANGE",res);
      res.forEach(async (change) => {
        if (change.type == 'added') {
          let newTable = {
            ...change.doc.data(),
            id: change.doc.id,
          } as TableConstructor;
          let table = await Table.fromObject(
            newTable,
            this.dataProvider,
            this.analyticsService,
            this.tableService,
            this.billService,
            this.printingService,
            this.customerService,
            this.userManagementService,
          );
          let isTokenAlreadyPresent = this.dataProvider.onlineTokens.find(
            (token) => token.id == table.id,
          );
          if (!isTokenAlreadyPresent) {
            this.dataProvider.onlineTokens.push(table);
          }
        }
      });
    });
  }

  startResetPassword() {
    this.stage = 'resetPasswordStage1';
  }

  checkValidity(businessId:string,accessCode:string){
    return this.checkIfAccessTokenIsValidFunction({
      businessId:businessId,
      accessCode:accessCode,
      username:this.dataProvider.currentUser.username
    })
  }
}

export default function fetchTimeout(url, options, timeout = 7000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout),
    ),
  ]);
}
