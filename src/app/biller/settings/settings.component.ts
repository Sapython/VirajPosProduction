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
import { Tax } from '../constructors';
import { AddTaxComponent } from './add-tax/add-tax.component';
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
  discounts:CodeBaseDiscount[] = []
  taxes:Tax[] = []
  paymentMethods:PaymentMethod[] = [];
  loadingPaymentMethods:boolean = false;
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

  constructor(private alertify:AlertsAndNotificationsService,public dataProvider:DataProvider,private databaseService:DatabaseService,private dialog:Dialog, private electronService:ElectronService,public dialogRef:DialogRef) {
    this.viewSettings.patchValue(localStorage.getItem('viewSettings')?JSON.parse(localStorage.getItem('viewSettings')!):{})
    this.viewSettings.valueChanges.pipe(debounceTime(1000)).subscribe((data)=>{
      localStorage.setItem('viewSettings',JSON.stringify(data))
    })
  }

  async deleteAccount(index:number){
    if (await this.dataProvider.confirm('Are you sure you want to delete account ?',[1])){
      // alert("delete account")
      this.dataProvider.currentBusiness?.users.splice(index,1)
      setTimeout(()=>{
        if(this.dataProvider.currentBusiness){
          this.databaseService.updateBusiness(this.dataProvider.currentBusiness);
        }
      },700)
    }
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
    this.databaseService.getDiscounts().then((res)=>{
      this.discounts = []
      res.forEach((data)=>{
        this.discounts.push({...data.data(),id:data.id} as CodeBaseDiscount)
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
    this.getPaymentMethods();
    this.getTaxes();
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

  addDiscount(){
    const dialog = this.dialog.open(AddDiscountComponent,{data:{mode:'add'}})
    dialog.closed.subscribe((data:any)=>{
      console.log("data",data);
      if (data){
        if(data.menus.length === 0){
          data.menus = null;
        }
        console.log("adding",data);
          this.databaseService.addDiscount({...data,mode:'codeBased',totalAppliedDiscount:0,creationDate:Timestamp.now(),reason:'' } as CodeBaseDiscount).then((res)=>{
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

  editDiscount(discount:CodeBaseDiscount){
    console.log("discount",discount);
    const dialog = this.dialog.open(AddDiscountComponent,{data:{mode:'edit',discount:discount}})
    dialog.closed.subscribe((data:any)=>{
      console.log("data",data);
      if (data){
        if(data.menus.length === 0){
          data.menus = null;
        }
        console.log("adding",data);
          this.databaseService.updateDiscount({...discount,...data} as CodeBaseDiscount).then((res)=>{
          console.log("res",res);
          this.getDiscounts();
          this.alertify.presentToast("Discount update successfully")
        }).catch((err)=>{
          console.log("err",err);
          this.alertify.presentToast("Error updating discount")
        })
      } else {
        console.log("no data",data);
      }
    })
  }

  deleteDiscount(discountId:string){
    this.dataProvider.loading = true;
    this.databaseService.deleteDiscount(discountId).then(()=>{
      this.alertify.presentToast("Discount deleted successfully")
      this.getDiscounts();
    }).catch((err)=>{
      this.alertify.presentToast("Error while deleting discount")
    }).finally(()=>{
      this.dataProvider.loading = false;
    })
  }

  setPrinters(){
    
  }

  async updateMode(){
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
    this.dataProvider.loading = true;
    await this.databaseService.updateMode(this.modes)
    this.dataProvider.loading = false;
    if (await this.dataProvider.confirm("Data is updated. Please restart the application to see the changes.",[1])){
      let url = window.location.href.split('/')
      url.pop()
      url.push('index.html')
      window.location.href = url.join('/') 
    }
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

  getPaymentMethods(){
    this.loadingPaymentMethods = true;
    this.databaseService.getPaymentMethods().then((res)=>{
      this.paymentMethods = res.docs.map((d)=>{return {...d.data(),id:d.id} as PaymentMethod})
    }).finally(()=>{
      this.loadingPaymentMethods = false;
    })
  }

  addMethod(){
    const dialog = this.dialog.open(AddMethodComponent,{data:{mode:'add'}})
    firstValueFrom(dialog.closed).then((data:any)=>{
      console.log("data",data);
      this.dataProvider.loading = true;
      if (data && data.name && typeof data.detail == 'boolean'){
        this.databaseService.addPaymentMethod({...data,addDate:new Date(),updateDate:new Date()}).then((res)=>{
          this.alertify.presentToast("Payment method added successfully")
        }).catch((err)=>{
          this.alertify.presentToast("Error while adding payment method")
        }).finally(()=>{
          this.dataProvider.loading = false;
        })
      } else {
        this.dataProvider.loading = false;
        this.alertify.presentToast("Cancelled adding payment method")
      }
    })
  }

  editMethod(method:PaymentMethod){
    const dialog = this.dialog.open(AddMethodComponent,{data:{mode:'edit',setting:method}})
    firstValueFrom(dialog.closed).then((data:any)=>{
      console.log("data",data);
      this.dataProvider.loading = true;
      if (data && data.name && typeof data.detail == 'boolean'){
        this.databaseService.addPaymentMethod({...data,addDate:new Date(),updateDate:new Date()}).then((res)=>{
          this.alertify.presentToast("Payment method added successfully")
          this.getPaymentMethods();
        }).catch((err)=>{
          this.alertify.presentToast("Error while adding payment method")
        }).finally(()=>{
          this.dataProvider.loading = false;
        })
      } else {
        this.dataProvider.loading = false;
        this.alertify.presentToast("Cancelled adding payment method")
      }
    })
  }

  getTaxes(){
    this.databaseService.getTaxes().then((res)=>{
      this.taxes = res.docs.map((d)=>{return {...d.data(),id:d.id} as Tax})
    })
  }

  addTax(){
    const dialog = this.dialog.open(AddTaxComponent,{data:{mode:'add'}})
    firstValueFrom(dialog.closed).then((data:any)=>{
      console.log("data",data);
      if (data){
        this.dataProvider.loading = true;
        this.databaseService.addTax({...data,creationDate:new Date(),updateDate:new Date()}).then((res)=>{
          this.alertify.presentToast("Tax added successfully")
          this.getTaxes();
        }).catch((err)=>{
          this.alertify.presentToast("Error while adding tax")
        }).finally(()=>{
          this.dataProvider.loading = false;
        })
      } else {
        this.alertify.presentToast("Cancelled adding tax")
      }
    }).catch((err:any)=>{
      this.alertify.presentToast("Error while adding tax")
    })
  }

  editTax(tax:Tax){
    const dialog = this.dialog.open(AddTaxComponent,{data:{mode:'edit',setting:tax}})
    firstValueFrom(dialog.closed).then((data:any)=>{
      console.log("data",data);
      if (data){
        this.databaseService.updateTax(tax.id,{...data,updateDate:Timestamp.now()}).then((res)=>{
          this.alertify.presentToast("Tax updated successfully")
          this.getTaxes()
        }).catch((err)=>{
          this.alertify.presentToast("Error while updating tax")
        })
      } else {
        this.alertify.presentToast("Cancelled updating tax")
      }
    }).catch((err:any)=>{
      this.alertify.presentToast("Error while updating tax")
    })
  }

  async deleteTax(id:string){
    if (await this.dataProvider.confirm('Are you sure you want to delete tax ?',[1])){
      this.databaseService.deleteTax(id).then((res)=>{
        this.alertify.presentToast("Tax deleted successfully")
      }).catch((err)=>{
        this.alertify.presentToast("Error while deleting tax")
      })
    }
  }

  deleteMethod(id:string){
    if (this.dataProvider.confirm('Are you sure you want to delete payment method ?',[1])){
      this.databaseService.deletePaymentMethod(id).then((res)=>{
        this.alertify.presentToast("Payment method deleted successfully")
      }).catch((err)=>{
        this.alertify.presentToast("Error while deleting payment method")
      })
    }
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


export interface CodeBaseDiscount{
  mode:'codeBased';
  type:'percentage'|'flat';
  id:string;
  name:string;
  value:number;
  totalAppliedDiscount:number;
  creationDate:Timestamp;
  minimumAmount?:number;
  minimumProducts?:number;
  maximumDiscount?:number;
  menus?:string[];
  accessLevels:string[];
  reason:string;
}
export interface DirectPercentDiscount{
  mode:'directPercent'
  value:number;
  totalAppliedDiscount:number;
  creationDate:Timestamp;
  reason:string;
}

export interface DirectFlatDiscount{
  mode:'directFlat'
  value:number;
  totalAppliedDiscount:number;
  creationDate:Timestamp;
  reason:string;
}

export interface PaymentMethod {
  id?:string
  name:string,
  detail:boolean,
  addDate:Timestamp,
  updateDate:Timestamp,
  custom?:boolean,
}
