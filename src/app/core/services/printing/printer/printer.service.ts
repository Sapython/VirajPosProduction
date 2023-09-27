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
import { firstValueFrom, timeout } from 'rxjs';


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

  async printKot(printableKotData: PrintableKot,reprint:boolean = false,customPrinter?:string) {
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
            'Please select a printer in main category option of menu management.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      await firstValueFrom(dialog.closed);
    }
    let printerConfig = printableKotData.products.map((product: any) => {
      return { product: product.id, printer: product.specificPrinter };
    });
    console.log('printerConfig', printerConfig);
    //  console.log("printableKotData.products",printableKotData.products);
    // group products by printer
    if (!customPrinter){
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
      let index= 0;
      for (const printer of Object.keys(groupedProducts)) {
        //  console.log('printing', printer, groupedProducts[printer]);
        printableKotData.products = groupedProducts[printer];
        let result = this.encoderService.getKotCode(printableKotData,reprint);
        console.log('got kot code', result, printer);
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
          await firstValueFrom(dialog.closed);
          return;
        }
        await this.printing.printData(result, printer);
        await new Promise(resolve => setTimeout(resolve, index * 1000));
        index++;
      }
    } else {
      let result = this.encoderService.getKotCode(printableKotData,reprint);
      console.log('got kot code', result, customPrinter);
      if (!customPrinter) {
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
        await firstValueFrom(dialog.closed);
        return;
      }
      await this.printing.printData(result, customPrinter);
    }
  }

  async printBill(billData: PrintableBill) {
    console.log('Printing bill', billData);
    let data = this.encoderService.getBillCode(billData);
    if (!this.dataProvider.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing bill.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      await firstValueFrom(dialog.closed);
      return;
    }
    console.log('printing bill', data);
    return this.printing.printData(
      data,
      this.dataProvider.billerPrinter,
    );
  }

  async reprintBill(billData: PrintableBill,reprint:boolean = false) {
    //  console.log("Printing bill",billData);
    let data = this.encoderService.getBillCode(billData,reprint);
    if (!this.dataProvider.billerPrinter) {
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'No printer found for printing bill.',
          description: 'Please select a printer in settings panel.',
          buttons: ['Ok'],
          primary: [0],
        },
      });
      await firstValueFrom(dialog.closed);
      return;
    }
    console.log('printing bill', data);
    return this.printing.printData(
      data,
      this.dataProvider.billerPrinter,
    );
  }

}
