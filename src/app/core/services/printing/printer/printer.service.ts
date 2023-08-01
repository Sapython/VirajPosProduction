import { MenuManagementService } from './../../database/menuManagement/menu-management.service';
import { Injectable } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { ElectronService } from '../../electron/electron.service';
import { Product } from '../../../../types/product.structure';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { EncoderService } from '../encoder/encoder.service';
import {
  BillConstructor,
  PrintableBill,
} from '../../../../types/bill.structure';
import { KotConstructor, PrintableKot } from '../../../../types/kot.structure';


var debugMode = true;
@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor(
    private dataProvider: DataProvider,
    private dialog: Dialog,
    private printing: ElectronService,
    private encoderService: EncoderService,
  ) {}
  getPrinters() {
    if (!debugMode && !this.printing) return;
    return Promise.resolve(['POS-80C']);
    // return window.pywebview.api.getPrinters();
  }

  printKot(printableKotData: PrintableKot) {
    if (debugMode) console.log('Printing kot', printableKotData);
    let filteredProducts = printableKotData.products.filter(
      (product: any) => product.specificPrinter,
    );
    if (filteredProducts.length != printableKotData.products.length) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: `${
            filteredProducts.length || 'Some'
          } products will not be printed..`,
          description:
            'Please select a printer in main category option of menu manegement.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
    }
    let printerConfig = printableKotData.products.map((product: any) => {
      return { product: product.id, printer: product.specificPrinter };
    });
    console.log('printerConfig', printerConfig);
    //  console.log("printableKotData.products",printableKotData.products);
    // group products by printer
    let groupedProducts: any = {};
    printableKotData.products.forEach((product: any) => {
      let category = this.dataProvider.currentMenu.mainCategories.find(
        (category) => category.id == product.category.id,
      );
      if (product.specificPrinter) {
        if (groupedProducts[product.specificPrinter]) {
          groupedProducts[product.specificPrinter].push(product);
        } else {
          groupedProducts[product.specificPrinter] = [product];
        }
      } else {
        if (groupedProducts[product.specificPrinter]) {
          groupedProducts[product.specificPrinter].push(product);
        } else {
          groupedProducts[product.specificPrinter] = [product];
        }
      }
    });
    console.log('grouped products', groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any, i) => {
      //  console.log('printing', printer, groupedProducts[printer]);
      printableKotData.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(printableKotData);
      console.log('got kot code', result, printer);
      setTimeout(() => {
        if (!printer) {
          const dialog = this.dialog.open(DialogComponent, {
            data: {
              title: 'No printer found for printing kot.',
              description:
                'Please select a printer in settings panel. \n Not printed: \n ' +
                printableKotData.products
                  .map((product) => product.name)
                  .join(', '),
              buttons: ['Ok'],
              primary: [0],
            },
          });
          return;
        }
        this.printing.printData(result, printer);
      }, i * 1000);
    });
  }

  printBill(billData: PrintableBill) {
    console.log('Printing bill', billData);
    let data = this.encoderService.getBillCode(billData);
    if (!this.dataProvider.currentBusiness?.billerPrinter) {
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
      this.dataProvider.currentBusiness?.billerPrinter,
    );
  }

  reprintBill(billData: PrintableBill) {
    //  console.log("Printing bill",billData);
    let data = this.encoderService.getBillCode(billData);
    if (!this.dataProvider.currentBusiness?.billerPrinter) {
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
      this.dataProvider.currentBusiness?.billerPrinter,
    );
  }

}
