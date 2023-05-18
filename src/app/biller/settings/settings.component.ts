import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { debounceTime, firstValueFrom } from 'rxjs';
import { DataProvider } from '../../provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../services/alerts-and-notification/alerts-and-notifications.service';
import { DatabaseService } from '../../services/database.service';
import { APP_CONFIG } from '../../../../src/environments/environment';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { ElectronService } from '../../core/services';
import { SelectMenuComponent } from './select-menu/select-menu.component';
import { ModeConfig } from '../sidebar/edit-menu/edit-menu.component';
import { AddMethodComponent } from './add-method/add-method.component';
declare var window:any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // global vars
  version:string = APP_CONFIG.appVersion;
  serverVersion:string = window.pywebview || 'N/A';
  account:string = this.dataProvider.currentFirebaseUser?.uid || 'N/A';
  discounts:Discount[] = []
  paymentMethods:{name:string,detail:boolean}[] = [];
  @Output() cancel = new EventEmitter();
  @Output() save = new EventEmitter();
  activeTab:'printer'|'account'|'view'|'about'|'config'|'discount'|'payment'|'taxes' = 'config'
  settingsForm:FormGroup = new FormGroup({
    hotelName: new FormControl(this.dataProvider.currentBusiness?.hotelName,[Validators.required]),
    phone: new FormControl(this.dataProvider.currentBusiness?.phone,[Validators.required]),
    address: new FormControl(this.dataProvider.currentBusiness?.address,[Validators.required]),
    gst: new FormControl(this.dataProvider.currentBusiness?.gst,[Validators.required]),
    fssai: new FormControl(this.dataProvider.currentBusiness?.fssai,[Validators.required]),
    cgst:new FormControl(this.dataProvider.currentBusiness?.cgst,[Validators.required]),
    sgst:new FormControl(this.dataProvider.currentBusiness?.sgst,[Validators.required]),
  })
  billerPrinter:FormControl = new FormControl(this.dataProvider.currentBusiness?.billerPrinter,[Validators.required])
  loadingDiscount:boolean = false;
  viewSettings:FormGroup = new FormGroup({
    smartView: new FormControl(false),
    touchMode: new FormControl(false),
  });
  modes:[boolean,boolean,boolean] = this.dataProvider.activeModes
  configs:any[] = []
  printers:string[] = [
    'printer1',
    'printer2',
    'printer3'
  ]
  accounts:Account[] = []
  categories:any[] = []

  get twoModeDeactived():boolean{
    // return true when any two modes are false from all modes
    return this.modes.filter((mode)=>!mode).length >= 2
  }

  constructor(private indexedDb:NgxIndexedDBService,private alertify:AlertsAndNotificationsService,public dataProvider:DataProvider,private databaseService:DatabaseService,private dialog:Dialog, private electronService:ElectronService,public dialogRef:DialogRef) {
    this.viewSettings.patchValue(localStorage.getItem('viewSettings')?JSON.parse(localStorage.getItem('viewSettings')!):{})
    this.viewSettings.valueChanges.pipe(debounceTime(1000)).subscribe((data)=>{
      localStorage.setItem('viewSettings',JSON.stringify(data))
    })
  }
  cancelSettings(){
    this.cancel.emit()
  }
  getMappedMenu(menus?:string[]){
    if(!menus) return []
    return this.dataProvider.allMenus.filter((menu)=>menus.includes(menu.id!))
  }

  updateBillPrinter(value:string){
    this.dataProvider.currentBusiness!.billerPrinter = value;
    this.databaseService.updateBusiness({billerPrinter:value,businessId:this.dataProvider.currentBusiness?.businessId!}).then(()=>{
      this.alertify.presentToast("Printer updated successfully")
    }).catch((err)=>{
      this.alertify.presentToast("Error while updating printer")
    })
  }

  updateSettings(data:any){
    this.databaseService.updateRootSettings(data,this.dataProvider.currentBusiness?.businessId!).then(()=>{
      this.alertify.presentToast("Settings updated successfully")
    }).catch((err)=>{
      this.alertify.presentToast("Error while updating settings")
    })
  }

  getDiscounts(){
    this.loadingDiscount = true;
    this.databaseService.getDiscounts().then((res:any)=>{
      this.discounts = []
      res.forEach((data:any)=>{
        this.discounts.push({...data.data(),id:data.id})
      })
    }).catch((err:any)=>{
      console.log(err)
      this.alertify.presentToast("Error while fetching discounts")
    }).finally(()=>{
      this.loadingDiscount = false;
    })
  }

  setLocalShowTable(event:any){
    localStorage.setItem('showTable',JSON.stringify(event.target.checked))
  }
  
  ngOnInit(): void {
    this.getDiscounts();
    // this.indexedDb.getAll('categories').subscribe((data)=>{
    //   this.categories = data.map((cat:any)=> {return {...cat,selected:false,indeterminate:false,products:cat.products.map((product:any)=>{return JSON.parse(JSON.stringify({name:product.name,id:product.id,selected:false}))})}});
    //   console.log("category data",this.categories);
    // })
    // let settings:any =JSON.parse(localStorage.getItem('printerSettings') || '{}');
    // if (!settings['port']){
    //   this.alertify.presentToast("Please set printer settings first")
    //   return
    // }
    console.log("this.electronService.getPrinters()",this.electronService.getPrinters());
    this.printers = this.electronService.getPrinters();
    // if (localStorage.getItem('printerSettings')){
    //   this.settingsForm.patchValue(JSON.parse(localStorage.getItem('printerSettings')!))
    // }
    // this.dataProvider.currentProject.printerConifgs.forEach((config:any)=>{
    //   // this.configs.push({printerControl:new FormControl(config.printer,[Validators.required]),categoryControl:new FormControl(config.category,[Validators.required])})
    // })
    // this.databaseService.getCheckerCategories().then((res:any)=>{
    //   this.categories = []
    //   res.forEach((data:any)=>{
    //     this.categories.push({...data.data(),id:data.id,control:new FormControl(''),checked:false})
    //   })
    //   console.log("this.categories",this.categories);
    // })
  }

  addAccount(){
    this.dataProvider.currentBusiness?.users.push({
      access:'waiter',
      username:'',
      lastUpdated:Timestamp.now(),
      updatedBy:this.dataProvider.currentUser?.username || 'user',
      new:true,
    })
  }

  setPrinters(){
    
  }

  updateMode(){
    if (this.modes[0]){
      if (!this.dataProvider.currentSettings.dineInMenu){
        const dialog = this.dialog.open(SelectMenuComponent,{data:{type:'dineIn',menus:this.dataProvider.allMenus}});
        dialog.closed.subscribe(async (data:any)=>{
          console.log("data",data);
          if (data){
            let currentMenu = this.dataProvider.allMenus.find((menu)=>menu.id == data);
            let inst = new ModeConfig('Dine In','dineIn',currentMenu,data,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.dineInMenu = currentMenu;
            this.dataProvider.currentSettings.dineInMenu = currentMenu;
            await this.updateSettings({dineInMenu:currentMenu})
            this.alertify.presentToast("Dine In menu set successfully")
          } else {
            this.modes[0] = false;
          }
        })
      }
    }
    if (this.modes[1]){
      if (!this.dataProvider.currentSettings.takeawayMenu){
        const dialog = this.dialog.open(SelectMenuComponent,{data:{type:'takeaway',menus:this.dataProvider.allMenus}});
        dialog.closed.subscribe(async (data:any)=>{
          console.log("data",data);
          if (data){
            let currentMenu = this.dataProvider.allMenus.find((menu)=>menu.id == data);
            let inst = new ModeConfig('Takeaway','takeaway',currentMenu,data,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.takeawayMenu = currentMenu;
            this.dataProvider.currentSettings.takeawayMenu = currentMenu;
            await this.updateSettings({takeawayMenu:currentMenu})
            this.alertify.presentToast("Takeaway menu set successfully")
          } else {
            this.modes[0] = false;
          }
        })
      }
    }
    if (this.modes[2]){
      if (!this.dataProvider.currentSettings.onlineMenu){
        const dialog = this.dialog.open(SelectMenuComponent,{data:{type:'online',menus:this.dataProvider.allMenus}});
        dialog.closed.subscribe(async (data:any)=>{
          console.log("data",data);
          if (data){
            let currentMenu = this.dataProvider.allMenus.find((menu)=>menu.id == data);
            let inst = new ModeConfig('Online','online',currentMenu,data,this.dataProvider,this.databaseService,this.alertify,this.dialog);
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.onlineMenu = currentMenu;
            this.dataProvider.currentSettings.onlineMenu = currentMenu;
            await this.updateSettings({onlineMenu:currentMenu})
            this.alertify.presentToast("Online menu set successfully")
          } else {
            this.modes[0] = false;
          }
        })
      }
    }
    let currentMenu = this.dataProvider.menus.find((menu)=>((menu.type == 'dineIn') && this.modes[0]) || (this.dataProvider.menus.find((menu)=>menu.type == 'takeaway') && this.modes[1]) || (this.dataProvider.menus.find((menu)=>menu.type == 'online') && this.modes[2]));
    console.log("currentMenu",currentMenu);
    if (currentMenu){
      this.dataProvider.menuLoadSubject.next(currentMenu);
    }
    this.databaseService.updateMode(this.modes)
  }

  smartModeToggle(value:boolean){
    localStorage.setItem('viewSettings',JSON.stringify({"smartView":value,"touchMode":this.dataProvider.touchMode}))
    this.dataProvider.smartMode = value
    console.log(localStorage.getItem('viewSettings'));
  }

  touchModeToggle(value:boolean){
    localStorage.setItem('viewSettings',JSON.stringify({"touchMode":value,"smartView":this.dataProvider.smartMode}))
    this.dataProvider.touchMode = value
    console.log(localStorage.getItem('viewSettings'));
  }

  saveSettings(){
    this.databaseService.updateBusiness(this.settingsForm.value).then(()=>{
      this.alertify.presentToast("Settings saved successfully")
      // this.cancel.emit()
    }).catch((err)=>{
      this.alertify.presentToast("Error while saving settings")
      console.log(err)
    })
  }

  addConfig(){
    this.configs.push({printerControl:new FormControl('',[Validators.required]),categories:JSON.parse(JSON.stringify(this.categories))})
  }

  onProductChange(item:any){
    // if all products in item.products are checked then check item
    // if all products in item.products are unchecked then uncheck item
    // if some products in item.products are checked then set indeterminate to true
    let checkedProducts = item.products.filter((product:any)=>product.selected)
    if (checkedProducts.length === item.products.length){
      item.selected = true
      item.indeterminate = false
    }else if (checkedProducts.length === 0){
      item.selected = false
      item.indeterminate = false
    }else{
      item.indeterminate = true
    }
    console.log("item",item);
  }

  onCategoryChange(item:any){
    // if item.selected is true then check all products in item.products
    // if item.selected is false then uncheck all products in item.products
    if (item.selected){
      item.products.forEach((product:any)=>product.selected = true)
    }else{
      item.products.forEach((product:any)=>product.selected = false)
    }
    console.log("item",item);
  }

  addDiscount(){
    const dialog = this.dialog.open(AddDiscountComponent)
    dialog.closed.subscribe((data:any)=>{
      console.log("data",data);
      if (data){
        if(data.menus.length === 0){
          data.menus = null;
        }
        console.log("adding",data);
        this.databaseService.addDiscount(data as Discount).then((res)=>{
          console.log("res",res);
          this.getDiscounts();
          this.alertify.presentToast("Discount added successfully")
        }).catch((err)=>{
          console.log("err",err);
          this.alertify.presentToast("Error adding discount")
        })
      } else {
        console.log("no data",data);
      }
    })
  }

  addMethod(){
    const dialog = this.dialog.open(AddMethodComponent)
    firstValueFrom(dialog.closed).then((data:any)=>{
      this.dataProvider.loading = true;
      if (data && data.name && typeof data.detail == 'boolean'){
        this.databaseService.addPaymentMethod(data).then((res)=>{
          this.alertify.presentToast("Payment method added successfully")
        }).catch((err)=>{
          this.alertify.presentToast("Error while adding payment method")
        }).finally(()=>{
          this.dataProvider.loading = false;
        })
      } else {
        this.alertify.presentToast("Cancelled adding payment method")
      }
    })
  }

  updateBusiness(){
    this.dataProvider.currentBusiness?.users.forEach((user:any)=>{
      if (user.new){
        delete user.new
      }
    })
    setTimeout(()=>{
      if(this.dataProvider.currentBusiness){
        this.databaseService.updateBusiness(this.dataProvider.currentBusiness);
      }
    },700)
  }

}

export interface Account{
  name:string,
  phoneNumber:string,
  email:string,
  role:'admin'|'cashier'|'manager',
  creationDate:Timestamp
}

export interface Discount{
  id?:string,
  name:string,
  type:'percentage'|'amount',
  value:number,
  totalAppliedDiscount:number,
  creationDate:Timestamp,
  minimumAmount?:number,
  minimumProducts?:number,
  maximumDiscount?:number,
  menus?:string[],
  accessLevels:string[],
}