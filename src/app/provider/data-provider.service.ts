import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ReplaySubject, Subject } from 'rxjs';
import { Product, TableConstructor } from '../biller/constructors';
import { Bill } from "../biller/Bill";
import { Device } from "../biller/Device";
import { Table } from "../biller/Table";
import { Category, RootCategory, ViewCategory } from '../structures/general.structure';
import { BusinessRecord, UserRecord } from '../structures/user.structure';
import { Menu } from '../services/database.service';
import { ModeConfig } from '../biller/sidebar/edit-menu/edit-menu.component';
import { Discount } from '../biller/settings/settings.component';

@Injectable({
  providedIn: 'root'
})
export class DataProvider {
  constructor() {
    // read viewSettings from localStorage every 2 seconds
    setInterval(() => {
      this.smartMode = (localStorage.getItem('viewSettings')?JSON.parse(localStorage.getItem('viewSettings')!):{smartView:false}).smartView;
    } , 2000);
    window.addEventListener('resize', () => {
      this.clientWidth = window.innerWidth;
      this.clientHeight = window.innerHeight;
    })
    window.addEventListener('online', () => {
      this.backOnline.next(true);
      setTimeout(() => {
        this.offline = false;
      },1000)
    })
    window.addEventListener('offline', () => {
      this.offline = true;
    })
  }

  // smart vars
  public chatInnerHtml:Node|undefined;
  public chatCustomWidget:any;

  // constants
  public password:string = '123456';
  public accessLevels:string[] = [
    "manager",
    "waiter",
    "accountant",
    "admin"
  ]

  // recommendationConfig
  highCostConfig:{min:number,max:number} = {min:0,max:0};
  lowCostConfig:{min:number,max:number} = {min:0,max:0};
  highRangeConfig:{min:number,max:number} = {min:0,max:0};
  lowRangeConfig:{min:number,max:number} = {min:0,max:0};
  mostSellingConfig:{min:number,max:number} = {min:0,max:0};
  newDishesConfig:{min:any,max:any} = {min:0,max:0};

  // counters
  public sale:number = 0;
  public billToken:number = 0;
  public orderTokenNo:number = 0;
  public ncBillToken:number = 0;
  public kotToken:number = 0;
  public takeawayToken:number = 0;
  public onlineTokenNo:number = 0;
  public dineInSales:number = 0;
  public takeawaySales:number = 0;
  public onlineSales:number = 0;
  public nonChargeableSales:number = 0;
  public tableTimeOutTime:number = 45;

  // public access
  public discounts:Discount[] = []
  public menus:ModeConfig[] = []
  public products:Product[] = [];
  public categories:Category[] = [];
  public viewCategories:ViewCategory[] = [];
  public rootCategories:RootCategory[] = [];
  public recommendedCategories:ViewCategory[] = [];
  public currentUser:UserRecord|undefined;
  public currentFirebaseUser:User|undefined;
  public activeModes:[boolean,boolean,boolean] = [false,false,false];
  public allMenus:Menu[] = []
  public currentMenu:ModeConfig|undefined;
  public tempProduct:Product|undefined;
  public currentTableSize:'large'|'medium'|'small' = 'large';
  public dineInMenu:Menu|undefined;
  public takeawayMenu:Menu|undefined;
  public onlineMenu:Menu|undefined;
  public tables:Table[] = [];
  public groupedTables:{[key:string]:Table[]} = {};
  public tokens:Table[] = [];
  public onlineTokens:Table[] = [];
  
  // statuses
  public billingMode:'dineIn'|'takeaway'|'online' = 'dineIn';
  public isAuthStateAvaliable:boolean =false;
  public loggedIn:boolean = false;
  public kotViewVisible:boolean = false;
  public allProducts:boolean = false;
  public currentTable:Table|undefined;
  public currentDevice:Device|undefined;
  public currentBill:Bill|undefined;
  public showTableOnBillAction:boolean = false;
  public moreActions:boolean = false;
  public manageKot:boolean = false;
  public manageKotChanged:Subject<boolean> = new Subject<boolean>();
  public totalSales:number = 0;
  public clientWidth:number = window.innerWidth;
  public clientHeight:number = window.innerHeight;
  public smartMode:boolean = (localStorage.getItem('viewSettings')?JSON.parse(localStorage.getItem('viewSettings')!):{smartView:false}).smartView;
  public touchMode:boolean = (localStorage.getItem('viewSettings')?JSON.parse(localStorage.getItem('viewSettings')!):{touchMode:false}).touchMode;
  public loading:boolean = false;
  
  // triggers
  public closeAllPanel:Subject<boolean> = new Subject<boolean>();
  public menuProducts:Subject<Category> = new Subject<Category>();
  public currentAuthState:Subject<User> = new Subject<User>();
  public selectProduct:Subject<any> = new Subject<any>();
  public selectTable:Subject<Table> = new Subject<Table>();
  public openTableView:Subject<boolean> = new Subject<boolean>();
  public billAssigned:Subject<void> = new Subject<void>();
  public searchResults:Subject<any[]|false> = new Subject<any[]|false>();
  public productsLoaded:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public billUpdated:Subject<void> = new Subject<void>();
  public settingsChanged:Subject<any> = new Subject<any>();

  public offline:boolean = false;
  public backOnline:Subject<boolean> = new Subject<boolean>();

  public get currentAccessLevel(){
    if(this.currentBusiness){
      let user = this.currentBusiness.users.find((user)=>{
        return user.email == this.currentUser?.email
      })
      if(user){
        return user.access;
      } else {
        return "waiter";
      }
    } else {
      return "waiter";
    }
  }

  public getAccess(level:string | string[]){
    if(this.currentBusiness && this.currentUser){
      let user = this.currentBusiness.users.find((user)=>{
        return user.email == this.currentUser?.email
      })
      if(user){
        if(Array.isArray(level)){
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

  // onboarding vars
  public userSubject:Subject<userState> = new Subject<userState>();
  public menuLoadSubject:Subject<any> = new Subject<any>();
  public modeChanged:Subject<string> = new Subject<string>();
  public currentBusiness:BusinessRecord|undefined;
  public businessId:string = "";
}

export type userState = {
  status:false;
  stage:number;
  code:string;
  message:string;
} | {
  status:true;
  stage:number;
  code:string;
  message:string;
  user:UserRecord
}