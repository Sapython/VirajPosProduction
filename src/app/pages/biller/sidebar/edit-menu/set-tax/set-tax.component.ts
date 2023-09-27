import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Product } from '../../../../../types/product.structure';
import { ExtendedTax } from '../../../../../types/tax.structure';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';

@Component({
  selector: 'app-set-tax',
  templateUrl: './set-tax.component.html',
  styleUrls: ['./set-tax.component.scss'],
})
export class SetTaxComponent {
  taxes: ExtendedTax[] = [];
  type: 'inclusive' | 'exclusive' = 'inclusive';
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: { product: Product; menu: ModeConfig },
  ) {
    this.data?.menu.taxes.forEach((tax) => {
      this.taxes.push(JSON.parse(JSON.stringify({ ...tax, checked: false })));
    });
    this.data?.product?.taxes?.forEach((tax) => {
      this.taxes.forEach((t) => {
        if (t.id == tax.id) {
          t.checked = true;
          this.type = tax.nature || 'exclusive';
        }
      });
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
