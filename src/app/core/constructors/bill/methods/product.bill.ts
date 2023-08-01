import { Bill } from '..';
import { Product } from '../../../../types/product.structure';
import { ApplicableCombo } from '../../comboKot/comboKot';
import { Kot } from '../../kot/Kot';

export async function addProduct(
  this: Bill,
  product: Product | ApplicableCombo,
) {
  if (this.stage == 'finalized') {
    if (
      await this.userManagementService.authenticateAction(['admin', 'manager'])
    ) {
      let reactiveReason = await this.dataProvider.prompt(
        'Please enter reason for adding product',
      );
      if (reactiveReason) {
        this.reactivateKotReasons.push(reactiveReason);
        this.billService.addActivity(this, {
          type: 'billReactivated',
          message: 'Bill reactivated by ' + this.user.username,
          user: this.user.username,
          data: { reason: reactiveReason },
        });
        this.stage = 'active';
      } else {
        return;
      }
    }
    return;
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
      let kot = new Kot(product, this);
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

export function removeProduct(
  this: Bill,
  product: Product | ApplicableCombo,
  kotIndex: number,
) {
  const index = this.kots[kotIndex].products.findIndex(
    (item) => item.id === product.id,
  );
  this.kots[kotIndex].products.splice(index, 1);
  this.calculateBill();
}
