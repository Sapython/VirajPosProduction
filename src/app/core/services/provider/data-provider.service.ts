import { Dialog } from '@angular/cdk/dialog';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ReplaySubject, Subject, debounceTime, firstValueFrom } from 'rxjs';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';
import { PromptComponent } from '../../../shared/base-components/prompt/prompt.component';
import { Category, ViewCategory, RootCategory } from '../../../types/category.structure';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { Tax } from '../../../types/tax.structure';
import { UserRecord, BusinessRecord, userState } from '../../../types/user.structure';
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

@Injectable({
  providedIn: 'root',
})
export class DataProvider {
  constructor(private dialog: Dialog,private functions:Functions) {
    // read viewSettings from localStorage every 2 seconds
    setInterval(() => {
      this.smartMode = (
        localStorage.getItem('viewSettings')
          ? JSON.parse(localStorage.getItem('viewSettings')!)
          : { smartView: false }
      ).smartView;
    }, 2000);
    window.alert = (message: string) => {
      this.confirm('Alert',[0],{description:message,buttons:['ok'],primary:[0]});
    };
    window.addEventListener('resize', () => {
      this.clientWidth = window.innerWidth;
      this.clientHeight = window.innerHeight;
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
    this.queueUpdate.subscribe((updateTime)=>[
      this.updateRequests.push({
        currentTime:Timestamp.now(),
        totalUpdateTimeMs:updateTime+500
      })
    ])

    // window.onbeforeunload = () => "STOP!! Data is being updated. Please wait. Or you may corrupt it.";
    setInterval(()=>{
      this.updating = !this.isTimeElapsed();
      if(this.updating){
        window.onbeforeunload = () => "STOP!! Data is being updated. Please wait. Or you may corrupt it.";
      } else {
        window.onbeforeunload = () => null;
      }
    },500)
  }

  private passwordCheck = httpsCallable(this.functions,'checkPassword');

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
  public currentSettings:any;
  public customBillNote:string = '';
  public todaySales:any = {};
  public taxes:Tax[] = [];
  public multipleDiscount:boolean = false;
  public editKotTime:number = 1;
  public kotEditable:boolean = false;
  
  // public access
  public discounts: CodeBaseDiscount[] = [];
  public menus: ModeConfig[] = [];
  public products: Product[] = [];
  public categories: Category[] = [];
  public viewCategories: ViewCategory[] = [];
  public rootCategories: RootCategory[] = [];
  public recommendedCategories: ViewCategory[] = [];
  public currentUser: UserRecord | undefined;
  public currentFirebaseUser: User | undefined;
  public activeModes: [boolean, boolean, boolean] = [false, false, false];
  public allMenus: Menu[] = [];
  public currentMenu: ModeConfig | undefined;
  public tempProduct: Product | undefined;
  public currentTableSize: 'large' | 'medium' | 'small' = 'large';
  public dineInMenu: Menu | undefined;
  public takeawayMenu: Menu | undefined;
  public onlineMenu: Menu | undefined;
  public tables: Table[] = [];
  public groupedTables: { [key: string]: Table[] } = {};
  public tokens: Table[] = [];
  public onlineTokens: Table[] = [];
  
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
  public clientWidth: number = window.innerWidth;
  public clientHeight: number = window.innerHeight;
  
  public get currentBusinessUser(){
    if (this.currentBusiness && this.currentUser){
      return this.currentUser.business.find((business) => business.businessId == this.currentBusiness.businessId)!
    } else {
      return undefined;
    }
  };
  public smartMode: boolean = (localStorage.getItem('viewSettings')
  ? JSON.parse(localStorage.getItem('viewSettings')!)
  : { smartView: false }
  ).smartView;
  public touchMode: boolean = (localStorage.getItem('viewSettings')
  ? JSON.parse(localStorage.getItem('viewSettings')!)
    : { touchMode: false }
  ).touchMode;
  public loading: boolean = false;

  // triggers
  public closeAllPanel: Subject<boolean> = new Subject<boolean>();
  public menuProducts: Subject<Category> = new Subject<Category>();
  public currentAuthState: Subject<User> = new Subject<User>();
  public selectProduct: Subject<any> = new Subject<any>();
  public selectTable: Subject<Table> = new Subject<Table>();
  public openTableView: Subject<boolean> = new Subject<boolean>();
  public billAssigned: Subject<void> = new Subject<void>();
  public searchResults: Subject<any[] | false> = new Subject<any[] | false>();
  public productsLoaded: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public billUpdated: Subject<void> = new Subject<void>();
  public settingsChanged: Subject<any> = new Subject<any>();

  public offline: boolean = false;
  public updating:boolean = false;
  public backOnline: Subject<boolean> = new Subject<boolean>();
  public queueUpdate:Subject<number> = new Subject<number>();
  public updateRequests:updateRequest[] = [];

  public isTimeElapsed():boolean{
    return this.updateRequests.filter((request)=>{
      // get current time in systemTime
      // get totalElapsed time => systemTime - request.currentTime
      // if totalElapsed time > request.totalUpdateTimeMs
      // return true

      // else return false
      let systemTime = Timestamp.now();
      let totalElapsed = systemTime.toMillis() - request.currentTime.toMillis();
      if (totalElapsed > request.totalUpdateTimeMs){
        return false;
      } else {
        return true;
      }
    }).length == 0
  }

  public get currentAccessLevel() {
    if (this.currentBusiness) {
      let user = this.currentBusiness.users.find((user) => {
        return user.username == this.currentUser?.username;
      });
      if (user) {
        return user.access;
      } else {
        return 'waiter';
      }
    } else {
      return 'waiter';
    }
  }

  public getAccess(level: string | string[]) {
    if (this.currentBusiness && this.currentUser) {
      let user = this.currentBusiness.users.find((user) => {
        return user.username == this.currentUser?.username;
      });
      if (user) {
        if (Array.isArray(level)) {
          return level.includes(user.access);
        } else {
          return user.access == level;
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
    params?: optionalPromptParam
  ): Promise<string | null> {
    const dialog = this.dialog.open(PromptComponent, {
      panelClass:'customDialog',
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

  public async confirm(title: string,correct:number[], params?: {description?:string,buttons?:string[],primary?:number[],}) {
    const dialog = this.dialog.open(DialogComponent, {
      panelClass:'customDialog',
      data: {
        title: title,
        ...params
      },
    });
    let res = await firstValueFrom(dialog.closed)
  //  console.log("responded",res);
    if (typeof(res) == 'number'){
      if (correct.includes(res)){
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
    const dialog = this.dialog.open(CheckingPasswordComponent,{
      hasBackdrop:false,
      panelClass:'passwordAlert'
    })
    dialog.disableClose = true;
    try {
      let res = await this.passwordCheck({password:password,uid:this.currentUser.username})
      if (res.data['correct']){
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
}


