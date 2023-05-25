import { Injectable } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { ElectronService } from '../../electron/electron.service';
import { Product } from '../../../../types/product.structure';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { EncoderService } from '../encoder/encoder.service';
import { BillConstructor } from '../../../../types/bill.structure';
import { KotConstructor } from '../../../../types/kot.structure';
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
    tableNo: string,
    orderNo: string,
    products: Product[],
    id: string,
    mode:
      | 'firstChargeable'
      | 'cancelledKot'
      | 'editedKot'
      | 'runningNonChargeable'
      | 'runningChargeable'
      | 'firstNonChargeable'
      | 'reprintKot'
      | 'online'
  ) {
    if (!debugMode && !this.printing) return;
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let data = {
      id: id,
      businessDetails: businessDetails,
      table: tableNo,
      orderNo: orderNo,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      mode: mode,
      products: products.map((product: Product) => {
        return {
          id: product.id,
          name:
            product.name +
            product.tags.find(
              (tag) =>
                tag.name.toLocaleLowerCase() == 'half' ||
                tag.name.toLocaleLowerCase() == 'full'
            )?.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        };
      }),
    };
    console.log('printing data', data, printerConfig);
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
    // group products by printer
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = data.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = data.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('grouped products', groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      data.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(data);
      console.log('got kot code', result);
      this.printing.printData(result, printer);
    });
  }

  deleteKot(tableNo: string, orderNo: string, products: Product[], id: string) {
    if (!debugMode && !this.printing) return;
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let data = {
      id: id,
      businessDetails: businessDetails,
      table: tableNo,
      orderNo: orderNo,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      mode: 'cancelledKot',
      products: products.map((product: Product) => {
        return {
          id: product.id,
          name:
            product.name +
            product.tags.find(
              (tag) =>
                tag.name.toLocaleLowerCase() == 'half' ||
                tag.name.toLocaleLowerCase() == 'full'
            )?.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
          edited: true,
        };
      }),
    };
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
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = data.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = data.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', data, printerConfig);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      data.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(data);
      this.printing.printData(result, printer);
    });
    // return window.pywebview.api.print(data['mode'], data, printerConfig);
  }

  printBill(bill: Bill) {
    if (!debugMode && !this.printing) return;
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let allProducts = [];
    let discountedProducts = [];
    let totalQuantity = 0;
    // bill.kots.forEach((kot: Kot) => {
    //   kot.products.forEach((product: Product) => {
    //     // add product to allProducts if not already present or update quantity
    //     if (product.lineDiscount){
    //       console.log('product has discount',product);
    //       discountedProducts.push(
    //         {
    //           id: product.id,
    //           name: product.name,
    //           instruction: product.instruction,
    //           quantity: product.quantity,
    //           price: (bill.optionalTax ? product.taxedPrice : product.price) - product.lineDiscount.totalAppliedDiscount,
    //           amount:((bill.optionalTax ? product.taxedPrice : product.price) * product.quantity) - product.lineDiscount.totalAppliedDiscount,
    //         }
    //       )
    //       totalQuantity += product.quantity
    //     } else {
    //       allProducts.push(
    //         {
    //           id: product.id,
    //           name: product.name,
    //           instruction: product.instruction,
    //           quantity: product.quantity,
    //           price: bill.optionalTax ? product.taxedPrice : product.price,
    //           amount: (bill.optionalTax ? product.taxedPrice : product.price) * product.quantity,
    //         }
    //       )
    //       totalQuantity += product.quantity
    //     }
    //   });
    // })
    // let mergedProducts = []
    // allProducts.forEach((product: any) => {
    //   // add product to mergedProducts if not already present or update quantity
    //   let foundProduct = mergedProducts.find((prod: any) => prod.id === product.id)
    //   if (foundProduct){
    //     foundProduct.quantity += product.quantity
    //     foundProduct.amount += product.amount
    //   } else {
    //     mergedProducts.push(product)
    //   }
    // })
    console.log('discountedProducts', bill.modifiedAllProducts);
    // mergedProducts = mergedProducts.concat(discountedProducts);
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    // console.log("mergedProducts",mergedProducts);
    let billdata = {
      id: bill.id,
      products: bill.modifiedAllProducts,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      grandTotal: bill.billing.grandTotal,
      tax: bill.billing.taxes.map((tax: Tax) => {
        return {
          name: tax.name,
          value: tax.amount,
          rate: tax.cost,
        };
      }),
      totaltax: {
        value: bill.billing.totalTax,
        rate: bill.billing.taxes.reduce((a, b: Tax) => a + b.cost, 0),
      },
      discount: bill.billing.discount.map((discount) => {
        if (discount.mode === 'codeBased') {
          return {
            name: discount.name,
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: discount.type,
          };
        } else if (discount.mode == 'directFlat') {
          return {
            name: 'Flat',
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: 'flat',
          };
        } else if (discount.mode == 'directPercent') {
          return {
            name: 'Percent',
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: 'percentage',
          };
        }
      }),
      billNoSuffix: this.dataprovider.billNoSuffix,
      subtotal: bill.billing.subTotal,
      totalQuantity: totalQuantity,
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'bill',
      table: bill.table.name,
      billNo: bill.billNo,
      orderNo: bill.orderNo,
      notes: bill.instruction ? [bill.instruction] : [],
      note: this.dataprovider.customBillNote,
      customerDetail: bill.customerInfo,
      businessDetails: businessDetails,
    };
    console.log('printing data', billdata, printerConfig);
    let data = this.encoderService.getBillCode(billdata);
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
    return this.printing.printData(
      data,
      this.dataprovider.currentBusiness?.billerPrinter
    );
  }

  reprintBill(bill: BillConstructor) {
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let allProducts = [];
    let totalQuantity = 0;
    // bill.modifiedAllProducts.forEach((product: any) => {

    // })
    let mergedProducts = [];
    console.log('discountedProducts', bill.modifiedAllProducts);
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    console.log('mergedProducts', mergedProducts);
    let billdata = {
      id: bill.id,
      products: bill.modifiedAllProducts,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      grandTotal: bill.billing.grandTotal,
      tax: bill.billing.taxes.map((tax: Tax) => {
        return {
          name: tax.name,
          value: tax.amount,
          rate: tax.cost,
        };
      }),
      totaltax: {
        value: bill.billing.totalTax,
        rate: bill.billing.taxes.reduce((a, b: Tax) => a + b.cost, 0),
      },
      discount: bill.billing.discount.map((discount) => {
        if (discount.mode === 'codeBased') {
          return {
            name: discount.name,
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: discount.type,
          };
        } else if (discount.mode == 'directFlat') {
          return {
            name: 'Flat',
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: 'flat',
          };
        } else if (discount.mode == 'directPercent') {
          return {
            name: 'Percent',
            value: discount.totalAppliedDiscount,
            rate: discount.value,
            type: 'percentage',
          };
        }
      }),
      billNoSuffix: this.dataprovider.billNoSuffix,
      subtotal: bill.billing.subTotal,
      totalQuantity: totalQuantity,
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'bill',
      table: bill.table,
      billNo: bill.billNo,
      orderNo: bill.orderNo,
      notes: [],
      note: this.dataprovider.customBillNote,
      customerDetail: bill.customerInfo,
      businessDetails: businessDetails,
    };
    console.log('printing data', billdata, printerConfig);
    let data = this.encoderService.getBillCode(billdata);
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
    return this.printing.printData(
      data,
      this.dataprovider.currentBusiness?.billerPrinter
    );
  }

  reprintKot(kot: KotConstructor, table: string, billNo: string) {
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let kotdata = {
      id: kot.id,
      products: kot.products.map((product: Product) => {
        return {
          id: product.id,
          name:
            product.name +
            product.tags.find(
              (tag) =>
                tag.name.toLocaleLowerCase() == 'half' ||
                tag.name.toLocaleLowerCase() == 'full'
            )?.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        };
      }),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'kot',
      table: table,
      orderNo: billNo,
      notes: [],
      businessDetails: businessDetails,
    };
    console.log('printing data', kotdata, printerConfig);
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
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = kotdata.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = kotdata.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', kotdata, printerConfig, groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      kotdata.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(kotdata);
      this.printing.printData(result, printer);
    });
  }

  printEditedKot(
    kot: KotConstructor,
    oldProducts: Product[],
    table: string,
    billNo: string
  ) {
    let businessDetails = {
      name: this.dataprovider.currentBusiness?.hotelName,
      address: this.dataprovider.currentBusiness?.address,
      phone: this.dataprovider.currentBusiness?.phone,
      gst: this.dataprovider.currentBusiness?.gst,
      fssai: this.dataprovider.currentBusiness?.fssai,
    };
    // filter with no category
    let filteredProducts =
      this.dataprovider.currentMenu?.products.filter(
        (product: Product) => product.category
      ) || [];
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let products: any[] = [];
    oldProducts.forEach((product: any) => {
      let prd = {
        id: product.id,
        name:
          product.name +
          product.tags.find(
            (tag) =>
              tag.name.toLocaleLowerCase() == 'half' ||
              tag.name.toLocaleLowerCase() == 'full'
          )?.name,
        instruction: product.instruction,
        quantity: product.quantity,
        price: product.price,
        total: product.price * product.quantity,
        edited: true,
      };
      products.push(prd);
    });
    kot.products.forEach((product: Product) => {
      let prd = {
        id: product.id,
        name:
          product.name +
          product.tags.find(
            (tag) =>
              tag.name.toLocaleLowerCase() == 'half' ||
              tag.name.toLocaleLowerCase() == 'full'
          )?.name,
        instruction: product.instruction,
        quantity: product.quantity,
        price: product.price,
        total: product.price * product.quantity,
      };
      products.push(prd);
    });
    let kotdata = {
      id: kot.id,
      products: products,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'editedKot',
      orderNo: billNo,
      table: table,
      notes: [],
      businessDetails: businessDetails,
    };
    console.log('printing data', kotdata, printerConfig);
    if (!debugMode && !this.printing) return;
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
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = kotdata.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = kotdata.products.find(
          (product: any) => product.id === config.product
        );
        if (foundProd) {
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', kotdata, printerConfig);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      kotdata.products = groupedProducts[printer];
      let result = this.encoderService.getKotCode(kotdata);
      this.printing.printData(result, printer);
    });
    // return window.pywebview.api.print('editedKot', kotdata, printerConfig);
  }
}
