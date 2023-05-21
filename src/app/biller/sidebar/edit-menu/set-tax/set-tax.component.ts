import { Component, Inject } from '@angular/core';
import { DataProvider } from '../../../../provider/data-provider.service';
import { Product, Tax } from '../../../constructors';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-set-tax',
  templateUrl: './set-tax.component.html',
  styleUrls: ['./set-tax.component.scss']
})
export class SetTaxComponent {
  taxes:ExtendedTax[] = []
  type:'inclusive'|'exclusive' = 'inclusive';
  constructor(private dataProvider:DataProvider,public dialogRef:DialogRef,@Inject(DIALOG_DATA) private data:Product) {
    this.dataProvider.taxes.forEach(tax => {
      this.taxes.push(JSON.parse(JSON.stringify({ ...tax, checked:false })))
    })
    this.data?.taxes?.forEach(tax => {
      this.taxes.forEach(t => {
        if(t.id == tax.id){
          t.checked = true;
          this.type = tax.nature || 'exclusive';
        }
      })
    })
  }

  cancel(){
    this.dialogRef.close()
  }
}
export interface ExtendedTax extends Tax {
  checked:boolean
}