import { Injectable } from '@angular/core';
import { customEncoder } from './encoder';

@Injectable({
  providedIn: 'root',
})
export class EncoderService {
  constructor() {}

  getBillCode(billdata: any) {
    console.log('billdata.businessDetails.name', billdata.businessDetails.name);
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
          [
            'Token: ' + billdata.orderNo,
            'Bill: ' +
              (billdata.billNoSuffix ? billdata.billNoSuffix : '') +
              (billdata.billNo || ''),
          ],
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
      .lineIf(billdata.note, 'left', 'Note:')
      .terms(billdata.notes)
      .end();
    return result;
  }

  getConsolidatedBillCode(billdata: any[]) {}

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
          [
            'Date: ' + kotData.date + ' ' + kotData.time,
            'Token: ' + kotData.orderNo,
          ],
          ['Kot No: ' + kotData.id, 'Table No: ' + kotData.table],
        ]
      )
      .hr()
      .itemTable(kotData.products)
      .hr()
      .end();
    return result;
  }
}
