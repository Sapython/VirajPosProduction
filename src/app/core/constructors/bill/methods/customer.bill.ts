import { Bill } from '..';
import { CustomerInfo } from '../../../../types/user.structure';

export function setCustomerInfo(this: Bill, customerInfo: CustomerInfo) {
  if (customerInfo.phone != this.customerInfo.phone) {
    // clear customer
    this.customerInfo = {}
  }
  this.customerInfo = {
    ...this.customerInfo,
    ...customerInfo
  };
  this.calculateBill();
}
