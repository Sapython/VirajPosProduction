import { Injectable } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { ElectronService } from '../../electron/electron.service';
import { Product } from '../../../../types/product.structure';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { EncoderService } from '../encoder/encoder.service';
import { BillConstructor, PrintableBill } from '../../../../types/bill.structure';
import { KotConstructor, PrintableKot } from '../../../../types/kot.structure';
import { Tax } from '../../../../types/tax.structure';
import { Bill } from '../../../constructors/bill';

var debugMode = true;
@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor(
    private dataprovider: DataProvider,
    private dialog: Dialog,
    private printing: ElectronService,
    private encoderService: EncoderService
  ) {}
  getPrinters() {
    if (!debugMode && !this.printing) return;
    return Promise.resolve(['POS-80C']);
    // return window.pywebview.api.getPrinters();
  }

  printKot(
    printableKotData:PrintableKot
  ) {
    if(debugMode) console.log("Printing kot",printableKotData);
    let filteredProducts = printableKotData.products.filter((product: any) => product.category?.printer)
    if (filteredProducts.length != printableKotData.products.length) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: `${filteredProducts.length || 'Some'} products will not be printed..`,
          description: 'Please select a printer in main category option of menu manegement.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
    }
    let printerConfig = printableKotData.products.map((product: any) => {
      let category = this.dataprovider.currentMenu.mainCategories.find((category)=>category.id == product.category.id)
      return { product: product.id, printer: category?.printer };
    });
    console.log('printerConfig', printerConfig);
    if (!this.dataprovider.currentBusiness?.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing kot.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      return;
    }
  //  console.log("printableKotData.products",printableKotData.products);
    // group products by printer
    let groupedProducts: any = {};
    printableKotData.products.forEach((product: any) => {
      let category = this.dataprovider.currentMenu.mainCategories.find((category)=>category.id == product.category.id)
      if (groupedProducts[category.printer]) {
        groupedProducts[category.printer].push(product);
      } else {
        groupedProducts[category.printer] = [product];
      }
    })
    console.log('grouped products', groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any) => {
    //  console.log('printing', printer, groupedProducts[printer]);
      printableKotData.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(printableKotData);
      console.log('got kot code', result);
      this.printing.printData(result, printer);
    });
  }

  printBill(billData: PrintableBill) {
    console.log("Printing bill",billData);
    let data = this.encoderService.getBillCode(billData);
    if (!this.dataprovider.currentBusiness?.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing bill.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      return;
    }
    console.log('printing bill', data);
    return this.printing.printData(
      data,
      this.dataprovider.currentBusiness?.billerPrinter
    );
  }

  reprintBill(billData: PrintableBill) {
  //  console.log("Printing bill",billData);
    let data = this.encoderService.getBillCode(billData);
    if (!this.dataprovider.currentBusiness?.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing bill.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      return;
    }
    console.log('printing bill', data);
    return this.printing.printData(
      data,
      this.dataprovider.currentBusiness?.billerPrinter
    );
  }

  reprintKot(kot: KotConstructor, table: string, billConstructor: BillConstructor) {
    let printableKotData:PrintableKot = {
      date:kot.createdDate.toDate().toLocaleDateString(),
      time:kot.createdDate.toDate().toLocaleTimeString(),
      mode:kot.mode || 'firstChargeable',
      orderNo:billConstructor.orderNo,
      table:billConstructor.table as unknown as string,
      token:kot.id,
      billingMode:billConstructor.mode,
      products:kot.products.map((product)=>{
        return {
          id:product.id,
          name:product.name,
          instruction:product.instruction,
          quantity:product.quantity,
          edited:product.cancelled,
          category:product.category
        }
      }),
    }
    if (!this.dataprovider.currentBusiness?.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing kot.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      return;
    }
    let printerConfig = printableKotData.products.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = printableKotData.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = printableKotData.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', printableKotData, printerConfig, groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any) => {
     console.log('printing', printer, groupedProducts[printer]);
      printableKotData.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(printableKotData);
      console.log('got kot code', result);
      this.printing.printData(result, printer);
    });
  }

}
