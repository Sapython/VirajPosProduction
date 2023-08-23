import {
  billLoyalty,
  printableBillItem,
  printableDiscount,
  printableTax,
} from '../../../../types/bill.structure';
import { printableKotItem } from '../../../../types/kot.structure';
import * as EscPosEncoder from '../esc-pos-encoder.umd';
export class customEncoder extends EscPosEncoder {
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
    return this.rule({ style: double ? 'double' : 'single', width: 47 });
  }
  strike(chars: string) {
    // return text with strikethrough
    return this.text('X---').text(chars).text('---X');
  }
  productTable(products: printableBillItem[]) {
    // products contains name, price, quantity, total
    let table = [
      { width: 15, marginRight: 2, align: 'left' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 12, align: 'right' },
    ];
    let data = [];
    data.push([
      (encoder: any) => encoder.bold().text('Item').bold(),
      (encoder: any) => encoder.bold().align('center').text('Qty').bold(),
      (encoder: any) => encoder.bold().align('center').text('Price').bold(),
      'Amount',
    ]);
    products.forEach((product, index) => {
      data.push([
        (index + 1).toString() + '. ' + product.name,
        product.quantity.toString(),
        'Rs.' + product.untaxedValue.toString(),
        'Rs.' + (product.total).toString(),
      ]);
    });
    return this.table(table, data);
  }
  itemTable(items: printableKotItem[]) {
    let table = [
      { width: 26, marginRight: 2, align: 'left' },
      { width: 5, marginRight: 2, align: 'center' },
      { width: 5, marginRight: 2, align: 'center' },
    ];
    let data: any = [];
    data.push([
      (encoder: any) => encoder.bold().text('Item').bold(),
      (encoder: any) => encoder.bold().align('center').text('Ins').bold(),
      (encoder: any) => encoder.bold().align('center').text('Qty').bold(),
    ]);
    items.forEach((product) => {
      if (product.edited) {
        // strike through products
        data.push([
          'X--' + product.name + '--X',
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
    prefix: string | null = null,
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
  end() {
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
  discounts(discounts: printableDiscount[]) {
    // discounts is of type {name: string, value: number, type: string, rate: number}[]
    if (discounts.length == 0) return this;
    this.align('center').h2('Discounts', 'left');
    let discountsColumns = [['Discount', 'Rate', 'Amount']];
    discounts.forEach((discount, index) => {
      discountsColumns.push([
        discount.name,
        discount.rate.toString() + (discount.type == 'flat' ? 'Rs.' : '%'),
        'Rs.' + discount.value.toString(),
      ]);
    });
    return this.table(
      [
        { width: 20, marginRight: 2, align: 'left' },
        { width: 10, marginRight: 2, align: 'center' },
        { width: 10, align: 'right' },
      ],
      discountsColumns,
    ).hr();
  }
  charges(charges: {tip: number, serviceCharge: number, deliveryCharge: number, containerCharge: number}) {
    let allSum = charges.tip + charges.serviceCharge + charges.deliveryCharge + charges.containerCharge;
    // discounts is of type {name: string, value: number, type: string, rate: number}[]
    if (allSum == 0) return this;
    this.align('center').h2('Charges', 'left');
    let chargesColumns = [['Charge', 'Cost']];
    if(charges.tip){
      chargesColumns.push([
        'Tip',
        'Rs.' + charges.tip.toString(),
      ]);
    }
    if(charges.serviceCharge){
      chargesColumns.push([
        'Service Charge',
        'Rs.' + charges.serviceCharge.toString(),
      ]);
    }
    if(charges.deliveryCharge){
      chargesColumns.push([
        'Delivery Charge',
        'Rs.' + charges.deliveryCharge.toString(),
      ]);
    }
    if(charges.containerCharge){
      chargesColumns.push([
        'Container Charge',
        'Rs.' + charges.containerCharge.toString(),
      ]);
    }
    return this.table(
      [
        { width: 20, marginRight: 2, align: 'left' },
        { width: 10, marginRight: 2, align: 'center' },
        { width: 10, align: 'right' },
      ],
      chargesColumns,
    ).hr();
  }
  loyalty(loyalty: billLoyalty) {
    if (loyalty.totalToBeRedeemedPoints == 0){
      return this;
    }
    // taxes is of type {name: string, value: number, rate: number}[]
    this.align('center').h2('Loyalty', 'left');
    let taxesColumns = [
      ['Loyalty', 'Point', 'Value'],
      ['Availed', loyalty.totalToBeRedeemedPoints,'Rs.'+loyalty.totalToBeRedeemedCost]
    ];
    return this.table(
      [
        { width: 20, marginRight: 2, align: 'left' },
        { width: 10, marginRight: 2, align: 'center' },
        { width: 10, align: 'right' },
      ],
      taxesColumns,
    ).hr();
  }
  taxes(taxes: printableTax[]) {
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
      taxesColumns,
    ).hr();
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
  postDiscountSubtotal(billdata,discounts,loyaltySetting){
    if (discounts.length || loyaltySetting.totalToBeRedeemedPoints) {
      return this.hr()
      .table(
        [{ marginRight: 2, align: 'left' }, { align: 'right' }],
        [
          [
            '',
            (encoder: any) =>
              encoder
                .bold()
                .text('Subtotal: Rs.' + billdata.postDiscountSubTotal)
                .bold(),
          ],
        ],
      )
    } else {
      return this
    }
  }
  postChargesSubtotal(billdata,charges: {tip: number, serviceCharge: number, deliveryCharge: number, containerCharge: number}){
    let allSum = charges.tip + charges.serviceCharge + charges.deliveryCharge + charges.containerCharge;
    if (allSum == 0){
      return this;
    }
    return this.hr()
    .table(
      [{ marginRight: 2, align: 'left' }, { align: 'right' }],
      [
        [
          '',
          (encoder: any) =>
            encoder
              .bold()
              .text('Subtotal: Rs.' + billdata.postChargesSubTotal)
              .bold(),
        ],
      ],
    )
  }
}
