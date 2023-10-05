import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import {
  BillConstructor,
  PrintableBill,
} from '../../../../types/bill.structure';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import { DataProvider } from '../../../services/provider/data-provider.service';
import { ApplicableCombo } from '../../comboKot/comboKot';

export function allProducts(this: Bill) {
  // return all products from all kots and merge with their quantity
  let products: (Product | ApplicableCombo)[] = [];
  this.kots.forEach((kot) => {
    kot.products.forEach((product) => {
      let index = products.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        products[index].quantity += product.quantity;
      } else {
        products.push(structuredClone(product));
      }
    });
  });
  return products;
}

export function allFinalProducts(this: Bill): (Product | ApplicableCombo)[] {
  let products: (Product | ApplicableCombo)[] = [];
  this.kots.forEach((kot) => {
    if (kot.stage == 'finalized') {
      kot.products.forEach((product) => {
        let index = products.findIndex((item) => item.id === product.id);
        if (index !== -1) {
          products[index].quantity += product.quantity;
        } else {
          products.push(structuredClone(product));
        }
      });
    }
  });
  return products;
}

export function kotWithoutFunctions(this: Bill): any[] {
  return this.kots
    .filter((kot) => kot.stage == 'cancelled' || kot.stage == 'finalized')
    .map((kot) => kot.toObject());
}

export function totalProducts(): number {
  let total = 0;
  this.kots.forEach((kot) => {
    if (kot.stage === 'finalized') {
      total += kot.products.length;
    }
  });
  return total;
}

export function getPrintableBill(
  this: Bill,
  products: Product[],
  dataProvider: DataProvider,
): PrintableBill {
  //  console.log("madhoosh",this);
  let bill = this;
  return printableBillGenerator(bill, products, dataProvider);
}

export function getPrintableBillConstructor(
  bill: BillConstructor,
  products: (Product | ApplicableCombo)[],
  dataProvider: DataProvider,
): PrintableBill {
  return printableBillGenerator(bill, products, dataProvider);
}

function printableBillGenerator(
  bill: BillConstructor | Bill,
  products: (Product | ApplicableCombo)[],
  dataProvider: DataProvider,
): PrintableBill {
  return {
    businessDetails: {
      address: dataProvider.currentBusiness.address,
      email: dataProvider.currentBusiness.email,
      fssai: dataProvider.currentBusiness.fssai,
      gstin: dataProvider.currentBusiness.gst,
      name: dataProvider.currentBusiness.hotelName,
      phone: dataProvider.currentBusiness.phone,
    },
    customerDetail: {
      address: bill.customerInfo.address,
      gstin: bill.customerInfo.gst,
      name: bill.customerInfo.name,
      phone: bill.customerInfo.phone,
    },
    postChargesSubTotal:roundOffPipe(bill.billing.postChargesSubTotal),
    appliedCharges:bill.appliedCharges,
    currentLoyalty: bill.currentLoyalty,
    postDiscountSubTotal:roundOffPipe(bill.billing.postDiscountSubTotal),
    billNoSuffix: dataProvider.billNoSuffix,
    billNo: bill.billNo || '',
    orderNo: bill.orderNo,
    cashierName: dataProvider.currentUser?.username || '',
    // date in dd/mm/yyyy format
    date: bill.createdDate.toDate().toLocaleDateString('en-GB'),
    // time in 12 hour format
    time: bill.createdDate.toDate().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }),
    mode:
      bill.mode == 'dineIn'
        ? 'Dine In'
        : bill.mode == 'online'
        ? 'Online'
        : bill.mode == 'takeaway'
        ? 'Takeaway'
        : 'Dine In',
    products: products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        untaxedValue: product.price,
        total: roundOffPipe(product.untaxedValue),
      };
    }),
    totalQuantity: products.reduce((acc, product) => {
      return acc + product.quantity;
    }, 0),
    subTotal: roundOffPipe(bill.billing.subTotal),
    discounts: bill.billing.discount.map((discount) => {
      // console.log("Discount value in printable data",discount.value);
      if (discount.mode == 'codeBased') {
        return {
          name: discount.name,
          rate: roundOffPipe(discount.value),
          type: discount.type,
          value: roundOffPipe(discount.totalAppliedDiscount),
        };
      } else if (discount.mode == 'directFlat') {
        return {
          name: 'Flat',
          rate: roundOffPipe(discount.value),
          value: roundOffPipe(discount.totalAppliedDiscount),
          type: 'flat',
        };
      } else {
        return {
          name: 'Offer',
          rate: roundOffPipe(discount.value),
          type: 'percentage',
          value: roundOffPipe(discount.totalAppliedDiscount),
        };
      }
    }),
    taxes: bill.billing.taxes.map((tax) => {
      return {
        name: tax.name,
        rate: roundOffPipe(tax.cost),
        value: roundOffPipe(tax.amount),
      };
    }),
    grandTotal: roundOffPipe(bill.billing.grandTotal),
    note: dataProvider.customBillNote,
    notes: bill.instruction ? [bill.instruction] : [],
  };
}

function roundOffPipe(num: number) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}
