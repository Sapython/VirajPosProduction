import { Bill } from '..';
import { CustomerInfo } from '../../../../types/user.structure';

export function setCustomerInfo(this: Bill, customerInfo: CustomerInfo) {
  this.customerInfo = customerInfo;
  this.calculateBill();
}
