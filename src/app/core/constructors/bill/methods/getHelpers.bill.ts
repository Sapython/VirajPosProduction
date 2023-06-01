import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import { BillConstructor, PrintableBill } from '../../../../types/bill.structure';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import { DataProvider } from '../../../services/provider/data-provider.service';

export function allProducts(this: Bill) {
  // return all products from all kots and merge with their quantity
  let products: Product[] = [];
  this.kots.forEach((kot) => {
    kot.products.forEach((product) => {
      let index = products.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        products[index].quantity += product.quantity;
      } else {
        products.push(product);
      }
    });
  });
  return products;
}

export function allFinalProducts(this: Bill): Product[] {
  let products: Product[] = [];
  this.kots.forEach((kot) => {
    if (kot.stage == 'finalized') {
      kot.products.forEach((product) => {
        let index = products.findIndex((item) => item.id === product.id);
        if (index !== -1) {
          products[index].quantity += product.quantity;
        } else {
          products.push(product);
        }
      });
    }
  });
  return products;
}

export function kotWithoutFunctions(this: Bill): any[] {
  return this.kots.filter(kot => kot.stage=='cancelled' || kot.stage=='finalized').map((kot) => kot.toObject());
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

export function getPrintableBill(this: Bill,products:Product[],dataProvider:DataProvider): PrintableBill {
//  console.log("madhoosh",this);
  let bill = this;
  return printableBillGenerator(bill,products,dataProvider);
}

export function getPrintableBillConstructor(bill:BillConstructor,products:Product[],dataProvider:DataProvider): PrintableBill {
  return printableBillGenerator(bill,products,dataProvider);
}

function printableBillGenerator(bill:BillConstructor|Bill,products:Product[],dataProvider:DataProvider): PrintableBill {
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
    billNoSuffix: dataProvider.billNoSuffix,
    billNo: bill.id,
    orderNo: bill.orderNo,
    cashierName: dataProvider.currentUser.username,
    date: bill.createdDate.toDate().toLocaleDateString(),
    time: bill.createdDate.toDate().toLocaleDateString(),
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
        name: product.name,
        quantity: product.quantity,
        untaxedValue: product.untaxedValue,
        total: product.untaxedValue * product.quantity,
      };
    }),
    totalQuantity: products.reduce((acc, product) => {
      return acc + product.quantity;
    },0),
    subTotal: bill.billing.subTotal,
    discounts: bill.billing.discount.map((discount) => {
      if (discount.mode == 'codeBased') {
        return {
          name: discount.name,
          rate: discount.value,
          type: discount.type,
          value: discount.totalAppliedDiscount,
        };
      } else if (discount.mode == 'directFlat') {
        return {
          name: 'Flat',
          rate: discount.value,
          value: discount.totalAppliedDiscount,
          type: 'flat',
        };
      } else {
        return {
          name: 'Offer',
          rate: discount.value,
          type: 'percentage',
          value: discount.totalAppliedDiscount,
        };
      }
    }),
    taxes: bill.billing.taxes.map((tax) => {
      return {
        name: tax.name,
        rate: tax.cost,
        value: tax.amount,
      };
    }),
    grandTotal: bill.billing.grandTotal,
    note: dataProvider.customBillNote,
    notes: [bill.instruction],
  };
}