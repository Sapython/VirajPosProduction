import { DiscountedBillsPipe } from './discounted-bills.pipe';

describe('DiscountedBillsPipe', () => {
  it('create an instance', () => {
    const pipe = new DiscountedBillsPipe();
    expect(pipe).toBeTruthy();
  });
});
