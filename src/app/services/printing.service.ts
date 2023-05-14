import { Injectable } from '@angular/core';
import { DataProvider } from '../provider/data-provider.service';
import {
  BillConstructor,
  KotConstructor,
  Product,
  Tax,
} from '../biller/constructors';
import { Bill } from '../biller/Bill';
import { Discount } from '../biller/settings/settings.component';
import { Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../base-components/dialog/dialog.component';
declare var window: any;
// declare var printing: any;
// @ts-ignore
import * as EscPosEncoder from '../esc-pos-encoder.umd'
import { ElectronService } from '../core/services';
console.log(EscPosEncoder);
// declare var EscPosEncoder: any;
var debugMode = true;
@Injectable({
  providedIn: 'root',
})
export class PrintingService {
  constructor(private dataprovider: DataProvider,private dialog:Dialog,private printing:ElectronService) {
    // setInterval(() => {
    //   this.test();
    // }, 5000);
  }

  test() {
    let businessDetails = {
      name: 'Viraj',
      address: 'Near Viraj',
      phone: '1234567890',
      fssai: 'FSSAI1234567890',
      gst: 'GSTI1234567890',
    };

    let billdata = {
      id: 1,
      products: [
        {
          id: '1',
          name: 'Product 1 kdjhsfjhsdkfjhskjdhfkjshdjkh',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30,
          quantity: 2,
          amount: 60,
        },
      ],
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      grandTotal: 1000,
      tax: [
        {
          name: 'CGST',
          value: 50,
          rate: 5,
        },
        {
          name: 'CGST',
          value: 50,
          rate: 5,
        },
      ],
      totaltax: {
        value: 100,
        rate: 10,
      },
      discount: [
        {
          name: 'ZomatoPro',
          value: 10,
          type: 'percentage',
          rate: 5,
        },
        {
          name: 'Veena',
          value: 50,
          type: 'percentage',
          rate: 5,
        },
      ],
      subtotal: 1000,
      totalQuantity: 5,
      cashierName: 'Neeraj',
      mode: 'takeaway',
      table: 1,
      billNo: 1,
      tokenNo: 1,
      customerDetail: {
        name: 'Neeraj',
        phone: '1234567890',
        address: 'Near Viraj',
        gst: 'GST1234567890',
      },
      note: 'This is a special note',
      notes: [
        'This is a note',
        'This is a note',
        'This is a note',
        'This is a note',
      ],
      businessDetails: businessDetails,
    };

    let kotData = {
      id: 1,
      businessDetails: businessDetails,
      table: 1,
      billNo: 1,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      mode: 'firstChargeable',
      products: [
        {
          id: '1',
          name: 'Item 1 kfjhdskjfhkjdshfjsdkfjhsdkjhkjdhfkjsdhfkjhsdkfjhs',
          instruction: '',
          quantity: 2,
        },
        {
          id: '1',
          name: 'Item 2',
          instruction: 'spicy',
          quantity: 2,
        },
        {
          id: '1',
          name: 'Item 3',
          instruction: '',
          quantity: 2,
        },
        {
          id: '1',
          name: 'Item 4',
          instruction: '',
          quantity: 2,
        },
      ],
    };
    let data = this.getBillCode(billdata)
    console.log(data)
    this.printing.printData(data,'POS-80C');
    console.log("Send new data");
  }

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
          name: product.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        };
      }),
    };
    console.log('printing data', data, printerConfig);
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing kot.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    // group products by printer
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = data.products.find((product: any) => product.id === config.product);
        if (foundProd){
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = data.products.find((product: any) => product.id === config.product)
        if (foundProd){
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('grouped products', groupedProducts);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      data.products = groupedProducts[printer];
      let result = this.getKotCode(data);
      console.log("got kot code",result);
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
          name: product.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
          edited: true,
        };
      }),
    };
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing kot.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = data.products.find((product: any) => product.id === config.product);
        if (foundProd){
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = data.products.find((product: any) => product.id === config.product)
        if (foundProd){
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', data, printerConfig);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      data.products = groupedProducts[printer];
      let result = this.getKotCode(data);
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
    let printerConfig = filteredProducts.map((product: any) => {
      return { product: product.id, printer: product.category.printer };
    });
    let billdata = {
      id: bill.id,
      products: bill.allProducts.map((product: Product) => {
        return {
          id: product.id,
          name: product.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          amount: product.price * product.quantity,
        };
      }),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      grandTotal: bill.billing.grandTotal,
      tax: bill.billing.taxes.map((tax: Tax) => {
        return {
          name: tax.name,
          value: tax.amount,
          rate: tax.value,
        };
      }),
      totaltax: {
        value: bill.billing.totalTax,
        rate: bill.billing.taxes.reduce((a, b: Tax) => a + b.value, 0),
      },
      discount: bill.billing.discount.map((discount: Discount) => {
        return {
          name: discount.name,
          value: discount.totalAppliedDiscount,
          rate: discount.value,
          type: discount.type,
        };
      }),
      billNoSuffix:this.dataprovider.billNoSuffix,
      subtotal: bill.billing.subTotal,
      totalQuantity: bill.totalProducts(),
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'bill',
      table: bill.table.name,
      billNo: bill.billNo,
      orderNo: bill.orderNo,
      notes: [],
      note:this.dataprovider.customBillNote,
      customerDetail: bill.customerInfo,
      businessDetails: businessDetails,
    };
    if (this.dataprovider.optionalTax){
      console.log("Optional tax is enabled",this.dataprovider.currentBusiness.cgst,this.dataprovider.currentBusiness.cgst,this.dataprovider.currentBusiness.sgst);
      var totalTax = Number(this.dataprovider.currentBusiness.cgst) + Number(this.dataprovider.currentBusiness.sgst)
      if (typeof(totalTax) == 'number'){
        console.log("Total tax is",totalTax);
        // reduce totalPrice of products by totalTax percentage
        billdata.products.forEach((product: any) => {
          console.log("Reducing tax from product",product.name,product.amount,((Number(product.amount)/100) * totalTax),product.amount - ((Number(product.amount)/100) * totalTax));
          product.amount = Number(product.amount) - ((Number(product.amount)/100) * totalTax)
        })
      }
    }
    console.log('printing data', billdata, printerConfig);
    let data = this.getBillCode(billdata);
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing bill.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    return this.printing.printData(data,this.dataprovider.currentBusiness?.billerPrinter);
  }

  reprintBill(bill: BillConstructor) {
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
    let products: Product[] = [];
    let totalQuantity = 0;
    bill.kots.forEach((kot) => {
      kot.products.forEach((product) => {
        let index = products.findIndex((item) => item.id === product.id);
        if (index !== -1) {
          products[index].quantity += product.quantity;
          totalQuantity += product.quantity;
        } else {
          products.push(product);
          totalQuantity += product.quantity;
        }
      });
    });
    let billdata = {
      id: bill.id,
      products: products.map((product: Product) => {
        return {
          id: product.id,
          name: product.name,
          instruction: product.instruction,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        };
      }),
      billNoSuffix:this.dataprovider.billNoSuffix,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      grandTotal: bill.billing.grandTotal,
      tax: bill.billing.taxes.map((tax: Tax) => {
        return {
          name: tax.name,
          value: tax.amount,
          rate: tax.value,
        };
      }),
      totaltax: {
        value: bill.billing.totalTax,
        rate: bill.billing.taxes.reduce((a, b: Tax) => a + b.value, 0),
      },
      discount: bill.billing.discount.map((discount: Discount) => {
        return {
          name: discount.name,
          value: discount.totalAppliedDiscount,
          rate: discount.value,
          type: discount.type,
        };
      }),
      subtotal: bill.billing.subTotal,
      totalQuantity: totalQuantity,
      cashierName: this.dataprovider.currentUser?.username,
      mode: 'bill',
      note:this.dataprovider.customBillNote,
      table: bill.table,
      billNo: bill.billNo,
      orderNo: bill.orderNo,
      notes: [],
      businessDetails: businessDetails,
    };
    console.log('printing data', billdata, printerConfig);
    console.log('printing data', billdata, printerConfig);
    let data = this.getBillCode(billdata);
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing bill.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    return this.printing.printData(data,this.dataprovider.currentBusiness?.billerPrinter);
    // return window.pywebview.api.print('reprintBill', billdata, printerConfig);
  }

  reprintKot(kot: KotConstructor, table: string, billNo: string) {
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
    let products: Product[] = [];
    let kotdata = {
      id: kot.id,
      products: products.map((product: Product) => {
        return {
          id: product.id,
          name: product.name,
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
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing kot.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = kotdata.products.find((product: any) => product.id === config.product);
        if (foundProd){
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = kotdata.products.find((product: any) => product.id === config.product)
        if (foundProd){
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', kotdata, printerConfig);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      kotdata.products = groupedProducts[printer];
      let result = this.getKotCode(kotdata);
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
        name: product.name,
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
        name: product.name,
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
    if(!this.dataprovider.currentBusiness?.billerPrinter){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'No printer found for printing kot.',description:'Please select a printer in settings panel.',buttons:['Ok'],primary:[0]}})
      return
    }
    let groupedProducts: any = {};
    printerConfig.forEach((config: any) => {
      if (groupedProducts[config.printer]) {
        let foundProd = kotdata.products.find((product: any) => product.id === config.product);
        if (foundProd){
          groupedProducts[config.printer].push(foundProd);
        }
      } else {
        let foundProd = kotdata.products.find((product: any) => product.id === config.product)
        if (foundProd){
          groupedProducts[config.printer] = [foundProd];
        }
      }
    });
    console.log('printing data', kotdata, printerConfig);
    Object.keys(groupedProducts).forEach((printer: any) => {
      console.log('printing', printer, groupedProducts[printer]);
      kotdata.products = groupedProducts[printer];
      let result = this.getKotCode(kotdata);
      this.printing.printData(result, printer);
    });
    // return window.pywebview.api.print('editedKot', kotdata, printerConfig);
  }

  getBillCode(billdata: any) {
    console.log("billdata.businessDetails.name",billdata.businessDetails.name);
    let encoder = new customEncoder({ width: 48 });
    let result = encoder
      .initPrint()
      .h1(billdata.businessDetails.name)
      .lineIf(billdata.businessDetails.address, 'center', 'Add: ')
      .lineIf(billdata.businessDetails.phone, 'center', 'Phone: ')
      .lineIf(billdata.businessDetails.fssai, 'center', 'FSSAI: ')
      .lineIf(billdata.businessDetails.gst, 'center', 'GST: ')
      .hr()
      .h2('Customer details', 'left')
      .lineIf(billdata.customerDetail.name, 'left', 'Name:')
      .lineIf(billdata.customerDetail.phone, 'left', 'Phone:')
      .lineIf(billdata.customerDetail.address, 'left', 'Add:')
      .lineIf(billdata.customerDetail.gst, 'left', 'Gst:')
      .hr()
      .table(
        [
          {
            width: 20,
            marginRight: 2,
            align: 'left',
          },
          {
            width: 20,
            align: 'right',
          },
        ],
        [
          ['Date: ' + billdata.date, 'Time: ' + billdata.time],
          ['Token: ' + billdata.orderNo, 'Bill: ' + (billdata.billNoSuffix ? billdata.billNoSuffix : '')+ billdata.billNo],
          ['Cashier: ' + billdata.cashierName, 'Mode: ' + billdata.mode],
        ]
      )
      .hr()
      .productTable(billdata.products)
      .hr()
      .table(
        [{ marginRight: 2, align: 'left' }, { align: 'right' }],
        [
          [
            'Total Qty:' + billdata.totalQuantity,
            (encoder: any) =>
              encoder
                .bold()
                .text('Sub: Rs.' + billdata.subtotal)
                .bold(),
          ],
        ]
      )
      .hr()
      .discounts(billdata.discount)
      .hr()
      .taxes(billdata.tax)
      .hr(true)
      .table(
        [{ marginRight: 2, align: 'left' }, { align: 'right' }],
        [
          [
            (enc: any) => enc.bold(true).text('Grand Total: '),
            (encoder: any) =>
              encoder
                .bold(true)
                .height(2)
                .width(2)
                .size('normal')
                .text('Rs.' + billdata.grandTotal)
                .bold(false)
                .width(1)
                .height(1),
          ],
        ]
      )
      .hr()
      .lineIf(billdata.note,'left','Note:')
      .terms(billdata.notes)
      .reviewQr(billdata.id)
      .end('');
    return result;
  }

  getKotCode(kotData: any) {
    let encoder = new customEncoder({ width: 48 });
    let result = encoder
      .initPrint()
      .kotHead(kotData)
      .hr()
      .table(
        [
          {
            width: 20,
            marginRight: 2,
            align: 'left',
          },
          {
            width: 20,
            align: 'right',
          },
        ],
        [
          ['Date: ' + kotData.date +' '+ kotData.time, 'Token: ' + kotData.orderNo],
          ['Kot No: ' + kotData.id, 'Table No: ' + kotData.table],
        ]
      )
      .hr()
      .itemTable(kotData.products)
      .hr()
      .end('');
    return result;
  }
}

class customEncoder extends EscPosEncoder {
  constructor(data: any) {
    super();
  }
  initPrint() {
    this.initialize();
    return this;
  }
  h1(text: string) {
    return this.height(2)
      .width(2)
      .size('small')
      .align('center')
      .line(text)
      .newline()
      .size('normal')
      .align('left')
      .width(1)
      .height(1);
  }
  h2(text: string, align = 'center') {
    return this.bold(true)
      .align(align)
      .size('normal')
      .line(text)
      .bold(false)
      .align('left');
  }
  hr(double = false) {
    return this.rule({ style: double ? 'double' : 'single',width:47 });
  }
  strike(chars:string){
    // return text with strikethrough
    return this.text('X---').text(chars).text('---X');
  }
  productTable(products: any[]) {
    // products contains name, price, quantity, total
    let table = [
      { width: 26, marginRight: 2, align: 'left' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 5, align: 'right' },
    ];
    let data = [];
    data.push([
      (encoder: any) => encoder.bold().text('Item').bold(),
      (encoder: any) => encoder.bold().align('center').text('Qty').bold(),
      (encoder: any) => encoder.bold().align('center').text('Price').bold(),
      'Amount',
    ]);
    products.forEach((product) => {
      data.push([
        product.name,
        product.quantity.toString(),
        'Rs.' + product.price.toString(),
        'Rs.' + product.amount.toString(),
      ]);
    });
    return this.table(table, data);
  }
  itemTable(items: any[]) {
    let table = [
      { width: 26, marginRight: 2, align: 'left' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 5, marginRight: 2, align: 'center' },
    ];
    let data:any = [];
    data.push([
      (encoder: any) => encoder.bold().text('Item').bold(),
      (encoder: any) => encoder.bold().align('center').text('Ins').bold(),
      (encoder: any) => encoder.bold().align('center').text('Qty').bold(),
    ]);
    items.forEach((product) => {
      if (product.edited){
        // strike through products
        data.push([
          (encoder: any) => encoder.strike(product.name),
          product.instruction ? product.instruction : '',
          product.quantity.toString(),
        ]);
      } else {
        // simple products
        data.push([
          product.name,
          product.instruction ? product.instruction : '',
          product.quantity.toString(),
        ]);
      }
    });
    return this.table(table, data);
  }
  lineIf(
    text: string,
    align: 'left' | 'right' | 'center' = 'left',
    prefix: string | null = null
  ) {
    if (text) {
      return this.align(align).line((prefix ? prefix : '') + text);
    } else {
      return this;
    }
  }
  reviewQr(id: string) {
    return this.newline()
      .align('center')
      .qrcode('https://fbms-shreeva-demo.web.app/' + id)
      .align('left')
      .newline();
  }
  end(id: string) {
    return this.newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut()
      .encode();
  }
  terms(terms: string[]) {
    // terms is of type string[]
    this.align('center').line('Terms & Conditions').align('left').newline();
    terms.forEach((term, index) => {
      this.line((index + 1).toString() + ': ' + term);
    });
    return this;
  }
  discounts(discounts: any[]) {
    // discounts is of type {name: string, value: number, type: string, rate: number}[]
    this.align('center').h2('Discounts', 'left');
    let discountsColumns = [['Discount', 'Rate', 'Amount']];
    discounts.forEach((discount, index) => {
      discountsColumns.push([
        discount.name,
        discount.rate.toString() + '%',
        'Rs.' + discount.value.toString(),
      ]);
    });
    return this.table(
      [
        { width: 20, marginRight: 2, align: 'left' },
        { width: 10, marginRight: 2, align: 'center' },
        { width: 10, align: 'right' },
      ],
      discountsColumns
    ).newline();
  }
  taxes(taxes: any[]) {
    // taxes is of type {name: string, value: number, rate: number}[]
    this.align('center').h2('Taxes', 'left');
    let taxesColumns = [['Tax', 'Rate', 'Amount']];
    taxes.forEach((tax, index) => {
      taxesColumns.push([
        tax.name,
        tax.rate.toString() + '%',
        'Rs.' + tax.value.toString(),
      ]);
    });
    return this.table(
      [
        { width: 20, marginRight: 2, align: 'left' },
        { width: 10, marginRight: 2, align: 'center' },
        { width: 10, align: 'right' },
      ],
      taxesColumns
    ).newline();
  }
  kotHead(kotData: any) {
    // modes are 'firstChargeable'|'cancelledKot'|'editedKot'|'runningNonChargeable'|'runningChargeable'|'firstNonChargeable'|'reprintKot'|'online'
    if (kotData.mode == 'firstChargeable') {
      return this.h1('KOT').h2('First Chargeable');
    } else if (kotData.mode == 'cancelledKot') {
      return this.h1('KOT').h2('Cancelled');
    } else if (kotData.mode == 'editedKot') {
      return this.h1('KOT').h2('Edited');
    } else if (kotData.mode == 'runningNonChargeable') {
      return this.h1('KOT').h2('Running Non Chargeable');
    } else if (kotData.mode == 'runningChargeable') {
      return this.h1('KOT').h2('Running Chargeable');
    } else if (kotData.mode == 'firstNonChargeable') {
      return this.h1('KOT').h2('First Non Chargeable');
    } else if (kotData.mode == 'reprintKot') {
      return this.h1('KOT').h2('Reprint');
    } else if (kotData.mode == 'online') {
      return this.h1('KOT').h2('Online');
    } else {
      return this.h1('KOT');
    }
  }
}
