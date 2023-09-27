import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { Category } from '../../../../structures/general.structure';

@Component({
  selector: 'app-select-category',
  templateUrl: './select-category.component.html',
  styleUrls: ['./select-category.component.scss']
})
export class SelectCategoryComponent {
  viewCategories:ExtendedCategory[] = [];
  mainCategory:Category|undefined;
  constructor(public dialogRef:DialogRef,@Inject(DIALOG_DATA) public dialogData:{mainCategories:Category[],viewCategories:Category[]}) {
    this.viewCategories = this.dialogData.viewCategories.map((category)=>{
      return {...category,selected:false}
    })
  }

  close(){
    this.dialogRef.close({mainCategory:this.mainCategory,viewCategories:this.viewCategories});
  }
}
interface ExtendedCategory extends Category{
  selected:boolean;
}