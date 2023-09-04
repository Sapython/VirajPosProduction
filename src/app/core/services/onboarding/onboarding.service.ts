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
  updateDoc,
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
  UserBusiness,
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
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Router } from '@angular/router';

var debug: boolean = true;
@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  previousValidity: boolean = false;
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
  currentAreaState: {
    state: string;
    cities: { city: string; businesses: UserBusiness[] }[];
  };
  currentAreaCity: { city: string; businesses: UserBusiness[] };
  groupedBusiness: {
    state: string;
    cities: { city: string; businesses: UserBusiness[] }[];
  }[] = [];
  atLeastOneAdmin:boolean = false;
  autoOutletFromEmail:{
    email:string,
    username:string,
  }={
    email:'',
    username:''
  };
  private checkIfAccessTokenIsValidFunction = httpsCallable(
    this.functions,
    'checkIfAccessTokenIsValid',
  );
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
    private functions: Functions,
  ) {
    // getDocs(collection(this.firestore,'users')).then((res)=>{
    //   console.log("Res",res);
    //   res.docs.forEach((document)=>{
    //     if(document.data()['business']){
    //       let userDoc = document.data();
    //       let business = userDoc['business'] as UserBusiness[];
    //       business.forEach((business)=>{
    //         business.city = business.city || 'Jaipur';
    //         business.state = business.state || 'Rajasthan';
    //       });
    //       updateDoc(doc(this.firestore,'users',document.id),{...userDoc});
    //     }
    //   });
    // })
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
        if (data.user.business.length >= 1) {
          this.loadingSteps.next('User Found with multiple businesses');
          let localRead = localStorage.getItem('businessId');
          if (localRead) {
            this.loadBusiness(localRead);
          }
          this.groupedBusiness = [];
          // generate a grouped business list
          this.atLeastOneAdmin = false;
          data.user.business.forEach((business) => {
            let state = business.state;
            let city = business.city;
            console.log('state', state, 'city', city);
            let stateIndex = this.groupedBusiness.findIndex((stateObj) => {
              return stateObj.state == state;
            });
            if (stateIndex == -1) {
              this.groupedBusiness.push({
                state: state,
                cities: [
                  {
                    city: city,
                    businesses: [business],
                  },
                ],
              });
            } else {
              let cityIndex = this.groupedBusiness[stateIndex].cities.findIndex(
                (cityObj) => {
                  return cityObj.city == city;
                },
              );
              if (cityIndex == -1) {
                this.groupedBusiness[stateIndex].cities.push({
                  city: city,
                  businesses: [business],
                });
              } else {
                this.groupedBusiness[stateIndex].cities[
                  cityIndex
                ].businesses.push(business);
              }
            }
            console.log('groupedBusiness', business,business.access.accessType,business.access.accessType == 'role' ? business.access.role : 'NA',business.access.accessType == 'role' && business.access.role == 'admin');
            if (business.access.accessType == 'role' && business.access.role == 'admin'){
              this.atLeastOneAdmin = true;
              console.log("data.user",data.user);
              this.autoOutletFromEmail = {
                email:data.user.email,
                username:data.user.username
              };
            }
          });
          // if only one state is present then select the state
          if (this.groupedBusiness.length == 1) {
            this.currentAreaState = this.groupedBusiness[0];
            if (this.currentAreaState.cities.length == 1) {
              this.currentAreaCity = this.currentAreaState.cities[0];
            }
          }
          // if only one outlet is present then load that outlet
          if (data.user.business.length == 1 && !this.atLeastOneAdmin) {
            this.loadBusiness(data.user.business[0].businessId);
          }
          console.log('groupedBusiness', this.groupedBusiness);
          this.stage = 'multipleBusiness';
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
    docData(doc(this.firestore, 'business', businessId), {
      idField: 'id',
    }).subscribe(async (business) => {
      if (business) {
        this.loadingSteps.next('Checking validity of business');
        if (!business['accessCode']) {
          this.previousValidity = false;
          this.stage = 'validityExpired';
          this.message = 'Validity Has Expired';
          this.alertify.presentToast(this.message, 'error');
          alert(
            'Validity of your biller is expired please contact support to renew your validity.',
          );
          this.checkAndRefresh();
          this.dataProvider.loading = false;
          return;
        } else {
          try {
            let res = await this.checkValidity(
              business.id,
              business['accessCode'],
            );
            if (!res || !res.data || !res.data['status']) {
              this.dataProvider.validTill = new Date(res.data['validTill']);
              console.log(
                'this.dataProvider.validTill',
                this.dataProvider.validTill,
              );
              this.stage = 'validityExpired';
              this.message = 'Validity Has Expired';
              this.alertify.presentToast(this.message, 'error');
              this.previousValidity = false;
              alert(
                'Validity of your biller is expired please contact support to renew your validity.',
              );
              this.checkAndRefresh();
              this.dataProvider.loading = false;
              return;
            }
          } catch (err) {
            this.stage = 'validityExpired';
            this.message = 'Validity Has Expired';
            this.alertify.presentToast(this.message, 'error');
            this.checkAndRefresh();
            this.previousValidity = false;
            return;
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
        if (!this.router.url.includes('biller')) {
          this.stage = 'userExists';
          this.loadingSteps.next('Loaded user details.');
          this.startVrajera(this.dataProvider.currentBusiness);
        }
      } else {
        this.stage = 'businessError';
        this.message = 'Business Not Found';
        this.alertify.presentToast(this.message, 'error');
      }
    });
  }

  checkAndRefresh() {
    // check the current url if the path is biller then refresh the page
    if (this.router.url.includes('biller')) {
      let url = window.location.href.split('/');
      url.pop();
      url.push('index.html');
      window.location.href = url.join('/');
    }
  }

  async startVrajera(business: BusinessRecord) {
    if (debug) console.log('Starting Vrajera', business);
    firstValueFrom(this.dataProvider.settingsChanged).then(async (setting) => {
      // console.log(setting);
      this.dataProvider.businessId = business.businessId;
      this.loadingSteps.next('Loading Settings');
      if (setting.modes.filter((mode: boolean) => mode).length >= 1) {
        this.loadingSteps.next('Checking available modes');
        if (setting.dineInMenu || setting.takeawayMenu || setting.onlineMenu) {
          this.menuManagementService.getAllMenus();
          let menus = await firstValueFrom(this.dataProvider.allMenus);
          console.log("Available menus",menus);
          
          // get whatever menu is available in currentMenu and set it to currentMenu
          let toBeLoadedMenus = [];
          console.log("setting.dineInMenu",setting.dineInMenu);
          console.log("setting.takeawayMenu",setting.takeawayMenu);
          console.log("setting.onlineMenu",setting.onlineMenu);
          if (setting.dineInMenu){
            let menu = menus.find((m)=>m.id == setting.dineInMenu?.id);
            if (!menu){
              menu = menus[0];
              this.menuManagementService.updateRootSettings({dineInMenu:menu},business.businessId);
            }
            toBeLoadedMenus.push({mode: ['dineIn'],menu: menu})
          }
          if (setting.takeawayMenu){
            let menu = menus.find((m)=>m.id == setting.takeawayMenu?.id);
            if (!menu){
              menu = menus[0];
              this.menuManagementService.updateRootSettings({takeawayMenu:menu},business.businessId);
            }
            toBeLoadedMenus.push({mode: ['takeaway'],menu: menu})
          }
          if (setting.onlineMenu){
            let menu = menus.find((m)=>m.id == setting.onlineMenu?.id);
            if (!menu){
              menu = menus[0];
              this.menuManagementService.updateRootSettings({onlineMenu:menu},business.businessId);
            }
            toBeLoadedMenus.push({mode: ['online'],menu: menu})
          }
          let filteredToBeLoadedMenus = [];
          console.log("mode",setting.modes,toBeLoadedMenus);
          toBeLoadedMenus.forEach((toBeLoadedMenu) => {
            if (toBeLoadedMenu) {
              let matchingMenuModesIndexes = toBeLoadedMenus
                .map((mode, index) => {
                  if (mode?.menu && mode?.menu?.id == toBeLoadedMenu?.menu?.id) {
                    return {
                      mode: mode.mode,
                      index: index,
                    };
                  }
                })
                .filter((mode) => mode);
              console.log('matchingMenuModesIndexes len', matchingMenuModesIndexes,matchingMenuModesIndexes.length);
              // merge the modes of matching menus
              if (matchingMenuModesIndexes.length > 1) {
                let mergedModes = [];
                matchingMenuModesIndexes.forEach((matchingMenuModeIndex) => {
                  mergedModes = [...mergedModes, ...matchingMenuModeIndex.mode];
                });
                filteredToBeLoadedMenus.push({
                  mode: mergedModes,
                  menu: toBeLoadedMenu.menu,
                });
                console.log('adding new menu to be loaded',filteredToBeLoadedMenus);
                // remove the matching menus from toBeLoadedMenus
                matchingMenuModesIndexes.forEach((matchingMenuModeIndex) => {
                  toBeLoadedMenus[matchingMenuModeIndex.index] = null;
                });
              } else {
                filteredToBeLoadedMenus.push(toBeLoadedMenu);
              }
            }
            return toBeLoadedMenu;
          });
          console.log('filteredToBeLoadedMenus', filteredToBeLoadedMenus);
          let loadingMenus = await Promise.all(
            filteredToBeLoadedMenus.map(async (toBeLoadedMenu) => {
              for (const toBeLoadedMode of toBeLoadedMenu.mode) {
                console.log('toBeLoadedMode', toBeLoadedMenu);
                if (toBeLoadedMode == 'dineIn') {
                  let inst = new ModeConfig(
                    'Dine In',
                    'dineIn',
                    toBeLoadedMenu.menu,
                    toBeLoadedMenu.menu.id,
                    this.dataProvider,
                    this.menuManagementService,
                    this.productService,
                    this.alertify,
                    this.dialog,
                    this.settingsService,
                  );
                  this.dataProvider.menus.push(inst);
                  this.loadingSteps.next('Loading Dine In Menu');
                  await firstValueFrom(inst.loadedAllData);
                } else if (toBeLoadedMode == 'takeaway') {
                  let inst = new ModeConfig(
                    'Takeaway',
                    'takeaway',
                    toBeLoadedMenu.menu,
                    toBeLoadedMenu.menu.id,
                    this.dataProvider,
                    this.menuManagementService,
                    this.productService,
                    this.alertify,
                    this.dialog,
                    this.settingsService,
                  );
                  this.dataProvider.menus.push(inst);
                  this.loadingSteps.next('Loading Takeaway Menu');
                  await firstValueFrom(inst.loadedAllData);
                } else if (toBeLoadedMode == 'online') {
                  let inst = new ModeConfig(
                    'Online',
                    'online',
                    toBeLoadedMenu.menu,
                    toBeLoadedMenu.menu.id,
                    this.dataProvider,
                    this.menuManagementService,
                    this.productService,
                    this.alertify,
                    this.dialog,
                    this.settingsService,
                  );
                  this.dataProvider.menus.push(inst);
                  this.loadingSteps.next('Loading Online Menu');
                  await firstValueFrom(inst.loadedAllData);
                }
              }
            }),
          );
          // let menuInits = [];
          // if(setting.takeawayMenu.id == setting.onlineMenu.id && setting.onlineMenu.id == setting.dineInMenu.id){
          //   if (setting.takeawayMenu) {
          //     let inst = new ModeConfig(
          //       'Takeaway',
          //       'takeaway',
          //       setting.takeawayMenu,
          //       setting.takeawayMenu.id,
          //       this.dataProvider,
          //       this.menuManagementService,
          //       this.productService,
          //       this.alertify,
          //       this.dialog,
          //       this.settingsService,
          //     );
          //     menuInits.push('takeaway');
          //     this.dataProvider.menus.push(inst);
          //     this.loadingSteps.next('Found Takeaway Menu');
          //     await firstValueFrom(inst.loadedAllData);
          //     if (setting.onlineMenu) {
          //       setting.onlineMenu =
          //       menus.find(
          //           (menu) => menu.id == setting.onlineMenu.id,
          //         ) || setting.onlineMenu;
          //       let inst = new ModeConfig(
          //         'Online',
          //         'online',
          //         setting.onlineMenu,
          //         setting.onlineMenu.id,
          //         this.dataProvider,
          //         this.menuManagementService,
          //         this.productService,
          //         this.alertify,
          //         this.dialog,
          //         this.settingsService,
          //       );
          //       menuInits.push('online');
          //       this.dataProvider.menus.push(inst);
          //       this.loadingSteps.next('Found Online Menu');
          //     }
          //     if (setting.dineInMenu) {
          //       setting.dineInMenu =
          //       menus.find(
          //           (menu) => menu.id == setting.dineInMenu.id,
          //         ) || setting.dineInMenu;
          //       let inst = new ModeConfig(
          //         'Dine In',
          //         'dineIn',
          //         setting.dineInMenu,
          //         setting.dineInMenu.id,
          //         this.dataProvider,
          //         this.menuManagementService,
          //         this.productService,
          //         this.alertify,
          //         this.dialog,
          //         this.settingsService,
          //       );
          //       menuInits.push('dineIn');
          //       this.dataProvider.menus.push(inst);
          //       this.loadingSteps.next('Found Dine In Menu');
          //     }
          //   }
          // }
          // console.log("loaded discounts",this.dataProvider.discounts);
          // let verifiedMenus = [];
          this.loadingSteps.next('Waiting for menus to load');
          this.loadingSteps.next('All menus loaded');
          // set current menu in order of dineIn, takeaway, online
          let lastLocalMode = localStorage.getItem('billingMode');
          var currentMenu;
          if (lastLocalMode) {
            currentMenu = this.dataProvider.menus.find(
              (menu) => menu.type == lastLocalMode,
            );
          }
          if (!currentMenu) {
            console.log("No menus",this.dataProvider.menus);
            currentMenu = this.dataProvider.menus.find(
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
          }
          console.log('currentMenu', currentMenu, this.dataProvider.menus);
          if (currentMenu) {
            this.dataProvider.menuLoadSubject.next(currentMenu);
          } else {
            this.loadingSteps.next('No menus found');
            this.alertify.presentToast('No menus found', 'error');
            this.stage = 'onboardingStep3';
            return;
          }
          this.dataProvider.currentMenu = currentMenu;
          this.dataProvider.products = this.dataProvider.currentMenu.products;
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
          this.loadingSteps.next('Setup Completed');
          this.message = 'Vrajera is ready to use.';
          this.dataProvider.loading = false;
          this.stage = 'virajReady';
          this.router.navigate(['biller']);
        } else {
          this.stage = 'onboardingStep3';
        }
      } else {
        this.loadingSteps.next('No modes enabled');
        this.alertify.presentToast('Please enable at-least one mode', 'error');
      }
    });
    // get daily counters
    let date = new Date().toISOString().split('T')[0];
    console.log('ISO date:', date);
    docData(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/dailyTokens/' + date,
      ),
    ).subscribe((tokens) => {
      if (tokens && tokens['billTokenNo']) {
        this.dataProvider.dailyTokens.billTokenNo = tokens['billTokenNo'];
      } else {
        this.dataProvider.dailyTokens.billTokenNo = 0;
      }

      if (tokens && tokens['orderTokenNo']) {
        this.dataProvider.dailyTokens.orderTokenNo = tokens['orderTokenNo'];
      } else {
        this.dataProvider.dailyTokens.orderTokenNo = 0;
      }

      if (tokens && tokens['ncBillTokenNo']) {
        this.dataProvider.dailyTokens.ncBillTokenNo = tokens['ncBillTokenNo'];
      } else {
        this.dataProvider.dailyTokens.ncBillTokenNo = 0;
      }

      if (tokens && tokens['takeawayTokenNo']) {
        this.dataProvider.dailyTokens.takeawayTokenNo =
          tokens['takeawayTokenNo'];
      } else {
        this.dataProvider.dailyTokens.takeawayTokenNo = 0;
      }

      if (tokens && tokens['onlineTokenNo']) {
        this.dataProvider.dailyTokens.onlineTokenNo = tokens['onlineTokenNo'];
      } else {
        this.dataProvider.dailyTokens.onlineTokenNo = 0;
      }

      if (tokens && tokens['kitchenTokenNo']) {
        this.dataProvider.dailyTokens.kitchenTokenNo = tokens['kitchenTokenNo'];
      } else {
        this.dataProvider.dailyTokens.kitchenTokenNo = 0;
      }
    });
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
        this.dataProvider.directSettle =
          res['directSettle'] || false;
        this.dataProvider.confirmBeforePrint =
          res['confirmBeforePrint'] || false;
        this.dataProvider.takeawayToken = res['takeawayTokenNo'] || 0;
        this.dataProvider.editKotTime = res['editKotTime'] || 0;
        this.dataProvider.kotEditable = res['kotEditable'] || false;
        this.dataProvider.onlineTokenNo = res['onlineTokenNo'] || 0;
        this.dataProvider.orderTokenNo = res['orderTokenNo'] || 0;
        this.dataProvider.kotRePrintable = res['kotRePrintable'] || false;
        // this.dataProvider.password = res['password'];
        this.dataProvider.multipleDiscount = res['multipleDiscount'] || false;
        this.dataProvider.charges = res['charges'] || {
          dineIn:{
            container:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            delivery:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            service:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            tip:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
          },
          takeaway:{
            container:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            delivery:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            service:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            tip:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
          },
          online:{
            container:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            delivery:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            service:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
            tip:{
              allowed:false,
              byDefault:false,
              fixed:false,
              charges:0
            },
          },
        };
        this.dataProvider.openItemEnabled = res['openItemEnabled'] || false;
        this.dataProvider.deleteCancelledBill = res['deleteCancelledBill'] || false;
        this.dataProvider.customCharges = res['customCharges'] || {dineIn:[],takeaway:[],online:[]};
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

  checkValidity(businessId: string, accessCode: string) {
    return this.checkIfAccessTokenIsValidFunction({
      businessId: businessId,
      accessCode: accessCode,
      username: this.dataProvider.currentUser.username,
    });
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
