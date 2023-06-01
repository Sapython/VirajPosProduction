import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product, portionColor } from '../../../../../types/product.structure';

@Component({
  selector: 'app-add-dish',
  templateUrl: './add-dish.component.html',
  styleUrls: ['./add-dish.component.scss']
})
export class AddDishComponent {
  type:string[] = [
    'veg',
    'non-veg',
  ];
  predefinedColors:portionColor[] = [
    {
      color:'#008000',
      contrast:'#ffffff',
    },
    {
      color:'#ff6347',
      contrast: '#ffffff',
    },
    {
      color:'#ffa500',
      contrast: '#ffffff',
    },
    {
      color:'#ffff00',
      contrast: '#000000',
    },
    {
      color:'#0099ff',
      contrast: '#ffffff',
    },
  ]
  tags:{color:string,name:string,contrast:string}[] = [
    {
      color:'tomato',
      contrast:'white',
      name:'Half',
    },
    {
      color:'green',
      contrast:'white',
      name:'Full',
    }
  ]
  portions:{portionName:string,portionSize:number,portionColor:portionColor}[] = []
  newDishForm:FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    price: new FormControl('',Validators.required),
    type: new FormControl('',Validators.required),
    tag: new FormControl('',Validators.required),
  });

  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) public data:{mode:'add'|'edit',product?:Product}) {
    if(data.mode == 'edit') {
      this.newDishForm.patchValue(data.product)
      this.newDishForm.controls.tag.setValue(data.product.tags[0]);
    //  console.log(this.newDishForm.value,"this.tags",this.tags);
    }
  }

  addVariant(){
    this.portions.push({
      portionName:'',
      portionSize:0,
      portionColor:this.predefinedColors[0],
    });
  }

  cancel(){
    this.dialogRef.close()
  }

  removeVariant(i:number){
    this.portions.splice(i,1);
  }

  addDish(){
    this.dialogRef.close({...this.newDishForm.value,tags:[this.newDishForm.value.tag]})
  }

  switchColor(event:any,i:number){
  //  console.log(event,i);
  }

}
