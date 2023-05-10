import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../../provider/data-provider.service';
import { DatabaseService } from '../../../../services/database.service';
import { Product } from '../../../constructors';

@Component({
  selector: 'app-add-dish',
  templateUrl: './add-dish.component.html',
  styleUrls: ['./add-dish.component.scss']
})
export class AddDishComponent {
  tags:string[] = [
    'veg',
    'non-veg',
  ];
  variants:{variantName:string,price:number}[] = []
  newDishForm:FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    price: new FormControl('',Validators.required),
    type: new FormControl('',Validators.required),
    // variants: new FormControl(this.variants),
  });

  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) public data:{mode:'add'|'edit',product?:Product}) {
    if(data.mode == 'edit') {
      this.newDishForm.patchValue(data.product)
      console.log(this.newDishForm.value);
    }
  }

  addVariant(){
    this.variants.push({variantName:'',price:0});
  }

  cancel(){
    this.dialogRef.close()
  }

  removeVariant(i:number){
    this.variants.splice(i,1);
  }

  addDish(){
    this.dialogRef.close(this.newDishForm.value)
  }

}
