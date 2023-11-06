import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { PrinterSetting, PrinterSettingProductWise } from '../../../../../types/printing.structure';
import { ReplaySubject, Subject, Subscription, debounceTime } from 'rxjs';
import { Product } from '../../../../../types/product.structure';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { ElectronService } from '../../../../../core/services/electron/electron.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-printer-setting',
  templateUrl: './printer-setting.component.html',
  styleUrls: ['./printer-setting.component.scss']
})
export class PrinterSettingComponent implements OnDestroy {
  printerSettings:extendedPrinterSetting[] = [];
  printers:string[] = [];
  billPrinter:string;
  kotPrinter:string;
  searchSubjectSubscription:Subscription = Subscription.EMPTY;
  constructor(@Inject(DIALOG_DATA) public data:{menu:ModeConfig},private electronService: ElectronService,private alertify:AlertsAndNotificationsService,private dialogRef:DialogRef,private dataProvider:DataProvider){
    this.data.menu.getPrinterSettings().then(async (printerSettings:PrinterSetting[])=>{
      let defaults = await this.data.menu.getDefaultPrinters();
      if (defaults){
        this.billPrinter = defaults.billPrinter;
        this.kotPrinter = defaults.kotPrinter;
      }
      let printers = this.electronService.getPrinters();
      this.printers = printers;
      if (printerSettings && printerSettings.length){
        printers.forEach((printer)=>{
          let filteredProducts:ReplaySubject<Product[]> = new ReplaySubject<Product[]>(1);
          filteredProducts.next(this.data.menu.products);
          let searchSubject:Subject<string> = new Subject<string>();
          this.searchSubjectSubscription.unsubscribe();
          this.searchSubjectSubscription = searchSubject.pipe(debounceTime(700)).subscribe((searchString)=>{
            // let alreadyUsedProducts = this.printerSettings.map((setting)=>setting.products).flat();
            let alreadyUsedProducts = [];
            // remove already used products
            let allUsableProducts = this.data.menu.products.filter((product)=>{
              return !alreadyUsedProducts.find((usedProduct)=>usedProduct.id === product.id);
            });
            filteredProducts.next(allUsableProducts.filter((product)=>{
              return product.name.toLowerCase().includes(searchString.toLowerCase());
            }));
          });
          this.printerSettings.push({
            ...printerSettings.find((setting)=>setting.printerName === printer),
            products:this.data.menu.products.filter((product)=>{
              return printerSettings.find((setting)=>setting.printerName === printer).dishesId.includes(product.id);
            }),
            filteredProducts,
            searchSubject,
            addProduct:async (event:any,setting:PrinterSettingProductWise,productSearch:any)=>{
              // console.log("event",event);
              // check if this product is available in any other printer
              let alreadyUsedProducts = this.printerSettings.map((setting)=>setting.products).flat();
              if (alreadyUsedProducts.find((product)=>product.id === event.option.value.id)){
                // product already added
                this.alertify.presentToast("Product already added to another printer");
                if (!await this.dataProvider.confirm('Product already added under different printer, do you want to replace it ?',[1])){
                  return
                }
              }
              // remove the product from other printers
              this.printerSettings.forEach((setting)=>{
                if (setting.products.find((product)=>product.id === event.option.value.id)){
                  setting.products.splice(setting.products.findIndex((product)=>product.id === event.option.value.id),1);
                  setting.dishesId.splice(setting.dishesId.findIndex((id)=>id === event.option.value.id),1);
                }
              });
              setting.products.push(event.option.value);
              setting.dishesId.push(event.option.value.id);
              productSearch.value = '';
            }
          });
        });
      } else {
        this.printerSettings = printers.map((printer)=>{
          let filteredProducts:Subject<Product[]> = new Subject<Product[]>();
          let searchSubject:Subject<string> = new Subject<string>();
          this.searchSubjectSubscription.unsubscribe();
          this.searchSubjectSubscription = searchSubject.pipe(debounceTime(700)).subscribe((searchString)=>{
            let alreadyUsedProducts = this.printerSettings.map((setting)=>setting.products).flat();
            // remove already used products
            let allUsableProducts = this.data.menu.products.filter((product)=>{
              return !alreadyUsedProducts.find((usedProduct)=>usedProduct.id === product.id);
            });
            filteredProducts.next(allUsableProducts.filter((product)=>{
              return product.name.toLowerCase().includes(searchString.toLowerCase());
            }));
          });
          return {
            printerName:printer,
            dishesId:[],
            products:[],
            filteredProducts,
            searchSubject,
            addProduct:(event:any,setting:PrinterSettingProductWise,productSearch:any)=>{
              console.log("event",event);
              // check if the product is already added to any other printer
              let alreadyUsedProducts = this.printerSettings.map((setting)=>setting.products).flat();
              if (alreadyUsedProducts.find((product)=>product.id === event.option.value.id)){
                // product already added
                this.alertify.presentToast("Product already added to another printer");
              } else {
                setting.products.push(event.option.value);
                setting.dishesId.push(event.option.value.id);
                productSearch.value = '';
              }
            }
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubjectSubscription.unsubscribe();
  }

  spliceProduct(i:number,setting:PrinterSettingProductWise){
    setting.products.splice(i,1);
    setting.dishesId.splice(i,1);
  }

  save(){
    let printerSettings:PrinterSetting[] = this.printerSettings.map((setting)=>{
      return {
        printerName:setting.printerName,
        dishesId:setting.dishesId
      }
    });
    console.log("Saving",printerSettings);
    this.data.menu.savePrinterSettings(printerSettings).then(()=>{
      this.dialogRef.close();
    });
  }

  cancel(){
    this.dialogRef.close();
  }

  setDefaultPrinter(printer:string,type:'bill'|'kot'){
    console.log("Setting default printer",printer,type);
    if (type === 'bill'){
      this.billPrinter = printer;
      this.data.menu.updateDefaultPrinters({billPrinter:printer,kotPrinter:this.kotPrinter});
    } else {
      this.kotPrinter = printer;
      this.data.menu.updateDefaultPrinters({billPrinter:printer,kotPrinter:this.kotPrinter});
    }
  }
}
interface extendedPrinterSetting extends PrinterSetting{
  products:Product[];
  filteredProducts:Subject<Product[]>;
  searchSubject:Subject<string>;
  addProduct:(event:any,setting:PrinterSettingProductWise,productSearch:any)=>void;
}
