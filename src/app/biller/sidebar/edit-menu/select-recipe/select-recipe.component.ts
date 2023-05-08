import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, Input } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Product } from 'src/app/biller/constructors';
import Fuse from 'fuse.js';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-select-recipe',
  templateUrl: './select-recipe.component.html',
  styleUrls: ['./select-recipe.component.scss'],
})
export class SelectRecipeComponent {
  @Input() editMode: boolean = false;
  filteredProducts: Product[] = [];
  fuseSearchInstance:Fuse<Product> = new Fuse<Product>(this.products,{keys:["name",'price']})
  searchSubject:Subject<string> = new Subject<string>();
  constructor(
    @Inject(DIALOG_DATA) public products: Product[],
    private dialogRef: DialogRef
  ) {
    this.searchSubject.pipe(debounceTime(600)).subscribe((searchString:string)=>{
      console.log("searchString",searchString);
      this.filteredProducts = this.fuseSearchInstance.search(searchString).map((result)=>{
        return result.item;
      })
      console.log("this.filteredProducts",this.filteredProducts);
    })
  }

  save() {
    this.dialogRef.close(this.products);
  }

  close() {
    this.dialogRef.close();
  }

  switchAll(event:any){
    this.products.forEach((product:Product)=>{
      product.selected = event.checked;
    })
  }
}
