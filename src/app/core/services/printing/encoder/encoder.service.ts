import { Injectable } from '@angular/core';
import { customEncoder } from './encoder';
import {
  BillConstructor,
  PrintableBill,
} from '../../../../types/bill.structure';
import { PrintableKot } from '../../../../types/kot.structure';
import { DataProvider } from '../../provider/data-provider.service';

@Injectable({
  providedIn: 'root',
})
export class EncoderService {
  constructor(private dataProvider:DataProvider) {}

  getBillCode(billdata: PrintableBill, reprint: boolean = false) {
    //  console.log('billdata.businessDetails.name', billdata.businessDetails.name);
    let encoder = new customEncoder({ width: 48 });
    let result = encoder
      .initPrint()
      .h1(reprint ? 'Reprint' : '')
      .h1(billdata.businessDetails.name)
      .lineIf(billdata.businessDetails.address, 'center', 'Add: ')
      .lineIf(billdata.businessDetails.phone, 'center', 'Phone: ')
      .lineIf(billdata.businessDetails.fssai, 'center', 'FSSAI: ')
      .lineIf(billdata.businessDetails.gstin, 'center', 'GST: ')
      .hr()
      .h2('Customer details', 'left')
      .lineIf(billdata.customerDetail.name, 'left', 'Name:')
      .lineIf(billdata.customerDetail.phone, 'left', 'Phone:')
      .lineIf(billdata.customerDetail.address, 'left', 'Add:')
      .lineIf(billdata.customerDetail.gstin, 'left', 'Gst:')
      .hr()
      .generateBillInfo(billdata,this.dataProvider)
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
                .text('Sub: Rs.' + billdata.subTotal)
                .bold(),
          ],
        ],
      )
      .hr()
      .loyalty(billdata.currentLoyalty)
      .discounts(billdata.discounts)
      .postDiscountSubtotal(
        billdata,
        billdata.discounts,
        billdata.currentLoyalty,
      )
      .charges(billdata.appliedCharges)
      .postChargesSubtotal(billdata, billdata.appliedCharges)
      .hr()
      .taxes(billdata.taxes)
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
        ],
      )
      .hr()
      .lineIf(billdata.note, 'left', 'Note:')
      .terms(billdata.notes)
      .end();
    return result;
  }

  getKotCode(kotData: PrintableKot, reprint: boolean = false) {
    let encoder = new customEncoder({ width: 48 });
    let result = encoder
      .initPrint()
      .h1(reprint ? 'Reprint' : '')
      .kotHead(kotData)
      .lineIf(kotData.note, 'left', 'Note:')
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
          ['Date: ' + kotData.date, 'Order Id: ' + kotData.orderNo],
          [
            'Time: ' + kotData.time,
            (enc: any) =>
              enc
                .bold()
                .text('Punched By: ' + kotData.user)
                .bold(),
          ],
          [
            (enc: any) =>
              enc
                .bold()
                .text('Kot No: ' + kotData.token)
                .bold(),
            this.getModeTitle(kotData.billingMode) + ' No: ' + kotData.table,
          ],
        ],
      )
      .hr()
      .itemTable(kotData.products)
      .hr()
      .end();
    return result;
  }

  getModeTitle(mode: 'dineIn' | 'takeaway' | 'online'): string {
    if (mode == 'dineIn') {
      return 'Table';
    } else if (mode == 'takeaway') {
      return 'Token';
    } else if (mode == 'online') {
      return 'Order';
    } else {
      return 'Table';
    }
  }
}
