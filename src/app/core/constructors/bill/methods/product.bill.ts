import { Bill } from '..';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';

export async function addProduct(this: Bill, product: Product) {
  if (this.stage == 'finalized' && this.mode == 'takeaway') {
    let reactiveReason = await this.dataProvider.prompt(
      'Please enter reason for adding product'
    );
    if (reactiveReason) {
      this.reactivateKotReasons.push(reactiveReason);
      this.stage = 'active';
    } else {
      return;
    }
  }
  if (this.stage !== 'active') {
    alert('This bill is already finalized.');
    return;
  }
  this.dataProvider.manageKot = false;
  this.dataProvider.kotViewVisible = false;
  this.dataProvider.allProducts = false;
  if (this.editKotMode != null) {
    // this.editKotMode.newKot.push(product);
    this.editKotMode.newKot.find((item) => item.id === product.id)
      ? this.editKotMode.newKot.find((item) => item.id === product.id)!
          .quantity++
      : this.editKotMode.newKot.push(product);
  } else {
    const kotIndex = this.kots.findIndex((kot) => kot.stage === 'active');
    if (kotIndex === -1) {
      if (!this.orderNo) {
        this.orderNo = this.dataProvider.orderTokenNo.toString();
        this.dataProvider.orderTokenNo++;
        this.analyticsService.addOrderToken();
      }
      let kot = new Kot(product);
      this.kots.push(kot);
    } else {
      // if the item exists in the kot, increase the quantity by 1 else add the item to the kot
      this.kots[kotIndex].products.find((item) => item.id === product.id)
        ? this.kots[kotIndex].products.find((item) => item.id === product.id)!
            .quantity++
        : this.kots[kotIndex].products.push(product);
    }
  }
  this.calculateBill(true);
}

export function removeProduct(this: Bill, product: Product, kotIndex: number) {
  const index = this.kots[kotIndex].products.findIndex(
    (item) => item.id === product.id
  );
  this.kots[kotIndex].products.splice(index, 1);
  this.calculateBill();
}
