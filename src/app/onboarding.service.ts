import { Injectable } from '@angular/core';
import { DataProvider } from './provider/data-provider.service';
import { Firestore, collection, doc, docData, getDoc, getDocs } from '@angular/fire/firestore';
import { BusinessRecord } from './structures/user.structure';
import { AlertsAndNotificationsService } from './services/alerts-and-notification/alerts-and-notifications.service';
import { Subject, firstValueFrom } from 'rxjs';
import { ModeConfig } from './biller/sidebar/edit-menu/edit-menu.component';
import { DatabaseService, Menu  } from './services/database.service';
import { Dialog } from '@angular/cdk/dialog';
import { TableConstructor } from './biller/constructors';
import { Table } from './biller/Table';
import { Discount } from './biller/settings/settings.component';
import { PrintingService } from './services/printing.service';
import { DialogComponent } from './base-components/dialog/dialog.component';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  noUserExists:boolean = false;
  message:string = ""
  stage:'noUser'|'userExists'|'multipleBusiness'|'businessError'|'onboardingStep1'|'onboardingStep2'|'onboardingStep3'|'virajReady'|'virajGettingReady'|'errorOccured' = 'noUser';
  loadingSteps:Subject<string> = new Subject<string>();

  constructor(private dataProvider:DataProvider,private firestore:Firestore,private alertify:AlertsAndNotificationsService,private databaseService:DatabaseService,private dialog:Dialog,private printingService:PrintingService,private authService:AuthService) {
    this.loadingSteps.next('Checking User');
    this.dataProvider.userSubject.subscribe((data)=>{
      this.stage = 'virajGettingReady';
      if(data.status){
        this.loadingSteps.next('User Found');
        if (data.user.business.length > 1) {
          this.loadingSteps.next('User Found with multiple businesses');
          let localRead = localStorage.getItem('businessId');
          if(localRead){
            this.loadBusiness(localRead);
          }
          this.stage = 'multipleBusiness';
        } else if (data.user.business.length == 1) {
          this.loadingSteps.next('User Found with a business');
          this.loadBusiness(data.user.business[0].businessId)
        } else {
          this.loadingSteps.next('User Found with no business');
          const dialog = this.dialog.open(DialogComponent,{data:{title:'No Business Found',description:'No business found for this user. Please onboard on viraj to continue. For now we will log you out.'}})
          dialog.closed.subscribe(()=>{
            this.authService.logout();
          })
        }
      } else {
        this.message = data.message;
        this.stage = 'noUser';
        this.alertify.presentToast(this.message,'error');
      }
    })
  }

  loadBusiness(businessId:string){
    getDoc(doc(this.firestore,'business',businessId)).then((business)=>{
      if (business.exists()){
        console.log("business.data()",business.data());
        this.dataProvider.currentBusiness = {...business.data(),businessId:business.id} as BusinessRecord;
        this.dataProvider.businessId = business.id;
        this.stage = 'userExists';
        this.loadingSteps.next('Loaded user details.');
        this.startViraj(this.dataProvider.currentBusiness)
      } else {
        this.stage = 'businessError';
        this.message = "Business Not Found";
        this.alertify.presentToast(this.message,'error');
      }
    })
  }

  startViraj(business:BusinessRecord){
    firstValueFrom(this.dataProvider.settingsChanged).then(async (setting)=>{
      console.log(setting);
      this.dataProvider.businessId = business.businessId;
      this.loadingSteps.next('Loading Settings');
      if(setting.modes.filter((mode:boolean)=>mode).length >= 1){
        this.loadingSteps.next('Checking available modes');
        if (setting.dineInMenu || setting.takeawayMenu || setting.onlineMenu){
          // get whatever menu is available in currentMenu and set it to currentMenu
          let menuInits = []
          this.dataProvider.menus = [];
          if (setting.takeawayMenu){
            let inst = new ModeConfig('Takeaway','takeaway',setting.takeawayMenu,setting.takeawayMenu.id,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            menuInits.push('takeaway')
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Takeaway Menu');
          }
          if (setting.onlineMenu){
            let inst = new ModeConfig('Online','online',setting.onlineMenu,setting.onlineMenu.id,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            menuInits.push('online')
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Online Menu');
          }
          if (setting.dineInMenu){
            let inst = new ModeConfig('Dine In','dineIn',setting.dineInMenu,setting.dineInMenu.id,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            menuInits.push('dineIn')
            this.dataProvider.menus.push(inst);
            this.loadingSteps.next('Found Dine In Menu');
          }
          let discountRes = await this.databaseService.getDiscounts();
          let menus = await this.databaseService.getMenus();
          this.dataProvider.allMenus = [];
          menus.docs.forEach((menu)=>{
            this.dataProvider.allMenus.push({...menu.data(),id:menu.id} as Menu);
          })
          this.dataProvider.discounts = [];
          discountRes.docs.forEach((discount)=>{
            this.dataProvider.discounts.push({...discount.data(),id:discount.id} as Discount);
          })
          let verifiedMenus = []
          this.loadingSteps.next('Waiting for menus to load');
          let menuSubscription = this.dataProvider.menuLoadSubject.subscribe(async (menu)=>{
            verifiedMenus.push(menu.type)
            // check if all menus are loaded
            if (verifiedMenus.length == menuInits.length){
              this.loadingSteps.next('All menus loaded');
              // set current menu in order of dineIn, takeaway, online
              let currentMenu = this.dataProvider.menus.find((menu)=>menu.type == 'dineIn') || this.dataProvider.menus.find((menu)=>menu.type == 'takeaway') || this.dataProvider.menus.find((menu)=>menu.type == 'online');
              if (currentMenu){
                this.dataProvider.menuLoadSubject.next(currentMenu);
              } else {
                this.loadingSteps.next('No menus found');
                this.alertify.presentToast('No menus found','error');
                this.stage = 'onboardingStep3';
                return
              }
              this.dataProvider.currentMenu = currentMenu;
              this.dataProvider.products = this.dataProvider.currentMenu.products;
              if (setting.modes[0]){
                await this.getTables();
                this.loadingSteps.next('All tables loaded');
              }
              if (setting.modes[1]){
                await this.getTokens();
                this.loadingSteps.next('All tokens loaded');
              }
              if (setting.modes[2]){
                await this.getOnlineTokens();
                this.loadingSteps.next('All online tokens loaded');
              }
              this.dataProvider.showTableOnBillAction = JSON.parse(localStorage.getItem('showTable') || 'false');
              console.log("Loading table size");
              let tempSize = localStorage.getItem('tableSize')
              if (tempSize == 'large' || tempSize == 'medium' || tempSize == 'small'){
                this.dataProvider.currentTableSize = tempSize;
              } else {
                this.dataProvider.currentTableSize = 'large';
              }
              console.log("Loaded table size");
              menuSubscription.unsubscribe();
              this.loadingSteps.next('Setup Completed');
              this.message = "Viraj is ready to use."
              this.stage  = 'virajReady';
            }
          })
        } else {
          this.stage = 'onboardingStep3';
        }
      } else {
        this.loadingSteps.next('No modes enabled');
        this.alertify.presentToast('Please enable atleast one mode','error')
      }
    })
    console.log('business/'+business.businessId,'/settings/settings');
    docData(doc(this.firestore,'business',business.businessId),{idField:'businessId'}).subscribe((res)=>{
      this.dataProvider.currentBusiness = res as BusinessRecord;
      // console.log("Business Changed",res);
    })
    docData(doc(this.firestore,'business',business.businessId,'settings','settings')).subscribe((res)=>{
      // console.log("Settings Changed",res);
      this.dataProvider.currentSettings = res;
      this.dataProvider.billToken = res['billTokenNo'];
      this.dataProvider.kotToken = res['kitchenTokenNo'];
      this.dataProvider.ncBillToken = res['ncBillTokenNo'] || 0;
      this.dataProvider.customBillNote = res['customBillNote'] || '';
      this.dataProvider.tableTimeOutTime = res['tableTimeOutTime'] || 45;
      this.dataProvider.billNoSuffix = res['billNoSuffix'] || '';
      this.dataProvider.optionalTax = res['optionalTax'] || false;
      this.dataProvider.printBillAfterSettle = res['printBillAfterSettle'] || false;
      this.dataProvider.takeawayToken = res['takeawayTokenNo'] || 0;
      this.dataProvider.onlineTokenNo = res['onlineTokenNo'] || 0;
      this.dataProvider.orderTokenNo = res['orderTokenNo'] || 0;
      this.dataProvider.password = res['password'];
      this.dataProvider.activeModes = res['modes'];
      this.dataProvider.dineInMenu = res['dineInMenu'];
      this.dataProvider.takeawayMenu = res['takeawayMenu'];
      this.dataProvider.onlineMenu = res['onlineMenu'];
      this.dataProvider.dineInSales = res['dineInSales'];
      this.dataProvider.takeawaySales = res['takeawaySales'];
      this.dataProvider.onlineSales = res['onlineSales'];
      this.dataProvider.nonChargeableSales = res['nonChargeableSales'];
      this.dataProvider.settingsChanged.next(res)
    })
  }

  async getTables(){
    let res = await getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tables'))
    if (res.docs.length > 0){
      let tables = res.docs.map(async (doc)=>{
        let table =  {...doc.data(),id:doc.id} as TableConstructor
        // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,table.type,this.dataProvider,this.databaseService)
        // tableClass.fromObject(table);
        return await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService);
      })
      // console.log("tables ",tables);
      // add data to indexedDB
      let formedTable = await Promise.all(tables);
      // formedTable.forEach((table)=>{
      //   this.dbService.getAll('tables').subscribe((res)=>{
      //     if (res.length >0 ){
      //       this.dbService.update('tables',table.toObject()).subscribe((res)=>{
      //         console.log("adding table res ",res);
      //       },(err)=>{
      //         console.log("adding table Error ",err);
      //       })
      //     } else {
      //       this.dbService.add('tables',table.toObject()).subscribe((res)=>{
      //         console.log("adding table res ",res);
      //       },(err)=>{
      //         console.log("adding table Error ",err);
      //       })
      //     }
      //   })
      // })
      // sort tables by tableNo
      formedTable.sort((a,b)=>{
        return a.tableNo - b.tableNo;
      })
      // group table by their first split string like group 
      // Table 1 and Table 2 together
      // Token 1 and Token 5 together
      // Room 1 and Room 3 together
      // use name attribute to group like name.split(' ')[0]
      let groupedTables = formedTable.reduce((r:any, a) => {
        a.group = a.name.split(' ')[0];
        r[a.name.split(' ')[0]] = [...r[a.name.split(' ')[0]] || [], a];
        return r;
      }, {});
      console.log("groupedTables",groupedTables);
      this.dataProvider.tables = formedTable;
      this.dataProvider.groupedTables = groupedTables;
    } else {
      if (this.dataProvider.tables.length == 0 && res.docs.length == 0){
        this.dataProvider.tables = [];
      }
    }
  }

  async getTokens(){
    let res = await getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tokens'))
    let tables = res.docs.map(async (doc)=>{
      let table =  {...doc.data(),id:doc.id} as TableConstructor
      // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,'token',this.dataProvider,this.databaseService)
      // tableClass.fromObject(table);
      return await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService);
    })
    let formedTable = await Promise.all(tables);
    formedTable.sort((a,b)=>{
      return a.tableNo - b.tableNo;
    })
    this.dataProvider.tokens = formedTable;
  }

  async getOnlineTokens(){
    let res = await getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/onlineTokens'))
    let tables = res.docs.map(async (doc)=>{
      let table =  {...doc.data(),id:doc.id} as TableConstructor
      let tableClass = await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService)
      // console.log("ONLINE TABLE",tableClass);
      return tableClass;
    })
    let formedTable = await Promise.all(tables);
    formedTable.sort((a,b)=>{
      return a.tableNo - b.tableNo;
    })
    this.dataProvider.onlineTokens = formedTable;
  }

}
